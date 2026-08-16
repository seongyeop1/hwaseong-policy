'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

type SearchPolicy = {
  id: string;
  title: string;
  benefit: string;
  category: string;
  lifecycle: string;
  anchor: string;
  deadline: string | null;
};

const ALL_POLICIES: SearchPolicy[] = [
  {
    id: 'hs-2026-1276',
    lifecycle: '청년',
    anchor: 'youth',
    title: '2026년 경기 고립·은둔 청년 지원사업',
    benefit: '1:1 전문상담, 맞춤형 프로그램, 쉼터 제공, 일경험 — 300명',
    category: '복지',
    deadline: null,
  },
  {
    id: 'hs-2026-2594',
    lifecycle: '청년',
    anchor: 'youth',
    title: '화성시 청년 전(월)세 보증금 대출이자 지원사업',
    benefit: '대출이자 연 최대 200만 원 (생애 최대 2회)',
    category: '주거',
    deadline: '2026-08-14',
  },
  {
    id: 'hs-2026-2673',
    lifecycle: '청년',
    anchor: 'youth',
    title: '화성시 청년 내:일(job)응원금 지원사업',
    benefit: '근속장려금 최대 100만원 화성지역화폐',
    category: '일자리',
    deadline: '2026-08-14',
  },
  {
    id: 'hs-2026-0263',
    lifecycle: '청년',
    anchor: 'youth',
    title: '화성시 청년 부동산 중개보수 및 이사비 지원사업',
    benefit: '가구당 최대 50만원 실비 지원 (생애 1회) — 200명',
    category: '주거',
    deadline: '2026-03-06',
  },
  {
    id: 'hs-2026-0003',
    lifecycle: '신혼부부',
    anchor: 'newly-wed',
    title: '화성시 임신·출산 부모교육',
    benefit: '임신·출산 이해 및 건강한 부모 역할 준비 프로그램',
    category: '교육',
    deadline: null,
  },
  {
    id: 'hs-2026-0002',
    lifecycle: '임신·출산',
    anchor: 'pregnancy',
    title: '화성시 출산지원금',
    benefit: '첫째아 100만원 / 둘째·셋째아 200만원 / 넷째아 이상 300만원',
    category: '복지',
    deadline: null,
  },
  {
    id: 'hs-2026-0000',
    lifecycle: '어르신',
    anchor: 'senior',
    title: '화성시 노인 보청기 지원',
    benefit: '1인당 최대 1,179,000원 보청기 실구입비 지원 (생애 1회)',
    category: '건강',
    deadline: null,
  },
  {
    id: 'hs-2026-0001',
    lifecycle: '어르신',
    anchor: 'senior',
    title: '화성시 성인용 보행기 지원',
    benefit: '최대 20만원 보행기 실구입비 지원 (기초생활수급자·차상위계층)',
    category: '건강',
    deadline: null,
  },
];

const TODAY = '2026-08-16';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const results = q
    ? ALL_POLICIES.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.benefit.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.lifecycle.toLowerCase().includes(q),
      )
    : ALL_POLICIES;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000]"
            onClick={onClose}
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.28 }}
            className="fixed top-[4.5rem] left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-[10001]"
          >
            <div className="bg-white rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.18)] overflow-hidden">

              {/* 검색 입력 */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                <svg
                  className="w-4 h-4 text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="정책명, 혜택, 분야로 검색…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="text-gray-300 hover:text-gray-500 transition-colors"
                    aria-label="검색어 지우기"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* 결과 목록 */}
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                {results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                    <svg
                      className="w-10 h-10 text-gray-200 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <p className="text-sm text-gray-400 font-medium">결과가 없습니다</p>
                    <p className="text-xs text-gray-300 mt-1">다른 키워드로 검색해보세요</p>
                  </div>
                ) : (
                  results.map((p) => {
                    const expired = p.deadline !== null && p.deadline < TODAY;
                    return (
                      <Link
                        key={p.id}
                        href={`/policies#${p.anchor}`}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-blue-50/60 active:bg-blue-100/60 transition-colors duration-100 ${expired ? 'opacity-40' : ''}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[0.6rem] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              {p.lifecycle}
                            </span>
                            <span className="text-[0.6rem] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {p.category}
                            </span>
                            {expired && (
                              <span className="text-[0.6rem] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                마감 종료
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1">
                            {p.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.benefit}</p>
                        </div>
                        <svg
                          className="w-3.5 h-3.5 text-gray-300 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    );
                  })
                )}
              </div>

              {/* 하단 */}
              <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[0.6rem] text-gray-300">검수 완료 정책 {ALL_POLICIES.length}건 수록</span>
                <button
                  onClick={onClose}
                  className="text-[0.6rem] text-gray-400 hover:text-gray-600 font-medium transition-colors"
                >
                  닫기 (ESC)
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
