"""실제 data/policies + API 전체 경로 통합 테스트 (as_of 고정).

계약서 프로필(만 27세 · 전입 2026-03-15 · 1인가구, as_of 2026-08-07) 기준 실데이터 판정:
- hs-2026-2594 대출이자   → docs_needed (기계 조건 통과, 소득+서술형 확인 남음)
- hs-2026-2673 내일응원금 → 비대상 (거주 6개월 충족 9/15 > 마감 8/14 — 규칙 2)
- hs-2026-0263 중개보수   → 비대상 (마감 3/6 종료 — 규칙 0)
- hs-2026-0000/0001 노후  → 비대상 (만 65세가 90일 밖 — 규칙 1)

D-day(upcoming)는 상시 모집(deadline: null)인 노후 2건으로 검증한다 — 마감이 없어
"충족 예정일 ≤ 마감일"에 걸리지 않는 유일한 실데이터 경로다.

새 정책이 추가되면 목록이 늘어나는 건 정상이므로 특정 ID의 존재/부재만 확인한다.
"""
import json
import pathlib

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app, raise_server_exceptions=True)
FIXTURES = pathlib.Path(__file__).parent / "fixtures"

# 거주 12개월 요건이 곧 충족되는 어르신 — upcoming 경로의 실데이터 페르소나
SENIOR_MOVED_IN = {
    "birth_date": "1958-05-10",
    "region": "화성시 봉담읍",
    "move_in_date": "2025-09-20",
    "lifecycle": ["노후", "전입"],
    "household_type": "1인가구",
    "as_of": "2026-08-10",
}


def evaluate_request() -> dict:
    return json.loads((FIXTURES / "request_example.json").read_text(encoding="utf-8"))


def ids_of(items: list[dict]) -> list[str]:
    return [item["policy"]["policy_id"] for item in items]


def all_ids(results: dict) -> list[str]:
    return ids_of(results["eligible"]) + ids_of(results["docs_needed"]) + ids_of(results["upcoming"])


def test_youth_profile_classification():
    r = client.post("/evaluate", json=evaluate_request())
    assert r.status_code == 200
    results = r.json()["results"]

    assert "hs-2026-2594" in ids_of(results["docs_needed"])
    # 규칙 0(마감 종료)·규칙 2(충족일>마감)·규칙 1(90일 밖) — 응답 어디에도 없어야 한다
    for excluded in ("hs-2026-0263", "hs-2026-2673", "hs-2026-0000", "hs-2026-0001"):
        assert excluded not in all_ids(results)


def test_senior_profile_gets_dday_on_always_open_policies():
    r = client.post("/evaluate", json=SENIOR_MOVED_IN)
    assert r.status_code == 200
    upcoming = r.json()["results"]["upcoming"]

    hearing = next(i for i in upcoming if i["policy"]["policy_id"] == "hs-2026-0000")
    assert hearing["d_day"] == 41
    assert hearing["expected_date"] == "2026-09-20"
    assert "거주 12개월" in hearing["waiting_for"]
    assert hearing["for_member"] == "본인"
    # 상시 모집이므로 마감 비교를 건너뛴다 (규칙 0·2 예외)
    assert hearing["policy"]["deadline"] is None
    # 충족 후에도 서류 확인이 남는다 — "미리 준비하세요" 안내의 근거
    assert hearing["verify"]


def test_policy_detail_is_normalized_contract_shape():
    r = client.get("/policies/hs-2026-2594")
    assert r.status_code == 200
    body = r.json()
    # 저장 형식(문자열 키 배열)이 아니라 계약 v1.1 객체 배열로 정규화되어 나온다
    assert {
        "key": "income_percentile",
        "label": "소득 기준 (중위소득 180% 이하)",
        "hint": "소득증명원으로 확인이 필요합니다",
    } in body["verify_required"]
    # 내부 검수 기록·저장 전용 필드는 응답에 나가지 않는다
    assert "review" not in body
    assert "manual_conditions" not in body


def test_manual_conditions_surface_as_null_key_verify():
    r = client.get("/policies/hs-2026-0000")  # 보청기 — 서술형 조건 3건
    assert r.status_code == 200
    nulls = [v for v in r.json()["verify_required"] if v["key"] is None]
    assert len(nulls) == 3
    assert all(v["label"] and v["hint"] for v in nulls)


def test_health_reports_policy_count():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["policies"] >= 5  # 검수 게이트를 통과한 실데이터 (추가되면 늘어난다)
