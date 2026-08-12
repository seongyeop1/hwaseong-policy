# 판정 API 계약서 (B ↔ C)

> 확정일: 2026-08-07 · 작성: B(백엔드) · **v1.1.2** (2026-08-12 What-if 반영 범위 명시 — 필드 변경 없음)
> **이 문서의 필드는 v1.1 이후 "추가만" 허용된다. 이름·타입·구조 변경 및 삭제 금지.**
> (v1.0 → v1.1의 구조 변경은 동결 발효 전인 8/7 당일에 완료된 것으로, 이것이 마지막 구조 변경이다)
>
> C는 아래 응답 예시를 가짜 데이터 파일로 저장해 목업 개발을 시작하고,
> B의 실제 API가 나오면(8/12 목표) 호출부만 갈아끼운다.

---

## 변경 이력 (v1.1.1 → v1.1.2, 2026-08-12 — 문구 명확화, 필드 변경 없음)

| # | 변경 | 사유 |
| --- | --- | --- |
| 1 | `overrides` 6종 중 **실제로 판정을 바꾸는 항목**을 표로 명시 (`birth_date`·`move_in_date`·조건부 `household_type`) | 본 문서의 대표 What-if 예시가 `members`(자녀 추가)인데, 가구 판정(8/14~) 전에는 결과가 변하지 않는다. C 가 시뮬레이터를 붙이고 "안 먹는다"로 오인할 지점 — 실측(2026-08-12)으로 확인해 선반영 |

## 변경 이력 (v1.1 → v1.1.1, 2026-08-09 — 문구 명확화, 필드 변경 없음)

| # | 변경 | 사유 |
| --- | --- | --- |
| 1 | 저장 스키마의 `manual_conditions`(서술형 조건) ↔ 응답 `verify`의 `key: null` 항목 **대응 관계를 명시** (verify·verify_required·conditions 설명 3곳) | 변환 규칙이 스키마 파일에만 적혀 있어 계약서만 보는 사람이 추적 불가 + "서술형은 verify_required로"라는 옛 문장이 스키마와 모순되게 읽힘 (팀 검토 지적 반영) |

## 변경 이력 (v1.0 → v1.1, 2026-08-07)

| # | 변경 | 사유 |
| --- | --- | --- |
| 1 | 분류 규칙에 **규칙 0(마감 종료 제외)** 추가, 규칙 2에 **충족 예정일 ≤ 마감일** 조건 추가 | 신청 불가능한 정책에 D-day를 표시하는 버그 차단 |
| 2 | `verify`: 문자열 배열 → **객체 배열** `{key, label, hint}`, `verify_hint` 필드는 객체의 `hint`로 통합·폐지 | 서술형 조건(키 없음)과 확인 항목 2건 이상을 수용 |
| 3 | `upcoming` 항목: `reason` → **`waiting_for`로 개명**, `reasons`(통과 조건)·`verify`(충족 후 확인 항목) 추가 | `reason`/`reasons` 혼동 방지 + "미리 준비하세요" 시연의 근거 데이터 |
| 4 | 불변식을 **"(정책, 가구원) 쌍 기준으로 정확히 한 곳"**으로 재정의 | 8/14 가구 판정 도입 시 같은 정책이 가구원별로 다른 목록에 나타나는 것이 정상 |
| 5 | 요청에 **`as_of`(선택)** 추가 | 리허설·발표일 시연 재현성 + What-if 시간 이동 메커니즘 |
| 6 | **`overrides` 초안** 명시 (8/13 최종 확정) | C의 What-if 패널 설계에 필요한 노브 정의 |
| 7 | **`GET /policies/{policy_id}` 응답 예시**와 **에러 응답** 정의 추가 | 상세 페이지(8/12 목표)와 실통합 대비 |
| 8 | 예정 추가 필드 등재: `ai_summary` · `is_new`/`first_seen` · `policy.contact` | NEW 배지·Plan B 대비 UI 자리 예약 |
| 9 | `birth_date` 정본 규칙 · `relation` 허용값 · 빈 배열 보장 명시 | 판정 모호성·null 체크 제거 |
| 10 | 예시 데이터 통일: `hs-2026-0042`에 소득 조건 복원 | 기획서 스키마 예시와 불일치(드리프트) 해소 |

---

## 엔드포인트

| 메서드 | 경로 | 용도 | 시기 |
| --- | --- | --- | --- |
| POST | `/evaluate` | 프로필 → 전체 정책 판정 (3분류) | 8/12 관통 목표 |
| GET | `/policies/{policy_id}` | 상세 페이지용 정책 단건 | 8/12 |
| POST | `/evaluate` + `overrides` | What-if 시뮬레이터 (가상 프로필 병합) | **구현 완료 (8/12)** |

---

## 요청 — `POST /evaluate` (프로필)

```json
{
  "birth_date": "1999-03-02",
  "region": "화성시 동탄5동",
  "move_in_date": "2026-03-15",
  "lifecycle": ["전입", "청년"],
  "household_type": "1인가구",
  "members": [
    { "relation": "본인", "birth_date": "1999-03-02" }
  ],
  "as_of": "2026-08-07"
}
```

| 필드 | 설명 | 비고 |
| --- | --- | --- |
| `birth_date` | 생년월일 | 만 나이 계산 재료. **`members`의 본인 항목과 반드시 일치** — 불일치 시 400 에러. 향후 가구 판정은 `members`를 정본으로 순회한다 |
| `region` | 거주 지역 | |
| `move_in_date` | 화성시 전입일 | **D-day 계산의 필수 입력** |
| `lifecycle` | 해당 생애주기 (복수 선택) | 허용값: 전입 / 청년 / 결혼·신혼 / 출산·육아 / 노후 |
| `household_type` | 가구 유형 | 허용값은 스키마 세션 확정본 참조 |
| `members` | 가구원 목록 | `relation` 허용값: **본인 / 배우자 / 자녀** (스키마 세션 확정본 기준, 값 추가는 허용). 지금은 본인만, 8/14 이후 가구 판정에 사용 |
| `as_of` | **(선택)** 판정 기준일 | 생략 시 서버의 오늘 날짜. 시연 데이터 고정(리허설과 발표일의 D-day 숫자 드리프트 방지) 및 What-if 시간 이동에 사용. 응답에 그대로 반환된다 |

소득은 입력받지 않는다 — 소득 조건이 있는 정책은 자동으로 '서류 확인 필요'로 분류된다.

### What-if 요청 — `overrides` (**확정 · 2026-08-12 구현 완료**)

같은 엔드포인트에 `overrides`(부분 프로필)를 얹는다. **응답 구조는 일반 판정과 완전히 동일** — C는 같은 렌더링 컴포넌트를 재사용한다.

```json
{
  "birth_date": "1999-03-02",
  "region": "화성시 동탄5동",
  "move_in_date": "2026-03-15",
  "lifecycle": ["전입", "청년"],
  "household_type": "1인가구",
  "members": [{ "relation": "본인", "birth_date": "1999-03-02" }],
  "as_of": "2026-09-20",
  "overrides": {
    "members": [
      { "relation": "본인", "birth_date": "1999-03-02" },
      { "relation": "자녀", "birth_date": "2026-12-01" }
    ]
  }
}
```

- **병합 규칙: 통째 교체(얕은 병합).** `overrides`에 넣은 필드는 스칼라든 배열이든 원본을 통째로 대체한다. "둘째가 태어나면" What-if는 C가 자녀가 추가된 **전체** `members` 배열을 보낸다 (부분 병합 규칙 논쟁을 없애기 위함)
- **시간 이동("6개월 뒤엔?")은 최상위 `as_of`로** 처리한다. 예: `as_of: "2026-09-20"`이면 아래 예시의 `hs-2026-0042`는 거주 요건 충족(9/15)으로 `upcoming` → `docs_needed`로 이동한다
- 시간을 이동해도 **마감 지난 정책은 규칙 0에 의해 자동 제외**된다 (예: `as_of`를 2027년으로 옮기면 9/30 마감 정책은 사라진다) — 의도된 동작

**바꿀 수 있는 항목 6종**: `birth_date` · `region` · `move_in_date` · `lifecycle` · `household_type` · `members`
= "가상의 나는 누구인가"를 이루는 값. **`as_of`는 여기 넣지 않는다**(최상위 필드가 시간 이동 담당).

**거부 규칙** — 잘못된 `overrides`는 조용히 무시하지 않고 **400 `VALIDATION`** 으로 즉시 알린다
(무시하면 "시뮬레이터를 붙였는데 숫자가 안 변한다"는 형태로 늦게 발견된다):

| 상황 | 응답 |
| --- | --- |
| 허용 6종 밖의 키 (오타 포함) | 400 — 허용 목록을 메시지에 함께 반환 |
| `overrides.as_of` | 400 — "시간 이동은 최상위 `as_of`로 보내세요" 안내 포함 |
| enum 위반 (`household_type` 등) | 400 |
| 병합 결과가 모순 (`birth_date`만 바꾸고 `members` 미갱신) | 400 — 함께 보내야 할 항목을 안내 |

⚠️ **통째 교체의 실무 주의**: `birth_date`를 바꾸면 `members`의 본인 항목도 **함께** 보내야 한다
(두 값이 어긋나면 400). 나이 슬라이더 What-if에서 가장 자주 걸리는 지점이다.

**보장**: `overrides`를 얹은 판정 결과는 그 값으로 처음부터 요청한 판정과 **완전히 동일**하다
(가상 프로필을 만든 뒤 일반 판정 경로를 그대로 타기 때문 — 테스트로 고정).

⚠️ **6종이 전부 판정을 바꾸지는 않는다** (2026-08-12 실측). 규칙 엔진이 읽는 값은 세 개뿐이다.

| 항목 | 판정 반영 | 비고 |
| --- | --- | --- |
| `birth_date` | ✅ | 나이 조건 |
| `move_in_date` | ✅ | 거주개월 조건 · D-day |
| `household_type` | ⚠️ 조건부 | 정책의 `conditions.household`가 `["제한없음"]`이 아닐 때만. 현재 정책은 전부 제한없음이라 결과가 안 바뀐다 |
| `members` | ❌ 아직 | 가구 판정(8/14~) 도입 후 반영. **그 전까지 자녀를 추가해도 결과가 그대로다** |
| `region` | ❌ | 판정 조건이 아니다(표시용) |
| `lifecycle` | ❌ | 생애주기는 분류 축이지 판정 조건이 아니다 |

**C 주의**: 위 What-if 예시(`members`에 자녀 추가 — "둘째가 태어나면?")는 **가구 판정이 붙기 전에는
화면이 변하지 않는다.** 버그가 아니다. 지금 시뮬레이터에서 결과가 실제로 달라지는 노브는
`birth_date`(나이)·`move_in_date`(전입일)·최상위 `as_of`(시간 이동) 세 개다.
검증된 시연 조합은 `docs/demo-scenarios.md` 참조.

---

## 응답 — 3분류 (각 1건씩 예시)

```json
{
  "as_of": "2026-08-07",
  "results": {
    "eligible": [
      {
        "for_member": "본인",
        "policy": {
          "policy_id": "hs-2026-0101",
          "title": "화성시 청년 문화활동비 지원",
          "category": "문화",
          "lifecycle": ["청년"],
          "beneficiary": "본인",
          "benefit": "연 10만 원 문화포인트",
          "conditions": {
            "age": { "min": 19, "max": 34 },
            "household": ["1인가구", "신혼부부"]
          },
          "verify_required": [],
          "exclusions": [],
          "deadline": "2026-11-30",
          "apply_channel": "온라인",
          "required_docs": ["주민등록등본"],
          "source_url": "https://example.hscity.go.kr/notice/0101"
        },
        "reasons": [
          "나이 요건 충족 (만 27세 / 기준 19~34세)",
          "가구 유형 충족 (1인가구)"
        ]
      }
    ],
    "docs_needed": [
      {
        "for_member": "본인",
        "policy": {
          "policy_id": "hs-2026-0087",
          "title": "화성시 청년 이사비 지원",
          "category": "주거",
          "lifecycle": ["전입", "청년"],
          "beneficiary": "본인",
          "benefit": "이사비 최대 30만 원",
          "conditions": {
            "age": { "min": 19, "max": 39 },
            "income_percentile": { "max": 150 }
          },
          "verify_required": [
            {
              "key": "income_percentile",
              "label": "소득 기준 (중위소득 150% 이하)",
              "hint": "소득증명원으로 확인이 필요합니다"
            },
            {
              "key": null,
              "label": "무주택자에 한함",
              "hint": "공고 원문 기준 — 무주택 여부 증빙 서류로 확인이 필요합니다"
            }
          ],
          "exclusions": [],
          "deadline": "2026-10-15",
          "apply_channel": "온라인·시청 방문",
          "required_docs": ["주민등록등본", "소득증명원", "임대차계약서"],
          "source_url": "https://example.hscity.go.kr/notice/0087"
        },
        "reasons": [
          "나이 요건 충족 (만 27세 / 기준 19~39세)"
        ],
        "verify": [
          {
            "key": "income_percentile",
            "label": "소득 기준 (중위소득 150% 이하)",
            "hint": "소득증명원으로 확인이 필요합니다"
          },
          {
            "key": null,
            "label": "무주택자에 한함",
            "hint": "공고 원문 기준 — 무주택 여부 증빙 서류로 확인이 필요합니다"
          }
        ]
      }
    ],
    "upcoming": [
      {
        "for_member": "본인",
        "policy": {
          "policy_id": "hs-2026-0042",
          "title": "화성시 청년 월세 지원",
          "category": "주거",
          "lifecycle": ["전입", "청년"],
          "beneficiary": "세대주",
          "benefit": "월 최대 20만 원, 최장 12개월",
          "conditions": {
            "age": { "min": 19, "max": 39 },
            "residence_months": { "min": 6 },
            "household": ["1인가구", "신혼부부"],
            "income_percentile": { "max": 150 }
          },
          "verify_required": [
            {
              "key": "income_percentile",
              "label": "소득 기준 (중위소득 150% 이하)",
              "hint": "소득증명원으로 확인이 필요합니다"
            }
          ],
          "exclusions": ["국토부 청년월세 특별지원과 중복 수급 불가"],
          "deadline": "2026-09-30",
          "apply_channel": "온라인·시청 방문",
          "required_docs": ["주민등록등본", "소득증명원"],
          "source_url": "https://example.hscity.go.kr/notice/0042"
        },
        "reasons": [
          "나이 요건 충족 (만 27세 / 기준 19~39세)",
          "가구 유형 충족 (1인가구)"
        ],
        "waiting_for": "거주 6개월 요건 충족까지 (전입일 2026-03-15 기준)",
        "d_day": 39,
        "expected_date": "2026-09-15",
        "verify": [
          {
            "key": "income_percentile",
            "label": "소득 기준 (중위소득 150% 이하)",
            "hint": "소득증명원으로 확인이 필요합니다"
          }
        ]
      }
    ]
  }
}
```

예시 숫자는 실제로 맞아떨어진다: 1999-03-02생 → 2026-08-07 기준 만 27세,
전입일 2026-03-15 + 6개월 = 2026-09-15 → D-39, 마감(9/30) 이전 충족.
`upcoming`의 `verify`는 "거주 요건이 충족돼도 소득 서류 확인이 남는다"는 뜻 —
화면의 **"미리 준비하세요"** 안내(시연 멘트)의 근거 데이터다.

---

## 분류 규칙 (B·C 공통 이해)

**한 (정책, 가구원) 쌍은 세 목록 중 정확히 한 곳에만 나타난다.**
가구 판정(8/14 이후)이 붙으면 같은 정책이 본인 기준 `eligible`, 배우자 기준 `docs_needed`에
동시에 나타날 수 있다 — 이것이 정상이므로 **C는 정책 ID 기준 중복 제거를 하지 않는다.**

판정 우선순위:

0. `deadline`이 있고 `as_of`가 그 이후면 → **비대상** (마감 종료, 응답에서 제외)
1. 90일 내 충족 불가능한 조건이 있으면 (나이 상한 초과, 가구 유형 불일치 등) → **비대상** (응답에서 제외, 화면에 안 나옴)
2. 시간이 지나면 충족되는 조건(나이 하한 도달·거주개월)이 남았으면:
   - 충족 예정일 ≤ `deadline` → `upcoming`
   - 충족 예정일이 `deadline` 이후 → **비대상** (충족 시점엔 이미 마감 — D-day를 보여주면 안 된다)
3. 기계 판정 조건은 전부 통과, 확인 항목(`verify`)만 남았으면 → `docs_needed`
4. 기계 판정 전부 통과 + 확인 항목 없음 → `eligible`

- `deadline`이 없는(상시 모집) 정책은 규칙 0과 규칙 2의 마감 비교를 건너뛴다. C는 마감 자리에 "상시"를 표시한다
- 예: "거주기간도 모자라고 소득 확인도 필요한 정책" → 2번이 먼저이므로 `upcoming` (남은 확인 항목은 `verify`로 함께 실린다)

---

## 필드별 약속

- **`as_of`** — 판정 기준일. 요청에서 고정할 수 있고(시연 재현용), What-if 시뮬레이터가 이 값을 이동시켜 미래를 계산한다. 응답에 그대로 반환된다
- **`results.eligible / docs_needed / upcoming`** — **세 배열은 항상 존재하며, 해당 없으면 빈 배열이다** (C는 null 체크 불필요)
- **`for_member`** — 지금은 전부 `"본인"`. 8/14 이후 가구 단위 판정이 붙으면 같은 구조로 `"자녀"` 등의 항목이 늘어날 뿐, 응답 구조는 바뀌지 않는다
- **`reasons`** — 세 분류 공통. **통과한 조건**을 사람이 읽는 문장 배열로. 그대로 화면에 출력하면 된다
- **`waiting_for`** — `upcoming` 전용. 충족을 기다리는 조건의 설명 문장 (v1.0의 `reason`에서 개명 — `reasons`와의 혼동 방지)
- **`verify`** — 서류로 확인해야 할 항목의 **객체 배열** `{key, label, hint}`. `key`는 기계 판정 필드 참조(예: `"income_percentile"`) 또는 **서술형 조건이면 `null`**. `docs_needed`와 `upcoming` 양쪽에 나타날 수 있다. MVP에서는 `policy.verify_required` 전체가 그대로 온다 (구조를 나눠둔 이유: 향후 일부 항목이 기계 확인되면 남은 것만 온다). **만드는 방법**: 저장 스키마(policy.schema.json)의 `verify_required`(필드 키 목록) + **`manual_conditions`(서술형 조건)**를 합쳐 API가 이 배열로 정규화한다 — `manual_conditions`의 항목이 곧 `key: null` 항목이다
- **`d_day` / `expected_date`** — 숫자(일수) / 충족 예정일 (`upcoming` 전용). 규칙 2에 의해 `expected_date ≤ deadline`이 항상 보장된다
- **`policy.*`** — **어디에 등장하든 `GET /policies/{policy_id}`와 동일한 전체 스키마다.** C는 정책 객체 타입을 하나만 다룬다
- **`policy.verify_required`** — 확인 항목의 객체 배열(위 `verify`와 같은 형태). **저장 형식(문자열 키 배열 + `manual_conditions`)과 무관하게 API에서는 항상 이 객체 형태로 정규화되어 온다.** 없으면 빈 배열
- **`policy.conditions`** — 기계 판정 가능한 값(숫자·보기 선택)만 들어온다. 서술형 조건은 **저장 시 `manual_conditions`로 분리**되고(policy.schema.json — 8/7 조건 이원화 결정), **응답에서는 `verify`/`verify_required`의 `key: null` 항목**으로 나타난다
- **`policy.exclusions`** — 중복수급 제한 안내 배지용 **표시 전용** 데이터 (판정에 사용 안 함). 없으면 빈 배열
- **예정 추가 필드** — 모르는 필드는 무시하면 되므로 C 코드는 안 깨진다:
  - `ai_summary` (각 판정 항목에, 8/14 이후) — **nullable.** `null`이면 C는 "요약 준비 중"을 표시한다. 요약 생성이 `/evaluate` 응답을 지연시키지 않게 하기 위함 (재조회·폴링 등 전달 방식 상세는 8/13 확정)
  - `policy.is_new` 또는 `policy.first_seen` (8/14 이후) — 신규 공고 감지(diff) 연동, **NEW 배지**용
  - `policy.contact` (조건부) — 공고에 서류·창구 미표기 시 담당부서 연락처로 대체하는 Plan B(8/8 확인)가 발동하면 추가

---

## 응답 — `GET /policies/{policy_id}` (상세 페이지용)

정책 객체 하나를 그대로 반환한다. `/evaluate` 응답에 내장되는 `policy`와 **완전히 동일한 스키마**.

```json
{
  "policy_id": "hs-2026-0087",
  "title": "화성시 청년 이사비 지원",
  "category": "주거",
  "lifecycle": ["전입", "청년"],
  "beneficiary": "본인",
  "benefit": "이사비 최대 30만 원",
  "conditions": {
    "age": { "min": 19, "max": 39 },
    "income_percentile": { "max": 150 }
  },
  "verify_required": [
    {
      "key": "income_percentile",
      "label": "소득 기준 (중위소득 150% 이하)",
      "hint": "소득증명원으로 확인이 필요합니다"
    },
    {
      "key": null,
      "label": "무주택자에 한함",
      "hint": "공고 원문 기준 — 무주택 여부 증빙 서류로 확인이 필요합니다"
    }
  ],
  "exclusions": [],
  "deadline": "2026-10-15",
  "apply_channel": "온라인·시청 방문",
  "required_docs": ["주민등록등본", "소득증명원", "임대차계약서"],
  "source_url": "https://example.hscity.go.kr/notice/0087"
}
```

---

## 에러 응답 (공통)

```json
{
  "error": {
    "code": "VALIDATION",
    "message": "birth_date와 members[본인].birth_date가 일치하지 않습니다"
  }
}
```

| HTTP | `code` | 상황 | C의 처리 |
| --- | --- | --- | --- |
| 400 | `VALIDATION` | 필수 필드 누락, 형식 오류, enum 위반, birth_date 불일치 | `error.message`를 입력 폼 안내로 표시 |
| 404 | `NOT_FOUND` | 존재하지 않는 `policy_id` | "정책을 찾을 수 없습니다" 화면 |
| 500 | `INTERNAL` | 서버 오류 | "잠시 후 다시 시도해 주세요" 토스트 |

---

## 미결 항목 (기한 있음)

| 항목 | 기한 | 현재 상태 |
| --- | --- | --- |
| ~~`overrides` 최종 스펙~~ | ~~8/13~~ | **해소(8/12)** — 초안(통째 교체 병합)대로 확정 + 구현·테스트 완료. 허용 6종·거부 규칙은 위 What-if 절 참조 |
| `ai_summary` 전달 방식 (nullable 재조회 vs 폴링) | **8/13** | nullable 필드 + 재조회를 기본안으로 |
| `policy.contact` 추가 여부 | 8/8 | Plan B(서류·창구 미표기) 확인 결과에 따름 |
