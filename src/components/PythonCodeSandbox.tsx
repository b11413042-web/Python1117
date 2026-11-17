import { useMemo, useState } from 'react';
import { AlertCircle, Box, Play, RotateCcw, Terminal } from 'lucide-react';
import { SANDBOX_PRESETS } from '../data/curriculum';
import { runMiniPythonOop } from '../utils/miniPythonOop';

export function PythonCodeSandbox() {
  const [presetId, setPresetId] = useState(SANDBOX_PRESETS[0].id);
  const activePreset = useMemo(
    () => SANDBOX_PRESETS.find((p) => p.id === presetId) ?? SANDBOX_PRESETS[0],
    [presetId]
  );

  const [code, setCode] = useState(SANDBOX_PRESETS[0].code);
  const [result, setResult] = useState(() => runMiniPythonOop(SANDBOX_PRESETS[0].code));

  const handleSelectPreset = (id: string) => {
    const found = SANDBOX_PRESETS.find((p) => p.id === id);
    if (!found) return;
    setPresetId(id);
    setCode(found.code);
    setResult(runMiniPythonOop(found.code));
  };

  const handleRun = () => {
    setResult(runMiniPythonOop(code));
  };

  const handleReset = () => {
    setCode(activePreset.code);
    setResult(runMiniPythonOop(activePreset.code));
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const nextCode = code.slice(0, start) + '    ' + code.slice(end);
      setCode(nextCode);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      });
    }
  };

  return (
    <section id="code-sandbox" className="border-b border-slate-200 bg-slate-50 py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-blue-700">
              04. 動手寫程式 · 即時編譯與物件解析沙盒
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              自由修改 Python 類別程式碼並立即執行
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              {activePreset.description}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="選擇練習範例"
            className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 self-start"
          >
            {SANDBOX_PRESETS.map((preset) => {
              const active = preset.id === presetId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Code Editor Panel */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <span className="font-mono text-xs font-medium text-slate-300">
                main.py（支援 Tab 縮排 4 格空白）
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>重設範例</span>
                </button>
                <button
                  type="button"
                  onClick={handleRun}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 whitespace-nowrap"
                >
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>執行程式碼</span>
                </button>
              </div>
            </div>

            <textarea
              aria-label="Python 類別練習編輯器"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              spellCheck={false}
              rows={20}
              className="w-full flex-1 resize-y bg-slate-950 p-4 font-mono text-xs sm:text-sm leading-6 text-slate-100 focus:outline-none"
            />
          </div>

          {/* Execution Output + Parsed Memory Objects */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Console Output */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Terminal className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  <span>終端機輸出 (Console)</span>
                </div>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {result.consoleLines.length} 行輸出
                </span>
              </div>

              {result.error ? (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs leading-relaxed text-red-800"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                  <div>
                    <div className="font-semibold">執行發生錯誤</div>
                    <p className="mt-1">{result.error}</p>
                  </div>
                </div>
              ) : result.consoleLines.length === 0 ? (
                <p className="mt-4 text-xs text-slate-500">
                  程式執行成功，但沒有使用 print() 印出任何內容。
                </p>
              ) : (
                <div className="mt-4 rounded-lg bg-slate-900 p-4 font-mono text-xs leading-6 text-emerald-300 space-y-1">
                  {result.consoleLines.map((line, idx) => (
                    <div key={idx}>&gt; {line}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Automatically Parsed Memory Objects */}
            <div className="flex-1 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Box className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>程式建立的記憶體物件</span>
                </div>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {result.instances.length} 個物件
                </span>
              </div>

              {result.instances.length === 0 ? (
                <p className="mt-4 text-xs text-slate-500">
                  尚未在程式中建立任何類別物件（例如 <code className="font-mono">x = Pet(...)</code>）。
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {result.instances.map((inst) => (
                    <div
                      key={inst.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-900">
                          {inst.varName}
                          <span className="ml-2 font-normal text-blue-700">
                            ({inst.className})
                          </span>
                        </span>
                        <span className="font-mono text-slate-500 tabular-nums">
                          {inst.address}
                        </span>
                      </div>

                      <div className="mt-2.5 grid grid-cols-1 gap-1.5 font-mono text-xs">
                        {Object.entries(inst.attrs).map(([k, v]) => (
                          <div
                            key={k}
                            className="flex items-center justify-between rounded border border-slate-200 bg-white px-2.5 py-1.5"
                          >
                            <span className="text-slate-500">.{k}</span>
                            <span className="font-medium text-slate-900 tabular-nums">
                              {typeof v === 'string' ? `"${v}"` : String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
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
