"""What-if overrides 테스트 (#14) — 계약 v1.1의 통째 교체(얕은 병합).

핵심 불변식: overrides를 얹은 판정은 그 값으로 처음부터 요청한 판정과 **완전히 같아야 한다**.
가상 프로필을 만든 뒤 평소 경로로 판정하는 구조라, 이게 깨지면 What-if 결과를 믿을 수 없다.
"""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

YOUTH = {
    "birth_date": "1999-03-02",
    "region": "화성시 동탄5동",
    "move_in_date": "2026-02-01",
    "lifecycle": ["전입", "청년"],
    "household_type": "1인가구",
    "members": [{"relation": "본인", "birth_date": "1999-03-02"}],
    "as_of": "2026-06-01",
}
# 만 68세 · 전입 2025-08-01 → as_of 6/1 기준 거주 10개월, 12개월 요건까지 D-61.
# (전입일이 이보다 늦으면 충족일이 90일 창 밖이라 규칙 1로 빠진다 — 경계에 유의)
SENIOR_FIELDS = {
    "birth_date": "1958-05-10",
    "move_in_date": "2025-08-01",
    "members": [{"relation": "본인", "birth_date": "1958-05-10"}],
}


def results_of(payload: dict) -> dict:
    r = client.post("/evaluate", json=payload)
    assert r.status_code == 200, r.json()
    return r.json()["results"]


def ids(results: dict, key: str) -> list[str]:
    return [i["policy"]["policy_id"] for i in results[key]]


def test_overrides_changes_the_verdict():
    """가상 조건이 실제로 판정을 바꾼다 (구현 전에는 200 OK로 조용히 무시됐다)."""
    before = results_of(YOUTH)
    after = results_of({**YOUTH, "overrides": SENIOR_FIELDS})
    assert ids(before, "upcoming") != ids(after, "upcoming")
    # 청년에게는 안 보이던 노후 정책이 가상 프로필에서는 보인다
    assert "hs-2026-0000" in ids(after, "upcoming")


def test_overrides_equals_requesting_that_profile_directly():
    """불변식: overrides 판정 == 그 값으로 직접 요청한 판정."""
    via_overrides = results_of({**YOUTH, "overrides": SENIOR_FIELDS})
    direct = results_of({**YOUTH, **SENIOR_FIELDS})
    assert via_overrides == direct


def test_overrides_replaces_arrays_wholesale():
    """배열은 병합이 아니라 통째 교체 — '자녀 추가'는 C가 전체 members를 보낸다."""
    with_child = {
        **SENIOR_FIELDS,
        "members": [
            {"relation": "본인", "birth_date": "1999-03-02"},
            {"relation": "자녀", "birth_date": "2026-12-01"},
        ],
        "birth_date": "1999-03-02",
    }
    r = client.post("/evaluate", json={**YOUTH, "overrides": with_child})
    assert r.status_code == 200


def test_response_shape_is_identical_to_normal_evaluation():
    """C가 같은 렌더링 컴포넌트를 재사용할 수 있어야 한다 (계약 약속)."""
    normal = client.post("/evaluate", json=YOUTH).json()
    whatif = client.post("/evaluate", json={**YOUTH, "overrides": SENIOR_FIELDS}).json()
    assert normal.keys() == whatif.keys()
    assert normal["results"].keys() == whatif["results"].keys()
    assert whatif["as_of"] == YOUTH["as_of"]  # as_of는 overrides의 영향을 받지 않는다


def test_no_overrides_behaves_as_before():
    assert results_of(YOUTH) == results_of({**YOUTH, "overrides": None})


# ── 거부 케이스: 조용한 무시 금지 ────────────────────────────────────────


def test_unknown_key_is_rejected_not_ignored():
    r = client.post("/evaluate", json={**YOUTH, "overrides": {"household": "다자녀"}})
    assert r.status_code == 400
    msg = r.json()["error"]["message"]
    assert "household" in msg and "허용" in msg  # 오타 필드를 바로 알 수 있어야 한다


def test_as_of_inside_overrides_is_rejected_with_hint():
    """시간 이동은 최상위 as_of 담당 — overrides에 넣으면 안내와 함께 거부."""
    r = client.post("/evaluate", json={**YOUTH, "overrides": {"as_of": "2027-01-01"}})
    assert r.status_code == 400
    assert "as_of" in r.json()["error"]["message"]


def test_inconsistent_override_is_rejected_with_actionable_message():
    """birth_date만 바꾸고 members를 안 바꾸면 모순 — 400으로 즉시 알린다."""
    r = client.post("/evaluate", json={**YOUTH, "overrides": {"birth_date": "1958-05-10"}})
    assert r.status_code == 400
    msg = r.json()["error"]["message"]
    assert "members" in msg  # 무엇을 함께 보내야 하는지 알려준다


def test_enum_violation_inside_overrides_is_rejected():
    r = client.post("/evaluate", json={**YOUTH, "overrides": {"household_type": "1인가구아님"}})
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "VALIDATION"
