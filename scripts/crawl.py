#!/usr/bin/env python3
"""화성시 정책 공고 크롤러.

수집 대상:
  1. 구청 지원사업 게시판 (4개 구청, q_bbsCode=1048)
     만세구 / 동탄구 / 병점구 / 효행구
  2. 청년지원센터 HEY 사업공고 (boardManagementNo=8)
  3. 본청 일반공고 (BD_selectGosiList.do)

출력: data/raw/{source}/{date}_{post_id}.txt
      (TITLE / DATE / DEPT / URL 헤더 + 본문 텍스트)

사용법:
  python scripts/crawl.py              # 전체 수집
  python scripts/crawl.py --source gu  # 구청 게시판만
  python scripts/crawl.py --source hey # HEY만
  python scripts/crawl.py --source main # 본청 공고만
  python scripts/crawl.py --pages 3    # 소스당 최대 3페이지
  python scripts/crawl.py --since 2026 # 해당 연도 이후 글만

주의:
  - 이미 내려받은 파일은 건너뜀 (재실행 가능)
  - 요청 사이 1초 대기 (서버 부하 방지)
  - API 키 불필요. 파싱은 parse.py 에서 별도 진행
"""

import argparse
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "data" / "raw"

BASE = "https://www.hscity.go.kr"
HEY_BASE = "https://hey.hscity.go.kr"

GU_OFFICES = [
    ("manse",      "만세구"),
    ("dongtan",    "동탄구"),
    ("byeongjeom", "병점구"),
    ("hyohaeng",   "효행구"),
]

DELAY = 1.0  # 요청 간격(초)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; hwaseong-policy-crawler/1.0; "
        "research project)"
    )
}


# ── 공통 유틸 ─────────────────────────────────────────────

def fetch(url: str, timeout: int = 15) -> str:
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            raw = res.read()
        for enc in ("utf-8", "euc-kr", "cp949"):
            try:
                return raw.decode(enc)
            except UnicodeDecodeError:
                continue
        return raw.decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code}: {url}", file=sys.stderr)
        return ""
    except Exception as e:
        print(f"  오류: {e} — {url}", file=sys.stderr)
        return ""


def clean(html: str) -> str:
    text = re.sub(r"<script[^>]*>.*?</script>", " ", html, flags=re.S | re.I)
    text = re.sub(r"<style[^>]*>.*?</style>", " ", text, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"&amp;", "&", text)
    text = re.sub(r"&lt;", "<", text)
    text = re.sub(r"&gt;", ">", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def save(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def safe_filename(s: str) -> str:
    return re.sub(r'[\\/:*?"<>|]', "_", s)[:60]


# ── 구청 게시판 ──────────────────────────────────────────

def crawl_gu_list(slug: str, name: str, max_pages: int, since: int) -> list[dict]:
    """구청 지원사업 게시판 목록 페이지에서 게시글 메타 수집."""
    posts = []
    list_url = f"{BASE}/{slug}/user/bbs/BD_selectBbsList.do?q_bbsCode=1048"

    for page in range(1, max_pages + 1):
        url = f"{list_url}&pageIndex={page}"
        html = fetch(url)
        if not html:
            break

        rows = re.findall(r"<tr[^>]*>(.*?)</tr>", html, re.S)
        found = 0
        for row in rows:
            href_m = re.search(
                r"href=['\"]([^'\"]*BD_selectBbs\.do[^'\"]*)['\"]", row
            )
            if not href_m:
                continue
            rel = href_m.group(1).replace("&amp;", "&")
            detail_url = BASE + rel if rel.startswith("/") else rel

            # 제목: 앵커 텍스트
            title_m = re.search(r"<a\s[^>]*href[^>]*>(.*?)</a>", row, re.S)
            title = clean(title_m.group(1)).strip() if title_m else ""

            # 날짜: data-cell-header="등록일자" td
            date_m = re.search(
                r'data-cell-header="등록일자[^"]*"[^>]*>(\d{4}-\d{2}-\d{2})', row
            )
            date_str = date_m.group(1) if date_m else ""
            if since and date_str and int(date_str[:4]) < since:
                continue

            # 담당부서: data-cell-header="담당부서" td
            dept_m = re.search(
                r'data-cell-header="담당부서[^"]*"[^>]*>(.*?)</td>', row, re.S
            )
            dept = clean(dept_m.group(1)).strip() if dept_m else name

            sn_m = re.search(r"q_bbscttSn=(\d+)", rel)
            post_id = sn_m.group(1) if sn_m else safe_filename(title)

            posts.append(
                {
                    "source": f"gu_{slug}",
                    "post_id": post_id,
                    "title": title,
                    "date": date_str,
                    "dept": dept,
                    "url": detail_url,
                }
            )
            found += 1

        if found == 0:
            break
        time.sleep(DELAY)

    return posts


def crawl_gu_detail(post: dict) -> str:
    """구청 게시글 상세 본문 추출."""
    html = fetch(post["url"])
    if not html:
        return ""

    # 본문은 <div class="txt"> 또는 <td colspan="3"> (내용 셀)
    content_m = re.search(
        r'<div[^>]*class="[^"]*txt[^"]*"[^>]*>(.*?)</div>',
        html,
        re.S | re.I,
    )
    if content_m:
        body = clean(content_m.group(1))
    else:
        # 폴백: '내용' 헤더 다음 td
        body_m = re.search(
            r"<th[^>]*>내용</th>.*?<td[^>]*>(.*?)</td>",
            html,
            re.S | re.I,
        )
        body = clean(body_m.group(1)) if body_m else ""

    return body


# ── HEY 청년지원센터 ─────────────────────────────────────

def crawl_hey_list(max_pages: int, since: int) -> list[dict]:
    """HEY 사업공고 게시판 목록 수집."""
    posts = []
    base_url = (
        f"{HEY_BASE}/base/board/list"
        f"?boardManagementNo=8&menuLevel=2&menuNo=95"
    )

    for page in range(1, max_pages + 1):
        url = f"{base_url}&page={page}"
        html = fetch(url)
        if not html:
            break

        items = re.findall(
            r'boardNo=(\d+)[^"\']*["\'][^>]*>(.*?)</a>',
            html,
            re.S,
        )
        found = 0
        for board_no, raw_title in items:
            title = re.sub(r"\s+", " ", clean(raw_title)).strip()
            # 카테고리 태그 제거: [화성시 청년정보] 등
            title = re.sub(r"^\[[^\]]+\]\s*", "", title).strip()
            # 끝에 붙는 날짜 제거: "제목 2026-07-27" 형태
            title = re.sub(r"\s+\d{4}-\d{2}-\d{2}$", "", title).strip()
            if not title or len(title) < 3:
                continue

            # 날짜 (같은 행 근처에서 추출)
            date_m = re.search(
                rf"boardNo={board_no}.*?(\d{{4}}-\d{{2}}-\d{{2}}|\d{{4}}\.\d{{2}}\.\d{{2}})",
                html,
                re.S,
            )
            date_str = ""
            if date_m:
                date_str = date_m.group(1).replace(".", "-")

            if since and date_str and int(date_str[:4]) < since:
                continue

            detail_url = (
                f"{HEY_BASE}/base/board/read"
                f"?boardManagementNo=8&boardNo={board_no}"
                f"&menuLevel=2&menuNo=95"
            )
            posts.append(
                {
                    "source": "hey",
                    "post_id": board_no,
                    "title": title,
                    "date": date_str,
                    "dept": "화성시청년지원센터HEY",
                    "url": detail_url,
                }
            )
            found += 1

        if found == 0:
            break
        time.sleep(DELAY)

    # 중복 제거 (boardNo 기준)
    seen = set()
    unique = []
    for p in posts:
        if p["post_id"] not in seen:
            seen.add(p["post_id"])
            unique.append(p)
    return unique


def crawl_hey_detail(post: dict) -> str:
    html = fetch(post["url"])
    if not html:
        return ""

    # HEY 본문: <div class="board-view-cont"> 또는 유사
    for pattern in [
        r'<div[^>]*class="[^"]*view[^"]*cont[^"]*"[^>]*>(.*?)</div>',
        r'<div[^>]*class="[^"]*cont[^"]*"[^>]*>(.*?)</div>',
        r'<div[^>]*id="[^"]*content[^"]*"[^>]*>(.*?)</div>',
    ]:
        m = re.search(pattern, html, re.S | re.I)
        if m:
            return clean(m.group(1))

    # 폴백: 전체 텍스트에서 본문 부분
    text = clean(html)
    idx = text.find(post["title"][:15])
    return text[idx : idx + 3000] if idx >= 0 else text[1000:4000]


# ── 본청 일반공고 ────────────────────────────────────────

def fetch_post(url: str, data: dict | None = None, timeout: int = 15) -> str:
    """GET 또는 POST 요청."""
    if data:
        encoded = urllib.parse.urlencode(data).encode()
        req = urllib.request.Request(url, data=encoded, headers=HEADERS)
    else:
        req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            raw = res.read()
        for enc in ("utf-8", "euc-kr", "cp949"):
            try:
                return raw.decode(enc)
            except UnicodeDecodeError:
                continue
        return raw.decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  오류: {e} — {url}", file=sys.stderr)
        return ""


def crawl_main_list(max_pages: int, since: int) -> list[dict]:
    """본청 일반공고 목록 수집.

    주의: 본청 고시공고는 행정공고 위주(의류수거함, 개발제한구역 등)라
    정책 지원사업과 직접 관련은 낮다. 구청 게시판과 HEY가 핵심 소스다.
    """
    posts = []
    list_url = f"{BASE}/www/gosi/BD_selectGosiList.do"

    for page in range(1, max_pages + 1):
        html = fetch(f"{list_url}?pageIndex={page}")
        if not html:
            break

        rows = re.findall(r"<tr[^>]*>(.*?)</tr>", html, re.S)
        found = 0
        for row in rows:
            # 제목: opGosiView('ID') 에서 ID 추출
            gosi_m = re.search(r"opGosiView\(['\"](\d+)['\"]", row)
            if not gosi_m:
                continue
            gosi_id = gosi_m.group(1)

            # 제목: 앵커 텍스트
            title_m = re.search(r"<a\s[^>]*>(.*?)</a>", row, re.S)
            title = clean(title_m.group(1)).strip() if title_m else ""

            # 날짜
            date_m = re.search(
                r'data-cell-header="게재[^"]*"[^>]*>(\d{4}-\d{2}-\d{2})', row
            )
            if not date_m:
                date_m = re.search(r"(\d{4}-\d{2}-\d{2})", row)
            date_str = date_m.group(1) if date_m else ""
            if since and date_str and int(date_str[:4]) < since:
                continue

            # 담당부서
            dept_m = re.search(
                r'data-cell-header="담당부서[^"]*"[^>]*>(.*?)</td>', row, re.S
            )
            dept = clean(dept_m.group(1)).strip() if dept_m else ""

            # 상세 URL은 POST → 메타에 gosi_id 보관, detail 함수에서 POST
            posts.append(
                {
                    "source": "main",
                    "post_id": gosi_id,
                    "title": title,
                    "date": date_str,
                    "dept": dept,
                    "url": f"{BASE}/www/gosi/BD_selectGosiDetail.do",
                    "_gosi_id": gosi_id,
                }
            )
            found += 1

        if found == 0:
            break
        time.sleep(DELAY)

    return posts


def crawl_main_detail(post: dict) -> str:
    html = fetch_post(
        post["url"],
        data={"q_notAncmtMgtNo": post["_gosi_id"]},
    )
    if not html:
        return ""

    content_m = re.search(
        r'<div[^>]*class="[^"]*txt[^"]*"[^>]*>(.*?)</div>',
        html,
        re.S | re.I,
    )
    if content_m:
        return clean(content_m.group(1))

    body_m = re.search(
        r"<th[^>]*>내용</th>.*?<td[^>]*>(.*?)</td>",
        html,
        re.S | re.I,
    )
    return clean(body_m.group(1)) if body_m else ""


# ── 저장 ─────────────────────────────────────────────────

def build_text(post: dict, body: str) -> str:
    return (
        f"TITLE: {post['title']}\n"
        f"DATE:  {post['date']}\n"
        f"DEPT:  {post['dept']}\n"
        f"URL:   {post['url']}\n"
        f"{'─' * 60}\n"
        f"{body}\n"
    )


def output_path(post: dict) -> Path:
    date_prefix = post["date"].replace("-", "") if post["date"] else "00000000"
    filename = f"{date_prefix}_{post['post_id']}.txt"
    return RAW_DIR / post["source"] / filename


# ── 진입점 ────────────────────────────────────────────────

def run(source_filter: str, max_pages: int, since: int) -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    all_posts: list[tuple[dict, callable]] = []

    if source_filter in ("gu", "all"):
        for slug, name in GU_OFFICES:
            print(f"\n[{name}] 목록 수집 중...")
            posts = crawl_gu_list(slug, name, max_pages, since)
            print(f"  → {len(posts)}건")
            all_posts.extend((p, crawl_gu_detail) for p in posts)

    if source_filter in ("hey", "all"):
        print("\n[HEY 청년지원센터] 목록 수집 중...")
        posts = crawl_hey_list(max_pages, since)
        print(f"  → {len(posts)}건")
        all_posts.extend((p, crawl_hey_detail) for p in posts)

    if source_filter in ("main", "all"):
        print("\n[본청 일반공고] 목록 수집 중...")
        posts = crawl_main_list(max_pages, since)
        print(f"  → {len(posts)}건")
        all_posts.extend((p, crawl_main_detail) for p in posts)

    print(f"\n총 {len(all_posts)}건 — 상세 페이지 수집 시작")
    saved = skipped = failed = 0

    for post, detail_fn in all_posts:
        path = output_path(post)
        if path.exists():
            skipped += 1
            continue

        time.sleep(DELAY)
        body = detail_fn(post)
        if not body:
            failed += 1
            print(f"  ⚠ 본문 없음: {post['title'][:40]}")
            continue

        save(path, build_text(post, body))
        saved += 1
        print(f"  ✓ {path.relative_to(ROOT)}")

    print(f"\n완료 — 저장 {saved}건 / 스킵 {skipped}건 / 실패 {failed}건")
    print(f"원문 위치: {RAW_DIR.relative_to(ROOT)}/")


def main() -> int:
    parser = argparse.ArgumentParser(description="화성시 정책 공고 크롤러")
    parser.add_argument(
        "--source",
        choices=["gu", "hey", "main", "all"],
        default="all",
        help="수집 대상 (기본: all)",
    )
    parser.add_argument(
        "--pages",
        type=int,
        default=10,
        metavar="N",
        help="소스당 최대 페이지 수 (기본: 10)",
    )
    parser.add_argument(
        "--since",
        type=int,
        default=2025,
        metavar="YEAR",
        help="이 연도 이후 게시글만 수집 (기본: 2025)",
    )
    args = parser.parse_args()
    run(args.source, args.pages, args.since)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
