'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

type Policy = {
  id: string;
  title: string;
  benefit: string;
  category: string;
  deadline: string | null;
  channel: string;
  applyUrl: string | null;
};

type Lifecycle = {
  id: string;
  anchor: string;
  desc: string;
  policies: Policy[];
};

const TODAY = '2026-08-17';

function CategoryIcon({ id, className }: { id: string; className?: string }) {
  const cls = className ?? 'w-8 h-8';
  const base = {
    className: cls,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.5',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (id) {
    case '전입':
      return (
        <svg {...base}>
          {/* 집 + 화살표(이사) */}
          <path d="M3 12L12 4l9 8" />
          <path d="M9 21V12h6v9" />
          <path d="M16 17h5l-2.5-2.5L21 12" />
        </svg>
      );
    case '청년':
      return (
        <svg {...base}>
          <circle cx="12" cy="14" r="3" />
          <path d="M6 21a6 6 0 0112 0" />
          <path d="M7 11l5-2 5 2-5 2-5-2z" />
          <path d="M17 11v2.5" />
          <circle cx="17" cy="14" r="0.6" />
        </svg>
      );
    case '결혼·신혼':
    case '신혼부부':
      return (
        <svg {...base}>
          <circle cx="8" cy="7" r="2.5" />
          <path d="M3 19a5 5 0 0110 0" />
          <circle cx="16" cy="7" r="2.5" />
          <path d="M11 19a5 5 0 0110 0" />
          <circle cx="10.5" cy="21.5" r="1.5" />
          <circle cx="13.5" cy="21.5" r="1.5" />
        </svg>
      );
    case '출산·육아':
    case '임신·출산':
      return (
        <svg {...base}>
          <circle cx="13" cy="6" r="2.5" />
          <path d="M10 9 v12" />
          <path d="M10 9 Q13 9 14 10.5 Q19 14 17 18 Q15 22 10 21" />
        </svg>
      );
    case '노후':
    case '어르신':
      return (
        <svg {...base}>
          <circle cx="9" cy="6.5" r="2.5" />
          <path d="M9 9 Q8 13 7 17" />
          <path d="M7 17 L8 21" />
          <path d="M7 17 L6 21" />
          <path d="M8.5 12 L14 13" />
          <path d="M12.5 12 Q14 11 14 13" />
          <path d="M14 13 L17 21" />
        </svg>
      );
    case '영유아':
      return (
        <svg {...base}>
          {/* 유모차 */}
          <path d="M4 14 Q4 7 13 7 L20 7" />
          <rect x="4" y="14" width="16" height="5" rx="1" />
          <path d="M20 10 L23 5" />
          <path d="M7 19 L7 21" />
          <path d="M17 19 L17 21" />
          <circle cx="7" cy="22" r="1.5" />
          <circle cx="17" cy="22" r="1.5" />
        </svg>
      );
    case '다자녀':
      return (
        <svg {...base}>
          {/* 어른 1명 + 아이 2명 */}
          <circle cx="12" cy="5" r="2.5" />
          <path d="M9 21 Q9 10 12 10 Q15 10 15 21" />
          <path d="M9 12 L6 13" />
          <path d="M15 12 L18 13" />
          <circle cx="5" cy="12" r="1.8" />
          <path d="M3 21 Q3 17 5 17 Q7 17 7 21" />
          <circle cx="19" cy="12" r="1.8" />
          <path d="M17 21 Q17 17 19 17 Q21 17 21 21" />
        </svg>
      );
    case '중장년':
      return (
        <svg {...base}>
          {/* 서류가방(브리프케이스) */}
          <rect x="3" y="10" width="18" height="12" rx="2" />
          <path d="M9 10 V7 Q9 5 12 5 Q15 5 15 7 V10" />
          <path d="M3 15 H21" />
          <path d="M11 17.5 h2" />
        </svg>
      );
    case '장애인':
      return (
        <svg {...base}>
          {/* 휠체어 국제 심볼 */}
          <circle cx="16" cy="4" r="2" />
          <path d="M16 6 L13 12" />
          <path d="M14 9 L10 13" />
          <path d="M13 12 L18 12" />
          <path d="M18 12 L19 15" />
          <circle cx="10" cy="19" r="4.5" />
          <circle cx="19" cy="20" r="1.5" />
        </svg>
      );
    default:
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

const LIFECYCLES: Lifecycle[] = [
  {
    id: '전입',
    anchor: 'move-in',
    desc: '화성시 전입 신규 거주자 정착 지원',
    policies: [
      { id: 'hs-2025-0009', title: '2025년 발달장애인 긴급돌봄서비스 사업 안내', benefit: '일상생활 및 사회참여 활동 지원, 식사지원, 야간돌봄 등 최대 30일 지원', category: '복지', deadline: null, channel: '전화신청: 경기도발달장애인지원센터 ☎031-895-6163', applyUrl: 'https://www.hscity.go.kr/byeongjeom/user/bbs/BD_selectBbs.do?q_bbsCode=1048&q_bbscttSn=20250410104553782' },
      { id: 'hs-2026-0004', title: '2026년 지역사회서비스투자사업 대상자 및 재판정 모집', benefit: '지원 내용 공고 확인 필요', category: '복지', deadline: null, channel: '남양읍 행정복지센터 방문 신청', applyUrl: 'https://www.hscity.go.kr/byeongjeom/user/bbs/BD_selectBbs.do?q_bbsCode=1048&q_bbscttSn=20260115104005538' },
      { id: 'hs-2026-0263', title: '2026년 화성시 청년 부동산 중개보수 및 이사비 지원사업', benefit: '가구당 최대 50만원 실비 지원 (중개보수 30만원 / 이사비 40만원, 생애 1회) — 200명', category: '주거', deadline: '2026-03-06', channel: '온라인 — 잡아바어플라이(apply.jobaba.net)', applyUrl: 'https://www.hscity.go.kr/dongtan/user/bbs/BD_selectBbs.do?q_bbsCode=1048&q_bbscttSn=20260114165703844' },
      { id: 'hs-2026-1242', title: '화성특례시 사회서비스 종사자 휴식 지원사업 「힐링UP」', benefit: '문화활동비 및 국내여행비 1인 최대 250,000원 지원', category: '복지', deadline: '2026-03-25', channel: '화성시복지재단 홈페이지(www.hcare.kr) 온라인 접수', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1242' },
      { id: 'hs-2026-1251', title: '서울 청년 홈&잡(Home & Job) 페어', benefit: '취업·주거 연계 박람회 참가 지원', category: '기타', deadline: null, channel: 'https://forms.gle/j4QrEUeTCjUyVCTt9', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1251' },
    ],
  },
  {
    id: '청년',
    anchor: 'youth',
    desc: '만 19~39세 청년 대상 주거·취업·금융 지원',
    policies: [
      { id: 'hs-2025-0004', title: '2025년 화성시 청년활동포인트제 사업 안내', benefit: '청년 활동 포인트 지원', category: '기타', deadline: null, channel: '공고 확인 필요', applyUrl: 'https://www.hscity.go.kr/byeongjeom/user/bbs/BD_selectBbs.do?q_bbsCode=1048&q_bbscttSn=20250213151126906' },
      { id: 'hs-2025-0005', title: '화성특례시 여성청소년 생리용품 보편지원', benefit: '생리용품 현물 지원', category: '복지', deadline: null, channel: '공고 확인 필요', applyUrl: 'https://www.hscity.go.kr/byeongjeom/user/bbs/BD_selectBbs.do?q_bbsCode=1048&q_bbscttSn=20250311193023538' },
      { id: 'hs-2025-0007', title: '2025년 경기도 청소년 생활장학금 지원사업', benefit: '생활장학금 지원', category: '복지', deadline: '2025-03-28', channel: '공고 확인 필요', applyUrl: 'https://www.hscity.go.kr/byeongjeom/user/bbs/BD_selectBbs.do?q_bbsCode=1048&q_bbscttSn=20250311203422028' },
      { id: 'hs-2025-0008', title: '경기도 장애인 누림통장 및 화성형 장애인 누림통장 모집', benefit: '저축 장려금 지원', category: '복지', deadline: null, channel: '공고 확인 필요', applyUrl: 'https://www.hscity.go.kr/byeongjeom/user/bbs/BD_selectBbs.do?q_bbsCode=1048&q_bbscttSn=20250404160306677' },
      { id: 'hs-2026-1212', title: '고립·은둔 청년과 가족을 위한 안내서', benefit: '고립·은둔 청년과 가족을 위한 온라인 강의 지원', category: '교육', deadline: null, channel: '경기도 평생학습포털 지식(www.gseek.kr)', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1212' },
      { id: 'hs-2026-1215', title: '제5기 화성시 청년정책협의체 위원 모집', benefit: '청년정책 참여 기회 제공', category: '기타', deadline: null, channel: '공고 확인 필요', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1215' },
      { id: 'hs-2026-1217', title: 'AI올인원 취업지원 (수원대 대학일자리플러스센터)', benefit: 'AI모의면접, 경험분석, 직무추천, 자소서코칭 지원', category: '일자리', deadline: '2026-03-31', channel: '구글폼 신청', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1217' },
      { id: 'hs-2026-1221', title: '화성시 청년기자단(V:ON) 모집', benefit: '월별 활동비, 전문가 교육, 기자증 및 활동물품 지원', category: '기타', deadline: '2026-02-22', channel: '이메일 접수(hscity1365@hanmail.net)', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1221' },
      { id: 'hs-2026-1222', title: '2026 상반기 CJ도너스캠프 아카데미', benefit: '교육비 전액 무료, 교육지원금 월 50만원 지급', category: '일자리', deadline: '2026-03-02', channel: 'CJ채용 사이트 지원', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1222' },
      { id: 'hs-2026-1225', title: '화성시 청년 전월세 보증금 대출이자 지원사업', benefit: '최대 200만원(대출이율 최대 2%까지) 지원', category: '주거', deadline: '2026-02-27', channel: '잡아바어플라이 온라인 접수', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1225' },
      { id: 'hs-2026-1226', title: '화성시 청년 부동산 중개보수 및 이사비 지원', benefit: '가구당 최대 50만원 실비 지원 (생애 1회)', category: '주거', deadline: '2026-03-06', channel: '잡아바어플라이 온라인 접수', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1226' },
      { id: 'hs-2026-1227', title: '화성시 청년 창업 스타트', benefit: '창업 실무 역량 강화 교육 지원', category: '일자리', deadline: '2026-02-27', channel: '잡아바어플라이 온라인 접수', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1227' },
      { id: 'hs-2026-1241', title: '2026 청년봉사단 2기 모집', benefit: '봉사활동 지원', category: '복지', deadline: '2026-03-20', channel: '홈페이지 신청', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1241' },
      { id: 'hs-2026-1243', title: '구로청년공간 청년이룸 커리어업클리닉', benefit: '1:1 전문 코칭 및 커리어 상담 제공', category: '교육', deadline: '2026-03-15', channel: '미니인터 홈페이지 온라인 접수', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1243' },
      { id: 'hs-2026-1244', title: '청년문화공간 오류장', benefit: '청년문화공간 무료 대관', category: '문화', deadline: '2026-03-17', channel: '구글폼 온라인 접수', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1244' },
      { id: 'hs-2026-1245', title: '화성시 청년정책 홍보 서포터즈 모집', benefit: '콘텐츠 채택 시 월별 활동비, 우수활동자 표창', category: '기타', deadline: '2026-03-19', channel: '이메일 접수(jiy100@korea.kr)', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1245' },
      { id: 'hs-2026-1246', title: '고립청년 지원조직 임팩트 커뮤니티 멤버 모집 (청년재단)', benefit: '고립청년 지원 네트워크 참여', category: '기타', deadline: '2026-03-23', channel: '온라인 설문 신청', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1246' },
      { id: 'hs-2026-1247', title: '생활 소품 공작소 백드롭 페인팅 참여자 모집', benefit: '백드롭 페인팅 프로그램 무료 제공', category: '문화', deadline: '2026-03-19', channel: '범계역 청년출구 인스타그램 링크 접속', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1247' },
      { id: 'hs-2026-1248', title: 'AI기반 e커머스 마케팅 실무과정 교육생 모집 (수원여성인력개발센터)', benefit: '교육비 전액 국비 지원, 참여촉진수당·취업성공수당', category: '교육', deadline: '2026-03-17', channel: '방문 접수만 가능', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1248' },
      { id: 'hs-2026-1249', title: '2026년 경기청년 맞춤형 채용지원 서비스 1기 (경기도일자리재단)', benefit: '1:1 취업컨설팅 및 취업역량 강화 프로그램 지원', category: '일자리', deadline: '2026-03-18', channel: '홈페이지 온라인 신청', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1249' },
      { id: 'hs-2026-1250', title: '2026년 경기청년 사다리 프로그램 (경기도미래세대재단)', benefit: '항공료·보험료·연수비·숙식비 등 프로그램 운영비용 지원', category: '교육', deadline: '2026-03-26', channel: '경기청년포털(youth.gg.go.kr) 온라인 접수', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1250' },
      { id: 'hs-2026-1253', title: '용산청년지음 진로멘토링 MD로 살아남기', benefit: 'MD 직무 실무 중심 진로멘토링 프로그램 지원', category: '일자리', deadline: '2026-03-23', channel: 'https://miniintern.com/event/3106', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1253' },
      { id: 'hs-2026-1259', title: '화성시복지재단 H·아카데미 상반기 교육생 모집', benefit: '무료 교육 지원', category: '교육', deadline: null, channel: '화성시복지재단 홈페이지(www.hcare.kr) 선착순 접수', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1259' },
      { id: 'hs-2026-1262', title: "나의 첫 국민연금 청년 연금보험료·생활비 지원사업", benefit: '연금보험료 3개월 전액 지원, 생활지원금 30만원', category: '복지', deadline: '2026-04-17', channel: '온라인 신청', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1262' },
      { id: 'hs-2026-1263', title: '고립(은둔) 청년을 위한 AI 실무형 잡택트 캠프', benefit: '안전한 실무 일경험 제공', category: '일자리', deadline: null, channel: '아르케 홈페이지(www.big-tree.kr)', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1263' },
      { id: 'hs-2026-1264', title: '2026 청년 새로:온(溫) 창업동아리 모집', benefit: '최소 128만~최대 200만원 프로젝트 지원금', category: '일자리', deadline: '2026-04-13', channel: '경기도사회적경제원 누리집(www.gsic.or.kr) 온라인 신청', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1264' },
      { id: 'hs-2026-1266', title: '2026 대한민국 상생 채용박람회', benefit: '채용박람회 참가', category: '일자리', deadline: '2026-03-19', channel: '박람회 홈페이지(www.youthjobfair.co.kr)', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1266' },
      { id: 'hs-2026-1268', title: '2026 사회참여형 미래내일 일경험사업', benefit: '주 25시간 근무 시 1주당 375,000원, 8주 완료 시 300만원', category: '일자리', deadline: null, channel: 'https://forms.gle/fQkbs439huRwbBQb9', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1268' },
      { id: 'hs-2026-1275', title: '화성시 경기청년 사다리 프로그램', benefit: '해외대학 연수 프로그램 및 문화체험 지원', category: '교육', deadline: '2026-04-30', channel: '잡아바어플라이(apply.jobaba.net) 온라인 접수', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1275' },
      { id: 'hs-2026-1276', title: '2026년 경기 고립·은둔 청년 지원사업', benefit: '1:1 전문상담, 맞춤형 프로그램, 쉼터 제공, 일경험 — 300명', category: '복지', deadline: null, channel: '경기민원24 온라인 접수', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1276' },
      { id: 'hs-2026-1278', title: 'ANY LOCAL LAB 청년 로컬 연구 프로젝트 (안양)', benefit: '연구 지원금 150만원 지원', category: '교육', deadline: '2026-05-03', channel: 'https://miniintern.com/event/3152', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1278' },
      { id: 'hs-2026-1281', title: '1인 생활 공작소 참여자 모집', benefit: '1인 생활 역량 강화 프로그램', category: '복지', deadline: null, channel: '화성특례시통합예약시스템 선착순 접수', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1281' },
      { id: 'hs-2026-1288', title: '경기청년 메디케어 플러스 (경기도미래세대재단)', benefit: '건강검진·예방접종 비용 1인 최대 20만원 지원', category: '건강', deadline: '2026-05-29', channel: '잡아바어플라이(apply.jobaba.net) 온라인 접수', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1288' },
      { id: 'hs-2026-1291', title: '미래내일 일경험 워크베이스(Work-Base) 캠프', benefit: '교육비 전액 무료, 수료 축하비 최대 150만원 지급', category: '일자리', deadline: '2026-05-21', channel: '분야별 링크 접수', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1291' },
      { id: 'hs-2026-1310', title: '화성여성새로일하기센터 여성인턴 참가기업 및 참가자 모집', benefit: '1인 총 460만원 지원', category: '일자리', deadline: null, channel: '홈페이지(www.hswf.or.kr/womanjob)', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1310' },
      { id: 'hs-2026-1325', title: "경기 고립·은둔 청년지원 사업 '나와,(with me) 볼만한 세상'", benefit: '고립·은둔 청년 지원 프로그램', category: '복지', deadline: '2026-06-26', channel: '온라인 신청', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1325' },
      { id: 'hs-2026-1339', title: '미래내일 일경험 워크베이스 캠프 (~7.19)', benefit: '교육비 전액 무료, 수료축하비 최대 150만원 지원', category: '일자리', deadline: '2026-07-19', channel: '공고 확인 필요', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1339' },
      { id: 'hs-2026-1359', title: '2026년 사회적가치형 청년 일경험 인턴 모집', benefit: '주 30시간 8주 일경험, 월 170만원 참여수당', category: '일자리', deadline: null, channel: '잡코리아 온라인 지원', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1359' },
      { id: 'hs-2026-1360', title: '경기청년 일자리 매치업 플러스 참여자 모집', benefit: '3개월 근무 후 정규직 전환 가능, 참여수당 25만원', category: '일자리', deadline: null, channel: '잡아바 및 잡코리아 온라인 접수', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1360' },
      { id: 'hs-2026-1363', title: '2026 청년창업지원센터 상주올래 입주기업 모집', benefit: '청년창업지원센터 입주 지원', category: '일자리', deadline: '2026-08-04', channel: '청년창업지원센터 공식 누리집 접수', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1363' },
      { id: 'hs-2026-1370', title: '2026년 청년층 자살시도자 치료비 지원사업', benefit: '연 100만원 한도 치료비 지원', category: '건강', deadline: null, channel: '거주지 내 시군 자살예방(정신건강복지)센터 문의', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1370' },
      { id: 'hs-2026-2594', title: '화성시 청년 전(월)세 보증금 대출이자 지원사업', benefit: '대출이자 연 최대 200만원 (연 1회, 생애 최대 2회)', category: '주거', deadline: '2026-08-14', channel: '잡아바어플라이(apply.jobaba.net) 온라인 접수', applyUrl: 'https://apply.jobaba.net/bsns/bsnsDetailView.do?bsnsSeq=5814' },
      { id: 'hs-2026-2673', title: '2026년 화성시 청년 내:일(job)응원금 지원사업 (2차 추가모집)', benefit: '근속장려금 최대 100만원 화성지역화폐 (1차 50만원 9월 / 2차 50만원 11월)', category: '일자리', deadline: '2026-08-14', channel: '잡아바어플라이(apply.jobaba.net) 온라인 신청', applyUrl: 'https://www.hscity.go.kr/manse/user/bbs/BD_selectBbs.do?q_bbsCode=1048&q_bbscttSn=20260415091943924' },
      { id: 'kr-2026-1376', title: '2026 사회참여형 미래내일 일경험 사업 3차 모집', benefit: '최대 300만원의 활동비 지원', category: '일자리', deadline: null, channel: '청년일경험포털 상세검색', applyUrl: 'https://hey.hscity.go.kr/base/board/read?boardManagementNo=8&boardNo=1376' },
    ],
  },
  {
    id: '결혼·신혼',
    anchor: 'newly-wed',
    desc: '결혼 준비·신혼 가정 주택·생활 지원',
    policies: [
      { id: 'hs-2026-0003', title: '화성시 임신·출산 부모교육', benefit: '임신·출산 이해 및 건강한 부모 역할 준비 프로그램 (2026년 4월·8월 각 2회기)', category: '교육', deadline: null, channel: '화성시가족센터 홈페이지(hsfc.familynet.or.kr) 온라인 신청', applyUrl: 'https://www.hscity.go.kr/www/partInfo/femaleFamily/Welfare1/Welfare1_2.jsp' },
    ],
  },
  {
    id: '출산·육아',
    anchor: 'pregnancy',
    desc: '임신·출산·육아 가정 의료비·용품·교육 지원',
    policies: [
      { id: 'hs-2025-0002', title: '화성시 저소득층 아동 치과주치의 사업', benefit: '1인당 최대 70만원 지원', category: '복지', deadline: null, channel: '신청접수', applyUrl: 'https://www.hscity.go.kr/byeongjeom/user/bbs/BD_selectBbs.do?q_bbsCode=1048&q_bbscttSn=20250203174908861' },
      { id: 'hs-2025-0003', title: '2025년 보육서비스 사전 신청 안내', benefit: '보육료, 양육수당, 유아학비 변경 및 신규신청', category: '보육', deadline: '2025-02-28', channel: '읍면동 행정복지센터 방문 또는 복지로(www.bokjiro.go.kr)', applyUrl: 'https://www.hscity.go.kr/byeongjeom/user/bbs/BD_selectBbs.do?q_bbsCode=1048&q_bbscttSn=20250204175711686' },
      { id: 'hs-2025-0006', title: '맘튼튼 축산물 꾸러미 지원사업', benefit: '산모 1인당 10만원 이내 축산물 꾸러미 공급·배송', category: '복지', deadline: '2026-02-28', channel: '경기민원24(gg24.gg.go.kr) 온라인 신청', applyUrl: 'https://www.hscity.go.kr/byeongjeom/user/bbs/BD_selectBbs.do?q_bbsCode=1048&q_bbscttSn=20250311195430105' },
      { id: 'hs-2026-0002', title: '화성시 출산지원금', benefit: '첫째아 100만원 / 둘째·셋째아 각 200만원 / 넷째아 이상 300만원', category: '복지', deadline: null, channel: '행정복지센터 방문 (출생신고 시 원스톱 신청) 또는 정부24', applyUrl: 'https://www.hscity.go.kr/www/partInfo/femaleFamily/Welfare1/Welfare1_2.jsp' },
    ],
  },
  {
    id: '노후',
    anchor: 'senior',
    desc: '만 65세 이상 돌봄·의료·여가 지원',
    policies: [
      { id: 'hs-2026-0000', title: '화성시 노인 보청기 지원', benefit: '1인당 최대 1,179,000원 보청기 실구입비 지원 (생애 1회, 5년 무상 사후관리)', category: '건강', deadline: null, channel: '읍면동 행정복지센터 복지팀 방문', applyUrl: 'https://www.hscity.go.kr/www/partInfo/femaleFamily/Welfare5/Welfare5_9.jsp' },
      { id: 'hs-2026-0001', title: '화성시 성인용 보행기 지원', benefit: '1인당 최대 20만원 보행기 실구입비 지원 (기초생활수급자·차상위계층, 5년 주기 1회)', category: '건강', deadline: null, channel: '읍면동 행정복지센터 복지팀 방문', applyUrl: 'https://www.hscity.go.kr/www/partInfo/femaleFamily/Welfare5/Welfare5_9.jsp' },
    ],
  },
  { id: '영유아', anchor: 'infant', desc: '만 0~6세 영유아 보육·양육 지원', policies: [] },
  { id: '다자녀', anchor: 'multi-child', desc: '자녀 2인 이상 가구 양육·교육비 지원', policies: [] },
  { id: '중장년', anchor: 'middle-age', desc: '만 40~64세 재취업·건강관리 지원', policies: [] },
  { id: '장애인', anchor: 'disabled', desc: '등록 장애인 생활·이동·취업 지원', policies: [] },
];

function deadlineLabel(deadline: string | null): { text: string; cls: string } | null {
  if (!deadline) return null;
  if (deadline < TODAY) return { text: '마감 종료', cls: 'text-gray-400 bg-gray-100' };
  if (deadline === TODAY) return { text: '오늘 마감', cls: 'text-red-600 bg-red-50' };
  return null;
}

function PolicyListItem({ policy }: { policy: Policy }) {
  const dl = deadlineLabel(policy.deadline);
  const isExpired = policy.deadline !== null && policy.deadline < TODAY;

  return (
    <div className={`flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0 ${isExpired ? 'opacity-50' : ''}`}>
      <div className="w-0.5 h-10 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className="text-[0.6rem] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{policy.category}</span>
          {dl && (
            <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${dl.cls}`}>{dl.text}</span>
          )}
          {policy.deadline && !isExpired && policy.deadline !== TODAY && (
            <span className="text-[0.6rem] text-gray-400">{policy.deadline} 마감</span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-0.5 line-clamp-2">{policy.title}</h3>
        <p className="text-xs text-gray-500 truncate">{policy.benefit}</p>
      </div>
      <div className="flex-shrink-0">
        {policy.applyUrl ? (
          <a
            href={policy.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 active:scale-95 transition-all duration-150"
          >
            신청하기
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ) : (
          <span className="text-[0.6875rem] text-gray-400 font-medium">오프라인 방문</span>
        )}
      </div>
    </div>
  );
}

export default function PoliciesPage() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const allActive = LIFECYCLES.filter((lc) => lc.policies.length > 0);
  const totalPolicies = allActive.reduce((sum, lc) => sum + lc.policies.length, 0);

  const q = query.trim().toLowerCase();

  // 검색어가 있을 때: 정책 단위로 평탄화해서 필터
  const flatResults = q
    ? allActive.flatMap((lc) =>
        lc.policies
          .filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.benefit.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              lc.id.toLowerCase().includes(q),
          )
          .map((p) => ({ ...p, lifecycle: lc.id, anchor: lc.anchor })),
      )
    : null;

  return (
    <div className="bg-[#E1EEF6] min-h-screen">

      {/* ── 헤더 ── */}
      <section className="py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-[0.6rem] font-bold tracking-[0.22em] text-sky-700/80 uppercase mb-3">화성시 복지 정책</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 [letter-spacing:-0.03em]">전체 정책</h1>
          <p className="text-sm text-slate-600 font-normal mb-6">화성시에서 운영 중인 복지·지원 정책을 생애주기별로 확인하세요.</p>

          {/* 검색창 */}
          <div className="flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 shadow-[0_4px_24px_rgba(14,116,144,0.12)] ring-1 ring-sky-100 focus-within:ring-sky-400 transition-all duration-150">
            <svg className="w-4 h-4 text-sky-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="정책명, 분야, 혜택으로 검색… (예: 청년, 주거, 보청기)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"
                aria-label="검색어 지우기"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── 콘텐츠 시트 ── */}
      <div className="bg-white rounded-t-[2.5rem] shadow-[0_-16px_60px_rgba(14,116,144,0.08)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">

          {/* ── 검색 결과 모드 ── */}
          {flatResults !== null ? (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold text-gray-800">
                  '{query}' 검색 결과
                </span>
                <span className="text-xs text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full font-bold">
                  {flatResults.length}건
                </span>
              </div>

              {flatResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-sm text-gray-400 font-medium">일치하는 정책이 없습니다</p>
                  <p className="text-xs text-gray-300 mt-1">다른 키워드로 검색해보세요</p>
                </div>
              ) : (
                <div className="rounded-2xl ring-1 ring-blue-100 overflow-hidden bg-white">
                  {flatResults.map((p, i) => {
                    const isExpired = p.deadline !== null && p.deadline < TODAY;
                    return (
                      <div key={`${p.anchor}-${p.id}-${i}`} className={`flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0 ${isExpired ? 'opacity-50' : ''}`}>
                        <div className="w-0.5 h-10 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[0.6rem] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">{p.lifecycle}</span>
                            <span className="text-[0.6rem] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{p.category}</span>
                            {p.deadline && !isExpired && <span className="text-[0.6rem] text-gray-400">{p.deadline} 마감</span>}
                            {isExpired && <span className="text-[0.6rem] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">마감 종료</span>}
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-0.5 line-clamp-2">{p.title}</h3>
                          <p className="text-xs text-gray-500 truncate">{p.benefit}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {p.applyUrl ? (
                            <a href={p.applyUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 active:scale-95 transition-all duration-150">
                              신청하기
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : (
                            <span className="text-[0.6875rem] text-gray-400 font-medium">오프라인 방문</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ) : (
            <>
              {/* ── 기본 모드: 생애주기별 카테고리 타일 ── */}
              <section>
                <div className="flex items-end justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-800">생애주기별 정책</h2>
                  <span className="text-xs text-gray-400 font-normal">검수 완료 {totalPolicies}건</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {LIFECYCLES.map((lc) =>
                    lc.policies.length > 0 ? (
                      <a key={lc.id} href={`#${lc.anchor}`}
                        className="group bg-white rounded-2xl ring-1 ring-blue-100 p-3.5 flex items-center gap-3 hover:ring-blue-300 hover:shadow-[0_4px_16px_rgba(59,130,246,0.1)] transition-all duration-150">
                        <CategoryIcon id={lc.id} className="w-7 h-7 text-blue-500 flex-shrink-0 group-hover:text-blue-600 transition-colors" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-700 transition-colors leading-tight">{lc.id}</p>
                          <span className="text-[0.625rem] font-bold text-blue-600 tracking-wide">{lc.policies.length}개 정책 →</span>
                        </div>
                      </a>
                    ) : (
                      <div key={lc.id} className="bg-white rounded-2xl ring-1 ring-gray-100 p-3.5 flex items-center gap-3 opacity-50 cursor-not-allowed">
                        <CategoryIcon id={lc.id} className="w-7 h-7 text-gray-300 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800 leading-tight">{lc.id}</p>
                          <span className="text-[0.625rem] font-medium text-gray-300 tracking-wide">준비 중</span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* ── 생애주기별 정책 리스트 ── */}
              {allActive.map((lc) => (
                <section key={lc.id} id={lc.anchor}>
                  <div className="rounded-2xl ring-1 ring-blue-100 overflow-hidden bg-white">
                    <div className="flex items-center gap-3 px-5 py-3.5 bg-blue-50 border-b border-blue-100">
                      <CategoryIcon id={lc.id} className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-bold text-gray-800">{lc.id}</span>
                      <span className="ml-auto text-[0.625rem] font-bold text-blue-600 bg-white border border-blue-200 px-2.5 py-0.5 rounded-full tracking-wide">
                        {lc.policies.length}건
                      </span>
                    </div>
                    <div>
                      {lc.policies.map((p) => (
                        <PolicyListItem key={`${lc.anchor}-${p.id}`} policy={p} />
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </>
          )}

          {/* 맞춤 분석 CTA */}
          <section className="text-center py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-4 font-normal">어떤 정책이 나에게 해당하는지 바로 확인하고 싶다면?</p>
            <Link
              href="/analysis"
              className="inline-block bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-semibold px-7 py-3 rounded-xl transition-[transform,background-color,box-shadow] duration-150 text-sm shadow-lg shadow-sky-200 hover:shadow-xl"
            >
              맞춤 정책 분석하기 →
            </Link>
          </section>

        </div>
      </div>
    </div>
  );
}
