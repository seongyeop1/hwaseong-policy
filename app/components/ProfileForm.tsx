'use client';

import { useState } from 'react';

// 필드 이름·값은 API 계약(packages/schema/api-contract.md)에 맞춘다.
// 이 객체를 그대로 POST /evaluate 의 body 로 보낼 수 있다 (as_of 는 선택).
export type Profile = {
  birth_date: string;      // YYYY-MM-DD — 만 나이 경계 판정에 쓰이므로 나이(세)가 아니라 생년월일이다
  region: string;
  move_in_date: string;    // YYYY-MM-DD — D-day 계산의 필수 입력 (계약서 명시)
  household_type: string;
  lifecycle: string[];
};

const RESIDENCE_OPTIONS = [
  '화성시 전체',
  '동탄1·2동',
  '동탄3·4동',
  '동탄5·6동',
  '동탄7·8동',
  '봉담읍',
  '향남읍',
  '남양읍',
  '우정읍',
  '병점1동',
  '병점2동',
  '진안동',
  '반월동',
  '기배동',
  '화산동',
  '기타',
];

// ⚠️ id 는 API 로 그대로 나가므로 스키마 enum 과 **정확히** 같아야 한다.
// 값이 다르면 판정 전에 400 VALIDATION 으로 막힌다. label 은 자유롭게 바꿔도 된다.
// 정본: packages/schema/profile.schema.json · apps/api/app/enums.py

// household ∈ 1인가구 / 신혼부부 / 유자녀가구 / 한부모 / 다자녀 / 다문화
const HOUSEHOLD_OPTIONS = [
  { id: '1인가구', label: '1인 가구' },
  { id: '신혼부부', label: '신혼부부' },
  { id: '유자녀가구', label: '자녀가 있는 가구' },
  { id: '한부모', label: '한부모 가구' },
  { id: '다자녀', label: '다자녀 가구' },
  { id: '다문화', label: '다문화 가구' },
];

// lifecycle ∈ 전입 / 청년 / 결혼·신혼 / 출산·육아 / 노후  ← 5개 고정
// household 와 다른 축이다. '신혼부부'·'다자녀'는 household 값이라 여기 오지 않는다.
const LIFECYCLE_OPTIONS = [
  { id: '전입', label: '화성시 전입' },
  { id: '청년', label: '청년' },
  { id: '결혼·신혼', label: '결혼·신혼' },
  { id: '출산·육아', label: '임신·출산·육아' },
  { id: '노후', label: '노후(어르신)' },
];

type Props = {
  onAnalyze?: (profile: Profile) => void;
};

export default function ProfileForm({ onAnalyze }: Props) {
  const [profile, setProfile] = useState<Profile>({
    birth_date: '',
    region: '',
    move_in_date: '',
    household_type: '',
    lifecycle: [],
  });

  function toggleLifecycle(id: string) {
    setProfile((prev) => ({
      ...prev,
      lifecycle: prev.lifecycle.includes(id)
        ? prev.lifecycle.filter((l) => l !== id)
        : [...prev.lifecycle, id],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAnalyze?.(profile);
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">내 정보 입력</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          정확한 정보를 입력할수록 더 많은 정책을 찾아드립니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 생년월일 — 나이(세)가 아니라 생년월일이어야 만 나이 경계가 정확히 판정된다 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            생년월일
          </label>
          <input
            type="date"
            value={profile.birth_date}
            onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
            className="w-full sm:w-56 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* 화성시 전입일 — D-day(거주기간 요건) 계산의 필수 입력 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            화성시 전입일
          </label>
          <input
            type="date"
            value={profile.move_in_date}
            onChange={(e) => setProfile({ ...profile, move_in_date: e.target.value })}
            className="w-full sm:w-56 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            거주 기간 요건이 있는 정책의 신청 가능 시점을 계산하는 데 쓰입니다.
          </p>
        </div>

        {/* 거주지 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            거주지
          </label>
          <select
            value={profile.region}
            onChange={(e) => setProfile({ ...profile, region: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            <option value="">읍면동을 선택하세요</option>
            {RESIDENCE_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* 가구 유형 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            가구 유형
          </label>
          <div className="flex flex-wrap gap-2">
            {HOUSEHOLD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  setProfile({ ...profile, household_type: opt.id })
                }
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  profile.household_type === opt.id
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400 hover:text-primary-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 생애주기 — 다중 선택 탭 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            생애주기
          </label>
          <p className="text-xs text-gray-400 mb-2">해당하는 항목을 모두 선택하세요</p>
          <div className="flex flex-wrap gap-2">
            {LIFECYCLE_OPTIONS.map((opt) => {
              const selected = profile.lifecycle.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleLifecycle(opt.id)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selected
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400 hover:text-primary-700'
                  }`}
                >
                  {selected ? '✓ ' : ''}{opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 분석 버튼 */}
        <button
          type="submit"
          className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold py-3 rounded-xl transition-colors text-sm tracking-wide"
        >
          맞춤 정책 분석하기
        </button>
      </form>
    </section>
  );
}
