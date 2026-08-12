'use client';

type Props = {
  timeShift: boolean;
  addChild: boolean;
  isLoading: boolean;
  onTimeShiftToggle: () => void;
  onAddChildToggle: () => void;
};

export default function SimulatorPanel({
  timeShift,
  addChild,
  isLoading,
  onTimeShiftToggle,
  onAddChildToggle,
}: Props) {
  const anyActive = timeShift || addChild;

  return (
    <section className="bg-white rounded-2xl border border-dashed border-gray-300 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
          What-if 시뮬레이터
        </span>
        {anyActive && (
          <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">
            적용 중
          </span>
        )}
        {isLoading && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-primary-600">
            <span className="inline-block w-3 h-3 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            계산 중…
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* 시간 이동 토글 버튼 */}
        <button
          type="button"
          onClick={onTimeShiftToggle}
          disabled={isLoading}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors disabled:opacity-50 ${
            timeShift
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          <span>⏩</span>
          6개월 뒤로 시간 이동
          {timeShift && <span className="text-xs opacity-75">(적용됨)</span>}
        </button>

        {/* 자녀 추가 토글 스위치 */}
        <div
          className={`flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl border flex-1 transition-colors ${
            addChild ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-300'
          }`}
        >
          <span className="text-sm font-medium text-gray-700">자녀 1명 추가</span>
          <button
            type="button"
            role="switch"
            aria-checked={addChild}
            onClick={onAddChildToggle}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
              addChild ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                addChild ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
