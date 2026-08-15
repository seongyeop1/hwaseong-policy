"""규칙 엔진 — 분류 규칙 0~4 구현. 정본은 packages/schema/api-contract.md v1.1.3.

절대 원칙 (CLAUDE.md):
- **순수 함수.** 전역 상태·LLM·네트워크 금지, 기준일은 as_of 인자로만 (`datetime.now()` 금지).
  What-if(overrides 병합 후 재호출)와 가구 판정(members 반복 호출)이 이 구조에서 나온다.
- `exclusions`는 판정에 쓰지 않는다 — 표시 전용.
- (정책, 가구원) 쌍당 정확히 한 분류 — 정책 ID 기준 중복 제거 금지.

분류 규칙 0~4 (계약서 요약):
  0. deadline이 있고 as_of가 그 이후          → 비대상 (마감 종료, 응답 제외. 마감 당일은 신청 가능)
  1. 90일 내 충족 불가능한 조건이 있음         → 비대상 (나이 상한 초과·가구 유형 불일치·충족일이 90일 밖)
  2. 시간 경과로 충족되는 조건(나이 하한·거주개월)이 남음
       - 충족 예정일 <= deadline               → upcoming (d_day, expected_date, waiting_for)
       - 충족 예정일 >  deadline               → 비대상 (충족 시점엔 이미 마감 — D-day 표시 금지)
  3. 기계 판정 전부 통과 + 확인 항목(verify)만 남음 → docs_needed
  4. 전부 통과 + 확인 항목 없음                → eligible
  * deadline이 없는(상시) 정책은 규칙 0·2의 마감 비교를 건너뛴다

조건 이원화 (8/7 결정): `conditions`의 기계 판정 값만 여기서 판정한다.
`income_percentile`은 프로필에 입력이 없으므로(계약: 소득은 입력받지 않는다) 판정하지 않고
verify로 보낸다. 서술형(`manual_conditions`)은 `key: null`인 verify 항목으로 정규화된다.
"""
from datetime import date
from typing import Any, Iterable

from pydantic import ValidationError

from ..schemas import Profile
from .dates import (
    age_on,
    date_age_reaches,
    date_residence_reaches,
    days_until,
    residence_months,
)

# 규칙 1·2의 "가까운 미래" 창 — 이 안에 충족되는 조건만 upcoming 이 된다
UPCOMING_WINDOW_DAYS = 90

# 세대주 미지정 프로필의 폴백 기준 — 민법상 성년(만 19세). 성인 본인은 본인을 세대주로,
# 미성년 본인(조력자 모드 — 자녀가 부모 대신 입력)은 부/모를 세대주로 본다.
ADULT_AGE = 19

# 통과 사유가 하나도 안 나오는 정책의 대체 문장 — 분류마다 사실이 다르므로 문구도 다르다.
#
# eligible (#37): 확인 항목(verify)까지 비어 있다는 뜻이라 "요건이 없다"가 사실이다.
#   소득 조건이 있으면 verify 가 생겨 docs_needed 로 가므로 여기 걸리지 않는다.
NO_MACHINE_CONDITIONS_REASON = "별도의 나이·소득·거주 요건이 없습니다"

# docs_needed (#45): 확인할 항목이 **남아 있다**. 위 문장을 그대로 쓰면 "요건이 없다"가
#   거짓이 된다 — 소득만 있는 정책(소득은 판정하지 않고 verify 로 보낸다)이 대표적이다.
#   그래서 "자동 확인되는 요건이 없다"까지만 말하고, 무엇이 남았는지는 verify 목록이 보여준다.
NO_AUTO_CHECKED_CONDITIONS_REASON = (
    "나이·거주 기간처럼 자동으로 확인되는 요건은 없습니다 — 아래 항목을 서류로 확인해 주세요"
)


# ── verify 정규화 (저장 스키마 → 계약 v1.1 객체 배열) ────────────────────


def _fmt_num(v: Any) -> str:
    """150.0 → '150' (라벨 표기용)."""
    if isinstance(v, float) and v == int(v):
        return str(int(v))
    return str(v)


def _age_bounds_desc(cond: dict) -> str:
    lo, hi = cond.get("min"), cond.get("max")
    if lo is not None and hi is not None:
        return f"{lo}~{hi}세"
    if lo is not None:
        return f"{lo}세 이상"
    return f"{hi}세 이하"


def _verify_item_for_key(key: str, conditions: dict) -> dict:
    """저장 verify_required의 문자열 키 → {key, label, hint} (계약서 예시 문구 기준)."""
    cond = conditions.get(key, {})
    if key == "income_percentile":
        cap = cond.get("max")
        label = f"소득 기준 (중위소득 {_fmt_num(cap)}% 이하)" if cap is not None else "소득 기준 (공고 기준)"
        return {"key": key, "label": label, "hint": "소득증명원으로 확인이 필요합니다"}
    if key == "residence_months":
        need = cond.get("min")
        label = f"거주 기간 (화성시 {need}개월 이상 거주)" if need is not None else "거주 기간 (공고 기준)"
        return {"key": key, "label": label, "hint": "주민등록초본으로 확인이 필요합니다"}
    if key == "age":
        return {"key": key, "label": f"나이 기준 ({_age_bounds_desc(cond)})", "hint": "주민등록등본으로 확인이 필요합니다"}
    if key == "household":
        kinds = "·".join(cond) if isinstance(cond, list) else "공고 기준"
        return {"key": key, "label": f"가구 유형 ({kinds})", "hint": "주민등록등본으로 확인이 필요합니다"}
    return {"key": key, "label": key, "hint": "공고 원문 확인이 필요합니다"}


def normalize_verify(policy: dict) -> list[dict]:
    """정책 1건의 확인 항목 전체 — 키 항목 먼저, 서술형(key: null)이 뒤 (계약서 예시 순서).

    소득 조건은 프로필로 판정하지 않으므로 verify_required에 키가 없어도 항상 포함한다
    (계약: "소득 조건이 있는 정책은 자동으로 '서류 확인 필요'").
    """
    conditions = policy.get("conditions", {})
    keys = list(policy.get("verify_required", []))
    if "income_percentile" in conditions and "income_percentile" not in keys:
        keys.insert(0, "income_percentile")
    items = [_verify_item_for_key(k, conditions) for k in keys]
    items += [
        {"key": None, "label": m["label"], "hint": m.get("hint", "공고 원문 기준 — 서류로 확인이 필요합니다")}
        for m in policy.get("manual_conditions", [])
    ]
    return items


def to_api_policy(policy: dict) -> dict:
    """저장 스키마(data/policies) → 계약 v1.1 정책 객체.

    /evaluate 내장 policy와 GET /policies/{id}가 완전히 동일한 스키마를 쓰기 위한 단일 변환점.
    review(내부 검수 기록)는 내보내지 않고, manual_conditions는 verify_required 객체로 흡수된다.
    """
    return {
        "policy_id": policy["policy_id"],
        "title": policy["title"],
        "category": policy["category"],
        "lifecycle": policy["lifecycle"],
        "beneficiary": policy["beneficiary"],
        "benefit": policy["benefit"],
        "conditions": policy.get("conditions", {}),
        "verify_required": normalize_verify(policy),
        "exclusions": policy.get("exclusions", []),
        "deadline": policy.get("deadline"),
        "apply_channel": policy["apply_channel"],
        "required_docs": policy["required_docs"],
        "source_url": policy["source_url"],
        "contact": policy.get("contact"),
    }


# ── What-if (overrides 병합) ────────────────────────────────────────────


class OverrideError(ValueError):
    """overrides를 얹은 결과가 유효한 프로필이 아닐 때 (main.py가 400으로 변환)."""


def apply_overrides(profile: Profile) -> Profile:
    """가상 프로필을 만든다 — 계약 v1.1의 **통째 교체(얕은 병합)**.

    `overrides`에 넣은 필드는 스칼라든 배열이든 원본을 통째로 대체한다. 부분 병합 규칙을
    두지 않는 이유는 "자녀를 한 명 추가"를 서버가 해석하게 두면 규칙 논쟁이 끝나지 않기
    때문이다 — C가 바뀐 **전체** 값을 보낸다.

    병합 결과는 평범한 프로필이라 판정 경로가 일반 요청과 완전히 같다. 그래서 응답 구조도
    같고 C는 렌더링 컴포넌트를 재사용한다. 시간 이동은 여기가 아니라 as_of가 담당한다.
    """
    if not profile.overrides:
        return profile

    data = profile.model_dump()
    data.update(profile.overrides)
    data["overrides"] = None  # 가상 프로필에는 남기지 않는다 (중첩 What-if 방지)
    try:
        return Profile.model_validate(data)
    except ValidationError as exc:
        reason = str(exc.errors()[0].get("msg", "")).removeprefix("Value error, ")
        raise OverrideError(
            f"overrides를 적용한 결과가 올바른 프로필이 아닙니다: {reason}. "
            "overrides는 항목을 통째로 바꾸므로, 서로 맞물린 값(birth_date ↔ members[본인])은 함께 보내야 합니다"
        ) from exc


# ── 판정 (규칙 0~4) ─────────────────────────────────────────────────────


def _parse_date(v: Any) -> date | None:
    if v is None or isinstance(v, date):
        return v
    return date.fromisoformat(v)


def evaluate(profile: Profile, policy: dict, as_of: date) -> dict:
    """한 (프로필, 정책) 쌍을 판정한다.

    반환: {"status": "eligible"|"docs_needed"|"upcoming"|"excluded", ...}
    excluded 는 응답에서 제외되는 비대상 (why는 디버깅·테스트용, 응답에 싣지 않는다).
    """
    deadline = _parse_date(policy.get("deadline"))

    # 규칙 0 — 마감 종료 (마감 당일은 신청 가능이므로 초과만 제외)
    if deadline is not None and as_of > deadline:
        return {"status": "excluded", "why": "deadline_passed"}

    conditions = policy.get("conditions", {})
    reasons: list[str] = []                     # 통과한 기계 조건 (계약서 예시 문구)
    pending: list[tuple[date, str]] = []        # 시간 경과로 충족될 조건 (충족일, 대기 문구)

    age_cond = conditions.get("age")
    if age_cond:
        age = age_on(profile.birth_date, as_of)
        hi, lo = age_cond.get("max"), age_cond.get("min")
        if hi is not None and age > hi:
            return {"status": "excluded", "why": "age_over_max"}        # 규칙 1 — 영구 불충족
        if lo is not None and age < lo:
            pending.append((
                date_age_reaches(profile.birth_date, lo),
                f"만 {lo}세 요건 충족까지 (생년월일 {profile.birth_date.isoformat()} 기준)",
            ))
        else:
            reasons.append(f"나이 요건 충족 (만 {age}세 / 기준 {_age_bounds_desc(age_cond)})")

    res_cond = conditions.get("residence_months")
    if res_cond and res_cond.get("min") is not None:
        need = res_cond["min"]
        have = residence_months(profile.move_in_date, as_of)
        if have >= need:
            reasons.append(f"거주 기간 충족 (화성시 {have}개월 거주 / 기준 {need}개월 이상)")
        else:
            pending.append((
                date_residence_reaches(profile.move_in_date, need),
                f"거주 {need}개월 요건 충족까지 (전입일 {profile.move_in_date.isoformat()} 기준)",
            ))

    hh_cond = conditions.get("household")
    if hh_cond and "제한없음" not in hh_cond:
        if profile.household_type not in hh_cond:
            return {"status": "excluded", "why": "household_mismatch"}  # 규칙 1 — 영구 불충족
        reasons.append(f"가구 유형 충족 ({profile.household_type})")

    # income_percentile 은 기계 판정하지 않는다 → normalize_verify 가 verify 항목으로 만든다

    verify = normalize_verify(policy)

    # 규칙 2 — 시간 경과 충족 조건이 남은 경우
    if pending:
        expected = max(d for d, _ in pending)   # 모든 대기 조건이 충족되는 날
        if days_until(expected, as_of) > UPCOMING_WINDOW_DAYS:
            return {"status": "excluded", "why": "beyond_window"}       # 규칙 1 — 90일 밖
        if deadline is not None and expected > deadline:
            return {"status": "excluded", "why": "expected_after_deadline"}  # 충족 시점엔 마감
        return {
            "status": "upcoming",
            "reasons": reasons,
            "waiting_for": " · ".join(w for _, w in pending),
            "d_day": days_until(expected, as_of),
            "expected_date": expected,
            "verify": verify,
        }

    # 규칙 3·4 — 기계 판정 전부 통과
    #
    # 조건이 '제한없음'뿐이거나 아예 없으면 통과 사유 문장이 하나도 안 나온다. 계약상
    # reasons는 그대로 화면에 출력되므로, 빈 배열이면 카드에 설명이 사라진다 (#37·#45).
    # upcoming은 waiting_for가 항상 있어 카드가 비어 보이지 않으므로 대체 문장을 넣지 않는다.
    if verify:
        return {
            "status": "docs_needed",
            "reasons": reasons or [NO_AUTO_CHECKED_CONDITIONS_REASON],
            "verify": verify,
        }
    return {"status": "eligible", "reasons": reasons or [NO_MACHINE_CONDITIONS_REASON]}


def basis_members(policy: dict, profile: Profile, as_of: date) -> list[tuple[str, date]]:
    """정책의 beneficiary가 가리키는 판정 기준 가구원 — (for_member, birth_date) 목록.

    빈 목록 = 기준 가구원이 이 가구에 없음 → 비대상 (자녀 대상 정책 + 자녀 없는 가구 등).
    자녀가 여럿이면 각각 담는다 — 응답 항목도 각각 나간다 ((정책, 가구원) 쌍당 한 분류).
    나이만 가구원별 값을 쓰고, 거주개월·가구 유형은 가구 공통값으로 판정한다
    (profile.schema.json의 members에는 개인별 전입일이 없다).
    """
    beneficiary = policy.get("beneficiary", "본인")
    if beneficiary in ("배우자", "자녀"):
        return [(m.relation, m.birth_date) for m in profile.members if m.relation == beneficiary]
    if beneficiary == "세대주":
        flagged = [m for m in profile.members if m.is_householder]
        if flagged:
            return [(flagged[0].relation, flagged[0].birth_date)]
        if age_on(profile.birth_date, as_of) >= ADULT_AGE:
            return [("본인", profile.birth_date)]
        parents = [m for m in profile.members if m.relation in ("부", "모")]
        if parents:
            return [(parents[0].relation, parents[0].birth_date)]
        return []
    # "본인"과 "가구"(대표자 기준 판정 — hs-2026-0002 확정 동작) — 종전과 동일
    return [("본인", profile.birth_date)]


def evaluate_all(profile: Profile, policies: Iterable[dict], as_of: date) -> dict:
    """전체 정책 × 판정 기준 가구원을 판정해 계약 v1.1 results를 만든다.

    가구 판정: 정책마다 basis_members가 고른 가구원 각각의 나이로 판정하고, 그 가구원을
    for_member에 적는다. members가 없거나 본인뿐이면 종전 본인 단독 판정과 동일하다(하위 호환).
    자녀가 여럿이면 같은 정책이 여러 항목으로 나온다 — (정책, 가구원) 쌍당 한 분류가
    불변식이므로 정책 ID 기준 중복 제거를 하지 않는다 (절대 원칙).
    """
    results: dict[str, list[dict]] = {"eligible": [], "docs_needed": [], "upcoming": []}
    for policy in policies:
        for for_member, birth_date in basis_members(policy, profile, as_of):
            basis = (
                profile
                if birth_date == profile.birth_date
                else profile.model_copy(update={"birth_date": birth_date})
            )
            verdict = evaluate(basis, policy, as_of)
            status = verdict["status"]
            if status == "excluded":
                continue
            item: dict[str, Any] = {
                "for_member": for_member,
                "policy": to_api_policy(policy),
                "reasons": verdict["reasons"],
            }
            if status == "upcoming":
                item.update(
                    waiting_for=verdict["waiting_for"],
                    d_day=verdict["d_day"],
                    expected_date=verdict["expected_date"],
                    verify=verdict["verify"],
                )
            elif status == "docs_needed":
                item["verify"] = verdict["verify"]
            results[status].append(item)
    return results
