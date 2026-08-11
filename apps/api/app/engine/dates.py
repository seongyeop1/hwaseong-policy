"""만 나이·거주개월·D-day 계산 — relativedelta 기반 (경계: 생일 당일·월말·D-90/91).

- 모든 함수는 기준일(as_of)을 인자로 받는다 — `datetime.now()` 금지 (CLAUDE.md 절대 원칙)
- "몇 세/몇 개월인가"를 판정하는 함수(age_on·residence_months)가 유일한 심판이고,
  충족 예정일은 그 심판이 처음 통과되는 날로 정의한다. 월말은 relativedelta의 절삭 규칙을
  따른다 — 예: 3/31 전입 + 6개월 = 9/30 충족, 2/29생의 만 나이는 평년 2/28에 올라간다.
  (relativedelta는 덧셈과 차이 계산이 서로 일관되므로 예정일과 심판이 어긋나지 않는다)
"""
from datetime import date, timedelta

from dateutil.relativedelta import relativedelta


def age_on(birth_date: date, as_of: date) -> int:
    """as_of 기준 만 나이. 생일 당일부터 한 살 올라간다."""
    return relativedelta(as_of, birth_date).years


def residence_months(move_in_date: date, as_of: date) -> int:
    """as_of 기준 거주 개월 수 (내림). 전입 전(미래 전입 What-if)은 0."""
    if as_of < move_in_date:
        return 0
    rd = relativedelta(as_of, move_in_date)
    return rd.years * 12 + rd.months


def days_until(target: date, as_of: date) -> int:
    """as_of → target 까지 남은 일수 (계약서 검산: as_of 8/7, 충족일 9/15 → 39)."""
    return (target - as_of).days


def date_age_reaches(birth_date: date, target_age: int) -> date:
    """만 target_age세가 되는 첫날."""
    return _first_passing(
        birth_date + relativedelta(years=target_age),
        lambda d: age_on(birth_date, d) >= target_age,
    )


def date_residence_reaches(move_in_date: date, months: int) -> date:
    """거주 months개월을 채우는 첫날 (월말 절삭: 3/31 전입 + 6개월 = 9/30)."""
    return _first_passing(
        move_in_date + relativedelta(months=months),
        lambda d: residence_months(move_in_date, d) >= months,
    )


def _first_passing(candidate: date, passes) -> date:
    # relativedelta의 덧셈·차이는 서로 일관되어 첫 후보가 곧 첫 충족일이다.
    # 이 가드는 그 일관성이 깨질 때(라이브러리 동작 변화 등) 예정일과 심판(age_on·
    # residence_months)이 어긋나 "D-day 0인데 미충족"이 되는 모순을 막는 안전장치다.
    while not passes(candidate):
        candidate += timedelta(days=1)
    return candidate
