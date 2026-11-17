/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BeginnerQuiz } from './components/BeginnerQuiz';
import { HeroBlueprintSection } from './components/HeroBlueprintSection';
import { ObjectFactoryLab } from './components/ObjectFactoryLab';
import { PythonCodeSandbox } from './components/PythonCodeSandbox';
import { SelfInitStepper } from './components/SelfInitStepper';
import { TopNav } from './components/TopNav';

export default function App() {
  return (
    <div id="top" className="min-h-screen bg-slate-50 text-slate-900">
      <TopNav />

      <main>
        <HeroBlueprintSection />
        <ObjectFactoryLab />
        <SelfInitStepper />
        <PythonCodeSandbox />
        <BeginnerQuiz />
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <span className="font-semibold text-slate-800">PyCraft 物件工坊</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Python 類別與物件初學者入門教材</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <a href="#concept-blueprint" className="hover:text-slate-900">
              概念藍圖
            </a>
            <a href="#object-lab" className="hover:text-slate-900">
              物件實驗室
            </a>
            <a href="#self-stepper" className="hover:text-slate-900">
              圖解 self
            </a>
            <a href="#code-sandbox" className="hover:text-slate-900">
              實作沙盒
            </a>
            <a href="#beginner-quiz" className="hover:text-slate-900">
              觀念測驗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
