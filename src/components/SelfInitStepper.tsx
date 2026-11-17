import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { SELF_STEPPER_STEPS, STEPPER_CODE_LINES } from '../data/curriculum';

export function SelfInitStepper() {
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentStep = SELF_STEPPER_STEPS[stepIdx];
  const totalSteps = SELF_STEPPER_STEPS.length;

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2400);
    return () => window.clearInterval(timer);
  }, [isPlaying, totalSteps]);

  const handlePrev = () => {
    setIsPlaying(false);
    setStepIdx((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setStepIdx((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIdx(0);
  };

  return (
    <section id="self-stepper" className="border-b border-slate-200 bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-amber-700">
              03. 程式碼執行剖析 · 解開初學者最大疑問
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              一步步看懂 __init__ 與 self 究竟指向誰
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              按下「下一步」或「自動播放」，觀察 Python 執行每一行程式碼時，<code className="font-mono text-amber-700 font-semibold">self</code> 如何自動切換指向不同的物件記憶體。
            </p>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start">
            <button
              type="button"
              onClick={handlePrev}
              disabled={stepIdx === 0}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
            >
              <SkipBack className="h-3.5 w-3.5" aria-hidden="true" />
              <span>上一步</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (stepIdx >= totalSteps - 1) setStepIdx(0);
                setIsPlaying((p) => !p);
              }}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 whitespace-nowrap"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>暫停播放</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>自動播放</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={stepIdx === totalSteps - 1}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
            >
              <span>下一步</span>
              <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>重設</span>
            </button>
          </div>
        </div>

        {/* Step Navigation Bar */}
        <div className="mt-6 grid grid-cols-7 gap-1.5">
          {SELF_STEPPER_STEPS.map((step, idx) => {
            const isActive = idx === stepIdx;
            const isVisited = idx < stepIdx;
            return (
              <button
                key={step.stepIndex}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx(idx);
                }}
                aria-label={`跳至第 ${idx + 1} 步`}
                className={`rounded-md py-2 text-center font-mono text-xs font-semibold tabular-nums transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isVisited
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Main Stepper Split Stage */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
          {/* Left: Line-by-Line Highlighted Code */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-900 p-5 text-slate-100">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs text-slate-400">
                <span className="font-mono">pet_demo.py</span>
                <span className="font-mono tabular-nums">
                  執行第 {currentStep.activeLine} 行 · 進度 {stepIdx + 1} / {totalSteps}
                </span>
              </div>

              <div className="mt-3 space-y-0.5 font-mono text-xs sm:text-sm">
                {STEPPER_CODE_LINES.map((line, index) => {
                  const lineNo = index + 1;
                  const isActive = lineNo === currentStep.activeLine;
                  return (
                    <div
                      key={lineNo}
                      className={`flex items-start gap-3 rounded px-2.5 py-1 transition-colors ${
                        isActive ? 'bg-blue-600/30 text-white' : 'text-slate-300'
                      }`}
                    >
                      <span className="w-5 shrink-0 select-none text-right text-slate-500 tabular-nums">
                        {lineNo}
                      </span>
                      <pre className="whitespace-pre overflow-x-auto">{line || ' '}</pre>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Explanation Box */}
            <div className="mt-5 rounded-lg border border-slate-700 bg-slate-800/80 p-4">
              <div className="text-xs font-semibold text-amber-300">{currentStep.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
                {currentStep.explanation}
              </p>
            </div>
          </div>

          {/* Right: Visual Memory & self Pointer */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-xl border border-slate-200 blueprint-grid p-5 sm:p-6">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-sm font-semibold text-slate-900">
                  記憶體狀態與 self 指標視覺化
                </span>
                <span className="font-mono text-xs font-semibold text-amber-700">
                  {currentStep.selfTarget === 'none'
                    ? 'self = 未指派'
                    : currentStep.selfTarget === 'pet1'
                    ? 'self → pet1 (0x104A)'
                    : 'self → pet2 (0x208F)'}
                </span>
              </div>

              {/* self Pointer Banner */}
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                  <span className="font-mono">目前 self 參數指向：</span>
                  <span className="font-mono">
                    {currentStep.selfTarget === 'none'
                      ? '尚無物件呼叫方法'
                      : currentStep.selfTarget === 'pet1'
                      ? 'pet1（記憶體位址 0x104A）'
                      : 'pet2（記憶體位址 0x208F）'}
                  </span>
                </div>
              </div>

              {/* Memory Boxes for pet1 and pet2 */}
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* pet1 box */}
                <div
                  className={`rounded-xl border p-4 transition-all ${
                    currentStep.selfTarget === 'pet1'
                      ? 'border-amber-500 bg-white ring-2 ring-amber-500/20'
                      : currentStep.pet1.exists
                      ? 'border-emerald-300 bg-white'
                      : 'border-dashed border-slate-300 bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900">pet1</span>
                    <span className="font-mono text-slate-500 tabular-nums">0x104A</span>
                  </div>
                  {currentStep.selfTarget === 'pet1' && (
                    <div className="mt-1.5 text-xs font-semibold text-amber-700">
                      ▲ 目前 self 指向此物件
                    </div>
                  )}

                  {!currentStep.pet1.exists ? (
                    <p className="mt-4 text-xs text-slate-400">尚未建立此物件</p>
                  ) : (
                    <div className="mt-3 space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between rounded bg-slate-50 px-2.5 py-1.5">
                        <span className="text-slate-500">name</span>
                        <span className="font-semibold text-slate-900">
                          {currentStep.pet1.name ? `"${currentStep.pet1.name}"` : '待設定...'}
                        </span>
                      </div>
                      <div className="flex justify-between rounded bg-slate-50 px-2.5 py-1.5">
                        <span className="text-slate-500">species</span>
                        <span className="font-semibold text-slate-900">
                          {currentStep.pet1.species ? `"${currentStep.pet1.species}"` : '待設定...'}
                        </span>
                      </div>
                      <div className="flex justify-between rounded bg-slate-50 px-2.5 py-1.5">
                        <span className="text-slate-500">energy</span>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {currentStep.pet1.energy ?? '待設定...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* pet2 box */}
                <div
                  className={`rounded-xl border p-4 transition-all ${
                    currentStep.selfTarget === 'pet2'
                      ? 'border-amber-500 bg-white ring-2 ring-amber-500/20'
                      : currentStep.pet2.exists
                      ? 'border-emerald-300 bg-white'
                      : 'border-dashed border-slate-300 bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900">pet2</span>
                    <span className="font-mono text-slate-500 tabular-nums">0x208F</span>
                  </div>
                  {currentStep.selfTarget === 'pet2' && (
                    <div className="mt-1.5 text-xs font-semibold text-amber-700">
                      ▲ 目前 self 指向此物件
                    </div>
                  )}

                  {!currentStep.pet2.exists ? (
                    <p className="mt-4 text-xs text-slate-400">尚未建立此物件</p>
                  ) : (
                    <div className="mt-3 space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between rounded bg-slate-50 px-2.5 py-1.5">
                        <span className="text-slate-500">name</span>
                        <span className="font-semibold text-slate-900">
                          {currentStep.pet2.name ? `"${currentStep.pet2.name}"` : '待設定...'}
                        </span>
                      </div>
                      <div className="flex justify-between rounded bg-slate-50 px-2.5 py-1.5">
                        <span className="text-slate-500">species</span>
                        <span className="font-semibold text-slate-900">
                          {currentStep.pet2.species ? `"${currentStep.pet2.species}"` : '待設定...'}
                        </span>
                      </div>
                      <div className="flex justify-between rounded bg-slate-50 px-2.5 py-1.5">
                        <span className="text-slate-500">energy</span>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {currentStep.pet2.energy ?? '待設定...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Output Preview */}
            <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold text-slate-700">終端機輸出結果 (stdout)</div>
              {currentStep.consoleLines.length === 0 ? (
                <p className="mt-2 font-mono text-xs text-slate-400">尚未執行到 print() 語句...</p>
              ) : (
                <div className="mt-2 space-y-1 font-mono text-xs text-emerald-700">
                  {currentStep.consoleLines.map((line, i) => (
                    <div key={i}>&gt; {line}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
