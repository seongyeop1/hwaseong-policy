"""실제 data/policies 6건 + API 전체 경로 통합 테스트 (as_of 2026-08-07 고정).

시드 6건의 기대 분류 (계약서 프로필: 만 27세 · 전입 3/15 · 1인가구):
- hs-2026-0042 청년 월세     → upcoming (거주 6개월 충족 9/15, D-39)
- hs-2026-2594 대출이자      → docs_needed (기계 조건 통과, 소득+서술형 확인)
- hs-2026-2673 내일응원금    → 비대상 (거주 충족 9/15 > 마감 8/14 — 규칙 2)
- hs-2026-0263 중개보수      → 비대상 (마감 3/6 종료 — 규칙 0)
- hs-2026-0000/0001 노후 2건 → 비대상 (만 65세 요건이 90일 밖 — 규칙 1)

새 정책이 추가되면 목록이 늘어나는 건 정상이므로, 특정 ID의 존재/부재만 확인한다.
"""
import json
import pathlib

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app, raise_server_exceptions=True)
FIXTURES = pathlib.Path(__file__).parent / "fixtures"


def evaluate_request() -> dict:
    return json.loads((FIXTURES / "request_example.json").read_text(encoding="utf-8"))


def ids_of(items: list[dict]) -> list[str]:
    return [item["policy"]["policy_id"] for item in items]


def test_seed_policies_classification():
    r = client.post("/evaluate", json=evaluate_request())
    assert r.status_code == 200
    results = r.json()["results"]

    all_ids = ids_of(results["eligible"]) + ids_of(results["docs_needed"]) + ids_of(results["upcoming"])

    assert "hs-2026-0042" in ids_of(results["upcoming"])
    assert "hs-2026-2594" in ids_of(results["docs_needed"])
    # 규칙 0(마감 종료)·규칙 2(충족일>마감)·규칙 1(90일 밖) — 응답 어디에도 없어야 한다
    for excluded in ("hs-2026-0263", "hs-2026-2673", "hs-2026-0000", "hs-2026-0001"):
        assert excluded not in all_ids

    up = next(i for i in results["upcoming"] if i["policy"]["policy_id"] == "hs-2026-0042")
    assert up["d_day"] == 39
    assert up["expected_date"] == "2026-09-15"
    assert up["for_member"] == "본인"


def test_policy_detail_is_normalized_contract_shape():
    r = client.get("/policies/hs-2026-0042")
    assert r.status_code == 200
    body = r.json()
    # 저장 형식(문자열 키 배열)이 아니라 계약 v1.1 객체 배열로 정규화되어 나온다
    assert body["verify_required"] == [
        {
            "key": "income_percentile",
            "label": "소득 기준 (중위소득 150% 이하)",
            "hint": "소득증명원으로 확인이 필요합니다",
        }
    ]
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
    assert r.json()["policies"] >= 6  # 시드 6건은 전부 검수 게이트 통과
