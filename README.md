# 개인별 맞춤형 정책 지원 분석 플랫폼

> AI 화성 챌린지 · 주제2
> **"우리 가족의 오늘과 내일에 해당하는 화성시 정책을 먼저 알려주는 서비스"**

**설계 원칙: 판정은 코드가, 설명은 LLM이.**
LLM은 요청 경로에 없다 → LLM 환각이 판정에 개입하는 것은 구조적으로 불가능하다.
데이터 오류는 구조가 아니라 **2인 교차 전수 검수**로 막는다.

---

## 구조

```
apps/web/          Next.js + Tailwind        (C: 프론트)
apps/api/          FastAPI + 규칙 엔진        (B: 백엔드)
packages/schema/   정책·프로필 표준 스키마     ← 팀의 계약서. 변경 시 전원 리뷰
scripts/           크롤러 + LLM 파싱          (A: 데이터)
data/policies/     검수 완료 정책 JSON        1건 = 1파일, PR 로 머지
data/raw/          크롤링 원문 (gitignore)
docs/              기획서·전제 검증 결과      (D: 기획·발표)
```

## 시작하기

```bash
git clone <레포 주소>
cd hwaseong-policy
cp .env.example .env      # 값 채우기. .env 는 절대 커밋 금지
```

정책 데이터 검증:

```bash
pip install jsonschema
python scripts/validate_policies.py

# 검수 전 형식만 확인하고 싶을 때
python scripts/validate_policies.py --allow-unreviewed
```

## 브랜치 규칙 (3개만)

1. **하루 1회 이상 `main` 에 머지.** 브랜치가 3일 넘게 살면 8/12 관통 기준을 못 맞춘다.
2. **Squash merge 고정.**
3. **스키마 변경 PR 은 전원 리뷰.**

| 브랜치 | 용도 |
|---|---|
| `main` | 항상 배포 가능. 직접 푸시 금지 |
| `feat/a-crawler` `feat/b-engine` `feat/c-ui` | 역할별 기능 |
| `data/policy-batch-N` | 정책 JSON 묶음 (검수 PR) |
| `fix/*` | 8/16 기능 동결 이후엔 이것만 |

## 정책 데이터 추가 절차

1. `data/policies/{policy_id}.json` 생성 (파일명 = policy_id)
2. `python scripts/validate_policies.py` 로 형식 확인
3. `data/policy-batch-N` 브랜치로 PR
4. **파싱 담당이 아닌 1인**이 원문 대조 → PR 템플릿 6항목 체크 → `review` 블록 기입
5. CI 통과 후 머지

검수 기록은 PR 히스토리에 남는다 → "누가·언제·무엇을 대조했는지"의 증빙.

## A 파트 현재 상태 (2026-08-12 기준)

### 완료
- `scripts/crawl.py` — 구청 4개 + HEY + 본청 크롤러 완성, `FIRST_SEEN` 헤더 추가
- `scripts/parse.py` — Groq API(llama-3.3-70b) 파서 완성, null 조건 자동 제거, `first_seen` 필드 기록
- `packages/schema/policy.schema.json` — `first_seen` 필드 추가
- 정책 파싱 초안 **31건** — `feat/a-crawler` 브랜치 `data/draft/` (스키마 검증 ❌ 0건)
- 검수 완료 — `data/policies/` 7건 (PR #36 머지)
- **목표 30건 달성 가능**: 완료 7 + 검수대기 31 = 38건

### 다음 할 일
1. **팀원 검수 대기** — Issue #41 수정 확인 후 `data/policy-batch-N` PR 머지
2. **매일 크롤러 재실행** — 새 공고 수집 후 파싱 (Groq 토큰 매일 자정 UTC 리셋)
   ```bash
   python scripts/crawl.py --source gu --since 2026
   python scripts/crawl.py --source hey --since 2026
   python scripts/parse.py   # 새 파일만 자동 파싱
   ```
3. **8/16 기능 동결 전** — validate_policies.py 전체 통과, 30건 이상 DB 반영

### 파싱 환경
- LLM: Groq `llama-3.3-70b-versatile` (무료, 하루 10만 토큰 / 자정 UTC 리셋)
- 하루 신규 공고 2~3건 기준 약 14,000토큰 소모 → 한도 여유 충분
- `--force` 전체 재파싱 시 토큰 소진 주의 (오늘 31건 재파싱으로 한도 초과 경험)
- API 키: `.env` 파일의 `GROQ_API_KEY` (console.groq.com에서 발급)
- 구청 4개 게시판은 동일 공고 중복 수집됨 → `gu_byeongjeom`만 파싱

### first_seen / is_new 구현 방식
- `crawl.py` — 새 원문 저장 시 `FIRST_SEEN: YYYY-MM-DD` 헤더 자동 기록
- `parse.py` — 헤더 읽어서 draft JSON `first_seen` 필드에 저장
- `is_new` — JSON에 저장하지 않음. B파트 API가 `first_seen` 기준으로 동적 계산

---

## 주요 일정

| 날짜 | 기준 |
|---|---|
| 8/9 | 전제 검증 5종 완료 → Plan B 발동 여부 확정 |
| 8/12 밤 | **관통 기준** — 수동 5건으로 입력→판정→결과 E2E 1회 |
| 8/16 밤 | **기능 동결 + Vercel 배포.** 이후 수정만 |
| 8/20 | 발표 |

## 대외 프레이밍 (팀 합의)

- ✅ "판정은 규칙 엔진이 하고, AI는 정책 문서를 읽고(파싱) 결과를 설명한다(요약)"
- ❌ "LLM 기반 맞춤 분석", "RAG 챗봇" — 발표·소개문 전체에서 사용 금지
