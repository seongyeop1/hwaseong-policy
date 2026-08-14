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
    <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[0.6rem] font-bold tracking-[0.2em] text-gray-400 uppercase">
          What-if 시뮬레이터
        </span>
        {anyActive && (
          <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
            적용 중
          </span>
        )}
        {isLoading && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-blue-500">
            <span className="inline-block w-3 h-3 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
            계산 중…
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={onTimeShiftToggle}
          disabled={isLoading}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 disabled:opacity-40 border ${
            timeShift
              ? 'bg-blue-50 text-blue-600 border-blue-200'
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900'
          }`}
        >
          <span>⏩</span>
          6개월 뒤로 시간 이동
          {timeShift && <span className="text-xs opacity-60 ml-auto">ON</span>}
        </button>

        <div
          className={`flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl border flex-1 transition-all duration-150 ${
            addChild
              ? 'bg-blue-50 border-blue-200'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <span className="text-sm font-medium text-gray-700">자녀 1명 추가</span>
          <button
            type="button"
            role="switch"
            aria-checked={addChild}
            onClick={onAddChildToggle}
            disabled={isLoading}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40 ${
              addChild ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                addChild ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
