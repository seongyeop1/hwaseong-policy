"""화성 정책 내비게이션 API — 골격 (Phase 0).

- 계약: api-contract.md v1.1 (필드 추가만 허용)
- /evaluate 는 Phase 3-a에서 규칙 엔진 연결. 골격 단계에서는 계약 형태(세 배열 상존)만 보장
- /policies/{id} 는 Phase 2에서 DB 조회로 대체
- /health 는 Phase 7 keep-warm 핑 대상 (DB 조회 포함 예정 — Render 슬립·Supabase 휴면 동시 방지)
"""
import os
from datetime import date

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .schemas import EvaluateResponse, Profile, Results

app = FastAPI(title="화성 정책 내비게이션 API", version="0.1.0")


# ── 에러 응답: 계약서 v1.1 공통 형식 {"error": {"code", "message"}} ──────


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    msg = "요청 형식이 올바르지 않습니다"
    errors = exc.errors()
    if errors:
        raw = str(errors[0].get("msg", msg))
        # pydantic model/field validator 메시지의 접두사 제거 → 계약서 예시와 같은 한국어 문장만 남김
        msg = raw.removeprefix("Value error, ")
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
    # Phase 2에서 가벼운 DB 조회 추가 (keep-warm 핑이 Supabase 휴면까지 막도록)
    db = "configured" if os.getenv("SUPABASE_URL") else "not_configured"
    return {"status": "ok", "db": db}


@app.post("/evaluate", response_model=EvaluateResponse)
def evaluate_profile(profile: Profile) -> EvaluateResponse:
    # 계약: as_of 생략 시 서버의 오늘. 엔진 내부는 항상 as_of 인자만 사용한다 (now() 금지)
    as_of = profile.as_of or date.today()
    # Phase 3-a: DB의 전체 정책 × (프로필, as_of)를 engine.evaluate로 판정해 3분류를 채운다
    return EvaluateResponse(as_of=as_of, results=Results())


@app.get("/policies/{policy_id}")
def get_policy(policy_id: str) -> JSONResponse:
    # Phase 2: DB 조회로 대체. 골격 단계에서는 계약 형식의 404만 보장
    return JSONResponse(
        status_code=404,
        content={"error": {"code": "NOT_FOUND", "message": f"정책을 찾을 수 없습니다: {policy_id}"}},
    )
