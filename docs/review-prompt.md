# 정책 검수 프롬프트

> 정책 JSON 1건을 공고문 원문과 대조할 때 쓰는 프롬프트. 저장소에서 Claude 를 켜고 아래를 붙여넣는다.
> 목표 30~40건을 검수하는 동안 매번 다시 만들지 않기 위해 파일로 둔다.
>
> **핵심 설계**: 원문 텍스트를 사람이 붙여넣기 전에는 어떤 항목도 체크하지 못하게 막는다.
> 그래야 검수 기록이 "누가·무엇을 대조했는지"의 증빙으로 성립한다.

---

## 실전 적용 결과 (2026-08-10, hs-2026-0263)

이 프롬프트로 검수한 첫 건에서 **신청 제외대상 8건 중 5건 누락**을 발견했다.
기초생활수급자·외국인·재외국민·시설 수급자·직계존속 임대인 — 전부 자격요건인데
`conditions` 에도 `manual_conditions` 에도 없었고, **스키마 검증은 통과하는 상태**였다.

체크리스트 ⑦(원문 자격요건 전수 대조)이 잡아낸 건이다. 상세는 PR #20.

---

## 프롬프트 (아래를 복사)

````markdown
# 정책 JSON 원문 대조 검수 (hwaseong-policy)

`data/policies/{policy_id}.json` 을 공고문 원문과 대조하는 검수 작업을 도와줘.

## 대상

- <policy_id 를 여기에 적는다. 여러 건이면 한 건씩 진행>

## 절대 규칙 (어기면 검수 자체가 무의미해짐)

1. **내가 원문 텍스트를 붙여넣기 전에는 어떤 항목도 체크하지 마.**
   원문 없이 "형식상 맞아 보인다" 로 통과시키면 안 돼. 이 기록은 증빙이야.
2. **JSON 값을 네 판단으로 고치지 마.** 불일치를 발견하면 보고하고, 내가 승인한 것만 수정해.
3. **원문에 없는 값을 추론해서 채우지 마.** 미표기 항목은 `["공고 확인 필요"]` 로 두고
   `contact` 에 담당부서를 기입하는 게 이 팀 규칙이야.
4. `review.parsed_by` 와 `reviewed_by` 가 **같으면 CI 가 실패해.** 내가 파싱 담당이 아닌지 먼저 확인해줘.

## 진행 순서

### 1단계 — 현재 값 정리
JSON 을 읽고 아래 7항목의 현재 값을 표로 정리해줘.
① 조건 수치(나이·소득·거주개월) ② 마감일 ③ 지원내용(benefit) ④ 필요서류
⑤ 신청창구 ⑥ 출처 URL ⑦ **원문 자격요건 전수**(conditions + manual_conditions 전체)

### 2단계 — 원문 요청
정리한 표를 보여주고 나에게 공고문 원문 텍스트를 요청해. 출처는 JSON 의 `source_url`.
내가 붙여넣을 때까지 기다려.

> `.hwp` 는 바이너리라 직접 못 읽는다. 웹 공고문 본문을 복사하는 쪽이 확실하다.
> 웹 요약본과 첨부 공고문의 내용이 다를 수 있으니 **첨부 공고문 전문**을 받는 게 좋다.

### 3단계 — 대조
항목별로 **일치 / 불일치 / 원문에 없음** 으로 판정하고, 불일치는 `원문 값` vs `JSON 값` 을
나란히 보여줘.

⑦번을 특히 꼼꼼히. 이 팀은 조건을 두 곳에 나눠 저장해:
- `conditions` — 기계 판정 가능한 값만 (나이·소득%·거주개월·가구유형)
- `manual_conditions` — 서술형 자격요건 (무주택·근속·국적 등)

**공고문의 자격요건 중 두 곳 어디에도 없는 게 하나라도 있으면 ⑦은 false 야.**
서술형 조건이 빠지면 조용한 과대 판정(자격 없는 사람에게 "대상" 표시)이 돼.

특히 **"신청 제외대상" 목록을 빠짐없이 확인**해줘. 제외대상은 대부분 자격요건이라
`manual_conditions` 에 들어가야 하고, 그중 중복수급 제한만 `exclusions` 로 간다.

소득 판별 기준도 확인: **"기준중위소득 N%" 로 명시된 경우에만** `conditions.income_percentile`,
건강보험료 본인부담금·연소득 절대액 등은 `manual_conditions` 로.

나이가 **출생연도·출생일 구간으로 명시**된 경우(예: "1986.1.1.~2007.12.31. 출생자")
`conditions.age` 의 만 나이로는 경계가 재현되지 않아. 그 구간을 `manual_conditions` 에 함께 적어줘.

### 4단계 — review 블록 작성
내가 "7항목 전부 확인" 이라고 확정해주면 파일 끝에 추가해.

```json
  "review": {
    "parsed_by": "<파싱한 사람>",
    "reviewed_by": "<나>",
    "reviewed_at": "<오늘 날짜 YYYY-MM-DD>",
    "checklist": {
      "conditions": true, "deadline": true, "benefit": true,
      "required_docs": true, "apply_channel": true, "source_url": true,
      "conditions_complete": true, "exclusions": true
    }
  }
```

대조하지 않았거나 불일치가 남은 항목은 **절대 true 로 쓰지 마.**

### 5단계 — 검증 및 PR
```bash
python scripts/validate_policies.py
```
(Windows 콘솔에서 인코딩 오류가 나면 `PYTHONIOENCODING=utf-8` 를 앞에 붙여)

초록불이면 `data/policy-batch-N` 브랜치로 PR. 본문에 **대조 과정에서 발견한 불일치와 수정 내역**을 적어줘.

## 참고
- 스키마 정본: `packages/schema/policy.schema.json`
- 판정 규칙 정본: `packages/schema/api-contract.md`
- 팀 규칙: `CLAUDE.md` (자동 로드됨)
- 전제 검증·부수 발견: `docs/assumptions.md`
````

---

## 검수 후 주의

- **`review` 블록을 채우고 나서 머지한다.** 비운 채 머지하면 `main` CI 가 실패한다
  (2026-08-10 에 실제로 발생 — 이슈 #7)
- 정책을 추가·삭제하면 `apps/api/tests/test_api_integration.py` 와
  `docs/demo-scenarios.md` 의 숫자가 함께 틀어진다. CI(API 테스트)가 먼저 알려준다
