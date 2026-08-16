'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useState, useEffect, useCallback } from 'react';

const HERO_SLIDES = [
  {
    tag: '화성시 소식',
    title: '화성시민의 아이디어로\n더 나은 화성을',
    desc: '국민신문고를 통해 직접 정책을\n제안하고 참여하세요',
    gradient: 'from-[#1e3a8a] via-[#1d4ed8] to-[#3b82f6]',
    accent: 'bg-blue-400/25 text-blue-100',
    icon: '📢',
    imageUrl: 'https://www.hscity.go.kr/webcontent/banner/2026/7/27/2a9486ff-c200-480e-8813-b450922cbb58.png',
    link: 'https://www.epeople.go.kr/cmmn/idea/redirect.do?ideaRegNo=1AE-2607-0001558',
  },
  {
    tag: '화성시 뉴스',
    title: '화성시 최신 소식을\n블로그에서 확인하세요',
    desc: '정책·행사·생활정보 등\n화성시 공식 소식 한눈에',
    gradient: 'from-[#0f4c75] via-[#1b6ca8] to-[#3498db]',
    accent: 'bg-sky-400/25 text-sky-100',
    icon: '📰',
    imageUrl: 'https://www.hscity.go.kr/webcontent/banner/2026/7/22/be0729ce-928b-4a0a-8fdc-14f2f4ccbb70.png',
    link: 'https://blog.naver.com/hsview/224361769071',
  },
  {
    tag: 'AI 캠퍼스',
    title: '화성 AI 캠퍼스\n프로그램',
    desc: '화성시 AI 교육 프로그램에\n지금 바로 참여하세요',
    gradient: 'from-[#065f46] via-[#059669] to-[#34d399]',
    accent: 'bg-sky-400/25 text-sky-100',
    icon: '🤖',
    imageUrl: 'https://www.hscity.go.kr/webcontent/banner/2026/8/5/ef76c610-6471-4198-9f78-cef94a0e06e8.png',
    link: 'https://yeyak.hscity.go.kr/1002/3001/lectureAllList.do?currentPageNo=1&recordCountPerPage=10&searchCondition=title&searchKeyword=%ED%99%94%EC%84%B1+AI+%EC%BA%A0%ED%8D%BC%EC%8A%A4&gbn=&serviceTypeCd=lecture&statusCd=',
  },
  {
    tag: '경기도 복지',
    title: '2026년 경기도\n가족돌봄수당',
    desc: '경기도내 생후 24~36개월 아동\n양육공백 가정 지원',
    gradient: 'from-[#4c1d95] via-[#6d28d9] to-[#8b5cf6]',
    accent: 'bg-violet-400/25 text-violet-100',
    icon: '👨‍👩‍👧',
    imageUrl: 'https://www.hscity.go.kr/webcontent/banner/2026/8/10/3ec0bfc5-cc02-48f8-b565-9395131b1500.png',
    link: 'https://blog.naver.com/sowooju_sc/224340547539',
  },
  {
    tag: '화성시 소식',
    title: '화성시 새소식을\n지금 확인하세요',
    desc: '화성시 최신 정책·행사·지원 정보\n한눈에 확인하세요',
    gradient: 'from-[#0f4c75] via-[#1b6ca8] to-[#3498db]',
    accent: 'bg-sky-400/25 text-sky-100',
    icon: '📋',
    imageUrl: 'https://www.hscity.go.kr/webcontent/banner/2026/8/12/0a8b9bed-8d01-415f-a9f4-a648eeb76e5a.png',
    link: '#',
  },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const total = HERO_SLIDES.length;

  const next = useCallback(() => setCurrent(i => (i + 1) % total), [total]);
  const prev = useCallback(() => setCurrent(i => (i - 1 + total) % total), [total]);

  const handleImgError = useCallback((index: number) => {
    setImgErrors(prev => new Set(prev).add(index));
  }, []);

  useEffect(() => {
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/40 select-none"
      style={{ aspectRatio: '16/9' }}>

      {/* 슬라이드 트랙 */}
      <div
        className="flex h-full"
        style={{
          transform: `translateX(-${current * 100}%)`,
          transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {HERO_SLIDES.map((slide, i) => {
          const showImage = !!slide.imageUrl && !imgErrors.has(i);
          return (
            <div
              key={i}
              className={`min-w-full h-full relative bg-gradient-to-br ${slide.gradient} flex flex-col justify-end ${slide.link ? 'cursor-pointer' : ''}`}
              onClick={() => slide.link && window.open(slide.link, '_blank', 'noopener,noreferrer')}
            >
              {/* 실제 이미지 (imageUrl 있고 로드 성공 시) */}
              {showImage && (
                <img
                  src={slide.imageUrl}
                  alt={slide.tag}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => handleImgError(i)}
                />
              )}

              {/* 이미지 위 텍스트 가독성 오버레이 (이미지 모드일 때만) */}
              {showImage && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              )}

              {/* 그라데이션 폴백일 때 배경 데코 */}
              {!showImage && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/[0.04]" />
                  <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-white/[0.03]" />
                </div>
              )}

              {/* 콘텐츠 */}
              <div className="relative z-10 p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{slide.icon}</span>
                  <span className={`text-[0.625rem] font-semibold tracking-[0.14em] uppercase px-2.5 py-1 rounded-full ${slide.accent}`}>
                    {slide.tag}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight [letter-spacing:-0.02em] whitespace-pre-line mb-2">
                  {slide.title}
                </h3>
                <p className="text-[0.8125rem] text-white/65 leading-relaxed font-normal whitespace-pre-line">
                  {slide.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 화살표 버튼 */}
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all duration-150"
        aria-label="이전 슬라이드"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all duration-150"
        aria-label="다음 슬라이드"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 인디케이터 */}
      <div className="absolute bottom-4 right-5 flex items-center gap-2">
        <span className="text-[0.625rem] font-medium text-white/50 tabular-nums">
          {current + 1}/{total}
        </span>
        <div className="flex gap-1.5">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-5 h-1.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/35 hover:bg-white/60'
              }`}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const cardSpring = { type: 'spring', bounce: 0, duration: 0.3 } as const;
const tapSpring  = { type: 'spring', bounce: 0, duration: 0.2 } as const;
const MotionLink = motion.create(Link);


function GeometricBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 520" fill="none"
      preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <circle cx="1320" cy="-40" r="380" stroke="#7ab8d9" strokeWidth="1.5" opacity="0.25" />
      <circle cx="1320" cy="-40" r="530" stroke="#7ab8d9" strokeWidth="1"   opacity="0.15" />
      <circle cx="100"  cy="570" r="300" stroke="#7ab8d9" strokeWidth="1.5" opacity="0.20" />
      <g stroke="#5a9fc4" strokeWidth="0.8" opacity="0.30">
        <line x1="80"  y1="115" x2="255" y2="68" /><line x1="255" y1="68"  x2="440" y2="195" />
        <line x1="80"  y1="115" x2="185" y2="365" /><line x1="440" y1="195" x2="590" y2="82" />
        <line x1="590" y1="82"  x2="760" y2="178" /><line x1="440" y1="195" x2="510" y2="395" />
        <line x1="760" y1="178" x2="910" y2="78" /><line x1="760" y1="178" x2="970" y2="305" />
        <line x1="910" y1="78"  x2="1090" y2="128" /><line x1="1090" y1="128" x2="1290" y2="88" />
        <line x1="1090" y1="128" x2="1190" y2="368" /><line x1="970" y1="305" x2="1190" y2="368" />
        <line x1="510" y1="395" x2="710" y2="445" /><line x1="710" y1="445" x2="970" y2="305" />
      </g>
      <g fill="#4a90b8">
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
    iconBg: 'bg-blue-500/[0.14]', iconColor: 'text-blue-400', numColor: 'text-blue-400/[0.18]',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    num: '03', title: '결과 확인 및 신청',
    desc: '확정·서류 확인·예정 대상으로 구분해 드리며, 필요 서류 체크리스트까지 안내합니다.',
    iconBg: 'bg-blue-500/[0.14]', iconColor: 'text-blue-400', numColor: 'text-blue-400/[0.18]',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

const FEATURES = [
  {
    iconBg: 'bg-blue-500/[0.12]', iconColor: 'text-blue-500',
    title: '개인 맞춤 분석',
    desc: '내 상황에 해당하지 않는 정책은 걸러내고, 실제로 받을 수 있는 혜택만 보여드립니다.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    iconBg: 'bg-blue-500/[0.12]', iconColor: 'text-blue-500',
    title: 'What-if 시뮬레이터',
    desc: "'6개월 뒤', '자녀가 한 명 더 생기면' 같은 가상 상황에서 달라지는 혜택을 미리 확인하세요.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    iconBg: 'bg-blue-500/[0.12]', iconColor: 'text-blue-500',
    title: '서류 체크리스트',
    desc: '신청에 필요한 서류를 자동으로 정리해 드립니다. 한 번에 빠짐없이 준비하세요.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    iconBg: 'bg-blue-500/[0.12]', iconColor: 'text-blue-500',
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
    <div className="bg-[#E1EEF6]">

      {/* ── 히어로 ─── */}
      <section className="relative bg-[#E1EEF6] overflow-hidden">
        <GeometricBackground />
        <div className="absolute inset-0 bg-gradient-to-br from-[#E1EEF6] via-[#d4e8f5]/80 to-[#c6e0f0]/60" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
          <div className="lg:grid lg:grid-cols-[2fr_3fr] lg:gap-10 lg:items-center">

            {/* 좌: 히어로 텍스트 */}
            <div>
              <div className="inline-flex items-center gap-2 bg-sky-200/60 backdrop-blur-md border border-sky-300/50 rounded-full px-4 py-1.5 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                <span className="text-xs font-medium text-sky-900/80 tracking-wide">화성시 공식 맞춤 정책 지원 서비스</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 leading-[1.06] [letter-spacing:-0.04em] mb-5 [font-optical-sizing:auto]">
                내 상황에 딱 맞는<br />
                <span className="text-sky-600">화성시 정책</span>을<br />
                찾아드립니다
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-9 font-normal break-keep">
                복잡한 정책 목록을 하나하나 찾아보지 않아도 됩니다.<br className="hidden sm:block" />
                정보를 입력하면 지금 바로 받을 수 있는 혜택을 정리해 드립니다.
              </p>
              <MotionLink
                href="/analysis"
                whileTap={{ scale: 0.95 }}
                transition={tapSpring}
                className="inline-flex items-center gap-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-[background-color,box-shadow] duration-150 text-sm shadow-lg shadow-sky-200 hover:shadow-xl"
              >
                맞춤 분석 시작하기
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </MotionLink>
              <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-sky-200/70">
                {[{ value: '120개+', label: '화성시 지원 정책' }, { value: '1분', label: '간편 분석' }, { value: '무료', label: '서비스 이용' }].map((s) => (
                  <div key={s.label} className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-slate-800">{s.value}</span>
                    <span className="text-xs text-slate-500 font-normal">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 우: 슬라이드 캐러셀 */}
            <div className="mt-12 lg:mt-0 lg:translate-x-28">
              <HeroCarousel />
            </div>

          </div>
        </div>
      </section>

      {/* ── 이용 방법 ─── */}
      <section className="py-20 sm:py-24 bg-white relative overflow-hidden">
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(14,116,144,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Top gradient fade */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#E1EEF6]/60 to-transparent pointer-events-none" />
        {/* Radial glow center */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(125,194,233,0.10) 0%, transparent 60%)' }} />
        {/* Bottom separator */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-200/60 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2.5 text-[0.6875rem] font-semibold tracking-[0.18em] text-sky-600/80 uppercase">
              <span className="w-5 h-px bg-current opacity-60" />
              How it works
              <span className="w-5 h-px bg-current opacity-60" />
            </span>
            <h2 className="text-2xl font-bold text-slate-800 mt-3 [letter-spacing:-0.02em]">단 3단계로 완성</h2>
            <p className="text-sm text-slate-500 mt-2 font-normal max-w-xs mx-auto leading-relaxed">
              간단한 정보 입력만으로 내 맞춤 정책을 확인하세요
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <motion.div
                key={step.num}
                whileHover={{ boxShadow: '0 0 0 2px rgba(59,130,246,0.25), 0 16px_40px rgba(59,130,246,0.12)', y: -3 }}
                transition={cardSpring}
                className="bg-white border border-blue-100 shadow-[0_4px_20px_rgba(59,130,246,0.08)] rounded-2xl p-7 cursor-default"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/[0.12] border border-blue-200/60 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-500">{step.icon}</span>
                  </div>
                  <span className="text-6xl font-bold leading-none select-none text-blue-300/60">{step.num}</span>
                </div>
                <p className="text-[0.625rem] font-bold tracking-[0.18em] text-blue-400 uppercase mb-2">Step {step.num}</p>
                <h3 className="text-base font-bold text-slate-800 mb-2 [letter-spacing:-0.01em]">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 주요 기능 ─── */}
      <section className="py-20 sm:py-24 bg-[#f0f7fc] relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-200/60 to-transparent" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2.5 text-[0.6875rem] font-semibold tracking-[0.18em] text-sky-700/60 uppercase">
              <span className="w-5 h-px bg-current" />
              Features
              <span className="w-5 h-px bg-current" />
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-3 [letter-spacing:-0.02em]">주요 기능</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                whileHover={{ boxShadow: '0 0 0 2px rgba(59,130,246,0.25), 0 16px 40px rgba(59,130,246,0.12)', y: -3 }}
                transition={cardSpring}
                className="bg-white border border-blue-100 shadow-[0_4px_20px_rgba(59,130,246,0.08)] rounded-2xl p-5"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-500/[0.12] border border-blue-200/60 flex items-center justify-center mb-4">
                  <span className="text-blue-500">{f.icon}</span>
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1.5 [letter-spacing:-0.01em]">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 주요 정책 미리보기 ─── */}
      <section className="bg-[#E1EEF6]/50 py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[0.6875rem] font-medium tracking-[0.14em] text-sky-700 uppercase">Hot Policies</span>
              <h2 className="text-2xl font-bold text-slate-800 mt-1 [letter-spacing:-0.02em]">지금 주목할 정책</h2>
              <p className="text-xs text-slate-400 mt-1 font-normal">기준일 2026-08-10 · 화성시 최신 정책</p>
            </div>
            <Link href="/policies"
              className="flex-shrink-0 text-xs font-medium text-sky-700 hover:text-sky-900 transition-colors flex items-center gap-1">
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
              className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 hover:text-sky-900 transition-colors">
              내 조건에 맞는 정책 전체 분석하기
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </p>
        </div>
      </section>

      {/* ── 하단 CTA ─── */}
      <section className="bg-[#c8dff0] py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 [letter-spacing:-0.03em]">지금 바로 내 정책을 확인하세요</h2>
          <p className="text-slate-500 text-sm mb-8 font-normal">화성시에 거주한다면 누구나 무료로 이용할 수 있습니다.</p>
          <MotionLink
            href="/analysis"
            whileTap={{ scale: 0.95 }}
            transition={tapSpring}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-[background-color,box-shadow] duration-150 text-sm shadow-lg shadow-sky-200"
          >
            맞춤 분석 시작하기
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </MotionLink>
          <p className="text-slate-400 text-xs mt-6 font-normal">실제 수급 자격은 화성시 담당 부서에 문의하시기 바랍니다.</p>
        </div>
      </section>

    </div>
  );
}
