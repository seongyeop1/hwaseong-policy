"""first_seen → is_new 계산 (v1.1.4) — 저장값은 first_seen뿐, is_new는 as_of 기준 서버 계산.

핵심 보장: first_seen이 없는 정책(현재 데이터 전부)은 first_seen null · is_new false로
나가며 다른 필드는 변하지 않는다 — 기존 스위트·fixture subset 테스트가 그대로 통과한다.
"""
from datetime import date

from app.engine.evaluate import NEW_WINDOW_DAYS, evaluate_all, to_api_policy
from app.schemas import Profile

AS_OF = date(2026, 8, 20)


def make_profile() -> Profile:
    return Profile(
        birth_date="1992-04-10",
        region="화성시 향남읍",
        move_in_date="2024-05-01",
        lifecycle=["출산·육아"],
        household_type="유자녀가구",
    )


def make_policy(**overrides) -> dict:
    base = {
        "policy_id": "hs-2026-9999",
        "title": "테스트 정책",
        "category": "기타",
        "lifecycle": ["출산·육아"],
        "beneficiary": "본인",
        "benefit": "테스트",
        "conditions": {},
        "apply_channel": "온라인",
        "required_docs": ["없음"],
        "source_url": "https://example.com",
    }
    base.update(overrides)
    return base


def test_without_first_seen_fields_are_inert():
    api = to_api_policy(make_policy(), AS_OF)
    assert api["first_seen"] is None
    assert api["is_new"] is False


def test_recent_first_seen_is_new():
    api = to_api_policy(make_policy(first_seen="2026-08-15"), AS_OF)  # 5일 전
    assert api["first_seen"] == date(2026, 8, 15)
    assert api["is_new"] is True


def test_window_boundary_inclusive_then_exclusive():
    exactly = AS_OF.fromordinal(AS_OF.toordinal() - NEW_WINDOW_DAYS)  # D-7 → 신규
    over = AS_OF.fromordinal(AS_OF.toordinal() - NEW_WINDOW_DAYS - 1)  # D-8 → 아님
    assert to_api_policy(make_policy(first_seen=exactly.isoformat()), AS_OF)["is_new"] is True
    assert to_api_policy(make_policy(first_seen=over.isoformat()), AS_OF)["is_new"] is False


def test_future_first_seen_is_not_new():
    # What-if로 과거(as_of)를 보면 아직 관측 전인 정책 — 신규로 표시하지 않는다
    api = to_api_policy(make_policy(first_seen="2026-08-25"), AS_OF)
    assert api["is_new"] is False


def test_evaluate_all_threads_as_of_into_policy():
    p = make_policy(first_seen="2026-08-14")  # as_of 8/20 기준 6일 전
    r = evaluate_all(make_profile(), [p], AS_OF)
    policy = r["eligible"][0]["policy"]
    assert policy["is_new"] is True
    assert policy["first_seen"] == date(2026, 8, 14)
