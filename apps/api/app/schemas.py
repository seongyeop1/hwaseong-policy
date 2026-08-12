"""Pydantic 모델 — 요청·응답 형태의 정본은 api-contract.md v1.1, enum 정본은 packages/schema/*.json.

계약 동결 규칙: 필드 추가만 허용, 이름·타입·구조 변경 금지.
"""
from __future__ import annotations

from datetime import date
from typing import Any

from pydantic import BaseModel, field_validator, model_validator

from .enums import HOUSEHOLD, LIFECYCLE, RELATION

# What-if overrides로 바꿀 수 있는 항목 = "가상의 나는 누구인가"를 이루는 필드.
# as_of(시간 이동)와 overrides(중첩)는 여기 없다 — 계약 v1.1의 역할 분담.
OVERRIDABLE_FIELDS = ("birth_date", "region", "move_in_date", "lifecycle", "household_type", "members")


# ── 요청 (POST /evaluate) ──────────────────────────────────────────────


class Member(BaseModel):
    relation: str
    birth_date: date
    is_householder: bool | None = None  # profile.schema.json — 세대주 여부 (beneficiary 매핑용)

    @field_validator("relation")
    @classmethod
    def relation_allowed(cls, v: str) -> str:
        if v not in RELATION:
            raise ValueError(f"relation 허용값이 아닙니다: {v} (허용: {', '.join(RELATION)})")
        return v


class Profile(BaseModel):
    birth_date: date
    region: str
    move_in_date: date
    lifecycle: list[str]
    household_type: str
    # profile.schema.json 기준 members는 선택 — 없으면 본인 단독 판정 (가구 판정은 8/14~)
    members: list[Member] = []
    as_of: date | None = None  # 생략 시 서버의 오늘 (계약서: 시연 재현·What-if 시간 이동용)
    overrides: dict[str, Any] | None = None  # What-if 가상 프로필 (계약: 통째 교체 얕은 병합)

    @field_validator("lifecycle")
    @classmethod
    def lifecycle_allowed(cls, v: list[str]) -> list[str]:
        bad = [x for x in v if x not in LIFECYCLE]
        if bad:
            raise ValueError(f"lifecycle 허용값이 아닙니다: {bad} (허용: {', '.join(LIFECYCLE)})")
        return v

    @field_validator("household_type")
    @classmethod
    def household_allowed(cls, v: str) -> str:
        if v not in HOUSEHOLD:
            raise ValueError(f"household_type 허용값이 아닙니다: {v} (허용: {', '.join(HOUSEHOLD)})")
        return v

    @model_validator(mode="after")
    def birth_date_matches_self_member(self) -> "Profile":
        selfs = [m for m in self.members if m.relation == "본인"]
        if selfs and selfs[0].birth_date != self.birth_date:
            raise ValueError("birth_date와 members[본인].birth_date가 일치하지 않습니다")
        return self

    @model_validator(mode="after")
    def overrides_keys_allowed(self) -> "Profile":
        """모르는 키를 조용히 무시하면 C가 '시뮬레이터가 안 먹는다'로 늦게 발견한다 — 즉시 거부."""
        if not self.overrides:
            return self
        bad = [k for k in self.overrides if k not in OVERRIDABLE_FIELDS]
        if bad:
            allowed = ", ".join(OVERRIDABLE_FIELDS)
            hint = ""
            if "as_of" in bad:
                # 계약: 시간 이동은 최상위 as_of 담당 (overrides는 '누구인가'만 바꾼다)
                hint = " — 시간 이동은 overrides가 아니라 최상위 as_of로 보내세요"
            raise ValueError(f"overrides에 넣을 수 없는 항목입니다: {', '.join(bad)} (허용: {allowed}){hint}")
        return self


# ── 응답 (계약서 v1.1) ─────────────────────────────────────────────────


class VerifyItem(BaseModel):
    """확인 항목. key는 기계 판정 필드 참조, 서술형 조건이면 None (8/7 조건 이원화 결정).

    저장 스키마(policy.schema.json)의 verify_required(문자열)·manual_conditions와 무관하게
    API 응답에서는 항상 이 객체 형태로 정규화된다 (계약서 필드별 약속).
    """

    key: str | None
    label: str
    hint: str


class Policy(BaseModel):
    """정책 객체 — 어디에 등장하든 GET /policies/{id}와 동일한 전체 스키마 (계약서 약속)."""

    policy_id: str
    title: str
    category: str
    lifecycle: list[str]
    beneficiary: str
    benefit: str
    conditions: dict[str, Any]  # 기계 판정 값만 (서술형은 verify로 정규화되어 나감)
    verify_required: list[VerifyItem] = []
    exclusions: list[str] = []  # 표시 전용 — 판정에 사용 금지
    deadline: date | None = None  # 없으면 상시 모집
    apply_channel: str
    required_docs: list[str]
    source_url: str
    contact: str | None = None  # 담당부서 연락처 (required_docs 미표기 정책의 Plan B)


class EligibleItem(BaseModel):
    for_member: str
    policy: Policy
    reasons: list[str]
    # 계약: nullable. null이면 C가 "요약 준비 중"을 표시한다 (배치 생성 — app/summary.py)
    ai_summary: str | None = None


class DocsNeededItem(BaseModel):
    for_member: str
    policy: Policy
    reasons: list[str]
    verify: list[VerifyItem]
    ai_summary: str | None = None


class UpcomingItem(BaseModel):
    for_member: str
    policy: Policy
    reasons: list[str]
    waiting_for: str
    d_day: int
    expected_date: date  # 규칙 2에 의해 expected_date <= deadline 보장
    verify: list[VerifyItem] = []
    ai_summary: str | None = None


class Results(BaseModel):
    """세 배열은 항상 존재하며, 해당 없으면 빈 배열 (계약서 약속 — C는 null 체크 불필요)."""

    eligible: list[EligibleItem] = []
    docs_needed: list[DocsNeededItem] = []
    upcoming: list[UpcomingItem] = []


class EvaluateResponse(BaseModel):
    as_of: date
    results: Results
