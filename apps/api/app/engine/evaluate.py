"""규칙 엔진 — Phase 3-a에서 구현 (roadmap.md).

절대 원칙 (CLAUDE.md):
- **순수 함수.** 전역 상태·`datetime.now()` 금지 — 기준일은 as_of 인자로만.
  What-if(overrides 병합 후 재호출)와 가구 판정(members 반복 호출)이 이 구조에서 나온다.

분류 규칙 0~4 — 정본은 api-contract.md v1.1 (여기 요약은 참조용):
  0. deadline이 있고 as_of가 그 이후          → 비대상 (마감 종료, 응답 제외)
  1. 90일 내 충족 불가능한 조건이 있음         → 비대상
  2. 시간 경과로 충족되는 조건(나이 하한·거주개월)이 남음
       - 충족 예정일 <= deadline               → upcoming (d_day, expected_date, waiting_for)
       - 충족 예정일 >  deadline               → 비대상 (충족 시점엔 이미 마감)
  3. 기계 판정 전부 통과 + 확인 항목(verify)만 남음 → docs_needed
  4. 전부 통과 + 확인 항목 없음                → eligible
  * deadline이 없는(상시) 정책은 규칙 0·2의 마감 비교를 건너뛴다
"""
from datetime import date
from typing import Any


def evaluate(profile: dict[str, Any], policy: dict[str, Any], as_of: date):
    """한 (프로필, 정책) 쌍을 판정한다. 반환 형태는 Phase 3-a에서 확정."""
    raise NotImplementedError("Phase 3-a에서 구현")
