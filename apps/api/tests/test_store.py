"""정책 스토어 검수 게이트 테스트 — "검수 통과분만 반영"의 기계적 강제."""
import json

from app.store import load_policies, review_gate_reason

GOOD_REVIEW = {
    "parsed_by": "A",
    "reviewed_by": "D",
    "reviewed_at": "2026-08-10",
    "checklist": {
        "conditions": True,
        "deadline": True,
        "benefit": True,
        "required_docs": True,
        "apply_channel": True,
        "source_url": True,
        "conditions_complete": True,
    },
}


def minimal_policy(pid: str, **overrides) -> dict:
    base = {
        "policy_id": pid,
        "title": "테스트",
        "category": "기타",
        "lifecycle": ["청년"],
        "beneficiary": "본인",
        "benefit": "테스트",
        "conditions": {},
        "apply_channel": "온라인",
        "required_docs": ["없음"],
        "source_url": "https://example.com",
        "review": GOOD_REVIEW,
    }
    base.update(overrides)
    return base


def write(dir_path, policy: dict) -> None:
    (dir_path / f"{policy['policy_id']}.json").write_text(
        json.dumps(policy, ensure_ascii=False), encoding="utf-8"
    )


def test_gate_reasons():
    assert review_gate_reason(minimal_policy("hs-2026-9001")) is None

    no_review = minimal_policy("hs-2026-9002")
    del no_review["review"]
    assert "review 블록 없음" in review_gate_reason(no_review)

    incomplete = minimal_policy(
        "hs-2026-9003",
        review={**GOOD_REVIEW, "checklist": {**GOOD_REVIEW["checklist"], "conditions_complete": False}},
    )
    assert "conditions_complete" in review_gate_reason(incomplete)

    self_reviewed = minimal_policy("hs-2026-9004", review={**GOOD_REVIEW, "reviewed_by": "A"})
    assert "교차 검수 위반" in review_gate_reason(self_reviewed)


def test_load_serves_only_gate_passing_policies(tmp_path):
    write(tmp_path, minimal_policy("hs-2026-9001"))                       # 통과
    no_review = minimal_policy("hs-2026-9002")
    del no_review["review"]
    write(tmp_path, no_review)                                            # 탈락: 기록 없음
    write(tmp_path, minimal_policy("hs-2026-9004", review={**GOOD_REVIEW, "reviewed_by": "A"}))  # 탈락: 자가 검수

    loaded = load_policies(tmp_path)
    assert set(loaded) == {"hs-2026-9001"}
