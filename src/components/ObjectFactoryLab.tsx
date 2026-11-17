import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Plus, RotateCcw, Terminal, Trash2 } from 'lucide-react';
import {
  BLUEPRINT_TEMPLATES,
  BlueprintTemplate,
  ObjectInstance,
} from '../data/curriculum';

interface ConsoleEntry {
  id: string;
  command: string;
  output: string;
  status: 'nominal' | 'warning';
}

export function ObjectFactoryLab() {
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<BlueprintTemplate['id']>('Pet');
  const template = useMemo(
    () => BLUEPRINT_TEMPLATES.find((t) => t.id === selectedTemplateId) ?? BLUEPRINT_TEMPLATES[0],
    [selectedTemplateId]
  );

  const [instancesByTemplate, setInstancesByTemplate] = useState<
    Record<BlueprintTemplate['id'], ObjectInstance[]>
  >(() => ({
    Pet: BLUEPRINT_TEMPLATES[0].initialInstances,
    BankAccount: BLUEPRINT_TEMPLATES[1].initialInstances,
    Hero: BLUEPRINT_TEMPLATES[2].initialInstances,
  }));

  const [formValues, setFormValues] = useState<Record<string, string | number>>(() => {
    const initial: Record<string, string | number> = {};
    BLUEPRINT_TEMPLATES[0].fields.forEach((f) => {
      initial[f.key] = f.defaultValue;
    });
    return initial;
  });

  const [consoleLog, setConsoleLog] = useState<ConsoleEntry[]>([
    {
      id: 'init-log-1',
      command: 'pet1 = Pet("麻糬", "柴犬")',
      output: '已在記憶體 0x104A 建立 Pet 物件，並自動執行 __init__',
      status: 'nominal',
    },
    {
      id: 'init-log-2',
      command: 'pet2 = Pet("小橘", "橘貓")',
      output: '已在記憶體 0x208F 建立 Pet 物件（與 pet1 完全獨立）',
      status: 'nominal',
    },
  ]);

  const [nextCounter, setNextCounter] = useState<Record<BlueprintTemplate['id'], number>>({
    Pet: 3,
    BankAccount: 3,
    Hero: 3,
  });

  const currentInstances = instancesByTemplate[template.id];

  const handleTemplateChange = (nextId: BlueprintTemplate['id']) => {
    setSelectedTemplateId(nextId);
    const nextTemplate = BLUEPRINT_TEMPLATES.find((t) => t.id === nextId)!;
    const nextForm: Record<string, string | number> = {};
    nextTemplate.fields.forEach((f) => {
      nextForm[f.key] = f.defaultValue;
    });
    setFormValues(nextForm);
    setConsoleLog([
      {
        id: `switch-${Date.now()}`,
        command: `# 切換至 ${nextTemplate.className} 類別藍圖`,
        output: `目前畫布載入 ${instancesByTemplate[nextId].length} 個 ${nextTemplate.className} 實體物件`,
        status: 'nominal',
      },
    ]);
  };

  const handleCreateObject = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInstances.length >= 6) {
      setConsoleLog((prev) => [
        {
          id: `warn-${Date.now()}`,
          command: `${template.className}(...)`,
          output: '實驗室畫布最多同時展示 6 個物件，請先移除部分物件再建立新物件。',
          status: 'warning',
        },
        ...prev.slice(0, 7),
      ]);
      return;
    }

    const index = nextCounter[template.id];
    const varName = `${template.varPrefix}${index}`;
    const addrNum = 0x1000 + index * 0x11a3 + Math.floor(Math.random() * 120);
    const address = `0x${addrNum.toString(16).toUpperCase()}`;

    const newAttrs: Record<string, string | number> = { ...template.defaultAttrs };
    const argParts: string[] = [];
    template.fields.forEach((f) => {
      const raw = formValues[f.key];
      if (f.type === 'number') {
        const numVal = Number(raw) || 0;
        newAttrs[f.key] = numVal;
        argParts.push(String(numVal));
      } else {
        const strVal = String(raw || f.defaultValue).trim() || String(f.defaultValue);
        newAttrs[f.key] = strVal;
        argParts.push(`"${strVal}"`);
      }
    });

    const newObj: ObjectInstance = {
      id: `${template.id}-${Date.now()}`,
      varName,
      address,
      className: template.className,
      attrs: newAttrs,
      lastAction: '剛剛透過 __init__ 建立',
    };

    setInstancesByTemplate((prev) => ({
      ...prev,
      [template.id]: [...prev[template.id], newObj],
    }));
    setNextCounter((prev) => ({ ...prev, [template.id]: index + 1 }));
    setConsoleLog((prev) => [
      {
        id: `create-${Date.now()}`,
        command: `${varName} = ${template.className}(${argParts.join(', ')})`,
        output: `已在記憶體 ${address} 建立物件 ${varName}，並完成屬性初始化`,
        status: 'nominal',
      },
      ...prev.slice(0, 7),
    ]);
  };

  const handleInvokeMethod = (instanceId: string, methodName: string) => {
    const target = currentInstances.find((inst) => inst.id === instanceId);
    const method = template.methods.find((m) => m.name === methodName);
    if (!target || !method) return;

    const result = method.execute(target);
    setInstancesByTemplate((prev) => ({
      ...prev,
      [template.id]: prev[template.id].map((item) =>
        item.id === instanceId
          ? {
              ...item,
              attrs: result.updatedAttrs,
              lastAction: `剛執行 ${method.callSignature}`,
            }
          : item
      ),
    }));

    setConsoleLog((prev) => [
      {
        id: `method-${Date.now()}`,
        command: `${target.varName}.${method.callSignature}`,
        output: result.consoleOutput,
        status: result.statusType,
      },
      ...prev.slice(0, 7),
    ]);
  };

  const handleDirectAttrEdit = (instanceId: string, attrKey: string, nextValue: string) => {
    const target = currentInstances.find((inst) => inst.id === instanceId);
    if (!target) return;
    const isNum = typeof target.attrs[attrKey] === 'number';
    const parsed: string | number = isNum ? Number(nextValue) || 0 : nextValue;

    setInstancesByTemplate((prev) => ({
      ...prev,
      [template.id]: prev[template.id].map((item) =>
        item.id === instanceId
          ? {
              ...item,
              attrs: { ...item.attrs, [attrKey]: parsed },
              lastAction: `修改屬性 ${attrKey}`,
            }
          : item
      ),
    }));

    setConsoleLog((prev) => [
      {
        id: `attr-${Date.now()}`,
        command: `${target.varName}.${attrKey} = ${isNum ? parsed : `"${parsed}"`}`,
        output: `已更新 ${target.varName} (${target.address}) 的 ${attrKey}，其他物件不受影響`,
        status: 'nominal',
      },
      ...prev.slice(0, 7),
    ]);
  };

  const handleRemoveInstance = (instanceId: string) => {
    const target = currentInstances.find((i) => i.id === instanceId);
    if (!target) return;
    setInstancesByTemplate((prev) => ({
      ...prev,
      [template.id]: prev[template.id].filter((i) => i.id !== instanceId),
    }));
    setConsoleLog((prev) => [
      {
        id: `del-${Date.now()}`,
        command: `del ${target.varName}`,
        output: `已從記憶體移除 ${target.varName} (${target.address})`,
        status: 'nominal',
      },
      ...prev.slice(0, 7),
    ]);
  };

  const handleResetTemplate = () => {
    setInstancesByTemplate((prev) => ({
      ...prev,
      [template.id]: template.initialInstances,
    }));
    setNextCounter((prev) => ({ ...prev, [template.id]: 3 }));
    setConsoleLog([
      {
        id: `reset-${Date.now()}`,
        command: `# 重設 ${template.className} 實驗室`,
        output: '已恢復預設物件狀態',
        status: 'nominal',
      },
    ]);
  };

  return (
    <section id="object-lab" className="border-b border-slate-200 bg-slate-50 py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-blue-700">
              02. 互動物件工坊 · 藍圖與記憶體實驗室
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              動手從類別藍圖製造物件，並呼叫方法
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              右側選擇藍圖並輸入參數來建立新物件；左側觀察每個物件如何擁有獨立的記憶體空間、屬性數值與專屬方法按鈕。
            </p>
          </div>

          {/* Template Segmented Selector */}
          <div
            role="tablist"
            aria-label="選擇類別藍圖範例"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 self-start"
          >
            {BLUEPRINT_TEMPLATES.map((t) => {
              const active = t.id === template.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleTemplateChange(t.id)}
                  className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {t.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Two-Zone Sandbox Layout: Left Interactive Stage (65%) + Right Control & Concept Deck (35%) */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* Left Stage: Memory Heap & Live Object Cards (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Python 記憶體空間（已建立 {currentInstances.length} / 6 個 {template.className} 物件）
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {template.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetTemplate}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>重設範例</span>
                </button>
              </div>

              {currentInstances.length === 0 ? (
                <div className="my-10 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    目前記憶體中沒有任何 {template.className} 物件
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    請在右側「物件製造機」填寫參數並點擊建立物件。
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {currentInstances.map((inst) => {
                    const meter = template.meterKey;
                    const meterVal = meter ? Number(inst.attrs[meter.key] ?? 0) : 0;
                    const meterPercent = meter
                      ? Math.min(100, Math.max(0, Math.round((meterVal / meter.max) * 100)))
                      : 0;
                    const isLowMeter = meter && meterVal <= 20;

                    return (
                      <article
                        key={inst.id}
                        className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:border-slate-300"
                      >
                        <div>
                          {/* Object Card Header */}
                          <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
                            <div>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="font-mono font-semibold text-emerald-700">
                                  {inst.className} 物件
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">
                                  記憶體 {inst.address}
                                </span>
                              </div>
                              <h4 className="mt-1 font-mono text-lg font-bold text-slate-900">
                                {inst.varName}
                              </h4>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveInstance(inst.id)}
                              aria-label={`移除物件 ${inst.varName}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>

                          {/* Visual Meter (e.g. Energy / Balance / HP) */}
                          {meter && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-600">{meter.label}</span>
                                <span
                                  className={`font-mono font-semibold tabular-nums ${
                                    isLowMeter ? 'text-amber-700' : 'text-slate-900'
                                  }`}
                                >
                                  {meterVal} / {meter.max} {meter.unit}
                                  {isLowMeter ? '（偏低）' : ''}
                                </span>
                              </div>
                              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className={`h-full transition-all duration-200 ${
                                    isLowMeter ? 'bg-amber-500' : 'bg-emerald-600'
                                  }`}
                                  style={{ width: `${meterPercent}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Attributes Table (Editable first attribute to demonstrate independence) */}
                          <div className="mt-3.5 space-y-2">
                            <div className="text-xs font-medium text-slate-500">
                              屬性 (Attributes)
                            </div>
                            <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
                              {Object.entries(inst.attrs).map(([key, val], idx) => (
                                <div
                                  key={key}
                                  className="flex items-center justify-between gap-2 px-3 py-2 text-xs"
                                >
                                  <span className="font-mono text-slate-600">
                                    self.<strong className="text-slate-900">{key}</strong>
                                  </span>
                                  {idx === 0 ? (
                                    <input
                                      type="text"
                                      aria-label={`修改 ${inst.varName}.${key}`}
                                      value={String(val)}
                                      onChange={(e) =>
                                        handleDirectAttrEdit(inst.id, key, e.target.value)
                                      }
                                      className="w-28 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-right font-mono text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                                    />
                                  ) : (
                                    <span className="font-mono font-medium text-slate-900 tabular-nums">
                                      {typeof val === 'string' ? `"${val}"` : val}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Method Action Buttons */}
                        <div className="mt-4 pt-3 border-t border-slate-200">
                          <div className="text-xs font-medium text-slate-500 mb-2">
                            呼叫方法 (Methods)
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {template.methods.map((method) => (
                              <button
                                key={method.name}
                                type="button"
                                onClick={() => handleInvokeMethod(inst.id, method.name)}
                                title={method.description}
                                className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs font-medium text-slate-800 transition-colors hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700 whitespace-nowrap"
                              >
                                .{method.callSignature}
                              </button>
                            ))}
                          </div>
                          {inst.lastAction && (
                            <p className="mt-2 text-[11px] text-slate-500">{inst.lastAction}</p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Live Python Console */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5 text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Terminal className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  <span>Python 即時執行紀錄</span>
                </div>
                <span className="font-mono text-xs text-slate-400">最新操作顯示於最上方</span>
              </div>
              <div className="mt-3 max-h-48 space-y-2.5 overflow-y-auto pr-1 font-mono text-xs">
                {consoleLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg bg-slate-950/70 px-3 py-2 border border-slate-800"
                  >
                    <div className="text-blue-300">&gt;&gt;&gt; {entry.command}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      {entry.status === 'warning' ? (
                        <span className="inline-flex items-center gap-1 text-amber-300">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>提示：{entry.output}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>結果：{entry.output}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Deck: Blueprint Code + Instantiation Form (4 cols) */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Object Creator Form */}
            <form
              onSubmit={handleCreateObject}
              className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="text-xs font-medium text-blue-700">物件製造機</div>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                建立新的 {template.className} 物件
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                填入傳給 <code className="font-mono text-slate-700">__init__</code> 的初始參數，按下按鈕就會在左側誕生新物件。
              </p>

              <div className="mt-4 space-y-4">
                {template.fields.map((field) => (
                  <div key={field.key}>
                    <label
                      htmlFor={`field-${field.key}`}
                      className="block text-xs font-semibold text-slate-700"
                    >
                      {field.label}
                    </label>
                    <input
                      id={`field-${field.key}`}
                      type={field.type}
                      value={formValues[field.key] ?? ''}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      placeholder={field.placeholder}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">快速填入：</span>
                      {field.presets.map((preset) => (
                        <button
                          key={String(preset)}
                          type="button"
                          onClick={() =>
                            setFormValues((prev) => ({ ...prev, [field.key]: preset }))
                          }
                          className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 transition-colors hover:border-blue-500 hover:text-blue-700"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="mt-5 flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>建立物件（呼叫 __init__）</span>
              </button>
            </form>

            {/* Blueprint Python Code Panel */}
            <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-mono text-xs font-semibold text-blue-300">
                  class {template.className}:
                </span>
                <span className="text-xs text-slate-400">類別藍圖程式碼</span>
              </div>
              <pre className="mt-3 overflow-x-auto font-mono text-xs leading-6 text-slate-200">
                <code>{template.codeLines.join('\n')}</code>
              </pre>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
