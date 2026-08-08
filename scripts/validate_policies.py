#!/usr/bin/env python3
"""
data/policies/*.json 을 표준 스키마로 검증한다.

로컬:  python scripts/validate_policies.py
CI:    PR 이 열릴 때 자동 실행 (.github/workflows/validate-policies.yml)

검사 항목
  1. JSON Schema 준수 (packages/schema/policy.schema.json)
  2. policy_id 중복 없음
  3. 파일명 == policy_id
  4. 논리 검증: age.min <= age.max
  5. 검수 완료 여부: review.checklist 6항목 전부 true
     (--allow-unreviewed 를 주면 5번은 경고로만 처리)
"""

import argparse
import json
import sys
from pathlib import Path

try:
    from jsonschema import Draft202012Validator
except ImportError:
    sys.exit("jsonschema 가 필요합니다:  pip install jsonschema")

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = ROOT / "packages" / "schema" / "policy.schema.json"
POLICY_DIR = ROOT / "data" / "policies"

REQUIRED_CHECKS = [
    "conditions",
    "deadline",
    "benefit",
    "required_docs",
    "apply_channel",
    "source_url",
    "conditions_complete",  # ⑦ 원문 자격요건 전수 대조 (조건 이원화의 필수 짝)
]

errors: list[str] = []
warnings: list[str] = []


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--allow-unreviewed", action="store_true",
                        help="검수 미완료를 에러가 아닌 경고로 처리")
    args = parser.parse_args()

    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    validator = Draft202012Validator(schema)

    files = sorted(POLICY_DIR.glob("*.json"))
    if not files:
        print("⚠️  data/policies/ 에 정책 파일이 없습니다.")
        return 0

    seen_ids: dict[str, str] = {}

    for path in files:
        name = path.name
        try:
            policy = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            errors.append(f"{name}: JSON 파싱 실패 — {e}")
            continue

        # 1. 스키마
        for err in sorted(validator.iter_errors(policy), key=lambda e: e.path):
            loc = ".".join(str(p) for p in err.path) or "(root)"
            errors.append(f"{name}: [{loc}] {err.message}")

        pid = policy.get("policy_id")
        if not pid:
            continue

        # 2. 중복 ID
        if pid in seen_ids:
            errors.append(f"{name}: policy_id '{pid}' 가 {seen_ids[pid]} 와 중복")
        else:
            seen_ids[pid] = name

        # 3. 파일명 규칙
        if path.stem != pid:
            errors.append(f"{name}: 파일명이 policy_id('{pid}') 와 다릅니다 → {pid}.json 으로 변경")

        # 4. 논리 검증
        age = policy.get("conditions", {}).get("age", {})
        if "min" in age and "max" in age and age["min"] > age["max"]:
            errors.append(f"{name}: age.min({age['min']}) > age.max({age['max']})")

        # 5. 검수 완료 여부
        review = policy.get("review")
        if not review:
            msg = f"{name}: review 블록 없음 (2인 교차 검수 미완료)"
            (warnings if args.allow_unreviewed else errors).append(msg)
            continue

        checklist = review.get("checklist", {})
        missing = [k for k in REQUIRED_CHECKS if not checklist.get(k)]
        if missing:
            msg = f"{name}: 검수 체크리스트 미완료 → {', '.join(missing)}"
            (warnings if args.allow_unreviewed else errors).append(msg)

        if policy.get("exclusions") and "exclusions" not in checklist:
            warnings.append(f"{name}: exclusions 가 파싱됐는데 원문 대조 기록이 없습니다")

        if review.get("parsed_by") == review.get("reviewed_by"):
            errors.append(f"{name}: 파싱자와 검수자가 동일 ({review.get('parsed_by')}) — 교차 검수 위반")

    # ── 결과 출력 ────────────────────────────────
    print(f"검사 대상: {len(files)}건\n")

    for w in warnings:
        print(f"⚠️  {w}")
    for e in errors:
        print(f"❌ {e}")

    if errors:
        print(f"\n실패: {len(errors)}건의 오류")
        return 1

    print(f"✅ 통과 — 정책 {len(files)}건, 검수 완료 {len(seen_ids)}건")
    return 0


if __name__ == "__main__":
    sys.exit(main())
