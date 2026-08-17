'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import mockData from '@/data/mockData.json';
import ProfileForm, { type Profile } from '@/app/components/ProfileForm';
import SimulatorPanel from '@/app/components/SimulatorPanel';
import PolicyModal, { type ModalPolicy } from '@/app/components/PolicyModal';
import { evaluate, isApiUnavailable, type EvaluateResponse } from '@/lib/api';

/* ─── Types ─────────────────────────────────────────────── */
type VerifyItem     = { key?: string | null; label: string; hint?: string };
type Policy = {
  policy_id: string;
  title: string;
  benefit: string;
  is_new?: boolean;
  conditions?: { age?: { min: number; max: number } };
  apply_channel?: string;
  source_url?: string;
  required_docs?: string[];
};
type EligibleItem   = { for_member: string; policy: Policy; reasons: string[]; ai_summary?: string | null };
type DocsNeededItem = { for_member: string; policy: Policy; reasons: string[]; verify: VerifyItem[]; ai_summary?: string | null };
type UpcomingItem   = { for_member: string; policy: Policy; waiting_for: string; d_day: number; expected_date: string; verify?: VerifyItem[]; ai_summary?: string | null };
type Overrides      = { timeShift: boolean; addChild: boolean };

const DEFAULT_DOCS = ['신분증 사본', '주민등록등본 (최근 3개월)', '통장 사본'];

/* ─── What-if: 실판정 재호출 ───────────────────────────────
   토글은 화면 데이터를 손대지 않는다 — 입력을 바꿔 /evaluate 를
   다시 부르고, 규칙 엔진의 응답으로 화면을 통째로 갱신한다.
   계약(v1.1.4) 역할 분담: 시간 이동 = 최상위 as_of · '누구인가' = overrides */

// 촬영용 고정 기준일 (?as_of=YYYY-MM-DD). 없으면 미전송 → 서버가 오늘로 판정 (#65)
function pinnedAsOf(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const q = new URLSearchParams(window.location.search).get('as_of');
  return q && /^\d{4}-\d{2}-\d{2}$/.test(q) ? q : undefined;
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addMonthsIso(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1 + months, d); // 말일 초과분은 Date 가 자동 이월
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

function simRequest(p: Profile, o: Overrides): { asOf?: string; overrides?: Record<string, unknown> } {
  const base = pinnedAsOf() ?? todayIso();
  const asOf = o.timeShift ? addMonthsIso(base, 6) : pinnedAsOf();
  let overrides: Record<string, unknown> | undefined;
  if (o.addChild) {
    overrides = {
      // 얕은 병합 = 키 통째 교체 → members 는 본인 포함 전체를 보낸다
      members: [
        { relation: '본인', birth_date: p.birth_date },
        { relation: '자녀', birth_date: base }, // 기준일 출생 신생아 가정
      ],
      household_type:
        p.household_type === '1인가구' || p.household_type === '신혼부부'
          ? '유자녀가구'
          : p.household_type,
      lifecycle: Array.from(new Set([...p.lifecycle, '출산·육아'])),
    };
  }
  return { asOf, overrides };
}

function computeResults(apiData: EvaluateResponse | null) {
  // API 응답을 그대로 쓴다 (What-if 결과도 서버 재판정으로 이 경로를 탄다). 없으면 목업 fallback
  const base = apiData ? apiData.results : (mockData.results as unknown as EvaluateResponse['results']);
  return {
    eligible:    base.eligible as EligibleItem[],
    docs_needed: base.docs_needed as DocsNeededItem[],
    upcoming:    base.upcoming as UpcomingItem[],
  };
}

/* ─── Spring presets ─────────────────────────────────────── */
const cardSpring  = { type: 'spring', bounce: 0, duration: 0.3  } as const;
const tapSpring   = { type: 'spring', bounce: 0, duration: 0.2  } as const;
const fadeSpring  = { type: 'spring', bounce: 0.08, duration: 0.55 } as const;

/* ─── Card components ────────────────────────────────────── */
function SectionHeader({ label, color, count }: { label: string; color: string; count: number }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
      <h2 className="text-sm font-bold text-slate-700 [letter-spacing:-0.01em]">{label}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-slate-200/50 to-transparent" />
      <span className="text-[0.6875rem] font-bold text-slate-500 bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-full tracking-wide">
        {count}건
      </span>
    </div>
  );
}

function EligibleCard({ item, onClick }: { item: EligibleItem; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(59,130,246,0.04)' }}
      transition={{ duration: 0.12 }}
      className="group flex items-center gap-4 px-5 py-4 cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      <div className="w-0.5 h-10 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug truncate">{item.policy.title}</h3>
          {item.policy.is_new && (
            <span className="flex-shrink-0 text-[0.6rem] font-bold text-white bg-blue-500 rounded-full px-1.5 py-0.5 leading-none">NEW</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-2 truncate">{item.policy.benefit}</p>
        <div className="flex flex-wrap gap-1.5">
          {item.reasons.map((r, i) => (
            <span key={i} className="text-[0.6rem] text-blue-600 bg-blue-50 rounded-full px-2 py-0.5 font-medium">
              {r}
            </span>
          ))}
        </div>
      </div>
      <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0 transition-colors duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </motion.div>
  );
}

function DocsNeededCard({ item, onClick }: { item: DocsNeededItem; onClick: () => void }) {
  const [docsOpen, setDocsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <motion.div
        onClick={onClick}
        whileHover={{ backgroundColor: 'rgba(59,130,246,0.04)' }}
        transition={{ duration: 0.12 }}
        className="group flex items-center gap-4 px-5 py-4 cursor-pointer"
      >
        <div className="w-0.5 h-10 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="text-sm font-semibold text-gray-900 leading-snug truncate">{item.policy.title}</h3>
            {item.policy.is_new && (
              <span className="flex-shrink-0 text-[0.6rem] font-bold text-white bg-blue-500 rounded-full px-1.5 py-0.5 leading-none">NEW</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2 truncate">{item.policy.benefit}</p>
          <button
            onClick={(e) => { e.stopPropagation(); setDocsOpen((v) => !v); }}
            className="flex items-center gap-1.5 text-[0.6875rem] font-semibold text-blue-500 hover:text-blue-700 transition-colors"
          >
            확인 필요 서류
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${docsOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0 transition-colors duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </motion.div>
      {docsOpen && (
        <div className="px-[3.25rem] pb-4">
          <ul className="space-y-1.5">
            {item.verify.map((v, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-1 h-1 rounded-full bg-blue-300 flex-shrink-0" />
                {v.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function UpcomingCard({ item, onClick }: { item: UpcomingItem; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(59,130,246,0.04)' }}
      transition={{ duration: 0.12 }}
      className="group flex items-center gap-4 px-5 py-4 cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      <div className="w-0.5 h-10 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug truncate">{item.policy.title}</h3>
          {item.policy.is_new && (
            <span className="flex-shrink-0 text-[0.6rem] font-bold text-white bg-blue-500 rounded-full px-1.5 py-0.5 leading-none">NEW</span>
          )}
          <span className="flex-shrink-0 text-[0.6rem] font-bold text-blue-600 bg-blue-100 rounded-full px-2 py-0.5">D-{item.d_day}</span>
        </div>
        <p className="text-xs text-gray-500 mb-1.5 truncate">{item.policy.benefit}</p>
        <div className="flex gap-2 text-xs">
          <span className="text-gray-400">대기</span>
          <span className="text-gray-600 truncate">{item.waiting_for}</span>
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-[0.6875rem] font-semibold text-gray-500">{item.expected_date}</p>
        <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 mt-1 ml-auto transition-colors duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function AnalysisPage() {
  const [analyzed,  setAnalyzed]  = useState(false);
  const [profile,   setProfile]   = useState<Profile | null>(null);
  const [modalItem, setModalItem] = useState<ModalPolicy | null>(null);
  const [overrides, setOverrides] = useState<Overrides>({ timeShift: false, addChild: false });
  const [apiData,   setApiData]   = useState<EvaluateResponse | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [apiError,  setApiError]  = useState<string | null>(null);

  const { eligible, docs_needed, upcoming } = computeResults(apiData);
  const simActive   = overrides.timeShift || overrides.addChild;
  const displayAsOf = apiData?.as_of ?? mockData.as_of; // 항상 서버가 실제 판정한 기준일

  async function handleAnalyze(p: Profile) {
    setProfile(p);
    setApiError(null);
    setLoading(true);

    if (!isApiUnavailable()) {
      try {
        const data = await evaluate(p, pinnedAsOf());
        setApiData(data);
      } catch (err) {
        setApiError(err instanceof Error ? err.message : '분석 중 오류가 발생했습니다');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setAnalyzed(true);
    setTimeout(() => {
      const el = document.getElementById('results-anchor');
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 320);
  }

  // What-if 토글 = 실판정 재호출. 실패하면 토글을 원복해 화면과 상태가 어긋나지 않게 한다
  async function applySim(next: Overrides) {
    if (!profile || simLoading) return;
    if (isApiUnavailable()) return; // 목업 모드에선 시뮬레이션 비활성 (실판정만 신뢰)
    const prev = overrides;
    setOverrides(next);
    setSimLoading(true);
    try {
      const { asOf, overrides: ov } = simRequest(profile, next);
      setApiData(await evaluate(profile, asOf, ov));
      setApiError(null);
    } catch (err) {
      setOverrides(prev);
      setApiError(err instanceof Error ? err.message : '시뮬레이션 중 오류가 발생했습니다');
    } finally {
      setSimLoading(false);
    }
  }

  function handleReset() {
    setAnalyzed(false);
    setApiData(null);
    setApiError(null);
    setOverrides({ timeShift: false, addChild: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="bg-[#E1EEF6] min-h-screen">

      {/* ── 폼 또는 프로필 칩 ── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        <AnimatePresence mode="wait">
          {!analyzed ? (
            <motion.div
              key="form"
              initial={false}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="py-10 grid grid-cols-1 lg:grid-cols-[2fr_2.4fr] gap-10 lg:gap-20 items-start"
            >
              {/* 왼쪽: 제목·설명 */}
              <div className="lg:pt-16 lg:pl-16">
                <p className="text-[0.6rem] font-bold tracking-[0.22em] text-sky-700/80 uppercase mb-4">
                  화성시 · 기준일 {displayAsOf}
                  {simActive && <span className="ml-2 text-amber-400">(시뮬레이션)</span>}
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 leading-tight mb-4" style={{ letterSpacing: '-0.04em' }}>
                  내 정보를<br />입력해 주세요
                </h1>
                <p className="text-slate-500 text-base leading-relaxed mb-8">
                  4가지 정보만 입력하면<br />맞춤 정책을 바로 찾아드립니다.
                </p>
                <ul className="space-y-2.5">
                  {[
                    '화성시 정책 전수 분석',
                    '마감·자격 요건 자동 판정',
                    'D-day 예고로 놓치지 않게',
                  ].map((txt) => (
                    <li key={txt} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <span className="w-4 h-4 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {txt}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 오른쪽: 폼 카드 */}
              <div className="lg:mt-16">
                <ProfileForm onAnalyze={handleAnalyze} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.08 }}
              className="py-5 flex items-center gap-3 flex-wrap"
            >
              <div className="inline-flex items-center gap-2 flex-wrap bg-sky-100/60 border border-sky-200/60 rounded-2xl px-4 py-2.5 backdrop-blur-sm">
                {profile?.birth_date && (
                  <span className="text-sm font-semibold text-slate-800">{profile.birth_date}</span>
                )}
                {profile?.region && (
                  <><span className="text-slate-300 text-xs">·</span>
                  <span className="text-sm text-slate-600">{profile.region}</span></>
                )}
                {profile?.household_type && (
                  <><span className="text-slate-300 text-xs">·</span>
                  <span className="text-sm text-slate-600">{profile.household_type}</span></>
                )}
                {profile && profile.lifecycle.length > 0 && (
                  <><span className="text-slate-300 text-xs">·</span>
                  <span className="text-xs text-slate-500">{profile.lifecycle.join(', ')}</span></>
                )}
              </div>
              <motion.button
                onClick={handleReset}
                whileTap={{ scale: 0.96 }}
                transition={tapSpring}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-sky-200 hover:border-sky-300 bg-sky-100/40 hover:bg-sky-100/80 rounded-xl px-3 py-2 transition-all"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                다시 분석
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── API 로딩 / 에러 ── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-10"
          >
            <div className="w-8 h-8 border-2 border-sky-300/40 border-t-sky-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-600">맞춤 정책을 분석하는 중...</p>
          </motion.div>
        )}
        {apiError && !loading && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-2 mb-4 rounded-2xl bg-red-500/10 border border-red-400/20 px-5 py-4"
          >
            <p className="text-sm font-semibold text-red-300 mb-1">연결 오류</p>
            <p className="text-xs text-red-300/70">{apiError}</p>
            <p className="text-xs text-red-300/50 mt-2">목업 데이터로 대신 표시합니다.</p>
            <button
              onClick={() => { setApiError(null); setAnalyzed(true); }}
              className="mt-3 text-xs text-red-300 underline underline-offset-2"
            >
              목업으로 계속 보기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────
          BLOCK 2: 다크 대시보드 — 분석 클릭 전까지 DOM에 없음
      ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {analyzed && (
          <motion.div
            key="results-block"
            id="results-anchor"
            initial={{ opacity: 0, y: 56 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={fadeSpring}
            className="bg-white rounded-t-[2.5rem] shadow-[0_-12px_40px_rgba(14,116,144,0.08)] relative overflow-hidden"
            style={{ minHeight: 'calc(100vh - 180px)' }}
          >
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-20 space-y-8">

              {/* What-if 시뮬레이터 */}
              <SimulatorPanel
                timeShift={overrides.timeShift}
                addChild={overrides.addChild}
                isLoading={simLoading}
                onTimeShiftToggle={() => applySim({ ...overrides, timeShift: !overrides.timeShift })}
                onAddChildToggle={() => applySim({ ...overrides, addChild: !overrides.addChild })}
              />

              {/* 결과 헤더 */}
              <div>
                <p className="text-[0.5875rem] font-bold tracking-[0.22em] text-gray-400 uppercase mb-2">
                  분석 결과
                </p>
                <h2 className="text-2xl font-bold text-gray-900 [letter-spacing:-0.03em] flex items-baseline gap-2 flex-wrap">
                  {profile ? `${profile.region || ''}`.trim() : ''} 맞춤 정책
                  {simActive && (
                    <span className="text-sm font-medium text-blue-500">(시뮬레이션 적용 중)</span>
                  )}
                </h2>
              </div>

              {/* 요약 숫자 바 */}
              <div className="flex rounded-2xl overflow-hidden ring-1 ring-gray-100 bg-white">
                {[
                  { label: '자격 충족', count: eligible.length,    bar: 'bg-gradient-to-r from-blue-600 to-blue-500'   },
                  { label: '서류 확인', count: docs_needed.length, bar: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
                  { label: '예정 대상', count: upcoming.length,    bar: 'bg-gradient-to-r from-blue-400 to-blue-600'   },
                ].map((s, i) => (
                  <div key={s.label} className={`flex-1 relative overflow-hidden px-4 py-5 text-center ${i < 2 ? 'border-r border-gray-100' : ''}`}>
                    <div className={`absolute top-0 inset-x-0 h-[2px] ${s.bar}`} />
                    <p className="text-3xl sm:text-4xl font-bold [letter-spacing:-0.04em] text-blue-600">
                      {s.count}
                    </p>
                    <p className="text-[0.625rem] text-gray-400 mt-1.5 font-semibold uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* ── 빈 결과 상태 ── */}
              {eligible.length === 0 && docs_needed.length === 0 && upcoming.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col items-center text-center py-12 px-6"
                >
                  {/* 아이콘 */}
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
                    <svg className="w-8 h-8 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-gray-700 mb-2">
                    현재 해당하는 정책이 없습니다
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-[280px] mb-1">
                    입력하신 조건에 맞는 화성시 정책을 찾지 못했습니다.
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-[280px] mb-8">
                    생애주기나 가구 유형을 추가로 선택하면<br />더 많은 정책을 확인할 수 있습니다.
                  </p>
                  <motion.button
                    onClick={handleReset}
                    whileTap={{ scale: 0.97 }}
                    transition={tapSpring}
                    className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-[0_4px_20px_rgba(14,165,233,0.25)]"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    다시 분석하기
                  </motion.button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {/* 확정 대상 */}
                  {eligible.length > 0 && (
                    <section className="rounded-2xl ring-1 ring-blue-100 overflow-hidden bg-white">
                      <div className="flex items-center gap-3 px-5 py-3.5 bg-blue-50 border-b border-blue-100">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        <span className="text-sm font-bold text-gray-800">자격 충족</span>
                        <span className="ml-auto text-[0.625rem] font-bold text-blue-600 bg-white border border-blue-200 px-2.5 py-0.5 rounded-full tracking-wide">{eligible.length}건</span>
                      </div>
                      <div>
                        {eligible.map((item) => (
                          <EligibleCard
                            key={item.policy.policy_id}
                            item={item}
                            onClick={() => setModalItem({
                              type: 'eligible',
                              policy: item.policy,
                              checklistItems: item.policy.required_docs?.length ? item.policy.required_docs : DEFAULT_DOCS,
                              ai_summary: item.ai_summary,
                            })}
                          />
                        ))}
                      </div>
                      <div className="px-5 pb-4 pt-2 border-t border-gray-100">
                        <p className="text-[0.625rem] text-gray-400 leading-relaxed">
                          * 신청 자격을 충족합니다. 최종 선정은 심사 결과에 따릅니다.
                        </p>
                      </div>
                    </section>
                  )}

                  {/* 서류 확인 필요 */}
                  {docs_needed.length > 0 && (
                    <section className="rounded-2xl ring-1 ring-blue-100 overflow-hidden bg-white">
                      <div className="flex items-center gap-3 px-5 py-3.5 bg-blue-50 border-b border-blue-100">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-bold text-gray-800">서류 확인 필요</span>
                        <span className="ml-auto text-[0.625rem] font-bold text-blue-600 bg-white border border-blue-200 px-2.5 py-0.5 rounded-full tracking-wide">{docs_needed.length}건</span>
                      </div>
                      <div>
                        {docs_needed.map((item) => (
                          <DocsNeededCard
                            key={item.policy.policy_id}
                            item={item}
                            onClick={() => setModalItem({
                              type: 'docs_needed',
                              policy: item.policy,
                              checklistItems: [
                                ...item.verify.map((v) => v.label),
                                ...(item.policy.required_docs?.length ? item.policy.required_docs : DEFAULT_DOCS),
                              ],
                              ai_summary: item.ai_summary,
                            })}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 예정 대상 */}
                  {upcoming.length > 0 && (
                    <section className="rounded-2xl ring-1 ring-blue-100 overflow-hidden bg-white">
                      <div className="flex items-center gap-3 px-5 py-3.5 bg-blue-50 border-b border-blue-100">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-sm font-bold text-gray-800">예정 대상 (D-day)</span>
                        <span className="ml-auto text-[0.625rem] font-bold text-blue-600 bg-white border border-blue-200 px-2.5 py-0.5 rounded-full tracking-wide">{upcoming.length}건</span>
                      </div>
                      <div>
                        {upcoming.map((item) => (
                          <UpcomingCard
                            key={item.policy.policy_id}
                            item={item}
                            onClick={() => setModalItem({ type: 'upcoming', policy: item.policy, checklistItems: [item.waiting_for, ...DEFAULT_DOCS], ai_summary: item.ai_summary })}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 모달 */}
      <AnimatePresence>
        {modalItem && (
          <PolicyModal
            key={modalItem.policy.policy_id}
            item={modalItem}
            onClose={() => setModalItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
