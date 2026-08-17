#!/usr/bin/env python3
"""판정 요약 배치 생성 — (정책, 판정 결과) 조합마다 Claude를 1회 호출해 문구를 만든다.

    pip install anthropic          # 서빙에는 불필요해 requirements.txt에 넣지 않았다
    python apps/api/tools/generate_summaries.py --dry-run   # 호출 없이 대상·예상 비용만
    python apps/api/tools/generate_summaries.py             # 실제 생성 → data/summaries.json

**이 스크립트는 개발자가 손으로 돌린다.** 서버는 결과 파일을 읽기만 하고, 실시간 판정
경로에서 LLM을 호출하지 않는다 (CLAUDE.md 절대 규칙). 생성된 문구는 시민에게 그대로
보이므로 PR 변경분을 사람이 읽고 검수한 뒤 머지한다.

기본 동작은 **증분**이다 — 정책 내용 해시가 그대로면 다시 만들지 않는다(비용 0).
프롬프트를 고쳐 전부 다시 만들려면 --force.
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO / "apps" / "api"))

from app.engine.evaluate import normalize_verify  # noqa: E402
from app.store import load_policies  # noqa: E402
from app.summary import policy_hash, summary_key  # noqa: E402

MODEL = "claude-sonnet-5"
PRICE_IN_PER_MTOK = 3.00   # USD, 2026-08 기준 정가 (8/31까지 인트로 $2/$10 적용 시 실비용은 더 낮음)
PRICE_OUT_PER_MTOK = 15.00

PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "summary.md"
OUT_PATH = REPO / "data" / "summaries.json"

MAX_CHARS = 150  # 프롬프트가 요구하는 길이 — 넘으면 사람이 확인해야 한다

STATUS_LABELS = {
    "eligible": "신청 자격 충족 (지금 신청할 수 있음)",
    "docs_needed": "서류 확인 필요 (기계로 판정 가능한 조건은 통과, 확인 항목이 남음)",
    "upcoming": "예정 대상 (시간이 지나면 조건을 충족함 — 아직 신청 불가)",
}

# 대외 문구 규칙(CLAUDE.md) + 판정 신뢰성을 해치는 표현
BANNED = ["확정", "AI가", "인공지능이", "맞춤 추천", "추천드립니다", "대상이 아닐"]


def reachable_statuses(policy: dict) -> list[str]:
    """이 정책이 실제로 도달할 수 있는 분류만 — 없는 조합에 돈을 쓰지 않는다.

    확인 항목이 하나라도 있으면 eligible에 도달할 수 없고(규칙 3), 시간이 지나 충족되는
    조건(나이 하한·거주개월)이 없으면 upcoming에 도달할 수 없다(규칙 2).
    """
    conditions = policy.get("conditions", {})
    has_verify = bool(normalize_verify(policy))
    time_based = "residence_months" in conditions or "min" in conditions.get("age", {})

    statuses = ["docs_needed"] if has_verify else ["eligible"]
    if time_based:
        statuses.append("upcoming")
    return statuses


def build_prompt(template: str, policy: dict, status: str) -> str:
    shown = {
        "지원 내용": policy.get("benefit"),
        "신청 방법": policy.get("apply_channel"),
        "필요 서류": policy.get("required_docs"),
        "마감일": policy.get("deadline") or "상시 접수",
        "담당": policy.get("contact"),
    }
    policy_block = "\n".join(
        f"- {k}: {json.dumps(v, ensure_ascii=False) if isinstance(v, list) else v}"
        for k, v in shown.items()
        if v
    )
    verify = [v["label"] for v in normalize_verify(policy)]
    return (
        template.split("---\n", 1)[1]  # 문서 상단의 사용 안내는 프롬프트에 넣지 않는다
        .replace("{policy_block}", policy_block)
        .replace("{status_label}", STATUS_LABELS[status])
        .replace("{verify_block}", ", ".join(verify) if verify else "없음")
    )


def check(text: str) -> list[str]:
    """사람이 봐야 할 신호. 생성을 막지는 않고 경고만 남긴다."""
    problems = []
    if len(text) > MAX_CHARS:
        problems.append(f"{len(text)}자 — {MAX_CHARS}자 초과")
    for word in BANNED:
        if word in text:
            problems.append(f"금지 표현 '{word}'")
    if re.search(r"\bD-\s?\d+|\d+일\s*(남|뒤)", text):
        problems.append("남은 기간을 문장에 넣음 (화면이 따로 표시함)")
    return problems


def load_api_key() -> str:
    """환경변수 우선. 없으면 팀 관례인 env.local.txt에서 읽는다."""
    key = os.getenv("ANTHROPIC_API_KEY")
    if key:
        return key
    for candidate in (REPO / "env.local.txt", REPO / ".env"):
        if not candidate.exists():
            continue
        for line in candidate.read_text(encoding="utf-8").splitlines():
            name, _, value = line.partition("=")
            if name.strip() == "ANTHROPIC_API_KEY" and value.strip():
                return value.strip()
    sys.exit("ANTHROPIC_API_KEY가 없습니다 (환경변수 또는 env.local.txt)")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="호출 없이 대상과 예상 비용만 출력")
    parser.add_argument("--force", action="store_true", help="해시가 같아도 전부 다시 생성")
    args = parser.parse_args()

    template = PROMPT_PATH.read_text(encoding="utf-8")
    policies = load_policies()
    existing = json.loads(OUT_PATH.read_text(encoding="utf-8")) if OUT_PATH.exists() else {}

    todo = []
    for pid, policy in sorted(policies.items()):
        digest = policy_hash(policy)
        for status in reachable_statuses(policy):
            key = summary_key(pid, status)
            if not args.force and existing.get(key, {}).get("policy_hash") == digest:
                continue
            todo.append((key, policy, status, digest))

    print(f"정책 {len(policies)}건 → 생성 대상 {len(todo)}건 (기존 {len(existing)}건)")
    if not todo:
        print("변경 없음 — 할 일이 없습니다.")
        return 0

    if args.dry_run:
        for key, policy, status, _ in todo:
            print(f"  {key:32} {policy['title'][:34]}")
        # 정책 본문이 대체로 1~3K 토큰, 출력은 150자 내외(약 120토큰)
        est = len(todo) * (2000 * PRICE_IN_PER_MTOK + 150 * PRICE_OUT_PER_MTOK) / 1_000_000
        print(f"\n예상 비용: 약 ${est:.2f} (건당 입력 2K·출력 150토큰 가정, {MODEL})")
        print("실제 생성: --dry-run 없이 다시 실행")
        return 0

    import anthropic  # 배치 실행에만 필요 — 서빙 의존성에 넣지 않는다

    client = anthropic.Anthropic(api_key=load_api_key())
    result = dict(existing)
    in_tokens = out_tokens = 0
    flagged = []

    for i, (key, policy, status, digest) in enumerate(todo, 1):
        message = client.messages.create(
            model=MODEL,
            max_tokens=1000,
            messages=[{"role": "user", "content": build_prompt(template, policy, status)}],
        )
        if message.stop_reason == "refusal":
            print(f"  [{i}/{len(todo)}] {key} — 거부됨, 건너뜁니다")
            continue

        text = "".join(b.text for b in message.content if b.type == "text").strip()
        in_tokens += message.usage.input_tokens
        out_tokens += message.usage.output_tokens

        problems = check(text)
        if problems:
            flagged.append((key, problems))
        print(f"  [{i}/{len(todo)}] {key}{'  ⚠️ ' + '; '.join(problems) if problems else ''}")
        print(f"      {text}")
        result[key] = {"summary": text, "policy_hash": digest}

    OUT_PATH.write_text(
        json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )

    cost = (in_tokens * PRICE_IN_PER_MTOK + out_tokens * PRICE_OUT_PER_MTOK) / 1_000_000
    print(f"\n저장: {OUT_PATH} ({len(result)}건)")
    print(f"토큰: 입력 {in_tokens:,} · 출력 {out_tokens:,} → 실제 비용 약 ${cost:.2f}")
    if flagged:
        print(f"\n⚠️  사람이 확인할 항목 {len(flagged)}건:")
        for key, problems in flagged:
            print(f"  - {key}: {'; '.join(problems)}")
    print("\n생성된 문구를 읽어보고 커밋하세요 — 시민에게 그대로 보입니다.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
