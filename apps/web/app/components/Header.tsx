'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLargeText } from '@/app/providers';

const NAV_ITEMS = [
  { href: '/', label: '서비스 소개' },
  { href: '/analysis', label: '맞춤 분석' },
  { href: '/policies', label: '전체 정책' },
  { href: '/faq', label: 'FAQ' },
];

/* spring presets */
const drawerSpring = { type: 'spring', bounce: 0.2, duration: 0.3 } as const;
const tapSpring    = { type: 'spring', bounce: 0, duration: 0.2 } as const;

function HwaseongLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
      <div className="w-9 h-9 rounded-xl bg-sky-100 group-hover:bg-sky-200 transition-colors flex items-center justify-center flex-shrink-0 shadow-sm border border-sky-200">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M11 19V11" stroke="#0ea5e9" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M11 14.5C11 14.5 5.5 13 4.5 7.5C7.5 5.5 12 8.5 11 14.5Z" fill="#6dd8a1" fillOpacity="0.9" />
          <path d="M11 12C11 12 16.5 10 17.5 4.5C14.5 3.5 11 6.5 11 12Z" fill="#38bdf8" fillOpacity="0.85" />
        </svg>
      </div>
      <div className="leading-tight">
        <p className="text-[0.9375rem] font-extrabold text-slate-800 tracking-tight">화성맞춤</p>
        <p className="text-[0.625rem] text-sky-600 font-medium hidden sm:block -mt-0.5">
          화성시 맞춤 정책 지원
        </p>
      </div>
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { largeText, toggle } = useLargeText();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white/75 backdrop-blur-2xl backdrop-saturate-180 shadow-[0_1px_0_rgba(0,0,0,0.07)] fixed top-0 left-0 right-0 z-[9999]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

        {/* 로고 */}
        <HwaseongLogo />

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden sm:flex items-center justify-center flex-1 gap-0.5" aria-label="주요 메뉴">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-[background-color,color] duration-150 ${
                  active
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* 유틸리티 버튼 */}
        <div className="flex items-center gap-1.5">
          {/* 검색 아이콘 */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            transition={tapSpring}
            className="hidden sm:flex w-8 h-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-[background-color,color] duration-150"
            aria-label="검색"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </motion.button>

          {/* 큰 글씨 토글 */}
          <motion.button
            onClick={toggle}
            whileTap={{ scale: 0.92 }}
            transition={tapSpring}
            className={`text-xs font-medium rounded-full px-3 py-1 border transition-[background-color,border-color,color] duration-150 ${
              largeText
                ? 'bg-sky-500 text-white border-sky-500'
                : 'text-gray-500 border-gray-200 hover:border-sky-300 hover:text-sky-700'
            }`}
            aria-pressed={largeText}
          >
            큰 글씨 {largeText ? 'ON' : 'OFF'}
          </motion.button>

          {/* 모바일 햄버거 */}
          <motion.button
            onClick={() => setMenuOpen((v) => !v)}
            whileTap={{ scale: 0.88 }}
            transition={tapSpring}
            className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-[background-color] duration-150"
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.svg
                  key="close"
                  initial={{ rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 45, opacity: 0 }}
                  transition={tapSpring}
                  className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="open"
                  initial={{ rotate: 45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -45, opacity: 0 }}
                  transition={tapSpring}
                  className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* 모바일 드롭다운 — spring drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={drawerSpring}
            className="sm:hidden border-t border-black/[0.06] bg-white/80 backdrop-blur-2xl px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
            aria-label="모바일 메뉴"
          >
            {NAV_ITEMS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-[background-color,color] duration-150 ${
                    active
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            {/* 모바일 검색 */}
            <div className="px-3 py-2 mt-1 border-t border-gray-100">
              <div className="w-full flex items-center gap-2 text-sm text-gray-300 bg-gray-50 rounded-xl px-3 py-2.5 cursor-not-allowed opacity-60">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                정책 검색 (준비 중)
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
