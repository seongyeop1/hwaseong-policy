import Link from 'next/link';

const CATEGORIES = [
  { id: '청년', emoji: '🎓', desc: '만 19~34세 청년 대상 주거·취업·금융 지원', color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { id: '신혼부부', emoji: '💑', desc: '결혼 7년 이내 신혼부부 주택·생활 지원', color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { id: '임신·출산', emoji: '🤱', desc: '임신·출산 가정 의료비·용품 지원', color: 'bg-rose-50 border-rose-200 text-rose-700' },
  { id: '영유아', emoji: '👶', desc: '만 0~6세 영유아 보육·양육 지원', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { id: '다자녀', emoji: '👨‍👩‍👧‍👦', desc: '자녀 2인 이상 가구 양육·교육비 지원', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { id: '중장년', emoji: '💼', desc: '만 40~64세 재취업·건강관리 지원', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { id: '어르신', emoji: '🌿', desc: '만 65세 이상 돌봄·의료·여가 지원', color: 'bg-green-50 border-green-200 text-green-700' },
  { id: '장애인', emoji: '♿', desc: '등록 장애인 생활·이동·취업 지원', color: 'bg-blue-50 border-blue-200 text-blue-700' },
];

const SAMPLE_POLICIES = [
  {
    id: 'hs-2026-0042',
    title: '화성시 청년 월세 지원',
    benefit: '월 최대 20만 원',
    category: '청년',
    status: '모집 중',
    statusColor: 'text-green-700 bg-green-50 border-green-200',
  },
  {
    id: 'hs-2026-0101',
    title: '화성시 신혼부부 전세자금 이자 지원',
    benefit: '연 최대 240만 원',
    category: '신혼부부',
    status: '모집 중',
    statusColor: 'text-green-700 bg-green-50 border-green-200',
  },
  {
    id: 'hs-2026-0155',
    title: '화성시 다자녀 양육비 지원',
    benefit: '자녀 1인당 월 10만 원',
    category: '다자녀',
    status: '모집 중',
    statusColor: 'text-green-700 bg-green-50 border-green-200',
  },
];

export default function PoliciesPage() {
  return (
    <div className="bg-gray-50 min-h-full">
      {/* 헤더 */}
      <section className="bg-white border-b border-gray-100 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">전체 정책</h1>
          <p className="text-sm text-gray-500">화성시에서 운영 중인 복지·지원 정책을 생애주기별로 확인하세요.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* 준비 중 배너 */}
        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5 flex items-start gap-4">
          <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-primary-800 mb-0.5">정책 전체 검색 기능 준비 중</p>
            <p className="text-sm text-primary-700">
              현재 전체 정책 탐색 기능을 준비하고 있습니다. 지금은{' '}
              <Link href="/" className="underline font-medium">맞춤 분석</Link>을 통해 내 조건에 맞는 정책을 확인해 보세요.
            </p>
          </div>
        </div>

        {/* 생애주기별 카테고리 */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-4">생애주기별 정책</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`rounded-2xl border p-4 flex flex-col gap-1.5 opacity-70 cursor-not-allowed ${cat.color}`}
                title="준비 중"
              >
                <span className="text-2xl">{cat.emoji}</span>
                <p className="font-bold text-sm">{cat.id}</p>
                <p className="text-xs opacity-80 leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">카테고리별 탐색 기능은 순차적으로 오픈될 예정입니다.</p>
        </section>

        {/* 샘플 정책 카드 */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-4">주요 정책 미리보기</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {SAMPLE_POLICIES.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 border ${p.statusColor}`}>
                    {p.status}
                  </span>
                  <span className="text-xs text-gray-400">{p.id}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{p.title}</h3>
                <p className="text-sm text-primary-600 font-medium">{p.benefit}</p>
                <span className="mt-3 inline-block text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-0.5">
                  {p.category}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 맞춤 분석 CTA */}
        <section className="text-center py-4">
          <p className="text-sm text-gray-600 mb-4">어떤 정책이 나에게 해당하는지 바로 확인하고 싶다면?</p>
          <Link
            href="/"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold px-7 py-3 rounded-xl transition-colors text-sm shadow-sm"
          >
            맞춤 정책 분석하기 →
          </Link>
        </section>
      </div>
    </div>
  );
}
