"""계약(api-contract.md v1.1) 준수 테스트 — 골격 단계.

fixture 3종은 계약서 예시 그대로다. 계약서에 필드를 추가하면 fixture와 이 테스트를 함께 갱신한다.
"""
import json
import pathlib

from fastapi.testclient import TestClient

from app.main import app
from app.schemas import EvaluateResponse, Policy

client = TestClient(app, raise_server_exceptions=True)
FIXTURES = pathlib.Path(__file__).parent / "fixtures"


def load(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


def test_health_ok():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_evaluate_contract_shape():
    r = client.post("/evaluate", json=load("request_example.json"))
    assert r.status_code == 200
    body = r.json()
    # 계약: as_of는 요청 값 그대로 반환
    assert body["as_of"] == "2026-08-07"
    # 계약: 세 배열은 항상 존재 (빈 배열 가능)
    assert set(body["results"].keys()) == {"eligible", "docs_needed", "upcoming"}
    for key in ("eligible", "docs_needed", "upcoming"):
        assert isinstance(body["results"][key], list)


def test_members_optional_returns_200():
    # profile.schema.json 기준 members는 선택 — 없으면 본인 단독 판정
    req = load("request_example.json")
    del req["members"]
    r = client.post("/evaluate", json=req)
    assert r.status_code == 200


def test_birth_date_mismatch_returns_400_validation():
    req = load("request_example.json")
    req["members"][0]["birth_date"] = "1998-01-01"
    r = client.post("/evaluate", json=req)
    assert r.status_code == 400
    body = r.json()
    assert body["error"]["code"] == "VALIDATION"
    assert "일치하지 않습니다" in body["error"]["message"]


def test_missing_field_message_names_the_field():
    req = load("request_example.json")
    del req["move_in_date"]
    r = client.post("/evaluate", json=req)
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "VALIDATION"
    assert "move_in_date" in r.json()["error"]["message"]


def test_bad_lifecycle_returns_400():
    req = load("request_example.json")
    req["lifecycle"] = ["1인가구"]  # household 축 값 — lifecycle에 오면 거부돼야 함
    r = client.post("/evaluate", json=req)
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "VALIDATION"


def test_policy_not_found_404():
    r = client.get("/policies/hs-0000-0000")
    assert r.status_code == 404
    assert r.json()["error"]["code"] == "NOT_FOUND"


def test_contract_fixtures_match_schemas():
    """계약서 예시가 Pydantic 스키마로 그대로 파싱되는가 — 스키마·계약 드리프트 감지."""
    EvaluateResponse.model_validate(load("evaluate_response_example.json"))
    Policy.model_validate(load("policy_hs-2026-0087.json"))


def test_upcoming_example_numbers_are_consistent():
    """계약서 검산: 충족일 9/15, as_of 8/7 → D-39, deadline(9/30) 이전."""
    data = load("evaluate_response_example.json")
    up = data["results"]["upcoming"][0]
    assert up["expected_date"] == "2026-09-15"
    assert up["d_day"] == 39
    assert up["expected_date"] <= up["policy"]["deadline"]
