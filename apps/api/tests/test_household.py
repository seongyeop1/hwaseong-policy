"""가구 단위 판정 — beneficiary → 기준 가구원 매핑과 (정책, 가구원) 쌍 불변식.

핵심 보장: members가 없거나 본인뿐이면 종전 본인 단독 판정과 완전히 같다 (하위 호환 —
기존 스위트와 계약서 fixture 3건이 이를 상시 확인한다). 이 파일은 그 너머,
가구원이 있을 때의 매핑·세대주 폴백·다자녀 항목 분리를 고정한다.
"""
from datetime import date

from app.engine.evaluate import apply_overrides, evaluate_all
from app.schemas import Profile

AS_OF = date(2026, 8, 15)


def make_profile(**overrides) -> Profile:
    base = dict(
        birth_date="1992-04-10",  # 만 34세 (AS_OF 기준)
        region="화성시 향남읍",
        move_in_date="2024-05-01",
        lifecycle=["출산·육아"],
        household_type="유자녀가구",
    )
    base.update(overrides)
    return Profile(**base)


def make_policy(**overrides) -> dict:
    """저장 스키마 형태의 최소 정책 (data/policies/*.json 과 같은 모양)."""
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


def flat(results: dict) -> list[tuple[str, str, str]]:
    """(분류, for_member, policy_id) 로 평탄화 — 어느 목록에 누가 실렸는지 한눈에 비교."""
    return [
        (bucket, item["for_member"], item["policy"]["policy_id"])
        for bucket in ("eligible", "docs_needed", "upcoming")
        for item in results[bucket]
    ]


# ── beneficiary 매핑: 자녀·배우자는 그 가구원의 나이로 판정한다 ───────────


def test_child_policy_without_child_is_excluded():
    p = make_policy(beneficiary="자녀", conditions={"age": {"max": 12}})
    assert flat(evaluate_all(make_profile(), [p], AS_OF)) == []


def test_child_policy_judged_by_child_age_not_parent():
    # 본인(만 34세)은 상한(12세) 밖 — 자녀(만 9세) 기준이므로 eligible
    p = make_policy(beneficiary="자녀", conditions={"age": {"min": 6, "max": 12}})
    prof = make_profile(members=[
        {"relation": "본인", "birth_date": "1992-04-10"},
        {"relation": "자녀", "birth_date": "2017-05-01"},
    ])
    r = evaluate_all(prof, [p], AS_OF)
    assert flat(r) == [("eligible", "자녀", "hs-2026-9999")]
    assert "만 9세" in r["eligible"][0]["reasons"][0]


def test_two_children_two_items_no_dedup():
    # 만 9세 → eligible / 만 5세(6세 도달 2026-10-01, D-47) → upcoming.
    # 같은 정책이 두 항목 — (정책, 가구원) 쌍 불변식이므로 중복 제거하지 않는다.
    p = make_policy(beneficiary="자녀", conditions={"age": {"min": 6, "max": 12}})
    prof = make_profile(members=[
        {"relation": "본인", "birth_date": "1992-04-10"},
        {"relation": "자녀", "birth_date": "2017-05-01"},
        {"relation": "자녀", "birth_date": "2020-10-01"},
    ])
    r = evaluate_all(prof, [p], AS_OF)
    assert flat(r) == [
        ("eligible", "자녀", "hs-2026-9999"),
        ("upcoming", "자녀", "hs-2026-9999"),
    ]
    assert r["upcoming"][0]["d_day"] == 47
    assert r["upcoming"][0]["expected_date"] == date(2026, 10, 1)


def test_spouse_policy_judged_by_spouse():
    # 본인(만 45세)은 상한(39세) 밖 — 배우자(만 35세) 기준이라 통과
    p = make_policy(beneficiary="배우자", conditions={"age": {"min": 19, "max": 39}})
    prof = make_profile(
        birth_date="1981-01-01",
        members=[
            {"relation": "본인", "birth_date": "1981-01-01"},
            {"relation": "배우자", "birth_date": "1991-06-01"},
        ],
    )
    assert flat(evaluate_all(prof, [p], AS_OF)) == [("eligible", "배우자", "hs-2026-9999")]


# ── 세대주: is_householder 지정이 우선, 미지정은 성인=본인 / 미성년=부모 ───


def test_householder_flag_wins():
    p = make_policy(beneficiary="세대주", conditions={"age": {"max": 39}})
    prof = make_profile(
        birth_date="1981-01-01",  # 만 45세 — 본인 기준이면 비대상
        members=[
            {"relation": "본인", "birth_date": "1981-01-01"},
            {"relation": "배우자", "birth_date": "1991-06-01", "is_householder": True},
        ],
    )
    assert flat(evaluate_all(prof, [p], AS_OF)) == [("eligible", "배우자", "hs-2026-9999")]


def test_householder_fallback_adult_self():
    # 미지정 + 성인 본인 → 본인이 세대주 (계약서 fixture 0042와 같은 종전 동작)
    p = make_policy(beneficiary="세대주")
    assert flat(evaluate_all(make_profile(), [p], AS_OF)) == [("eligible", "본인", "hs-2026-9999")]


def test_householder_fallback_minor_uses_parent():
    # 미성년 본인(만 17세, 조력자 모드) → 부/모가 세대주. 나이 조건도 모(만 48세) 기준
    p = make_policy(beneficiary="세대주", conditions={"age": {"min": 19}})
    prof = make_profile(
        birth_date="2009-01-01",
        lifecycle=["청년"],
        household_type="한부모",
        members=[
            {"relation": "본인", "birth_date": "2009-01-01"},
            {"relation": "모", "birth_date": "1978-03-01"},
        ],
    )
    assert flat(evaluate_all(prof, [p], AS_OF)) == [("eligible", "모", "hs-2026-9999")]


def test_householder_fallback_minor_without_parent_excluded():
    p = make_policy(beneficiary="세대주")
    prof = make_profile(birth_date="2009-01-01", lifecycle=["청년"])
    assert flat(evaluate_all(prof, [p], AS_OF)) == []


# ── What-if: "둘째가 태어나면?" 이 실제 판정 경로에서 동작한다 ─────────────


def test_whatif_adding_child_changes_result():
    p = make_policy(beneficiary="자녀", conditions={"age": {"max": 12}})
    base = dict(
        birth_date="1992-04-10",
        region="화성시 향남읍",
        move_in_date="2024-05-01",
        lifecycle=["출산·육아"],
        household_type="유자녀가구",
        members=[{"relation": "본인", "birth_date": "1992-04-10"}],
    )
    assert flat(evaluate_all(Profile(**base), [p], AS_OF)) == []

    virtual = apply_overrides(Profile(**base, overrides={
        "members": [
            {"relation": "본인", "birth_date": "1992-04-10"},
            {"relation": "자녀", "birth_date": "2026-06-01"},
        ]
    }))
    assert flat(evaluate_all(virtual, [p], AS_OF)) == [("eligible", "자녀", "hs-2026-9999")]
