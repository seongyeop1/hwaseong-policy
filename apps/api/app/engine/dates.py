"""날짜 연산 유틸 — Phase 3-a에서 구현 (roadmap.md).

- 만 나이·거주개월은 `dateutil.relativedelta`로 계산한다 (월말·생일 당일 경계 주의)
- 모든 함수는 기준일(as_of)을 인자로 받는다 — `datetime.now()` 금지 (CLAUDE.md 절대 원칙 2)
"""
from datetime import date


def age_on(birth_date: date, as_of: date) -> int:
    """as_of 기준 만 나이."""
    raise NotImplementedError("Phase 3-a에서 구현")


def residence_months(move_in_date: date, as_of: date) -> int:
    """as_of 기준 거주 개월 수 (내림)."""
    raise NotImplementedError("Phase 3-a에서 구현")


def days_until(target: date, as_of: date) -> int:
    """as_of → target 까지 남은 일수 (D-day 숫자)."""
    raise NotImplementedError("Phase 3-a에서 구현")
