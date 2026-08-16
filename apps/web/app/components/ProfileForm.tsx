'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// 필드 이름·값은 API 계약(packages/schema/api-contract.md)에 맞춘다.
// 이 객체를 그대로 POST /evaluate 의 body 로 보낼 수 있다 (as_of 는 선택).
export type Profile = {
  birth_date: string;    // YYYY-MM-DD — 만 나이 경계 판정에 쓰이므로 나이가 아닌 생년월일
  move_in_date: string;  // YYYY-MM-DD — D-day(거주 기간) 계산의 필수 입력
  region: string;
  household_type: string;
  lifecycle: string[];
};

const RESIDENCE_OPTIONS = [
  '화성시 전체', '동탄1·2동', '동탄3·4동', '동탄5·6동', '동탄7·8동',
  '봉담읍', '향남읍', '남양읍', '우정읍', '병점1동', '병점2동',
  '진안동', '반월동', '기배동', '화산동', '기타',
];

// ⚠️ id 는 API 로 그대로 나가므로 스키마 enum 과 정확히 같아야 한다.
// household ∈ 1인가구 / 신혼부부 / 유자녀가구 / 한부모 / 다자녀 / 다문화
const HOUSEHOLD_OPTIONS = [
  { id: '1인가구',   label: '1인 가구' },
  { id: '신혼부부',  label: '신혼부부' },
  { id: '유자녀가구', label: '자녀가 있는 가구' },
  { id: '한부모',    label: '한부모 가구' },
  { id: '다자녀',    label: '다자녀 가구' },
  { id: '다문화',    label: '다문화 가구' },
];

// lifecycle ∈ 전입 / 청년 / 결혼·신혼 / 출산·육아 / 노후  ← 5개 고정
// household 와 다른 축이다. '신혼부부'·'다자녀'는 household 값이라 여기 오지 않는다.
const LIFECYCLE_OPTIONS = [
  { id: '전입',    label: '화성시 전입' },
  { id: '청년',    label: '청년' },
  { id: '결혼·신혼', label: '결혼·신혼' },
  { id: '출산·육아', label: '임신·출산·육아' },
  { id: '노후',    label: '노후(어르신)' },
];

const STEPS = [
  { label: '기본 정보', title: '기본 정보를 알려주세요',   sub: '생년월일과 화성시 전입일이 필요합니다.' },
  { label: '거주지',    title: '어디 사세요?',             sub: '화성시 읍면동 단위로 선택해 주세요.' },
  { label: '가구',      title: '가구 유형을 알려주세요',    sub: '현재 가구 구성을 선택해 주세요.' },
  { label: '생애주기',  title: '생애주기를 선택해 주세요', sub: '해당 항목을 모두 고르세요. 없으면 건너뛰어도 됩니다.' },
];

const tapSpring   = { type: 'spring', bounce: 0, duration: 0.2 } as const;
const slideSpring = { type: 'spring', bounce: 0, duration: 0.32 } as const;

const variants = {
  enter:  (dir: number) => ({ x: dir > 0 ?  36 : -36, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir > 0 ? -36 :  36, opacity: 0 }),
};

type Props = { onAnalyze?: (profile: Profile) => void };

export default function ProfileForm({ onAnalyze }: Props) {
  const [step, setStep] = useState(0);
  const [dir,  setDir]  = useState(1);
  const [profile, setProfile] = useState<Profile>({
    birth_date: '', move_in_date: '', region: '', household_type: '', lifecycle: [],
  });

  function goNext() { setDir(1);  setStep((s) => s + 1); }
  function goPrev() { setDir(-1); setStep((s) => s - 1); }

  function toggleLifecycle(id: string) {
    setProfile((prev) => ({
      ...prev,
      lifecycle: prev.lifecycle.includes(id)
        ? prev.lifecycle.filter((l) => l !== id)
        : [...prev.lifecycle, id],
    }));
  }

  const canNext = [
    profile.birth_date !== '' && profile.move_in_date !== '',
    profile.region !== '',
    profile.household_type !== '',
    true,
  ][step];

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(6,11,40,0.7),0_0_0_1px_rgba(255,255,255,0.07)]">

      {/* ── 상단 진행 바 ── */}
      <div className="h-[2px] bg-zinc-100 relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-sky-500"
          initial={false}
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
        />
      </div>

      {/* ── 단계 인디케이터 ── */}
      <div className="px-6 pt-5 pb-0">
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <motion.div
                animate={{
                  backgroundColor:
                    i < step  ? '#0ea5e9' :
                    i === step ? '#09090b' :
                                 '#f4f4f5',
                  color: i <= step ? '#ffffff' : '#a1a1aa',
                }}
                transition={{ duration: 0.25 }}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
              >
                {i < step ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-1.5 bg-zinc-100" />
              )}
            </div>
          ))}
        </div>
        <p className="text-[0.5625rem] font-bold tracking-[0.18em] text-zinc-400 uppercase mt-3">
          {step + 1} / {STEPS.length} &nbsp;·&nbsp; {STEPS[step].label}
        </p>
      </div>

      {/* ── 슬라이딩 콘텐츠 ── */}
      <div className="px-6 pt-0 pb-5">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideSpring}
            className="min-h-[230px] flex flex-col justify-start pt-6"
          >

            {/* Step 0 — 생년월일 + 전입일 */}
            {step === 0 && (
              <div>
                <h3 className="text-[1.5rem] font-bold text-gray-900 [letter-spacing:-0.03em] mb-1">{STEPS[0].title}</h3>
                <p className="text-sm text-zinc-400 mb-6">{STEPS[0].sub}</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">생년월일</label>
                    <input
                      type="date"
                      value={profile.birth_date}
                      onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
                      className="w-full border-b-2 border-zinc-100 focus:border-sky-500 py-1.5 text-base font-medium text-gray-900 focus:outline-none bg-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">화성시 전입일</label>
                    <input
                      type="date"
                      value={profile.move_in_date}
                      onChange={(e) => setProfile({ ...profile, move_in_date: e.target.value })}
                      className="w-full border-b-2 border-zinc-100 focus:border-sky-500 py-1.5 text-base font-medium text-gray-900 focus:outline-none bg-transparent transition-colors"
                    />
                    <p className="text-[0.6rem] text-zinc-300 mt-1.5">거주 기간 요건이 있는 정책의 신청 가능 시점을 계산합니다</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1 — 거주지 */}
            {step === 1 && (
              <div>
                <h3 className="text-[1.625rem] font-bold text-gray-900 [letter-spacing:-0.03em] mb-1">{STEPS[1].title}</h3>
                <p className="text-sm text-zinc-400 mb-7">{STEPS[1].sub}</p>
                <div className="relative border-b-2 border-zinc-100 pb-1 focus-within:border-sky-500 transition-colors">
                  <select
                    value={profile.region}
                    onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                    className={`w-full bg-transparent text-base py-1.5 pr-8 focus:outline-none appearance-none cursor-pointer font-medium ${
                      profile.region === '' ? 'text-zinc-400' : 'text-gray-900'
                    }`}
                  >
                    <option value="">읍면동을 선택하세요</option>
                    {RESIDENCE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-0 bottom-3 text-zinc-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — 가구 유형 */}
            {step === 2 && (
              <div>
                <h3 className="text-[1.625rem] font-bold text-gray-900 [letter-spacing:-0.03em] mb-1">{STEPS[2].title}</h3>
                <p className="text-sm text-zinc-400 mb-5">{STEPS[2].sub}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {HOUSEHOLD_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, household_type: opt.id })}
                      whileTap={{ scale: 0.94 }}
                      transition={tapSpring}
                      className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                        profile.household_type === opt.id
                          ? 'bg-sky-600 text-white shadow-[0_4px_16px_rgba(14,165,233,0.3)]'
                          : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 — 생애주기 */}
            {step === 3 && (
              <div>
                <h3 className="text-[1.625rem] font-bold text-gray-900 [letter-spacing:-0.03em] mb-1">{STEPS[3].title}</h3>
                <p className="text-sm text-zinc-400 mb-5">{STEPS[3].sub}</p>
                <div className="flex flex-wrap gap-2">
                  {LIFECYCLE_OPTIONS.map((opt) => {
                    const selected = profile.lifecycle.includes(opt.id);
                    return (
                      <motion.button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleLifecycle(opt.id)}
                        whileTap={{ scale: 0.92 }}
                        transition={tapSpring}
                        className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                          selected
                            ? 'bg-sky-600 text-white shadow-[0_4px_12px_rgba(14,165,233,0.3)]'
                            : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                        }`}
                      >
                        {selected && <span className="inline-block mr-1 text-xs">✓</span>}
                        {opt.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ── 이전 / 다음 버튼 ── */}
        <div className="flex gap-2 mt-2">
          {step > 0 && (
            <motion.button
              type="button"
              onClick={goPrev}
              whileTap={{ scale: 0.97 }}
              transition={tapSpring}
              className="px-5 py-3 rounded-xl text-sm font-medium text-zinc-500 bg-zinc-100 hover:bg-zinc-200 transition-colors"
            >
              이전
            </motion.button>
          )}

          {step < STEPS.length - 1 ? (
            <motion.button
              type="button"
              onClick={goNext}
              disabled={!canNext}
              whileTap={canNext ? { scale: 0.97 } : {}}
              transition={tapSpring}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                canNext
                  ? 'bg-sky-600 text-white hover:bg-sky-700 shadow-[0_4px_20px_rgba(14,165,233,0.3)]'
                  : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
              }`}
            >
              다음 →
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={() => onAnalyze?.(profile)}
              whileTap={{ scale: 0.97 }}
              transition={tapSpring}
              className="flex-1 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold py-3 rounded-xl transition-colors shadow-[0_4px_20px_rgba(14,165,233,0.35)] text-sm"
            >
              맞춤 정책 분석하기 →
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
