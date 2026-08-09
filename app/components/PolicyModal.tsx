'use client';

import { useEffect, useState } from 'react';

export type ModalPolicy = {
  type: 'eligible' | 'docs_needed' | 'upcoming';
  policy: {
    policy_id: string;
    title: string;
    benefit: string;
  };
  checklistItems: string[];
};

function getMockSummary(title: string, benefit: string): string {
  return `「${title}」은(는) 화성시 거주 시민을 위한 지원 사업입니다. ${benefit} 혜택이 제공되며, 신청 기간 내 온라인 또는 읍면동 주민센터를 통해 신청할 수 있습니다. 소득 및 거주 요건 충족 여부를 미리 확인하신 후 구비 서류를 준비해 주세요.`;
}

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
        <span
          className={`text-sm transition-colors ${
            checked ? 'line-through text-gray-400' : 'text-gray-700'
          }`}
        >
          {label}
        </span>
      </label>
    </li>
  );
}

const BADGE = {
  eligible:   { label: '확정 대상',     style: 'text-green-700 bg-green-50 border-green-200' },
  docs_needed:{ label: '서류 확인 필요', style: 'text-amber-700 bg-amber-50 border-amber-200' },
  upcoming:   { label: '예정 대상',     style: 'text-blue-700  bg-blue-50  border-blue-200'  },
};

type Props = {
  item: ModalPolicy;
  onClose: () => void;
};

export default function PolicyModal({ item, onClose }: Props) {
  const [aiLoaded, setAiLoaded] = useState(false);

  /* AI 요약 로딩 시뮬레이션 */
  useEffect(() => {
    setAiLoaded(false);
    const t = setTimeout(() => setAiLoaded(true), 1600);
    return () => clearTimeout(t);
  }, [item.policy.policy_id]);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* ── 모달 헤더 ── */}
        <div className="flex items-start justify-between gap-3 p-6 pb-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <span className={`inline-block text-xs font-semibold border rounded-full px-2.5 py-0.5 mb-2 ${badge.style}`}>
              {badge.label}
            </span>
            <h2 className="text-base font-bold text-gray-900 leading-snug">
              {item.policy.title}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{item.policy.benefit}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="flex-shrink-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors p-1.5 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* ── AI 요약 ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">AI 요약</span>
              {!aiLoaded && (
                <span className="text-xs text-primary-600 animate-pulse">분석 중…</span>
              )}
            </div>
            {aiLoaded ? (
              <p className="text-sm text-gray-700 leading-relaxed">
                {getMockSummary(item.policy.title, item.policy.benefit)}
              </p>
            ) : (
              <div className="space-y-2.5">
                <div className="h-3.5 bg-gray-200 rounded-full animate-pulse w-full" />
                <div className="h-3.5 bg-gray-200 rounded-full animate-pulse w-11/12" />
                <div className="h-3.5 bg-gray-200 rounded-full animate-pulse w-4/5" />
                <div className="h-3.5 bg-gray-200 rounded-full animate-pulse w-2/3" />
              </div>
            )}
          </div>

          {/* ── 신청 필수 서류 체크리스트 ── */}
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
              신청 필수 서류
            </p>
            <ul className="space-y-3">
              {item.checklistItems.map((doc, i) => (
                <CheckItem key={i} label={doc} />
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
