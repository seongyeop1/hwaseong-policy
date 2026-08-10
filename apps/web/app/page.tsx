'use client';

import { useState } from 'react';
import mockData from '@/data/mockData.json';
import ProfileForm, { type Profile } from '@/app/components/ProfileForm';
import SimulatorPanel from '@/app/components/SimulatorPanel';
import PolicyModal, { type ModalPolicy } from '@/app/components/PolicyModal';

/* ─── Types ─────────────────────────────────────────────── */
type Policy = {
  policy_id: string;
  title: string;
  benefit: string;
  is_new?: boolean;
  conditions?: { age?: { min: number; max: number } };
};

type EligibleItem = {
  for_member: string;
  policy: Policy;
  reasons: string[];
};

type DocsNeededItem = {
  for_member: string;
  policy: Policy;
  reasons: string[];
  verify: { label: string }[];
};

type UpcomingItem = {
  for_member: string;
  policy: Policy;
  waiting_for: string;
  d_day: number;
  expected_date: string;
};

const DEFAULT_DOCS = ['신분증 사본', '주민등록등본 (최근 3개월)', '통장 사본'];

/* ─── 시뮬레이션용 추가 mock 데이터 ─────────────────────── */
const SIM_ELIGIBLE_TIMESHIFT: EligibleItem = {
  for_member: '본인',
  policy: { policy_id: 'hs-2026-0042', title: '화성시 청년 월세 지원', benefit: '월 최대 20만 원' },
  reasons: ['나이 요건 충족', '거주 6개월 요건 충족'],
};

const SIM_DOCS_CHILD: DocsNeededItem = {
  for_member: '본인',
  policy: { policy_id: 'hs-2026-0155', title: '화성시 다자녀 양육비 지원', benefit: '자녀 1인당 월 10만 원' },
  reasons: ['자녀 요건 충족'],
  verify: [
    { label: '가족관계증명서 (다자녀 증빙)' },
    { label: '소득 기준 확인 서류' },
  ],
};

type Overrides = { timeShift: boolean; addChild: boolean };

function computeResults(overrides: Overrides) {
  const base = mockData.results;
  const eligible: EligibleItem[]    = [...base.eligible];
  const docs_needed: DocsNeededItem[] = [...base.docs_needed];
  let   upcoming: UpcomingItem[]    = [...base.upcoming];

  if (overrides.timeShift) {
    // 거주 6개월 충족 → 월세 지원이 upcoming → eligible 로 이동
    eligible.push(SIM_ELIGIBLE_TIMESHIFT);
    upcoming = upcoming.filter((u) => u.policy.policy_id !== 'hs-2026-0042');
  }
  if (overrides.addChild) {
    // 자녀 1명 추가 → 다자녀 정책 신규 등장
    docs_needed.push(SIM_DOCS_CHILD);
  }
  return { eligible, docs_needed, upcoming };
}

/* ─── Badge helpers ──────────────────────────────────────── */
function MemberBadge({ member }: { member: string }) {
  return (
    <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-2 py-0.5 whitespace-nowrap">
      {member} 기준
    </span>
  );
}

function NewBadge() {
  return (
    <span className="text-xs font-black text-white bg-red-500 rounded-full px-2 py-0.5 tracking-wide">
      NEW
    </span>
  );
}

/* ─── Dashboard sub-components ──────────────────────────── */
function SectionHeader({ label, color, count }: { label: string; color: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className={`w-2 h-6 rounded-full ${color}`} />
      <h2 className="text-lg font-bold text-gray-800">{label}</h2>
      <span className="ml-auto text-sm font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-0.5">
        {count}건
      </span>
    </div>
  );
}

function EligibleCard({ item, onClick }: { item: EligibleItem; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-white border border-green-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
            확정 대상
          </span>
          <MemberBadge member={item.for_member} />
          {item.policy.is_new && <NewBadge />}
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{item.policy.policy_id}</span>
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">{item.policy.title}</h3>
      <p className="text-sm text-green-600 font-medium mb-3">{item.policy.benefit}</p>
      <div className="flex flex-wrap gap-2">
        {item.reasons.map((r, i) => (
          <span key={i} className="text-xs text-gray-600 bg-gray-100 rounded-full px-2.5 py-0.5">
            ✓ {r}
          </span>
        ))}
      </div>
    </div>
  );
}

function DocsNeededCard({ item, onClick }: { item: DocsNeededItem; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-white border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
            서류 확인 필요
          </span>
          <MemberBadge member={item.for_member} />
          {item.policy.is_new && <NewBadge />}
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{item.policy.policy_id}</span>
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">{item.policy.title}</h3>
      <p className="text-sm text-amber-600 font-medium mb-3">{item.policy.benefit}</p>
      <div className="border-t border-amber-100 pt-3 mt-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">확인이 필요한 조건</p>
        <ul className="space-y-1.5">
          {item.verify.map((v, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              {v.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function UpcomingCard({ item, onClick }: { item: UpcomingItem; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-white border border-blue-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
            예정 대상
          </span>
          <MemberBadge member={item.for_member} />
          {item.policy.is_new && <NewBadge />}
        </div>
        <span className="text-sm font-bold text-blue-600 bg-blue-50 rounded-full px-3 py-0.5 flex-shrink-0">
          D-{item.d_day}
        </span>
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">{item.policy.title}</h3>
      <p className="text-sm text-blue-600 font-medium mb-3">{item.policy.benefit}</p>
      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
        <span>⏳</span>
        <span className="flex-1 min-w-0">{item.waiting_for}</span>
        <span className="font-medium text-gray-700 flex-shrink-0">{item.expected_date}</span>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function Home() {
  const [analyzed, setAnalyzed] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [modalItem, setModalItem] = useState<ModalPolicy | null>(null);
  const [overrides, setOverrides] = useState<Overrides>({ timeShift: false, addChild: false });
  const [isSimulating, setIsSimulating] = useState(false);

  const { eligible, docs_needed, upcoming } = computeResults(overrides);
  const simActive  = overrides.timeShift || overrides.addChild;
  const displayAsOf = overrides.timeShift ? '2027-02-08' : mockData.as_of;

  function runSimulation(next: Overrides) {
    setIsSimulating(true);
    setOverrides(next);
    setTimeout(() => setIsSimulating(false), 900);
  }

  function handleAnalyze(p: Profile) {
    setProfile(p);
    setAnalyzed(true);
    // 결과 섹션으로 부드럽게 스크롤
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }

  return (
    <div className="bg-gray-50 min-h-full">
      {/* 기준일 서브헤더 */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-0">
        <p className="text-xs text-gray-400">
          화성시 · 기준일 {displayAsOf}
          {simActive && <span className="ml-1 text-orange-500">(시뮬레이션)</span>}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10">

        {/* ── View 1: 프로필 입력 폼 ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold">
              1
            </span>
            <h2 className="text-base font-bold text-gray-700">내 정보를 입력해 주세요</h2>
          </div>
          <ProfileForm onAnalyze={handleAnalyze} />
        </div>

        {/* ── What-if 시뮬레이터 ── */}
        <SimulatorPanel
          timeShift={overrides.timeShift}
          addChild={overrides.addChild}
          isLoading={isSimulating}
          onTimeShiftToggle={() => runSimulation({ ...overrides, timeShift: !overrides.timeShift })}
          onAddChildToggle={() => runSimulation({ ...overrides, addChild: !overrides.addChild })}
        />

        {/* ── 섹션 구분선 ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">분석 결과</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* ── View 2: 정책 대시보드 ── */}
        <div id="results" className="relative">
          {/* 시뮬레이션 로딩 오버레이 */}
          {isSimulating && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-3xl">
              <div className="w-9 h-9 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold">
              2
            </span>
            <h2 className="text-base font-bold text-gray-700">
              {analyzed && profile
                ? `${profile.age ? profile.age + '세' : ''} ${profile.residence || ''} 맞춤 정책 결과`.trim()
                : '맞춤 정책 결과'}
            </h2>
            {simActive && (
              <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-0.5">
                시뮬레이션
              </span>
            )}
          </div>

          {/* 요약 숫자 바 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
            {[
              { label: '확정 대상', count: eligible.length, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
              { label: '서류 확인', count: docs_needed.length, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
              { label: '예정 대상', count: upcoming.length, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl border px-2 py-2.5 sm:px-4 sm:py-3 text-center ${s.bg}`}>
                <p className={`text-xl sm:text-2xl font-extrabold ${s.color}`}>{s.count}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* 확정 대상 */}
          <section className="mb-8">
            <SectionHeader label="확정 대상" color="bg-green-400" count={eligible.length} />
            <div className="grid gap-4 sm:grid-cols-2">
              {eligible.map((item) => (
                <EligibleCard
                  key={item.policy.policy_id}
                  item={item}
                  onClick={() => setModalItem({ type: 'eligible', policy: item.policy, checklistItems: DEFAULT_DOCS })}
                />
              ))}
            </div>
          </section>

          {/* 서류 확인 필요 */}
          <section className="mb-8">
            <SectionHeader label="서류 확인 필요" color="bg-amber-400" count={docs_needed.length} />
            <div className="grid gap-4 sm:grid-cols-2">
              {docs_needed.map((item) => (
                <DocsNeededCard
                  key={item.policy.policy_id}
                  item={item}
                  onClick={() => setModalItem({ type: 'docs_needed', policy: item.policy, checklistItems: [...item.verify.map((v) => v.label), ...DEFAULT_DOCS] })}
                />
              ))}
            </div>
          </section>

          {/* 예정 대상 */}
          <section className="mb-8">
            <SectionHeader label="예정 대상 (D-day)" color="bg-blue-400" count={upcoming.length} />
            <div className="grid gap-4 sm:grid-cols-2">
              {upcoming.map((item) => (
                <UpcomingCard
                  key={item.policy.policy_id}
                  item={item}
                  onClick={() => setModalItem({ type: 'upcoming', policy: item.policy, checklistItems: [item.waiting_for, ...DEFAULT_DOCS] })}
                />
              ))}
            </div>
          </section>
        </div>

      </div>

      {/* ── View 3: 정책 상세 모달 ── */}
      {modalItem && (
        <PolicyModal item={modalItem} onClose={() => setModalItem(null)} />
      )}
    </div>
  );
}
