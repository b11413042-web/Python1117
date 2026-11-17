import { useState } from 'react';
import { ArrowRight, Box, Layers, Play, Wrench } from 'lucide-react';

type FocusConcept = 'blueprint' | 'house1' | 'house2' | 'house3';

interface HouseConfig {
  id: 'house1' | 'house2' | 'house3';
  varName: string;
  roofColor: string;
  roofHex: string;
  floors: number;
  owner: string;
  code: string;
}

const SAMPLE_HOUSES: HouseConfig[] = [
  {
    id: 'house1',
    varName: 'h1',
    roofColor: '磚紅色',
    roofHex: '#DC2626',
    floors: 2,
    owner: '小華',
    code: 'h1 = House(roof="磚紅色", floors=2, owner="小華")',
  },
  {
    id: 'house2',
    varName: 'h2',
    roofColor: '森林綠',
    roofHex: '#059669',
    floors: 1,
    owner: '美玲',
    code: 'h2 = House(roof="森林綠", floors=1, owner="美玲")',
  },
  {
    id: 'house3',
    varName: 'h3',
    roofColor: '琥珀金',
    roofHex: '#D97706',
    floors: 3,
    owner: '阿傑',
    code: 'h3 = House(roof="琥珀金", floors=3, owner="阿傑")',
  },
];

const CORE_PILLARS = [
  {
    num: '01',
    title: 'Class 類別（設計藍圖）',
    desc: '定義「這種東西有哪些資料與功能」的規格書，本身不佔用實體空間。',
    code: 'class House:',
    icon: Layers,
  },
  {
    num: '02',
    title: 'Object 物件（真實個體）',
    desc: '依照藍圖實際製造出來的個體，每個物件在記憶體中都有獨立的家。',
    code: 'h1 = House(...)',
    icon: Box,
  },
  {
    num: '03',
    title: 'Attribute 屬性（物件資料）',
    desc: '記錄物件狀態的變數，例如屋頂顏色、樓層數、寵物名字或體力值。',
    code: 'h1.roof = "磚紅色"',
    icon: Wrench,
  },
  {
    num: '04',
    title: 'Method 方法（物件動作）',
    desc: '寫在類別裡的函式，讓物件可以執行動作並更新自己的屬性。',
    code: 'h1.open_door()',
    icon: Play,
  },
];

export function HeroBlueprintSection() {
  const [selectedFocus, setSelectedFocus] = useState<FocusConcept>('blueprint');
  const activeHouse = SAMPLE_HOUSES.find((h) => h.id === selectedFocus);

  return (
    <section id="concept-blueprint" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
          {/* Left Copy Column */}
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                <span>單元 01</span>
                <span aria-hidden="true">·</span>
                <span>Python 物件導向基礎</span>
                <span aria-hidden="true">·</span>
                <span>適合零基礎初學者</span>
              </div>

              <h1
                className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.18]"
                style={{ textWrap: 'balance' }}
              >
                class 是設計藍圖，物件是依藍圖打造的真實個體
              </h1>

              <p className="mt-5 text-base leading-relaxed text-slate-600">
                學 Python 時不用死背「物件導向」這四個字。想像建築師畫了一張房屋設計圖（<code className="font-mono text-sm font-semibold text-blue-700">class</code>），工人就能用同一張圖蓋出三棟屋頂顏色、住戶都不同的房子（<code className="font-mono text-sm font-semibold text-emerald-700">object</code>）。
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#object-lab"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <span>進入互動實驗室</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="#self-stepper"
                  className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  看懂 self 逐步動畫
                </a>
              </div>
            </div>

            <p className="mt-8 text-xs leading-relaxed text-slate-500">
              互動提示：點擊右側圖解中的「房屋藍圖」或任意一棟「實體房子」，即可切換檢視對應的 Python 語法。
            </p>
          </div>

          {/* Right Interactive Blueprint-to-Objects Stage */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 blueprint-grid p-5 sm:p-6 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span>1 份設計藍圖</span>
                <span aria-hidden="true">→</span>
                <span>N 個互不干擾的獨立物件</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedFocus('blueprint')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedFocus === 'blueprint'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
                  }`}
                >
                  藍圖 House
                </button>
                {SAMPLE_HOUSES.map((house) => (
                  <button
                    key={house.id}
                    type="button"
                    onClick={() => setSelectedFocus(house.id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                      selectedFocus === house.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {house.varName}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Architecture Blueprint -> Houses */}
            <div className="my-5 grid grid-cols-1 items-center gap-4 sm:grid-cols-12">
              {/* Blueprint SVG Node */}
              <button
                type="button"
                onClick={() => setSelectedFocus('blueprint')}
                className={`sm:col-span-5 text-left rounded-lg border p-4 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  selectedFocus === 'blueprint'
                    ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/15'
                    : 'border-slate-300 bg-white hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-medium text-blue-700">
                  <span className="font-mono font-semibold">class House:</span>
                  <span>設計圖</span>
                </div>
                <svg
                  viewBox="0 0 180 120"
                  className="mt-3 w-full h-auto"
                  role="img"
                  aria-label="House 類別藍圖線框圖"
                >
                  <rect
                    x="10"
                    y="10"
                    width="160"
                    height="100"
                    rx="6"
                    fill="#EFF6FF"
                    stroke="#93C5FD"
                    strokeDasharray="4 3"
                  />
                  <polygon
                    points="90,22 42,56 138,56"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <rect
                    x="52"
                    y="56"
                    width="76"
                    height="42"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2"
                  />
                  <rect
                    x="80"
                    y="72"
                    width="20"
                    height="26"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="1.5"
                  />
                  <text x="18" y="34" fill="#1D4ED8" fontSize="9" fontFamily="JetBrains Mono">
                    roof
                  </text>
                  <text x="18" y="75" fill="#1D4ED8" fontSize="9" fontFamily="JetBrains Mono">
                    floors
                  </text>
                  <text x="135" y="96" fill="#1D4ED8" fontSize="9" fontFamily="JetBrains Mono">
                    owner
                  </text>
                </svg>
                <p className="mt-2 text-xs text-slate-600">
                  只規定「要有屋頂、樓層與屋主」，還沒決定實際顏色。
                </p>
              </button>

              {/* Flow Arrow */}
              <div className="hidden sm:flex sm:col-span-1 flex-col items-center justify-center text-slate-400">
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
                <span className="mt-1 text-[11px] font-mono">建立</span>
              </div>

              {/* 3 Instantiated House Cards */}
              <div className="sm:col-span-6 grid grid-cols-1 gap-2.5">
                {SAMPLE_HOUSES.map((house) => {
                  const isSelected = selectedFocus === house.id;
                  return (
                    <button
                      key={house.id}
                      type="button"
                      onClick={() => setSelectedFocus(house.id)}
                      className={`flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                        isSelected
                          ? 'border-emerald-600 bg-white ring-2 ring-emerald-600/15'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          viewBox="0 0 48 44"
                          className="h-10 w-11 shrink-0"
                          aria-hidden="true"
                        >
                          <polygon
                            points="24,4 4,20 44,20"
                            fill={house.roofHex}
                          />
                          <rect
                            x="10"
                            y="20"
                            width="28"
                            height="20"
                            fill="#F8FAFC"
                            stroke="#334155"
                            strokeWidth="1.5"
                          />
                          <rect x="20" y="28" width="8" height="12" fill="#94A3B8" />
                        </svg>
                        <div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-mono font-semibold text-slate-900">
                              {house.varName}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">
                              ·
                            </span>
                            <span className="text-slate-600">屋主：{house.owner}</span>
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500 font-mono tabular-nums">
                            roof=&quot;{house.roofColor}&quot; · floors={house.floors}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium whitespace-nowrap ${
                          isSelected ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {isSelected ? '檢視中' : '點選'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Python Code Readout Bar */}
            <div className="rounded-lg bg-slate-900 p-4 text-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  {activeHouse
                    ? `正在檢視實體物件 ${activeHouse.varName}`
                    : '正在檢視類別藍圖 House'}
                </span>
                <span className="font-mono">Python 語法對應</span>
              </div>
              {activeHouse ? (
                <pre className="mt-2 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-emerald-300">
                  <code>{`${activeHouse.code}\nprint(f"{${activeHouse.varName}.owner} 的房子是 {${activeHouse.varName}.roof} 屋頂")`}</code>
                </pre>
              ) : (
                <pre className="mt-2 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-blue-300">
                  <code>{`class House:\n    def __init__(self, roof, floors, owner):\n        self.roof = roof\n        self.floors = floors\n        self.owner = owner`}</code>
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Vocabulary Strip */}
        <div className="mt-12 grid grid-cols-1 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
          {CORE_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.num} className="p-5 sm:p-6">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <span className="font-mono tabular-nums">{pillar.num}</span>
                  <Icon className="h-4 w-4 text-blue-600" aria-hidden="true" />
                </div>
                <h2 className="mt-2.5 text-base font-semibold text-slate-900">
                  {pillar.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {pillar.desc}
                </p>
                <div className="mt-3 font-mono text-xs text-blue-700 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 inline-block">
                  {pillar.code}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
