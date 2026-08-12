"""규칙 엔진 경계값 테스트 — CLAUDE.md C절 목록 그대로.

D-90/D-91 · 마감 당일 · 생일 당일 · deadline null(상시) · 월말 연산 · 규칙 2(충족일≤마감).
엔진 수정 시 이 파일이 전부 통과해야 한다 (이전 통과 사례의 회귀 감지).
"""
from datetime import date

from app.engine.dates import (
    age_on,
    date_age_reaches,
    date_residence_reaches,
    residence_months,
)
from app.engine.evaluate import evaluate
from app.schemas import Profile

AS_OF = date(2026, 8, 10)


def make_profile(**overrides) -> Profile:
    base = dict(
        birth_date="1999-03-02",
        region="화성시 동탄5동",
        move_in_date="2026-03-15",
        lifecycle=["청년"],
        household_type="1인가구",
    )
    base.update(overrides)
    return Profile(**base)


def make_policy(**overrides) -> dict:
    """저장 스키마 형태의 최소 정책 (data/policies/*.json 과 같은 모양)."""
    base = {
        "policy_id": "hs-2026-9999",
        "title": "테스트 정책",
        "category": "기타",
        "lifecycle": ["청년"],
        "beneficiary": "본인",
        "benefit": "테스트",
        "conditions": {},
        "apply_channel": "온라인",
        "required_docs": ["없음"],
        "source_url": "https://example.com",
    }
    base.update(overrides)
    return base


# ── 규칙 1·2 경계: 90일 창 (D-90 은 upcoming, D-91 은 비대상) ─────────────


def test_d90_is_upcoming():
    # 전입 8/8 + 3개월 = 충족 11/8 → as_of 8/10 기준 D-90
    p = make_policy(conditions={"residence_months": {"min": 3}})
    v = evaluate(make_profile(move_in_date="2026-08-08"), p, AS_OF)
    assert v["status"] == "upcoming"
    assert v["d_day"] == 90
    assert v["expected_date"] == date(2026, 11, 8)


def test_d91_is_excluded():
    # 전입 8/9 + 3개월 = 충족 11/9 → D-91 → 90일 창 밖 (규칙 1)
    p = make_policy(conditions={"residence_months": {"min": 3}})
    v = evaluate(make_profile(move_in_date="2026-08-09"), p, AS_OF)
    assert v["status"] == "excluded"
    assert v["why"] == "beyond_window"


# ── 규칙 0 경계: 마감 당일은 신청 가능, 다음 날부터 제외 ─────────────────


def test_deadline_today_still_open():
    p = make_policy(deadline=AS_OF.isoformat())
    assert evaluate(make_profile(), p, AS_OF)["status"] == "eligible"


def test_deadline_yesterday_excluded():
    p = make_policy(deadline=date(2026, 8, 9).isoformat())
    v = evaluate(make_profile(), p, AS_OF)
    assert v["status"] == "excluded"
    assert v["why"] == "deadline_passed"


# ── 생일 당일: 만 나이는 생일부터 올라간다 ──────────────────────────────


def test_birthday_boundary():
    profile = make_profile(birth_date="2000-08-10")  # as_of 당일이 생일
    p = make_policy(conditions={"age": {"min": 26}})

    on_birthday = evaluate(profile, p, AS_OF)
    assert on_birthday["status"] == "eligible"
    assert on_birthday["reasons"] == ["나이 요건 충족 (만 26세 / 기준 26세 이상)"]

    day_before = evaluate(profile, p, date(2026, 8, 9))
    assert day_before["status"] == "upcoming"
    assert day_before["d_day"] == 1
    assert day_before["expected_date"] == date(2026, 8, 10)


def test_age_helpers_birthday():
    assert age_on(date(2000, 8, 10), date(2026, 8, 9)) == 25
    assert age_on(date(2000, 8, 10), date(2026, 8, 10)) == 26
    assert date_age_reaches(date(2000, 8, 10), 26) == date(2026, 8, 10)


# ── deadline null(상시): 마감 비교는 건너뛰고 90일 창만 적용 ─────────────


def test_no_deadline_pending_within_window_is_upcoming():
    p = make_policy(conditions={"residence_months": {"min": 6}}, deadline=None)
    v = evaluate(make_profile(move_in_date="2026-03-15"), p, AS_OF)  # 충족 9/15 → D-36
    assert v["status"] == "upcoming"
    assert v["expected_date"] == date(2026, 9, 15)


def test_no_deadline_pending_beyond_window_is_excluded():
    p = make_policy(conditions={"residence_months": {"min": 6}}, deadline=None)
    v = evaluate(make_profile(move_in_date="2026-08-01"), p, AS_OF)  # 충족 2027-02-01
    assert v["status"] == "excluded"
    assert v["why"] == "beyond_window"


# ── 월말 연산: relativedelta 절삭 규칙 (3/31 + 6개월 = 9/30 충족) ────────


def test_month_end_residence_semantics():
    assert residence_months(date(2026, 3, 31), date(2026, 9, 29)) == 5
    assert residence_months(date(2026, 3, 31), date(2026, 9, 30)) == 6
    assert date_residence_reaches(date(2026, 3, 31), 6) == date(2026, 9, 30)
    # 1/31 + 1개월 → 평년 2/28 충족
    assert date_residence_reaches(date(2026, 1, 31), 1) == date(2026, 2, 28)


def test_future_move_in_counts_zero():
    # What-if "다음 달 전입하면?" — 전입 전 거주개월은 0, 충족일은 전입일 + 개월
    assert residence_months(date(2026, 9, 1), AS_OF) == 0
    assert date_residence_reaches(date(2026, 9, 1), 1) == date(2026, 10, 1)


# ── 규칙 2: 충족 예정일 ≤ 마감일일 때만 upcoming ────────────────────────


def test_expected_after_deadline_excluded():
    # 전입 5/1 + 6개월 = 충족 11/1, 마감 10/15 → 충족 시점엔 마감 (D-day 표시 금지)
    p = make_policy(conditions={"residence_months": {"min": 6}}, deadline="2026-10-15")
    v = evaluate(make_profile(move_in_date="2026-05-01"), p, AS_OF)
    assert v["status"] == "excluded"
    assert v["why"] == "expected_after_deadline"


def test_expected_on_deadline_day_is_upcoming():
    p = make_policy(conditions={"residence_months": {"min": 6}}, deadline="2026-11-01")
    v = evaluate(make_profile(move_in_date="2026-05-01"), p, AS_OF)
    assert v["status"] == "upcoming"
    assert v["expected_date"] == date(2026, 11, 1)


# ── 규칙 1: 영구 불충족 (나이 상한·가구 유형) ───────────────────────────


def test_age_over_max_excluded():
    p = make_policy(conditions={"age": {"min": 19, "max": 39}})
    v = evaluate(make_profile(birth_date="1980-01-01"), p, AS_OF)
    assert v["status"] == "excluded"
    assert v["why"] == "age_over_max"


def test_household_mismatch_excluded():
    p = make_policy(conditions={"household": ["1인가구"]})
    v = evaluate(make_profile(household_type="다자녀"), p, AS_OF)
    assert v["status"] == "excluded"
    assert v["why"] == "household_mismatch"


def test_household_unrestricted_accepts_any_household():
    p = make_policy(conditions={"household": ["제한없음"]})
    v = evaluate(make_profile(household_type="다자녀"), p, AS_OF)
    assert v["status"] == "eligible"
    # '제한없음'은 조건이 아니므로 "가구 유형 충족" 문장은 만들지 않는다.
    # 사유가 하나도 없을 때 무엇이 들어가는지는 아래 #37 전용 테스트가 고정한다
    assert "가구 유형" not in " ".join(v["reasons"])


# ── 규칙 3: 소득 조건·서술형 조건은 기계 판정 없이 '서류 확인 필요' ───────


def test_income_only_policy_is_docs_needed():
    p = make_policy(
        conditions={"income_percentile": {"max": 150}},
        verify_required=["income_percentile"],
    )
    v = evaluate(make_profile(), p, AS_OF)
    assert v["status"] == "docs_needed"
    assert v["reasons"] == []  # 소득은 판정하지 않으므로 통과 사유가 아니다
    assert v["verify"] == [
        {"key": "income_percentile", "label": "소득 기준 (중위소득 150% 이하)", "hint": "소득증명원으로 확인이 필요합니다"}
    ]


def test_income_condition_without_key_still_goes_to_verify():
    # 파싱에서 verify_required 키를 빠뜨려도 소득 조건은 자동으로 verify에 실린다 (계약 약속)
    p = make_policy(conditions={"income_percentile": {"max": 180}})
    v = evaluate(make_profile(), p, AS_OF)
    assert v["status"] == "docs_needed"
    assert v["verify"][0]["key"] == "income_percentile"
    assert "180%" in v["verify"][0]["label"]


def test_manual_conditions_force_docs_needed():
    p = make_policy(manual_conditions=[{"label": "무주택자에 한함", "hint": "증빙 서류로 확인"}])
    v = evaluate(make_profile(), p, AS_OF)
    assert v["status"] == "docs_needed"
    assert v["verify"] == [{"key": None, "label": "무주택자에 한함", "hint": "증빙 서류로 확인"}]


def test_upcoming_carries_verify_for_prepare_ahead():
    # "미리 준비하세요" 시연의 근거 — upcoming에도 남은 확인 항목이 실린다
    p = make_policy(
        conditions={"residence_months": {"min": 6}, "income_percentile": {"max": 150}},
        verify_required=["income_percentile"],
    )
    v = evaluate(make_profile(move_in_date="2026-03-15"), p, AS_OF)
    assert v["status"] == "upcoming"
    assert v["verify"][0]["key"] == "income_percentile"


# ── #37: 조건 없는 정책도 통과 사유가 있어야 한다 ────────────────────────


def test_eligible_without_conditions_still_has_reason():
    """조건이 '제한없음'뿐이면 통과 사유 문장이 안 나온다 — 카드가 설명 없이 뜨는 것을 막는다."""
    p = make_policy(conditions={"household": ["제한없음"]})
    v = evaluate(make_profile(), p, AS_OF)
    assert v["status"] == "eligible"
    assert v["reasons"] == ["별도의 나이·소득·거주 요건이 없습니다"]


def test_eligible_with_no_conditions_at_all_has_reason():
    p = make_policy(conditions={})
    v = evaluate(make_profile(), p, AS_OF)
    assert v["status"] == "eligible"
    assert v["reasons"] == ["별도의 나이·소득·거주 요건이 없습니다"]


def test_real_reasons_are_not_replaced_by_fallback():
    """실제 통과 사유가 있으면 대체 문장을 넣지 않는다."""
    p = make_policy(conditions={"age": {"min": 19, "max": 39}, "household": ["제한없음"]})
    v = evaluate(make_profile(), p, AS_OF)
    assert v["reasons"] == ["나이 요건 충족 (만 27세 / 기준 19~39세)"]


def test_docs_needed_keeps_empty_reasons():
    """소득만 있는 정책은 verify 가 설명을 대신하므로 '요건이 없다'고 말하면 거짓이 된다."""
    p = make_policy(
        conditions={"income_percentile": {"max": 150}}, verify_required=["income_percentile"]
    )
    v = evaluate(make_profile(), p, AS_OF)
    assert v["status"] == "docs_needed"
    assert v["reasons"] == []
    assert v["verify"][0]["key"] == "income_percentile"
