"""팀 스키마 enum — 정본은 `packages/schema/*.json` (팀 계약서).

이 파일은 JSON Schema의 enum을 Pydantic 검증용으로 복제한 것이다.
스키마가 바뀌면 이 파일도 함께 갱신한다 (전원 리뷰 PR — CLAUDE.md 절대 규칙).
"""

# packages/schema/profile.schema.json 과 동일 — 5개 고정, '1인가구'는 household 축
LIFECYCLE = ["전입", "청년", "결혼·신혼", "출산·육아", "노후"]

# profile.schema.json household_type enum (8/7 스키마 세션 확정본)
HOUSEHOLD = ["1인가구", "신혼부부", "유자녀가구", "한부모", "다자녀", "다문화"]

# profile.schema.json members[].relation enum — 부·모는 조력자 모드(자녀가 부모 프로필 대신 판정)용
RELATION = ["본인", "배우자", "자녀", "부", "모", "기타"]
