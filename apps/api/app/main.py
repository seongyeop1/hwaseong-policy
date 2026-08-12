"""화성 정책 내비게이션 API — 규칙 엔진 연결 (Phase 3-a).

- 계약: packages/schema/api-contract.md v1.1.1 (필드 추가만 허용)
- 판정은 engine.evaluate (순수 함수·무 LLM). as_of 기본값(오늘) 결정은 여기서만 한다
- 정책 소스는 store.load_policies — 검수 게이트 통과분만 (Supabase 전환 시 store만 교체)
- /health 는 Phase 7 keep-warm 핑 대상 (DB 전환 시 가벼운 DB 조회 포함 — Render 슬립·Supabase 휴면 동시 방지)
"""
import os
from datetime import date

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .engine.evaluate import OverrideError, apply_overrides, evaluate_all, to_api_policy
from .schemas import EvaluateResponse, Policy, Profile
from .store import load_policies

app = FastAPI(title="화성 정책 내비게이션 API", version="0.2.0")

POLICIES = load_policies()


# ── CORS — 프론트가 전부 클라이언트 컴포넌트라 브라우저에서 직접 호출한다 ──
#
# 허용 출처는 CORS_ORIGINS 환경변수(쉼표 구분)로 배포마다 지정하고, 없으면 로컬 개발용만
# 허용한다. Vercel은 배포마다 프리뷰 도메인이 새로 생기므로 *.vercel.app을 정규식으로 함께
# 연다 (프리뷰 URL을 배포할 때마다 환경변수에 추가하는 운영 부담 제거).
# 쿠키·인증을 쓰지 않으므로 allow_credentials는 켜지 않는다.
DEFAULT_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
_configured = os.getenv("CORS_ORIGINS", "")
CORS_ORIGINS = [o.strip() for o in _configured.split(",") if o.strip()] or DEFAULT_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


# ── 에러 응답: 계약서 v1.1 공통 형식 {"error": {"code", "message"}} ──────


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    msg = "요청 형식이 올바르지 않습니다"
    errors = exc.errors()
    if errors:
        first = errors[0]
        raw = str(first.get("msg", msg))
        # pydantic model/field validator 메시지의 접두사 제거 → 계약서 예시와 같은 한국어 문장만 남김
        msg = raw.removeprefix("Value error, ")
        if raw == "Field required":
            # 어느 필드가 빠졌는지 없으면 C가 입력 폼 디버깅을 못 한다
            loc = ".".join(str(p) for p in first.get("loc", []) if p != "body")
            msg = f"필수 필드가 없습니다: {loc}" if loc else "요청 본문이 비어 있습니다"
    return JSONResponse(status_code=400, content={"error": {"code": "VALIDATION", "message": msg}})


@app.exception_handler(Exception)
async def internal_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL", "message": "잠시 후 다시 시도해 주세요"}},
    )


# ── 엔드포인트 ──────────────────────────────────────────────────────────


@app.get("/health")
def health() -> dict:
    # DB 전환 후에는 가벼운 DB 조회 추가 (keep-warm 핑이 Supabase 휴면까지 막도록)
    db = "configured" if os.getenv("SUPABASE_URL") else "not_configured"
    return {"status": "ok", "db": db, "policies": len(POLICIES)}


@app.post("/evaluate", response_model=EvaluateResponse)
def evaluate_profile(profile: Profile):
    # 계약: as_of 생략 시 서버의 오늘. 엔진 내부는 항상 as_of 인자만 사용한다 (now() 금지)
    as_of = profile.as_of or date.today()
    try:
        # What-if도 같은 경로를 탄다 — 가상 프로필로 바꾼 뒤 평소와 똑같이 판정한다
        effective = apply_overrides(profile)
    except OverrideError as exc:
        return JSONResponse(
            status_code=400, content={"error": {"code": "VALIDATION", "message": str(exc)}}
        )
    results = evaluate_all(effective, POLICIES.values(), as_of)
    return EvaluateResponse(as_of=as_of, results=results)


@app.get("/policies/{policy_id}", response_model=Policy)
def get_policy(policy_id: str):
    # /evaluate 내장 policy와 동일 스키마 (계약서 약속 — 변환점은 to_api_policy 하나)
    policy = POLICIES.get(policy_id)
    if policy is None:
        return JSONResponse(
            status_code=404,
            content={"error": {"code": "NOT_FOUND", "message": f"정책을 찾을 수 없습니다: {policy_id}"}},
        )
    return to_api_policy(policy)
