#!/usr/bin/env python3
"""
data/raw/ 원문 텍스트 → data/draft/ 정책 JSON 초안 생성 (Groq API 사용)

사용법:
  python scripts/parse.py                 # data/raw/ 전체 미처리 파일
  python scripts/parse.py --source hey   # 특정 소스 (hey / main / gu_manse 등)
  python scripts/parse.py --file PATH    # 단일 파일 지정
  python scripts/parse.py --force        # 이미 처리된 파일도 재처리
  python scripts/parse.py --dry-run      # API 호출 없이 대상 파일 목록만 확인

필요 패키지:
  pip install openai jsonschema

환경변수:
  GROQ_API_KEY  (.env 파일 또는 export GROQ_API_KEY=gsk_...)
"""
import argparse
import json
import os
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# python-dotenv 가 있으면 .env 자동 로드
try:
    from dotenv import load_dotenv
    load_dotenv(ROOT / ".env")
except ImportError:
    pass

try:
    from openai import OpenAI
except ImportError:
    sys.exit("openai가 필요합니다: pip install openai")

try:
    from jsonschema import Draft202012Validator
except ImportError:
    sys.exit("jsonschema가 필요합니다: pip install jsonschema")

RAW_DIR   = ROOT / "data" / "raw"
DRAFT_DIR = ROOT / "data" / "draft"
SCHEMA_PATH = ROOT / "packages" / "schema" / "policy.schema.json"

MODEL = "llama-3.3-70b-versatile"  # Groq 무료 티어: 하루 14,400건.
TODAY = date.today().isoformat()

# ─────────────────────────── 프롬프트 ───────────────────────────

SYSTEM_PROMPT = """\
당신은 화성시 정책 공고문을 표준 스키마 JSON으로 파싱하는 전문가입니다.

## 절대 규칙
- 공고에 명시되지 않은 정보는 절대 생성·추론하지 마세요.
- 불확실한 값은 null 또는 빈 배열 []로 두세요.
- 이 JSON은 사람이 2차 검수합니다. 과도한 추론 금지.

## 조건 이원화 (핵심)
기계 판정 가능한 수치 조건 → conditions 필드
서술형·맥락·기타 자격 조건 → manual_conditions 배열

### conditions 필드 규칙
- age.min / age.max: 나이 범위가 명시된 경우만 (정수)
- income_percentile.max: 반드시 "기준중위소득 N%" 문구가 원문에 있을 때만 입력.
  "소득 기준", "저소득", "기초수급자" 같은 모호한 표현은 manual_conditions로.
- residence_months.min: 거주 개월 수가 명시된 경우만 (정수, 예: 6개월 → 6)
- household: ["1인가구","신혼부부","유자녀가구","한부모","다자녀","다문화","제한없음"] 중 해당하는 것

### manual_conditions 형식
각 항목: {"label": "원문 조건 그대로", "hint": "확인 방법 안내"}
예: {"label": "무주택자에 한함", "hint": "무주택 여부 증빙 서류로 확인"}

## 필드별 규칙
- policy_id:
    URL에 hscity.go.kr 포함 → "hs-2026-XXXX"
    중앙정부 사업 → "kr-2026-XXXX"
- title: 공고 제목 그대로 (필수, 절대 빠뜨리지 마세요)
- category: "복지","주거","일자리","교육","보육","건강","문화","기타" 중 하나
- lifecycle: ["전입","청년","결혼·신혼","출산·육아","노후"] 중 해당하는 것들 (배열)
  주의: "1인가구"는 lifecycle이 아닌 conditions.household에 해당
- beneficiary: "세대주","본인","배우자","자녀","가구" 중 하나
- benefit: 지원 내용 한 줄 요약 (상세 페이지 표시용)
- deadline: YYYY-MM-DD 형식 또는 null (상시·미명시)
- required_docs: 구비서류 배열. 미명시 시 ["공고 확인 필요"]
- contact: required_docs가 ["공고 확인 필요"]인 경우 담당부서+연락처 필수
- exclusions: 중복수급 제한이 명시된 경우만 배열로
- apply_channel: 신청 방법·경로 설명

## 출력
순수 JSON만 출력하세요. 마크다운 코드블록(```) 없이.
review 블록은 포함하지 마세요 (스크립트가 자동으로 추가합니다)."""


def build_user_prompt(meta: dict) -> str:
    return "\n".join([
        f"제목: {meta.get('title', '')}",
        f"날짜: {meta.get('date', '')}",
        f"부서: {meta.get('dept', '')}",
        f"URL:  {meta.get('url', '')}",
        "",
        "본문:",
        meta.get("body", ""),
        "",
        "위 공고를 파싱하여 JSON을 출력하세요.",
    ])


# ─────────────────────────── 파일 처리 ───────────────────────────

def load_raw_file(path: Path) -> dict:
    """TITLE/DATE/DEPT/URL 헤더 + 본문 파싱."""
    text = path.read_text(encoding="utf-8")
    meta: dict = {}
    body_lines: list[str] = []
    in_body = False
    for line in text.splitlines():
        if in_body:
            body_lines.append(line)
        elif line.startswith("TITLE:"):
            meta["title"] = line[6:].strip()
        elif line.startswith("DATE:"):
            meta["date"] = line[5:].strip()
        elif line.startswith("DEPT:"):
            meta["dept"] = line[5:].strip()
        elif line.startswith("URL:"):
            meta["url"] = line[4:].strip()
        elif line.startswith("FIRST_SEEN:"):
            meta["first_seen"] = line[11:].strip()
        elif "────" in line:
            in_body = True
    meta["body"] = "\n".join(body_lines).strip()
    return meta


def draft_output_path(raw_path: Path) -> Path:
    """data/raw/source/date_id.txt → data/draft/source_date_id.json"""
    DRAFT_DIR.mkdir(parents=True, exist_ok=True)
    return DRAFT_DIR / f"{raw_path.parent.name}_{raw_path.stem}.json"


def strip_null_conditions(policy: dict) -> dict:
    """conditions 내 null 값 키 제거 — 스키마는 키 자체를 생략하는 형태를 기대함."""
    cond = policy.get("conditions")
    if not isinstance(cond, dict):
        return policy
    for field in ("age", "income_percentile", "residence_months"):
        if field not in cond:
            continue
        sub = cond[field]
        if sub is None:
            del cond[field]
        elif isinstance(sub, dict):
            cleaned = {k: v for k, v in sub.items() if v is not None}
            if cleaned:
                cond[field] = cleaned
            else:
                del cond[field]
    return policy


def add_review_block(policy: dict) -> dict:
    """파싱자 기록 및 검수 체크리스트 초기화."""
    policy["review"] = {
        "parsed_by": "A",
        "reviewed_by": "",       # 검수자가 직접 기입
        "reviewed_at": TODAY,    # 파싱 날짜. 검수 완료 후 검수자가 갱신.
        "checklist": {
            "conditions": False,
            "deadline": False,
            "benefit": False,
            "required_docs": False,
            "apply_channel": False,
            "source_url": False,
            "conditions_complete": False,
        },
    }
    return policy


def parse_file(
    client,            # anthropic.Anthropic | None (dry-run)
    raw_path: Path,
    validator,
    force: bool = False,
    dry_run: bool = False,
) -> str:
    """단일 파일 파싱. 반환값: "ok" | "skip" | "fail"."""
    out_path = draft_output_path(raw_path)

    if out_path.exists() and not force:
        return "skip"

    meta = load_raw_file(raw_path)
    if not meta.get("body"):
        print(f"  ⚠️  본문 없음 — 건너뜀: {raw_path.name}")
        return "skip"

    if dry_run:
        print(f"  [dry-run] {raw_path.name} → {out_path.name}")
        return "ok"

    # ── Groq API 호출 ──
    try:
        resp = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": build_user_prompt(meta)},
            ],
            max_tokens=4096,
            temperature=0,
        )
        raw_text = resp.choices[0].message.content.strip()
    except Exception as exc:
        print(f"  ❌ API 오류: {raw_path.name} — {exc}")
        return "fail"

    # 마크다운 코드블록 제거
    if raw_text.startswith("```"):
        lines = raw_text.splitlines()
        end = len(lines) - 1 if lines and lines[-1].strip() == "```" else len(lines)
        raw_text = "\n".join(lines[1:end])

    # ── JSON 파싱 ──
    try:
        policy = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        print(f"  ❌ JSON 파싱 실패: {raw_path.name} — {exc}")
        err_path = DRAFT_DIR / f"_error_{raw_path.parent.name}_{raw_path.stem}.txt"
        err_path.write_text(raw_text, encoding="utf-8")
        print(f"     → 원문 저장: {err_path.name}")
        return "fail"

    # source_url 보강
    if not policy.get("source_url") and meta.get("url"):
        policy["source_url"] = meta["url"].strip()

    # first_seen: 원문 최초 수집일 (crawl.py 가 헤더에 기록, 없으면 오늘)
    if "first_seen" not in policy:
        policy["first_seen"] = meta.get("first_seen") or TODAY

    strip_null_conditions(policy)
    add_review_block(policy)

    # ── 스키마 검증 (draft이므로 경고만) ──
    errs = list(validator.iter_errors(policy))
    if errs:
        locs = [".".join(str(p) for p in e.path) or "(root)" for e in errs[:3]]
        suffix = f" 외 {len(errs) - 3}건" if len(errs) > 3 else ""
        print(f"  ⚠️  스키마 경고 {len(errs)}건: {', '.join(locs)}{suffix}")

    out_path.write_text(
        json.dumps(policy, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"  ✅ {raw_path.name} → {out_path.name}")
    return "ok"


# ─────────────────────────── CLI ───────────────────────────

def collect_files(source: str | None) -> list[Path]:
    if not RAW_DIR.exists():
        return []
    files: list[Path] = []
    for src_dir in sorted(RAW_DIR.iterdir()):
        if not src_dir.is_dir():
            continue
        if source and src_dir.name != source:
            continue
        files.extend(sorted(src_dir.glob("*.txt")))
    return files


def main() -> None:
    ap = argparse.ArgumentParser(description="정책 공고 원문 → JSON 초안 생성")
    ap.add_argument("--source", default=None,
                    help="소스 필터 (hey / main / gu_manse / gu_ujeong / gu_dongtan / gu_bongdam)")
    ap.add_argument("--file", type=Path, help="단일 파일 지정")
    ap.add_argument("--force", action="store_true", help="기존 draft 덮어쓰기")
    ap.add_argument("--dry-run", action="store_true", help="API 호출 없이 대상 확인만")
    args = ap.parse_args()

    if args.file and not args.file.exists():
        sys.exit(f"파일 없음: {args.file}")

    client = None
    if not args.dry_run:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            sys.exit(
                "GROQ_API_KEY가 설정되지 않았습니다.\n"
                ".env 파일에 다음을 추가하거나 export로 설정하세요:\n"
                "  GROQ_API_KEY=gsk_..."
            )
        client = OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=api_key,
        )

    if not SCHEMA_PATH.exists():
        sys.exit(f"스키마 파일 없음: {SCHEMA_PATH}")
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    validator = Draft202012Validator(schema)

    files = [args.file] if args.file else collect_files(args.source)
    if not files:
        print("처리할 파일이 없습니다.")
        return

    mode = "dry-run" if args.dry_run else f"model={MODEL}"
    print(f"파싱 대상: {len(files)}건 | {mode} | → {DRAFT_DIR.relative_to(ROOT)}")

    ok = fail = skip = 0
    for f in files:
        result = parse_file(client, f, validator, force=args.force, dry_run=args.dry_run)
        if result == "ok":
            ok += 1
        elif result == "skip":
            skip += 1
        else:
            fail += 1

    print(f"\n완료 — 생성 {ok}건 | 건너뜀 {skip}건 | 실패 {fail}건")
    if fail:
        sys.exit(1)


if __name__ == "__main__":
    main()
