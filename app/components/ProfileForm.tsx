'use client';

import { useState } from 'react';

export type Profile = {
  birth_date: string;
  move_in_date: string;
  region: string;
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

const HOUSEHOLD_OPTIONS = [
  { id: '1인', label: '1인 가구' },
  { id: '부부', label: '부부' },
  { id: '한부모', label: '한부모 가구' },
  { id: '다자녀', label: '다자녀 가구' },
  { id: '조손', label: '조손 가구' },
  { id: '기타', label: '기타' },
];

const LIFECYCLE_OPTIONS = [
  { id: '청년', label: '청년' },
  { id: '신혼부부', label: '신혼부부' },
  { id: '임신출산', label: '임신·출산' },
  { id: '영유아', label: '영유아' },
  { id: '다자녀', label: '다자녀' },
  { id: '중장년', label: '중장년' },
  { id: '어르신', label: '어르신' },
  { id: '장애인', label: '장애인' },
];

type Props = {
  onAnalyze?: (profile: Profile) => void;
};

export default function ProfileForm({ onAnalyze }: Props) {
  const [profile, setProfile] = useState<Profile>({
    birth_date: '',
    move_in_date: '',
    region: '',
    household_type: '',
    lifecycle: [],
  });

  function toggleLifecycle(id: string) {
    setProfile((prev) => ({
      ...prev,
      lifecycle: prev.lifecycle.includes(id)
        ? prev.lifecycle.filter((l: string) => l !== id)
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
        {/* 나이 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            나이
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={120}
              placeholder="예: 28"
              value={profile.birth_date}
              onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
              className="w-28 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-500">세</span>
          </div>
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
