"""미처리 예외(500) 처리 테스트 (#34).

500 이 CORS 미들웨어 **안쪽**에서 만들어져야 한다. 바깥(ServerErrorMiddleware)에서 나오면
응답에 CORS 헤더가 없어 브라우저가 차단하고, C 는 계약서의 500 처리 대신 불투명한
CORS 에러만 보게 된다. 미들웨어 등록 순서가 뒤집히면 이 테스트가 잡는다.
"""
import logging

from fastapi.testclient import TestClient

from app.main import app

ORIGIN = "http://localhost:3000"

# 테스트 전용 폭발 라우트 — 실제 서비스 경로에는 500 을 낼 방법이 없으므로 여기서 만든다
BOOM_PATH = "/__test_unhandled_error"


@app.get(BOOM_PATH)
def _boom():
    raise RuntimeError("의도적 예외 — 500 처리 경로 테스트용")


# raise_server_exceptions=False: 실제 브라우저처럼 응답을 받아 본다
client = TestClient(app, raise_server_exceptions=False)


def test_unhandled_error_returns_contract_500():
    r = client.get(BOOM_PATH)
    assert r.status_code == 500
    assert r.json() == {"error": {"code": "INTERNAL", "message": "잠시 후 다시 시도해 주세요"}}


def test_500_carries_cors_header():
    """이 PR 의 핵심 — 500 에도 CORS 헤더가 붙어야 C 가 에러 내용을 읽을 수 있다."""
    r = client.get(BOOM_PATH, headers={"Origin": ORIGIN})
    assert r.status_code == 500
    assert r.headers.get("access-control-allow-origin") == ORIGIN


def test_500_is_logged_with_traceback(caplog):
    """로그가 없으면 배포 환경에서 원인 추적이 불가능하다 (#34 문제 2)."""
    with caplog.at_level(logging.ERROR, logger="app"):
        client.get(BOOM_PATH)
    records = [r for r in caplog.records if r.levelno >= logging.ERROR]
    assert records, "500 이 났는데 ERROR 로그가 없다"
    assert records[0].exc_info is not None, "스택트레이스가 기록되지 않았다"
    assert BOOM_PATH in records[0].getMessage()  # 어느 요청이었는지 남아야 한다


def test_other_error_statuses_still_carry_cors_header():
    """400·404 는 원래 정상이었다 — 미들웨어 추가로 깨지지 않았는지 확인."""
    r400 = client.post("/evaluate", json={}, headers={"Origin": ORIGIN})
    assert r400.status_code == 400
    assert r400.headers.get("access-control-allow-origin") == ORIGIN

    r404 = client.get("/policies/hs-9999-9999", headers={"Origin": ORIGIN})
    assert r404.status_code == 404
    assert r404.headers.get("access-control-allow-origin") == ORIGIN
