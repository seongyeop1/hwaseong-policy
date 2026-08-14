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
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4 21a8 8 0 0116 0" />
        </svg>
      );
    case '신혼부부':
      return (
        <svg {...base}>
          <circle cx="8" cy="8" r="2.8" />
          <path d="M2 21a6 6 0 0112 0" />
          <circle cx="16" cy="8" r="2.8" />
          <path d="M10 21a6 6 0 0112 0" />
        </svg>
      );
    case '임신·출산':
      return (
        <svg {...base}>
          <circle cx="12" cy="5.5" r="2.5" />
          <path d="M9 10a3 3 0 016 0c0 3.5-1.5 8-3 8s-3-4.5-3-8z" />
        </svg>
      );
    case '어르신':
      return (
        <svg {...base}>
          <circle cx="9" cy="7.5" r="3" />
          <path d="M3 21a6 6 0 0110.5-4" />
          <path d="M17 10v10" />
          <path d="M15 12l2-2 2 2" />
        </svg>
      );
    case '영유아':
      return (
        <svg {...base}>
          <circle cx="12" cy="11" r="5.5" />
          <circle cx="10" cy="10.5" r="0.75" />
          <circle cx="14" cy="10.5" r="0.75" />
          <path d="M10 13.5a2.5 2.5 0 004 0" />
          <path d="M9.5 5.5C9.5 4 10.5 3 12 3" />
        </svg>
      );
    case '다자녀':
      return (
        <svg {...base}>
          <circle cx="7" cy="7.5" r="3" />
          <path d="M1.5 20a5.5 5.5 0 0111 0" />
          <circle cx="17" cy="9" r="2.3" />
          <path d="M12 20a4.5 4.5 0 019 0" />
        </svg>
      );
    case '중장년':
      return (
        <svg {...base}>
          <circle cx="9.5" cy="7" r="3" />
          <path d="M3.5 19a6 6 0 019.5-4.5" />
          <rect x="13" y="13" width="8" height="6" rx="1.5" />
          <path d="M15.5 13v-1.5a1.5 1.5 0 013 0V13" />
        </svg>
      );
    case '장애인':
      return (
        <svg {...base}>
          <circle cx="13" cy="4" r="2" />
          <path d="M11 7.5L9.5 13h6l1.5 4.5" />
          <circle cx="9" cy="20" r="2.5" />
          <path d="M9.5 10h4" />
          <path d="M9.5 13l-.5 7" />
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
                    className="group bg-white rounded-2xl ring-1 ring-blue-100 p-4 flex flex-col gap-1 hover:ring-blue-300 hover:shadow-[0_4px_16px_rgba(59,130,246,0.1)] transition-all duration-150"
                  >
                    <CategoryIcon id={lc.id} className="w-7 h-7 text-blue-500 mb-1 group-hover:text-blue-600 transition-colors" />
                    <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-700 transition-colors">{lc.id}</p>
                    <span className="text-[0.625rem] font-bold text-blue-600 tracking-wide mt-auto pt-2">
                      {lc.policies.length}개 정책 →
                    </span>
                  </a>
                ) : (
                  <div
                    key={lc.id}
                    className="bg-white rounded-2xl ring-1 ring-gray-100 p-4 flex flex-col gap-1 opacity-50 cursor-not-allowed"
                  >
                    <CategoryIcon id={lc.id} className="w-7 h-7 text-gray-300 mb-1" />
                    <p className="font-semibold text-sm text-gray-800">{lc.id}</p>
                    <span className="text-[0.625rem] font-medium text-gray-300 tracking-wide mt-auto pt-2">준비 중</span>
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
