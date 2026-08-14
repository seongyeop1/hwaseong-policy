'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const cardSpring = { type: 'spring', bounce: 0, duration: 0.3 } as const;
const tapSpring  = { type: 'spring', bounce: 0, duration: 0.2 } as const;
const MotionLink = motion.create(Link);

/* ─── 마감 임박 데이터 (기준일 2026-08-12) ─────────────────── */
const DEADLINES = [
  { id: 'hs-2026-0155', title: '화성시 다자녀 양육비 지원',         category: '다자녀',  deadline: '08.13', dDay: 1  },
  { id: 'hs-2026-0101', title: '화성시 신혼부부 전세자금 이자 지원', category: '신혼부부', deadline: '08.31', dDay: 19 },
  { id: 'hs-2026-0042', title: '화성시 청년 월세 지원',             category: '청년',    deadline: '09.30', dDay: 49 },
];

function dDayChip(dDay: number) {
  if (dDay <= 7)  return 'bg-red-500/20 text-red-400 ring-1 ring-red-500/20';
  if (dDay <= 30) return 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/15';
  return 'bg-white/10 text-white/45';
}

function DeadlinePanel() {
  return (
    <div className="bg-white/[0.07] backdrop-blur-xl border border-white/[0.09] rounded-2xl overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-white/[0.07]">
        <svg className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[0.625rem] font-semibold tracking-[0.12em] text-orange-300/80 uppercase">마감 임박</span>
        <span className="ml-auto text-[0.5625rem] text-white/25 font-normal">2026.08.12 기준</span>
      </div>

      {/* 정책 목록 */}
      <div className="divide-y divide-white/[0.06]">
        {DEADLINES.map((d) => (
          <div key={d.id} className="flex items-center gap-3 px-4 py-3.5 group">
            {/* D-day 배지 */}
            <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
              {d.dDay <= 7 && (
                <span className="relative flex h-1.5 w-1.5 mb-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </span>
              )}
              <span className={`text-[0.625rem] font-bold px-2 py-0.5 rounded-md leading-none whitespace-nowrap ${dDayChip(d.dDay)}`}>
                D-{d.dDay}
              </span>
              <span className="text-[0.5rem] text-white/25 mt-0.5 leading-none">{d.deadline}</span>
            </div>

            {/* 정책 정보 */}
            <div className="min-w-0 flex-1">
              <span className="text-[0.5625rem] font-medium text-white/30 uppercase tracking-wide block mb-0.5">{d.category}</span>
              <p className="text-[0.6875rem] text-white/70 leading-snug font-medium line-clamp-2 group-hover:text-white/90 transition-colors duration-150">
                {d.title}
              </p>
            </div>

            {/* 화살표 */}
            <svg className="w-3 h-3 text-white/20 flex-shrink-0 group-hover:text-white/40 transition-colors duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        ))}
      </div>

      {/* 푸터 */}
      <div className="px-4 py-2.5 border-t border-white/[0.06]">
        <Link href="/policies" className="flex items-center gap-1 text-[0.5625rem] text-white/25 hover:text-white/45 transition-colors duration-150 font-medium">
          전체 정책 보기
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function GeometricBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 520" fill="none"
      preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <circle cx="1320" cy="-40" r="380" stroke="white" strokeWidth="1.5" opacity="0.06" />
      <circle cx="1320" cy="-40" r="530" stroke="white" strokeWidth="1"   opacity="0.04" />
      <circle cx="100"  cy="570" r="300" stroke="white" strokeWidth="1.5" opacity="0.05" />
      <g stroke="white" strokeWidth="0.8" opacity="0.13">
        <line x1="80"  y1="115" x2="255" y2="68" /><line x1="255" y1="68"  x2="440" y2="195" />
        <line x1="80"  y1="115" x2="185" y2="365" /><line x1="440" y1="195" x2="590" y2="82" />
        <line x1="590" y1="82"  x2="760" y2="178" /><line x1="440" y1="195" x2="510" y2="395" />
        <line x1="760" y1="178" x2="910" y2="78" /><line x1="760" y1="178" x2="970" y2="305" />
        <line x1="910" y1="78"  x2="1090" y2="128" /><line x1="1090" y1="128" x2="1290" y2="88" />
        <line x1="1090" y1="128" x2="1190" y2="368" /><line x1="970" y1="305" x2="1190" y2="368" />
        <line x1="510" y1="395" x2="710" y2="445" /><line x1="710" y1="445" x2="970" y2="305" />
      </g>
      <g fill="white">
        <circle cx="80"   cy="115" r="3"   opacity="0.45" /><circle cx="255"  cy="68"  r="2.5" opacity="0.35" />
        <circle cx="440"  cy="195" r="4"   opacity="0.55" /><circle cx="185"  cy="365" r="2.5" opacity="0.30" />
        <circle cx="590"  cy="82"  r="5"   opacity="0.65" /><circle cx="760"  cy="178" r="3.5" opacity="0.50" />
        <circle cx="510"  cy="395" r="3"   opacity="0.40" /><circle cx="910"  cy="78"  r="3"   opacity="0.38" />
        <circle cx="970"  cy="305" r="4.5" opacity="0.55" /><circle cx="1090" cy="128" r="3"   opacity="0.42" />
        <circle cx="1290" cy="88"  r="2.5" opacity="0.32" /><circle cx="1190" cy="368" r="3.5" opacity="0.45" />
        <circle cx="710"  cy="445" r="2.5" opacity="0.30" />
      </g>
    </svg>
  );
}

const STEPS = [
  {
    num: '01', title: '내 정보 입력',
    desc: '나이, 거주 지역, 가구 유형, 생애주기를 선택하세요. 1분이면 충분합니다.',
    iconBg: 'bg-blue-500/[0.14]', iconColor: 'text-blue-400', numColor: 'text-blue-400/[0.18]',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    num: '02', title: '맞춤 정책 분석',
    desc: '화성시 전체 지원 정책 데이터베이스와 내 조건을 자동으로 매칭합니다.',
    iconBg: 'bg-emerald-500/[0.14]', iconColor: 'text-emerald-400', numColor: 'text-emerald-400/[0.18]',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    num: '03', title: '결과 확인 및 신청',
    desc: '확정·서류 확인·예정 대상으로 구분해 드리며, 필요 서류 체크리스트까지 안내합니다.',
    iconBg: 'bg-amber-500/[0.14]', iconColor: 'text-amber-400', numColor: 'text-amber-400/[0.18]',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

const FEATURES = [
  {
    iconBg: 'bg-violet-100', iconColor: 'text-violet-600',
    title: '개인 맞춤 분석',
    desc: '내 상황에 해당하지 않는 정책은 걸러내고, 실제로 받을 수 있는 혜택만 보여드립니다.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
    title: 'What-if 시뮬레이터',
    desc: "'6개월 뒤', '자녀가 한 명 더 생기면' 같은 가상 상황에서 달라지는 혜택을 미리 확인하세요.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    iconBg: 'bg-teal-100', iconColor: 'text-teal-600',
    title: '서류 체크리스트',
    desc: '신청에 필요한 서류를 자동으로 정리해 드립니다. 한 번에 빠짐없이 준비하세요.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
    title: '큰 글씨 모드',
    desc: "상단 '큰 글씨' 버튼을 누르면 전체 글씨 크기가 커져 누구나 편리하게 이용할 수 있습니다.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
];

const PREVIEW_POLICIES = [
  { id: 'hs-2026-0042', title: '화성시 청년 월세 지원', benefit: '월 최대 20만 원', category: '청년', deadline: '2026-09-30' },
  { id: 'hs-2026-0101', title: '화성시 신혼부부 전세자금 이자 지원', benefit: '연 최대 240만 원', category: '신혼부부', deadline: '2026-08-31' },
  { id: 'hs-2026-0155', title: '화성시 다자녀 양육비 지원', benefit: '자녀 1인당 월 10만 원', category: '다자녀', deadline: '2026-08-13' },
];

export default function IntroPage() {
  return (
    <div className="bg-[#f5f5f7]">

      {/* ── 히어로 ─── */}
      <section className="relative bg-navy-950 overflow-hidden">
        <GeometricBackground />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900/90 to-navy-800/70" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
          {/* ── 두 컬럼: 좌측 히어로 텍스트 | 우측 마감 임박 패널 ── */}
          <div className="lg:grid lg:grid-cols-[1fr_268px] lg:gap-12 lg:items-start">

            {/* 좌: 히어로 본문 */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                <span className="text-xs font-medium text-white/80 tracking-wide">화성시 공식 맞춤 정책 지원 서비스</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.06] [letter-spacing:-0.04em] mb-5 [font-optical-sizing:auto]">
                내 상황에 딱 맞는<br />
                <span className="text-primary-300">화성시 정책</span>을<br />
                찾아드립니다
              </h1>
              <p className="text-base sm:text-lg text-white/60 leading-relaxed mb-9 max-w-lg font-normal">
                복잡한 정책 목록을 하나하나 찾아보지 않아도 됩니다.<br className="hidden sm:block" />
                정보를 입력하면 지금 바로 받을 수 있는 혜택을 정리해 드립니다.
              </p>
              <MotionLink
                href="/analysis"
                whileTap={{ scale: 0.95 }}
                transition={tapSpring}
                className="inline-flex items-center gap-2.5 bg-primary-500 hover:bg-primary-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-[background-color,box-shadow] duration-150 text-sm shadow-lg shadow-black/20 hover:shadow-xl"
              >
                맞춤 분석 시작하기
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </MotionLink>
              <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-white/10">
                {[{ value: '120개+', label: '화성시 지원 정책' }, { value: '1분', label: '간편 분석' }, { value: '무료', label: '서비스 이용' }].map((s) => (
                  <div key={s.label} className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-white">{s.value}</span>
                    <span className="text-xs text-white/40 font-normal">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 우: 마감 임박 패널 */}
            <div className="mt-10 lg:mt-10">
              {/* 레이블 (데스크톱에서만) */}
              <p className="hidden lg:block text-[0.5625rem] font-medium tracking-[0.14em] text-white/20 uppercase mb-2 pl-0.5">
                신청 마감 현황
              </p>
              <DeadlinePanel />
            </div>

          </div>
        </div>
      </section>

      {/* ── 통합 검색창 ─── */}
      <section className="bg-white/80 backdrop-blur-xl py-7 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-gray-400 uppercase text-center mb-3">통합 정책 검색</p>
          <div className="flex items-center gap-3 bg-gray-100/80 rounded-2xl px-4 py-3 cursor-not-allowed opacity-50 select-none">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="flex-1 text-sm text-gray-400">청년 월세 지원, 출산 지원금, 다자녀 혜택 등 검색...</span>
            <span className="flex-shrink-0 bg-gray-200 text-gray-400 text-xs font-medium px-4 py-2 rounded-xl">
              준비 중
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2.5 text-center font-normal">
            전체 정책 검색 기능 준비 중 ·{' '}
            <Link href="/analysis" className="text-navy-600 font-medium hover:underline">내 맞춤 분석</Link>으로 바로 확인하세요
          </p>
        </div>
      </section>

      {/* ── 이용 방법 ─── */}
      <section className="py-20 sm:py-24 bg-navy-950 relative overflow-hidden">
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Top gradient fade (blends with search bar above) */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-navy-900/60 to-transparent pointer-events-none" />
        {/* Radial glow center */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(100,137,245,0.07) 0%, transparent 60%)' }} />
        {/* Bottom separator */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2.5 text-[0.6875rem] font-semibold tracking-[0.18em] text-navy-400/70 uppercase">
              <span className="w-5 h-px bg-current opacity-60" />
              How it works
              <span className="w-5 h-px bg-current opacity-60" />
            </span>
            <h2 className="text-2xl font-bold text-white mt-3 [letter-spacing:-0.02em]">단 3단계로 완성</h2>
            <p className="text-sm text-navy-200/45 mt-2 font-normal max-w-xs mx-auto leading-relaxed">
              간단한 정보 입력만으로 내 맞춤 정책을 확인하세요
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {STEPS.map((step) => (
              <motion.div
                key={step.num}
                whileHover={{ boxShadow: '0 0 0 1px rgba(100,137,245,0.3), 0 12px 48px rgba(12,19,64,0.8)', y: -2 }}
                transition={cardSpring}
                className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 cursor-default"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl ${step.iconBg} ring-1 ring-white/[0.12] flex items-center justify-center flex-shrink-0`}>
                    <span className={step.iconColor}>{step.icon}</span>
                  </div>
                  <span className={`text-5xl font-bold leading-none select-none ${step.numColor}`}>{step.num}</span>
                </div>
                <p className="text-[0.625rem] font-semibold tracking-[0.15em] text-white/25 uppercase mb-2">Step {step.num}</p>
                <h3 className="text-base font-semibold text-white mb-1.5 [letter-spacing:-0.01em]">{step.title}</h3>
                <p className="text-[0.8125rem] text-navy-200/55 leading-relaxed font-normal">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 주요 기능 ─── */}
      <section className="py-20 sm:py-24 bg-white relative">
        {/* Thin gradient separator from dark navy above */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-navy-200/50 to-transparent" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2.5 text-[0.6875rem] font-semibold tracking-[0.18em] text-navy-500/60 uppercase">
              <span className="w-5 h-px bg-current" />
              Features
              <span className="w-5 h-px bg-current" />
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-3 [letter-spacing:-0.02em]">주요 기능</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                whileHover={{ boxShadow: '0 0 0 1.5px rgba(22,32,101,0.2), 0 12px 36px rgba(22,32,101,0.09)', y: -2 }}
                transition={cardSpring}
                className="flex gap-4 bg-white border border-gray-100 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5"
              >
                <div className={`w-11 h-11 rounded-2xl ${f.iconBg} ring-1 ring-black/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className={f.iconColor}>{f.icon}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 [letter-spacing:-0.01em]">{f.title}</h3>
                  <p className="text-[0.8125rem] text-gray-500 leading-relaxed font-normal">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 주요 정책 미리보기 ─── */}
      <section className="bg-white/50 py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[0.6875rem] font-medium tracking-[0.14em] text-navy-500 uppercase">Hot Policies</span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1 [letter-spacing:-0.02em]">지금 주목할 정책</h2>
              <p className="text-xs text-gray-400 mt-1 font-normal">기준일 2026-08-10 · 화성시 최신 정책</p>
            </div>
            <Link href="/policies"
              className="flex-shrink-0 text-xs font-medium text-navy-600 hover:text-navy-900 transition-colors flex items-center gap-1">
              전체 보기
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {PREVIEW_POLICIES.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.10)' }}
                whileTap={{ scale: 0.98 }}
                transition={cardSpring}
                className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[0.625rem] font-medium text-gray-400 uppercase tracking-wide">{p.category}</span>
                  <span className="text-[0.625rem] text-gray-300 font-normal">{p.id}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 [letter-spacing:-0.01em] leading-snug mb-4">{p.title}</h3>
                <div className="space-y-2 border-t border-black/[0.05] pt-3">
                  <div className="flex gap-3">
                    <span className="text-[0.6875rem] text-gray-400 w-14 flex-shrink-0 pt-px font-normal">지원 금액</span>
                    <span className="text-sm font-semibold text-gray-900 [letter-spacing:-0.01em]">{p.benefit}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-[0.6875rem] text-gray-400 w-14 flex-shrink-0 pt-px font-normal">마감일</span>
                    <span className="text-xs text-gray-600 font-normal">{p.deadline}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-center mt-8">
            <Link href="/analysis"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:text-navy-900 transition-colors">
              내 조건에 맞는 정책 전체 분석하기
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </p>
        </div>
      </section>

      {/* ── 하단 CTA ─── */}
      <section className="bg-navy-950 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 [letter-spacing:-0.03em]">지금 바로 내 정책을 확인하세요</h2>
          <p className="text-white/50 text-sm mb-8 font-normal">화성시에 거주한다면 누구나 무료로 이용할 수 있습니다.</p>
          <MotionLink
            href="/analysis"
            whileTap={{ scale: 0.95 }}
            transition={tapSpring}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-[background-color,box-shadow] duration-150 text-sm shadow-lg"
          >
            맞춤 분석 시작하기
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </MotionLink>
          <p className="text-white/25 text-xs mt-6 font-normal">실제 수급 자격은 화성시 담당 부서에 문의하시기 바랍니다.</p>
        </div>
      </section>

    </div>
  );
}
