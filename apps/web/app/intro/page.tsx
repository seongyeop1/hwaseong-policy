import Link from 'next/link';

const STEPS = [
  {
    num: '01',
    title: '내 정보 입력',
    desc: '나이, 거주 지역, 가구 유형, 생애주기를 선택하세요. 1분이면 충분합니다.',
    icon: (
      <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    num: '02',
    title: '맞춤 정책 분석',
    desc: '화성시 전체 지원 정책 데이터베이스와 내 조건을 자동으로 매칭합니다.',
    icon: (
      <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: '결과 확인 및 신청',
    desc: '확정 대상 · 서류 확인 필요 · 예정 대상으로 구분해 보여드립니다. 필요 서류 체크리스트까지 안내합니다.',
    icon: (
      <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const FEATURES = [
  {
    title: '개인 맞춤 분석',
    desc: '내 상황에 해당하지 않는 정책은 걸러내고, 실제로 받을 수 있는 혜택만 보여드립니다.',
  },
  {
    title: 'What-if 시뮬레이터',
    desc: '\'6개월 뒤\', \'자녀가 한 명 더 생기면\' 같은 가상 상황에서 달라지는 혜택을 미리 확인해 보세요.',
  },
  {
    title: '서류 체크리스트',
    desc: '신청에 필요한 서류를 자동으로 정리해 드립니다. 놓치는 서류 없이 한 번에 준비하세요.',
  },
  {
    title: '큰 글씨 모드',
    desc: '화면 상단의 \'큰 글씨\' 버튼을 누르면 전체 글씨 크기가 커져 어르신도 편리하게 이용하실 수 있습니다.',
  },
];

export default function IntroPage() {
  return (
    <div className="bg-gray-50">
      {/* 히어로 */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <span className="inline-block text-xs font-bold tracking-widest text-primary-600 bg-primary-50 border border-primary-200 rounded-full px-3 py-1 mb-5">
            화성맞춤 서비스 소개
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
            내 상황에 딱 맞는<br />화성시 정책을 찾아드립니다
          </h1>
          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-8">
            복잡한 정책 목록을 하나하나 찾아보지 않아도 됩니다. 정보를 입력하면 지금 바로 받을 수 있는 혜택을 정리해 드립니다.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold px-7 py-3 rounded-xl transition-colors text-sm shadow-sm"
          >
            지금 바로 분석하기 →
          </Link>
        </div>
      </section>

      {/* 이용 방법 */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-xl font-extrabold text-gray-900 mb-2 text-center">이용 방법</h2>
        <p className="text-sm text-gray-500 text-center mb-10">단 3단계로 내 맞춤 정책을 확인하세요</p>
        <div className="grid sm:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <div key={step.num} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  {step.icon}
                </div>
                <span className="text-2xl font-black text-primary-100 leading-none select-none">{step.num}</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 주요 기능 */}
      <section className="bg-white border-t border-gray-100 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-extrabold text-gray-900 mb-10 text-center">주요 기능</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="w-2 flex-shrink-0 mt-1">
                  <span className="block w-2 h-2 rounded-full bg-primary-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 유의사항 */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
          <p className="font-semibold mb-1">유의사항</p>
          <p className="leading-relaxed text-amber-700">
            본 서비스는 입력하신 정보를 기반으로 정책 해당 가능성을 안내합니다.
            실제 수급 자격 및 신청 절차는 화성시 담당 부서 또는 복지로(bokjiro.go.kr)를 통해 반드시 확인하시기 바랍니다.
          </p>
        </div>
      </section>
    </div>
  );
}
