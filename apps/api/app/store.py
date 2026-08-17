"""정책 스토어 — data/policies/*.json 로드 (검수 게이트 포함).

Supabase 전환(Phase 2 잔여) 전까지의 서빙 소스. 전환 시 load_policies 구현만 교체한다.

게이트: "검수 통과분만 반영" (CLAUDE.md 절대 규칙). 검수 기록(review)이 없거나 체크리스트가
미완이거나 파싱자=검수자인 정책은 서빙에서 제외하고 로그를 남긴다 — 이 로그가 발표의
"전수 검수" 증빙이다. 기준은 scripts/validate_policies.py(CI)와 동일하게 맞춘다.
"""
import json
import logging
import os
from datetime import date
from pathlib import Path

log = logging.getLogger("app.store")

# 판정 경로가 date.fromisoformat 으로 읽는 필드 (evaluate._parse_date · to_api_policy).
# 여기서 예외가 나면 evaluate_all 순회가 통째로 중단돼 정상 정책까지 500 이 된다.
DATE_FIELDS = ("deadline", "first_seen")

# scripts/validate_policies.py 와 동일 — 검수 7항목 (⑦ conditions_complete 포함)
REQUIRED_CHECKS = [
    "conditions",
    "deadline",
    "benefit",
    "required_docs",
    "apply_channel",
    "source_url",
    "conditions_complete",
]

_DEFAULT_DIR = Path(__file__).resolve().parents[3] / "data" / "policies"


def review_gate_reason(policy: dict) -> str | None:
    """검수 게이트 위반 사유. 통과면 None."""
    review = policy.get("review")
    if not review:
        return "review 블록 없음 (2인 교차 검수 미완료)"
    checklist = review.get("checklist", {})
    missing = [k for k in REQUIRED_CHECKS if not checklist.get(k)]
    if missing:
        return f"검수 체크리스트 미완료: {', '.join(missing)}"
    if review.get("parsed_by") == review.get("reviewed_by"):
        return f"파싱자와 검수자가 동일 ({review.get('parsed_by')}) — 교차 검수 위반"
    return None


def parse_gate_reason(policy: dict) -> str | None:
    """판정 경로에서 예외를 일으킬 값이 있는지. 통과면 None.

    CI(scripts/validate_policies.py)가 입구에서 막지만, 스키마의 날짜 검사는 자릿수만 보는
    정규식이라 `2026-02-30`·`2026-13-01` 같은 **실재하지 않는 날짜**가 통과한다. 그런 값 하나가
    판정 중 예외를 일으키면 요청 전체가 500이 되어 정상 정책까지 화면에서 사라진다 — 검수
    게이트와 같은 방식으로 그 정책만 제외해 나머지를 지킨다.
    """
    for field in DATE_FIELDS:
        value = policy.get(field)
        if value is None or isinstance(value, date):
            continue
        try:
            date.fromisoformat(value)
        except (ValueError, TypeError):
            return f"{field}가 날짜로 해석되지 않습니다: {value!r}"
    return None


def load_policies(policies_dir: str | os.PathLike | None = None) -> dict[str, dict]:
    """정책 파일 전체를 읽어 {policy_id: 저장 스키마 dict}로 반환. 게이트 탈락분은 제외+로그."""
    base = Path(policies_dir or os.getenv("POLICIES_DIR") or _DEFAULT_DIR)
    loaded: dict[str, dict] = {}
    rejected = 0
    for path in sorted(base.glob("*.json")):
        try:
            policy = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            log.error("정책 파일 파싱 실패 — 서빙 제외: %s (%s)", path.name, e)
            rejected += 1
            continue
        pid = policy.get("policy_id", path.stem)
        reason = review_gate_reason(policy) or parse_gate_reason(policy)
        if reason:
            log.warning("게이트 탈락 — 서빙 제외: %s (%s)", pid, reason)
            rejected += 1
            continue
        loaded[pid] = policy
    log.info("정책 로드 완료: 통과 %d건 / 게이트 탈락 %d건 (%s)", len(loaded), rejected, base)
    return loaded
