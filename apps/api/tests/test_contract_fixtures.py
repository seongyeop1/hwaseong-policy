"""계약서 v1.1 응답 예시 3건(만 27세 · 충족일 9/15 · D-39)을 엔진이 그대로 재현하는가.

CLAUDE.md C절: "계약서 예시 3건은 fixture로 상시 assert". 저장 스키마 형태의 정책 3건을
엔진에 넣고, 결과가 fixtures/evaluate_response_example.json(계약서 원문 예시)과 문장 단위로
일치해야 한다 — reasons·verify 문구, waiting_for, d_day까지.
"""
import json
import pathlib
from datetime import date

from app.engine.evaluate import evaluate_all
from app.schemas import Profile, Results

FIXTURES = pathlib.Path(__file__).parent / "fixtures"

# 계약서 응답 예시의 원본이 되는 정책 3건 — 저장 스키마(data/policies) 형태.
# 응답 예시의 policy 객체는 이 저장 형태가 정규화된 결과다 (계약서 '필드별 약속').

POLICY_0101 = {
    "policy_id": "hs-2026-0101",
    "title": "화성시 청년 문화활동비 지원",
    "category": "문화",
    "lifecycle": ["청년"],
    "beneficiary": "본인",
    "benefit": "연 10만 원 문화포인트",
    "conditions": {
        "age": {"min": 19, "max": 34},
        "household": ["1인가구", "신혼부부"],
    },
    "exclusions": [],
    "deadline": "2026-11-30",
    "apply_channel": "온라인",
    "required_docs": ["주민등록등본"],
    "source_url": "https://example.hscity.go.kr/notice/0101",
}

POLICY_0087 = {
    "policy_id": "hs-2026-0087",
    "title": "화성시 청년 이사비 지원",
    "category": "주거",
    "lifecycle": ["전입", "청년"],
    "beneficiary": "본인",
    "benefit": "이사비 최대 30만 원",
    "conditions": {
        "age": {"min": 19, "max": 39},
        "income_percentile": {"max": 150},
    },
    "verify_required": ["income_percentile"],
    "manual_conditions": [
        {
            "label": "무주택자에 한함",
            "hint": "공고 원문 기준 — 무주택 여부 증빙 서류로 확인이 필요합니다",
        }
    ],
    "exclusions": [],
    "deadline": "2026-10-15",
    "apply_channel": "온라인·시청 방문",
    "required_docs": ["주민등록등본", "소득증명원", "임대차계약서"],
    "source_url": "https://example.hscity.go.kr/notice/0087",
}

POLICY_0042 = {
    "policy_id": "hs-2026-0042",
    "title": "화성시 청년 월세 지원",
    "category": "주거",
    "lifecycle": ["전입", "청년"],
    "beneficiary": "세대주",
    "benefit": "월 최대 20만 원, 최장 12개월",
    "conditions": {
        "age": {"min": 19, "max": 39},
        "residence_months": {"min": 6},
        "household": ["1인가구", "신혼부부"],
        "income_percentile": {"max": 150},
    },
    "verify_required": ["income_percentile"],
    "exclusions": ["국토부 청년월세 특별지원과 중복 수급 불가"],
    "deadline": "2026-09-30",
    "apply_channel": "온라인·시청 방문",
    "required_docs": ["주민등록등본", "소득증명원"],
    "source_url": "https://example.hscity.go.kr/notice/0042",
}


def assert_subset(expected, actual, path="results"):
    """expected(계약서 예시)의 모든 키·값이 actual(엔진 출력)에 그대로 있는가.

    엔진이 계약에 '추가'한 필드(예: contact: null)는 허용된다 — 계약은 필드 추가만 허용,
    C는 모르는 필드를 무시한다. 배열은 길이·순서까지 일치해야 한다.
    """
    if isinstance(expected, dict):
        assert isinstance(actual, dict), f"{path}: dict가 아님"
        for k, v in expected.items():
            assert k in actual, f"{path}.{k} 누락"
            assert_subset(v, actual[k], f"{path}.{k}")
    elif isinstance(expected, list):
        assert isinstance(actual, list), f"{path}: list가 아님"
        assert len(actual) == len(expected), f"{path}: 길이 {len(actual)} != {len(expected)}"
        for i, (e, a) in enumerate(zip(expected, actual)):
            assert_subset(e, a, f"{path}[{i}]")
    else:
        assert actual == expected, f"{path}: {actual!r} != {expected!r}"


def test_engine_reproduces_contract_examples():
    request = json.loads((FIXTURES / "request_example.json").read_text(encoding="utf-8"))
    expected = json.loads(
        (FIXTURES / "evaluate_response_example.json").read_text(encoding="utf-8")
    )["results"]

    profile = Profile(**request)
    results = evaluate_all(
        profile, [POLICY_0101, POLICY_0087, POLICY_0042], date(2026, 8, 7)
    )
    serialized = Results.model_validate(results).model_dump(mode="json")

    assert_subset(expected, serialized)


def test_contract_example_key_numbers():
    """검산 요약 — 만 27세 · 충족일 9/15 · D-39 (계약서 하단 명시)."""
    profile = Profile(
        **json.loads((FIXTURES / "request_example.json").read_text(encoding="utf-8"))
    )
    results = evaluate_all(profile, [POLICY_0042], date(2026, 8, 7))
    up = results["upcoming"][0]
    assert up["d_day"] == 39
    assert up["expected_date"] == date(2026, 9, 15)
    assert up["waiting_for"] == "거주 6개월 요건 충족까지 (전입일 2026-03-15 기준)"
    assert up["reasons"] == [
        "나이 요건 충족 (만 27세 / 기준 19~39세)",
        "가구 유형 충족 (1인가구)",
    ]
