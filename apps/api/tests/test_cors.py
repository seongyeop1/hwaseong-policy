"""CORS 테스트 (#27) — 프론트가 브라우저에서 직접 호출하므로 응답 헤더가 없으면 차단된다.

allow_origins는 CORS_ORIGINS 환경변수로 배포마다 바뀌지만, Vercel 프리뷰(*.vercel.app)와
로컬 개발(localhost:3000)은 기본값으로 항상 열려야 한다 — 이 둘이 회귀하면 C가 막힌다.
"""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

VERCEL_PREVIEW = "https://hwaseong-policy-git-feat-abc123.vercel.app"
LOCAL_DEV = "http://localhost:3000"


def test_preflight_allows_local_dev():
    r = client.options(
        "/evaluate",
        headers={
            "Origin": LOCAL_DEV,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert r.status_code == 200
    assert r.headers["access-control-allow-origin"] == LOCAL_DEV
    assert "POST" in r.headers["access-control-allow-methods"]


def test_preflight_allows_vercel_preview_domain():
    # 프리뷰 도메인은 배포마다 새로 생기므로 정규식으로 열려 있어야 한다
    r = client.options(
        "/evaluate",
        headers={
            "Origin": VERCEL_PREVIEW,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert r.status_code == 200
    assert r.headers["access-control-allow-origin"] == VERCEL_PREVIEW


def test_actual_request_carries_allow_origin_header():
    r = client.get("/health", headers={"Origin": VERCEL_PREVIEW})
    assert r.status_code == 200
    assert r.headers["access-control-allow-origin"] == VERCEL_PREVIEW


def test_unknown_origin_gets_no_allow_header():
    r = client.get("/health", headers={"Origin": "https://example.com"})
    assert r.status_code == 200  # 서버는 정상 응답하고, 차단은 브라우저가 한다
    assert "access-control-allow-origin" not in r.headers
