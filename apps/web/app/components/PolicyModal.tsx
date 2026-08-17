'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type ModalPolicy = {
  type: 'eligible' | 'docs_needed' | 'upcoming';
  policy: {
    policy_id: string;
    title: string;
    benefit: string;
    apply_channel?: string;
    source_url?: string;
  };
  checklistItems: string[];
  /**
   * API가 미리 생성해 둔 요약 (배치 산출물 — data/summaries.json).
   * 값이 없으면(null·undefined) "준비 중"을 표시한다. 대신 채워 넣지 않는다 —
   * 원문에 없는 안내가 "AI 요약" 라벨 아래 나가면 사실과 다른 정보가 된다.
   */
  ai_summary?: string | null;
};

function CheckItem({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <li>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => setChecked((v) => !v)}
          className="w-4 h-4 accent-primary-600 rounded flex-shrink-0"
        />
        <span className={`text-sm transition-colors ${checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
          {label}
        </span>
      </label>
    </li>
  );
}

const BADGE = {
  eligible:    { label: '자격 충족',     style: 'text-sky-700 bg-sky-50 border-sky-200' },
  docs_needed: { label: '서류 확인 필요', style: 'text-amber-700 bg-amber-50 border-amber-200' },
  upcoming:    { label: '예정 대상',     style: 'text-blue-700  bg-blue-50  border-blue-200'  },
};

const modalSpring = { type: 'spring', bounce: 0, duration: 0.35 } as const;

type Props = {
  item: ModalPolicy;
  onClose: () => void;
};

export default function PolicyModal({ item, onClose }: Props) {
  const [docsOpen, setDocsOpen] = useState(false);

  /* ESC 닫기 */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  /* 모달 열릴 때 body 스크롤 잠금 */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const badge = BADGE[item.type];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* 1. 최대 높이 85vh, flex-col — 헤더 고정 + 본문만 스크롤 */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 12 }}
        transition={modalSpring}
        className="bg-white rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.15)] w-full max-w-lg max-h-[85vh] flex flex-col"
      >

        {/* ── 고정 헤더 ── */}
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-black/[0.06] flex-shrink-0">
          <div className="flex-1 min-w-0">
            <span className={`inline-block text-xs font-semibold border rounded-full px-2.5 py-0.5 mb-2 ${badge.style}`}>
              {badge.label}
            </span>
            <h2 className="text-base font-bold text-gray-900 leading-snug">
              {item.policy.title}
            </h2>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.policy.benefit}</p>
          </div>
          <motion.button
            onClick={onClose}
            aria-label="닫기"
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors p-1.5 rounded-lg"
          >
            ✕
          </motion.button>
        </div>

        {/* 2. 스크롤 가능한 본문 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-7">

            {/* ── AI 요약 ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">AI 요약</span>
                {!item.ai_summary && (
                  <span className="text-xs text-primary-600 animate-pulse">준비 중…</span>
                )}
              </div>
              {!item.ai_summary ? (
                <div className="space-y-3">
                  <div className="h-3 bg-gray-100 rounded-full animate-pulse w-full" />
                  <div className="h-3 bg-gray-100 rounded-full animate-pulse w-11/12" />
                  <div className="h-3 bg-gray-100 rounded-full animate-pulse w-4/5" />
                </div>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.ai_summary}
                </p>
              )}
            </div>

            {/* ── 신청 필수 서류 (아코디언) ── */}
            <div className="border-t border-black/[0.05] pt-5">
              <button
                onClick={() => setDocsOpen((v) => !v)}
                className="flex items-center justify-between w-full group"
              >
                <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                  신청 필수 서류
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                  {docsOpen ? '접기' : '보기'}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${docsOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              {docsOpen && (
                <ul className="mt-4 space-y-3">
                  {item.checklistItems.map((doc, i) => (
                    <CheckItem key={i} label={doc} />
                  ))}
                </ul>
              )}
            </div>

            {/* ── 신청하러 가기 버튼 ── */}
            {(item.policy.source_url || item.policy.apply_channel) && (
              <div className="border-t border-black/[0.06] pt-5">
                {item.policy.source_url && (
                  <a
                    href={item.policy.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold py-3.5 rounded-xl transition-colors text-sm shadow-[0_4px_16px_rgba(14,165,233,0.3)]"
                  >
                    신청하러 가기
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
                {item.policy.apply_channel && (
                  <p className="text-xs text-gray-400 text-center mt-2.5">{item.policy.apply_channel}</p>
                )}
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
