#!/usr/bin/env bash
# 백엔드 로컬 기동 (JupyterHub) — 포트 8000
# 미리보기: https://ahnbi3.suwon.ac.kr:5001${JUPYTERHUB_SERVICE_PREFIX}proxy/absolute/8000/health
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d .venv ]; then
  python3 -m venv .venv
  ./.venv/bin/pip install -q -r requirements.txt
fi

# JupyterHub 프록시 경유 시 root_path 지정 (학번이 파일에 남지 않게 환경변수로만)
ROOT_PATH="${JUPYTERHUB_SERVICE_PREFIX:+${JUPYTERHUB_SERVICE_PREFIX}proxy/absolute/8000}"
exec ./.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload \
  ${ROOT_PATH:+--root-path "$ROOT_PATH"}
