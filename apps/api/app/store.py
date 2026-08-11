"""정책 스토어 — data/policies/*.json 로드 (검수 게이트 포함).

Supabase 전환(Phase 2 잔여) 전까지의 서빙 소스. 전환 시 load_policies 구현만 교체한다.

게이트: "검수 통과분만 반영" (CLAUDE.md 절대 규칙). 검수 기록(review)이 없거나 체크리스트가
미완이거나 파싱자=검수자인 정책은 서빙에서 제외하고 로그를 남긴다 — 이 로그가 발표의
"전수 검수" 증빙이다. 기준은 scripts/validate_policies.py(CI)와 동일하게 맞춘다.
"""
import json
import logging
import os
from pathlib import Path

log = logging.getLogger("app.store")

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
        reason = review_gate_reason(policy)
        if reason:
            log.warning("검수 게이트 탈락 — 서빙 제외: %s (%s)", pid, reason)
            rejected += 1
            continue
        loaded[pid] = policy
    log.info("정책 로드 완료: 통과 %d건 / 게이트 탈락 %d건 (%s)", len(loaded), rejected, base)
    return loaded
