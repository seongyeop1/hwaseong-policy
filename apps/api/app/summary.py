"""판정 요약(ai_summary) 서빙 — 미리 만들어 둔 문구를 읽기만 한다.

**요청 경로에 LLM이 없다** (CLAUDE.md 절대 규칙). 요약은 배치로 생성해
`data/summaries.json`에 커밋해 두고, 여기서는 조회만 한다 — 응답 지연 0, 런타임 비용 0,
그리고 시민에게 보이는 문구가 PR 변경분으로 남아 사람이 검수할 수 있다.

**캐시 키는 (정책, 판정 결과)** — 계약서의 "같은 판정 결과에 재호출 금지"를 파일 단위로
실현한 것이다. D-day 숫자는 요약문에 넣지 않으므로(화면이 따로 표시) as_of가 달라져도
같은 문구를 쓴다 → 조합 수가 정책 수 × 3으로 묶인다.

**정책이 바뀌면 요약을 버린다.** 각 항목에 생성 당시 정책 내용의 해시를 함께 저장하고,
지금 정책과 다르면 None을 반환한다 → 계약서대로 C가 "요약 준비 중"을 표시한다.
낡은 요약으로 틀린 금액·조건을 안내하느니 비워 두는 편이 안전하다.
"""
import hashlib
import json
import logging
import os
from pathlib import Path
from typing import Any

log = logging.getLogger("app.summary")

_DEFAULT_PATH = Path(__file__).resolve().parents[3] / "data" / "summaries.json"

# 요약이 근거로 삼는 필드 — 이 값들이 바뀌면 요약도 다시 만들어야 한다.
# (검수 기록·출처 URL 등은 문구에 영향을 주지 않으므로 제외)
HASHED_FIELDS = (
    "title",
    "benefit",
    "conditions",
    "manual_conditions",
    "verify_required",
    "deadline",
    "apply_channel",
    "required_docs",
    "contact",
)


def policy_hash(policy: dict) -> str:
    """요약의 근거가 된 정책 내용의 지문. 정렬해 직렬화하므로 키 순서에 흔들리지 않는다."""
    material = {k: policy.get(k) for k in HASHED_FIELDS}
    blob = json.dumps(material, ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()[:16]


def summary_key(policy_id: str, status: str) -> str:
    return f"{policy_id}:{status}"


def load_summaries(path: str | os.PathLike | None = None) -> dict[str, dict]:
    """{key: {"summary": str, "policy_hash": str}}. 파일이 없으면 빈 dict (요약은 선택 기능)."""
    file = Path(path or os.getenv("SUMMARIES_PATH") or _DEFAULT_PATH)
    if not file.exists():
        log.info("요약 파일 없음 — ai_summary는 모두 null로 나갑니다 (%s)", file)
        return {}
    try:
        data = json.loads(file.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        log.error("요약 파일 파싱 실패 — ai_summary 없이 계속합니다: %s", e)
        return {}
    log.info("요약 로드 완료: %d건 (%s)", len(data), file)
    return data


def lookup(summaries: dict[str, dict], policy: dict, status: str) -> str | None:
    """정책 내용이 요약 생성 시점과 같을 때만 문구를 준다. 다르면 None (= 요약 준비 중)."""
    entry = summaries.get(summary_key(policy["policy_id"], status))
    if not entry:
        return None
    if entry.get("policy_hash") != policy_hash(policy):
        log.warning(
            "요약이 낡음 — 정책이 수정된 뒤 재생성되지 않았습니다: %s (%s)",
            policy["policy_id"],
            status,
        )
        return None
    return entry.get("summary")


def attach(
    results: dict[str, list[dict[str, Any]]],
    summaries: dict[str, dict],
    policies: dict[str, dict],
) -> None:
    """판정 결과 세 배열의 각 항목에 ai_summary를 채운다 (없으면 None — 계약: nullable).

    해시 대조에 저장 스키마 원본이 필요해서 policies(저장 형태)를 함께 받는다.
    """
    for status, items in results.items():
        for item in items:
            source = policies.get(item["policy"]["policy_id"])
            item["ai_summary"] = lookup(summaries, source, status) if source else None
