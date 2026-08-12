"""판정 요약(ai_summary) 서빙 테스트 — 배치 산출물 조회 + 낡은 요약 차단.

요약은 시민에게 그대로 보이는 문구다. 정책이 수정됐는데 요약이 갱신되지 않았다면
틀린 금액·조건을 안내하게 되므로, 그 경우 문구를 내보내지 않고 null을 준다.
"""
import json

from fastapi.testclient import TestClient

from app import main
from app.summary import attach, load_summaries, lookup, policy_hash, summary_key

POLICY = {
    "policy_id": "hs-2026-9001",
    "title": "테스트 정책",
    "benefit": "월 10만 원",
    "conditions": {"age": {"min": 19}},
    "apply_channel": "온라인",
    "required_docs": ["주민등록등본"],
    "deadline": None,
    "contact": None,
}


def entry(policy: dict, text: str = "안내 문장입니다.") -> dict:
    return {"summary": text, "policy_hash": policy_hash(policy)}


# ── 해시: 요약의 근거가 바뀌었는지 판별한다 ──────────────────────────────


def test_hash_is_stable_across_key_order():
    reordered = dict(reversed(list(POLICY.items())))
    assert policy_hash(POLICY) == policy_hash(reordered)


def test_hash_changes_when_summary_material_changes():
    changed = {**POLICY, "benefit": "월 20만 원"}
    assert policy_hash(changed) != policy_hash(POLICY)


def test_hash_ignores_fields_that_do_not_affect_wording():
    # 검수 기록·출처 URL이 바뀌었다고 요약을 다시 만들 필요는 없다
    assert policy_hash({**POLICY, "source_url": "https://other.example"}) == policy_hash(POLICY)


# ── 조회: 없거나 낡았으면 null ──────────────────────────────────────────


def test_lookup_returns_summary_when_fresh():
    summaries = {summary_key(POLICY["policy_id"], "eligible"): entry(POLICY)}
    assert lookup(summaries, POLICY, "eligible") == "안내 문장입니다."


def test_lookup_returns_none_when_missing():
    assert lookup({}, POLICY, "eligible") is None
    # 같은 정책이라도 분류가 다르면 다른 문구가 필요하다
    summaries = {summary_key(POLICY["policy_id"], "eligible"): entry(POLICY)}
    assert lookup(summaries, POLICY, "docs_needed") is None


def test_lookup_returns_none_when_policy_changed_after_generation():
    """이 PR의 핵심 안전장치 — 낡은 요약으로 틀린 내용을 안내하지 않는다."""
    summaries = {summary_key(POLICY["policy_id"], "eligible"): entry(POLICY)}
    edited = {**POLICY, "benefit": "월 20만 원"}  # 지원 금액이 바뀐 정책
    assert lookup(summaries, edited, "eligible") is None


def test_load_returns_empty_when_file_absent(tmp_path):
    assert load_summaries(tmp_path / "none.json") == {}


def test_load_survives_broken_file(tmp_path):
    """요약은 부가 기능 — 파일이 깨져도 판정 API는 계속 동작해야 한다."""
    broken = tmp_path / "summaries.json"
    broken.write_text("{ not json", encoding="utf-8")
    assert load_summaries(broken) == {}


# ── attach: 세 배열 전체를 채운다 ───────────────────────────────────────


def test_attach_fills_every_item():
    results = {
        "eligible": [{"policy": {"policy_id": POLICY["policy_id"]}}],
        "docs_needed": [],
        "upcoming": [{"policy": {"policy_id": "hs-2026-9999"}}],  # 요약 없는 정책
    }
    summaries = {summary_key(POLICY["policy_id"], "eligible"): entry(POLICY)}
    attach(results, summaries, {POLICY["policy_id"]: POLICY})

    assert results["eligible"][0]["ai_summary"] == "안내 문장입니다."
    assert results["upcoming"][0]["ai_summary"] is None  # 계약: nullable


# ── API 응답 ────────────────────────────────────────────────────────────


def evaluate_request() -> dict:
    return {
        "birth_date": "1995-05-10",
        "region": "화성시 동탄5동",
        "move_in_date": "2025-06-01",
        "lifecycle": ["청년"],
        "household_type": "1인가구",
        "as_of": "2026-08-12",
    }


def all_items(results: dict) -> list[dict]:
    return results["eligible"] + results["docs_needed"] + results["upcoming"]


def test_field_is_present_and_null_without_generated_summaries(monkeypatch):
    """요약을 아직 만들지 않았어도 필드는 존재해야 한다 — C가 분기할 수 있도록."""
    monkeypatch.setattr(main, "SUMMARIES", {})
    r = TestClient(main.app).post("/evaluate", json=evaluate_request())
    assert r.status_code == 200
    items = all_items(r.json()["results"])
    assert items, "판정 결과가 비어 테스트가 무의미하다"
    assert all(i["ai_summary"] is None for i in items)


def test_generated_summary_reaches_the_response(monkeypatch):
    real = json.loads(json.dumps(main.POLICIES["hs-2026-2594"], default=str))
    monkeypatch.setattr(
        main,
        "SUMMARIES",
        {summary_key("hs-2026-2594", "docs_needed"): entry(real, "대출이자를 지원받을 수 있어요.")},
    )
    r = TestClient(main.app).post("/evaluate", json=evaluate_request())
    item = next(i for i in r.json()["results"]["docs_needed"] if i["policy"]["policy_id"] == "hs-2026-2594")
    assert item["ai_summary"] == "대출이자를 지원받을 수 있어요."
