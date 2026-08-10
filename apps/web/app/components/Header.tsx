'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useLargeText } from '@/app/providers';

const NAV_ITEMS = [
  { href: '/', label: '맞춤 분석' },
  { href: '/intro', label: '서비스 소개' },
  { href: '/policies', label: '전체 정책' },
  { href: '/faq', label: 'FAQ' },
];

function HwaseongLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
      {/* 화성맞춤 로고: 그린 박스 + 새싹 아이콘 */}
      <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-700 transition-colors shadow-sm">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          {/* 줄기 */}
          <path d="M11 19V11" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          {/* 왼쪽 잎 */}
          <path
            d="M11 14.5C11 14.5 5.5 13 4.5 7.5C7.5 5.5 12 8.5 11 14.5Z"
            fill="white"
            fillOpacity="0.85"
          />
          {/* 오른쪽 잎 */}
          <path
            d="M11 12C11 12 16.5 10 17.5 4.5C14.5 3.5 11 6.5 11 12Z"
            fill="white"
          />
        </svg>
      </div>
      <div className="leading-tight">
        <p className="text-[15px] font-extrabold text-gray-900 tracking-tight">화성맞춤</p>
        <p className="text-[10px] text-gray-400 font-medium hidden sm:block -mt-0.5">
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <HwaseongLogo />

        {/* 데스크톱 내비게이션 */}
        <nav className="hidden sm:flex items-center gap-0.5" aria-label="주요 메뉴">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* 큰 글씨 토글 */}
          <button
            onClick={toggle}
            className={`text-xs font-medium rounded-full px-3 py-1 border transition-colors ${
              largeText
                ? 'bg-primary-600 text-white border-primary-600'
                : 'text-gray-500 border-gray-300 hover:border-primary-400 hover:text-primary-700'
            }`}
            aria-pressed={largeText}
          >
            큰 글씨 {largeText ? 'ON' : 'OFF'}
          </button>

          {/* 모바일 햄버거 버튼 */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="sm:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 */}
      {menuOpen && (
        <nav className="sm:hidden border-t border-gray-100 bg-white px-4 py-2 shadow-lg" aria-label="모바일 메뉴">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
