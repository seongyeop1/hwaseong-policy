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

const TODAY = '2026-08-14';

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
    case '청년':
      return (
        <svg {...base}>
          {/* 졸업모자 + 사람 */}
          <circle cx="12" cy="14" r="3" />
          <path d="M6 21a6 6 0 0112 0" />
          <path d="M7 11l5-2 5 2-5 2-5-2z" />
          <path d="M17 11v2.5" />
          <circle cx="17" cy="14" r="0.6" />
        </svg>
      );
    case '신혼부부':
      return (
        <svg {...base}>
          {/* 두 사람 + 결혼반지 */}
          <circle cx="8" cy="7" r="2.5" />
          <path d="M3 19a5 5 0 0110 0" />
          <circle cx="16" cy="7" r="2.5" />
          <path d="M11 19a5 5 0 0110 0" />
          <circle cx="10.5" cy="21.5" r="1.5" />
          <circle cx="13.5" cy="21.5" r="1.5" />
        </svg>
      );
    case '임신·출산':
      return (
        <svg {...base}>
          {/* 임신부 옆모습 실루엣 */}
          <circle cx="13" cy="6" r="2.5" />
          <path d="M10 9 v12" />
          <path d="M10 9 Q13 9 14 10.5 Q19 14 17 18 Q15 22 10 21" />
        </svg>
      );
    case '어르신':
      return (
        <svg {...base}>
          {/* 굽은 자세 + 지팡이 */}
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
    id: '청년',
    anchor: 'youth',
    desc: '만 19~39세 청년 대상 주거·취업·금융 지원',
    policies: [
      {
        id: 'hs-2026-1276',
        title: '2026년 경기 고립·은둔 청년 지원사업',
        benefit: '1:1 전문상담, 맞춤형 프로그램(자아 회복·관계 연습·거점별 특화 활동 등), 쉼터 제공, 일경험 — 300명',
        category: '복지',
        deadline: null,
        channel: '경기민원24 온라인 접수',
        applyUrl: 'https://www.gg.go.kr',
      },
      {
        id: 'hs-2026-2594',
        title: '화성시 청년 전(월)세 보증금 대출이자 지원사업',
        benefit: '대출이자 연 최대 200만 원 (연 1회, 생애 최대 2회, 대출액의 연 2% 이자 지원)',
        category: '주거',
        deadline: '2026-08-14',
        channel: '온라인 — 잡아바어플라이(apply.jobaba.net)',
        applyUrl: 'https://apply.jobaba.net',
      },
      {
        id: 'hs-2026-2673',
        title: '2026년 화성시 청년 내:일(job)응원금 지원사업 (2차 추가모집)',
        benefit: '근속장려금 최대 100만원 화성지역화폐 (1차 50만원 9월 / 2차 50만원 11월)',
        category: '일자리',
        deadline: '2026-08-14',
        channel: '온라인 — 잡아바어플라이(apply.jobaba.net)',
        applyUrl: 'https://apply.jobaba.net',
      },
      {
        id: 'hs-2026-0263',
        title: '2026년 화성시 청년 부동산 중개보수 및 이사비 지원사업',
        benefit: '가구당 최대 50만원 실비 지원 (중개보수 30만원 / 이사비 40만원 개별 한도, 생애 1회) — 200명',
        category: '주거',
        deadline: '2026-03-06',
        channel: '온라인 — 잡아바어플라이(apply.jobaba.net)',
        applyUrl: 'https://apply.jobaba.net',
      },
    ],
  },
  {
    id: '신혼부부',
    anchor: 'newly-wed',
    desc: '결혼 준비·신혼 가정 주택·생활 지원',
    policies: [
      {
        id: 'hs-2026-0003',
        title: '화성시 임신·출산 부모교육',
        benefit: '임신·출산 이해 및 건강한 부모 역할 준비 지원 프로그램 (2026년 4월 2회기·8월 2회기 운영)',
        category: '교육',
        deadline: null,
        channel: '온라인 — 화성시가족센터 홈페이지(hsfc.familynet.or.kr)',
        applyUrl: 'https://hsfc.familynet.or.kr',
      },
    ],
  },
  {
    id: '임신·출산',
    anchor: 'pregnancy',
    desc: '임신·출산 가정 의료비·용품·교육 지원',
    policies: [
      {
        id: 'hs-2026-0002',
        title: '화성시 출산지원금',
        benefit: '첫째아 100만원 / 둘째·셋째아 각 200만원 / 넷째아 이상 300만원 현금 지급 (넷째아 이상 2회 분할)',
        category: '복지',
        deadline: null,
        channel: '행정복지센터 방문 (출생신고 시 원스톱 신청) 또는 정부24',
        applyUrl: 'https://www.gov.kr',
      },
      {
        id: 'hs-2026-0003',
        title: '화성시 임신·출산 부모교육',
        benefit: '임신·출산 이해 및 건강한 부모 역할 준비 지원 프로그램 (2026년 4월 2회기·8월 2회기 운영)',
        category: '교육',
        deadline: null,
        channel: '온라인 — 화성시가족센터 홈페이지(hsfc.familynet.or.kr)',
        applyUrl: 'https://hsfc.familynet.or.kr',
      },
    ],
  },
  {
    id: '어르신',
    anchor: 'senior',
    desc: '만 65세 이상 돌봄·의료·여가 지원',
    policies: [
      {
        id: 'hs-2026-0000',
        title: '화성시 노인 보청기 지원',
        benefit: '1인당 최대 1,179,000원 보청기 실구입비 지원 (생애 1회, 5년 무상 사후관리)',
        category: '건강',
        deadline: null,
        channel: '오프라인 — 읍면동 행정복지센터 복지팀 방문',
        applyUrl: null,
      },
      {
        id: 'hs-2026-0001',
        title: '화성시 성인용 보행기 지원',
        benefit: '최대 20만원 보행기 실구입비 지원 (5년 주기 1인 1회, 기초생활수급자·차상위계층)',
        category: '건강',
        deadline: null,
        channel: '오프라인 — 읍면동 행정복지센터 복지팀 방문',
        applyUrl: null,
      },
    ],
  },
  {
    id: '영유아',
    anchor: 'infant',
    desc: '만 0~6세 영유아 보육·양육 지원',
    policies: [],
  },
  {
    id: '다자녀',
    anchor: 'multi-child',
    desc: '자녀 2인 이상 가구 양육·교육비 지원',
    policies: [],
  },
  {
    id: '중장년',
    anchor: 'middle-age',
    desc: '만 40~64세 재취업·건강관리 지원',
    policies: [],
  },
  {
    id: '장애인',
    anchor: 'disabled',
    desc: '등록 장애인 생활·이동·취업 지원',
    policies: [],
  },
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
  const activeLifecycles = LIFECYCLES.filter((lc) => lc.policies.length > 0);
  const totalPolicies = activeLifecycles.reduce((sum, lc) => sum + lc.policies.length, 0);

  return (
    <div className="bg-navy-950 min-h-screen">

      {/* ── 네이비 헤더 ── */}
      <section className="py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-[0.6rem] font-bold tracking-[0.22em] text-navy-400 uppercase mb-3">화성시 복지 정책</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 [letter-spacing:-0.03em]">전체 정책</h1>
          <p className="text-sm text-navy-300 font-normal">화성시에서 운영 중인 복지·지원 정책을 생애주기별로 확인하세요.</p>
        </div>
      </section>

      {/* ── 콘텐츠 시트 ── */}
      <div className="bg-[#fafaf9] rounded-t-[2.5rem] shadow-[0_-16px_60px_rgba(0,0,0,0.25)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">

          {/* 생애주기별 카테고리 타일 */}
          <section>
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">생애주기별 정책</h2>
              <span className="text-xs text-gray-400 font-normal">검수 완료 {totalPolicies}건</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LIFECYCLES.map((lc) =>
                lc.policies.length > 0 ? (
                  <a
                    key={lc.id}
                    href={`#${lc.anchor}`}
                    className="group bg-white rounded-2xl ring-1 ring-blue-100 p-3.5 flex items-center gap-3 hover:ring-blue-300 hover:shadow-[0_4px_16px_rgba(59,130,246,0.1)] transition-all duration-150"
                  >
                    <CategoryIcon id={lc.id} className="w-7 h-7 text-blue-500 flex-shrink-0 group-hover:text-blue-600 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-700 transition-colors leading-tight">{lc.id}</p>
                      <span className="text-[0.625rem] font-bold text-blue-600 tracking-wide">{lc.policies.length}개 정책 →</span>
                    </div>
                  </a>
                ) : (
                  <div
                    key={lc.id}
                    className="bg-white rounded-2xl ring-1 ring-gray-100 p-3.5 flex items-center gap-3 opacity-50 cursor-not-allowed"
                  >
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

          {/* 생애주기별 정책 리스트 */}
          {activeLifecycles.map((lc) => (
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

          {/* 맞춤 분석 CTA */}
          <section className="text-center py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-4 font-normal">어떤 정책이 나에게 해당하는지 바로 확인하고 싶다면?</p>
            <Link
              href="/analysis"
              className="inline-block bg-primary-600 hover:bg-primary-700 active:bg-primary-800 active:scale-95 text-white font-semibold px-7 py-3 rounded-xl transition-[transform,background-color] duration-150 text-sm shadow-sm"
            >
              맞춤 정책 분석하기 →
            </Link>
          </section>

        </div>
      </div>
    </div>
  );
}
