#!/usr/bin/env python3
"""복지로(중앙부처 복지서비스) OpenAPI 스모크 테스트.

사용법:
  1) 레포 루트의 .env 또는 env.local.txt 에 BOKJIRO_ENDPOINT, BOKJIRO_API_KEY 입력
     (env.local.txt 는 Jupyter 파일 브라우저에서 보이는 대안 파일 — gitignore 등록됨.
      키를 채팅·커밋에 붙여넣기 금지)
  2) python scripts/bokjiro_probe.py
  3) 엔드포인트 인자 덮어쓰기: python scripts/bokjiro_probe.py "https://apis.data.go.kr/..."

확인된 사실 (8/8 검증):
  - 엔드포인트 기본 주소: https://apis.data.go.kr/B554287/NationalWelfareInformationsV001
    (목록 /NationalWelfarelistV001, 상세 /NationalWelfaredetailedV001 를 붙여 호출)
  - 필수 파라미터: callTp=L + srchKeyCode=001 (없으면 INVALID_REQUEST_PARAMETER_ERROR)
  - 중앙부처 복지서비스 총 461건 (8/8 기준)

트래픽 주의: 이 스크립트는 호출을 정확히 1회(numOfRows=5)만 발생시킨다.
일일 트래픽 제한이 있으므로 반복 실행으로 낭비하지 않는다.
본 수집은 페이지당 최대 건수(numOfRows=100)로 호출 횟수를 최소화한다.
"""
import os
import pathlib
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent


def load_env() -> None:
    # .env(숨김)가 우선, env.local.txt(Jupyter 파일 브라우저에서 보이는 대안)가 보조
    for name in (".env", "env.local.txt"):
        path = ROOT / name
        if not path.exists():
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.split("#")[0].strip())


def main() -> int:
    load_env()
    endpoint = sys.argv[1] if len(sys.argv) > 1 else os.getenv("BOKJIRO_ENDPOINT", "")
    key = os.getenv("BOKJIRO_API_KEY", "")
    if not endpoint or not key:
        print(".env 또는 env.local.txt 에 BOKJIRO_ENDPOINT 와 BOKJIRO_API_KEY 를 먼저 입력하세요")
        return 1

    # env에는 기본 주소만 저장해도 된다 — 오퍼레이션 경로가 없으면 목록조회를 자동으로 붙인다
    lowered = endpoint.lower()
    if "list" not in lowered and "detail" not in lowered:
        endpoint = endpoint.rstrip("/") + "/NationalWelfarelistV001"

    # Decoding 키(% 없음)는 urlencode 1회, Encoding 키(% 포함)는 그대로 붙인다 — 이중 인코딩 방지
    common = urllib.parse.urlencode(
        {"pageNo": "1", "numOfRows": "5", "callTp": "L", "srchKeyCode": "001"}
    )
    if "%" in key:
        url = f"{endpoint}?serviceKey={key}&{common}"
    else:
        url = f"{endpoint}?{urllib.parse.urlencode({'serviceKey': key})}&{common}"

    print(f"→ GET {endpoint} (numOfRows=5, 호출 1회)")
    try:
        with urllib.request.urlopen(url, timeout=15) as res:
            body = res.read().decode("utf-8", errors="replace")
            print(f"HTTP {res.status}")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"HTTP {e.code}: {e.reason}")
    except Exception as e:
        print(f"요청 실패: {e}")
        return 1

    print("--- 응답 앞부분 (800자) ---")
    print(body[:800])
    print("---------------------------")

    upper = body.upper()
    if "SERVICE_KEY_IS_NOT_REGISTERED" in upper or ("SERVICE KEY" in upper and "NOT REGISTERED" in upper):
        print("진단: 인증키 미등록 오류 —")
        print("  ① 승인 직후에는 키 활성화까지 최대 1시간가량 걸릴 수 있음 (잠시 후 재시도)")
        print("  ② 일반 인증키의 Encoding/Decoding 다른 쪽으로 교체해 재시도")
        print("  ③ 활용신청한 API와 엔드포인트가 같은 건인지 확인")
    elif body.lstrip().startswith("{"):
        print("진단: JSON 응답 수신 — 본문에 서비스명 목록이 보이면 성공")
    elif body.lstrip().startswith("<"):
        names = re.findall(r"<servNm>(.*?)</servNm>", body)
        if names:
            print(f"진단: XML 정상 — 서비스명 샘플 {len(names)}건: {names[:5]}")
        else:
            print("진단: XML 수신 — 위 원문의 resultCode/resultMessage 를 확인")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
