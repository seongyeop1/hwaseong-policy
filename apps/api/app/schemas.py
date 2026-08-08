"""Pydantic 모델 — 요청·응답 형태의 정본은 api-contract.md v1.1, enum 정본은 packages/schema/*.json.

계약 동결 규칙: 필드 추가만 허용, 이름·타입·구조 변경 금지.
"""
from __future__ import annotations

from datetime import date
from typing import Any

from pydantic import BaseModel, field_validator, model_validator

from .enums import HOUSEHOLD, LIFECYCLE, RELATION


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
    overrides: dict[str, Any] | None = None  # 최종 스펙 8/13 확정 (기본안: 통째 교체 병합)

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


class DocsNeededItem(BaseModel):
    for_member: str
    policy: Policy
    reasons: list[str]
    verify: list[VerifyItem]


class UpcomingItem(BaseModel):
    for_member: str
    policy: Policy
    reasons: list[str]
    waiting_for: str
    d_day: int
    expected_date: date  # 규칙 2에 의해 expected_date <= deadline 보장
    verify: list[VerifyItem] = []


class Results(BaseModel):
    """세 배열은 항상 존재하며, 해당 없으면 빈 배열 (계약서 약속 — C는 null 체크 불필요)."""

    eligible: list[EligibleItem] = []
    docs_needed: list[DocsNeededItem] = []
    upcoming: list[UpcomingItem] = []


class EvaluateResponse(BaseModel):
    as_of: date
    results: Results
