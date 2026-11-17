export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          PyCraft 物件工坊
        </a>

        <nav
          aria-label="主要學習單元導覽"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <a
            href="#concept-blueprint"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            概念藍圖
          </a>
          <a
            href="#object-lab"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            物件實驗室
          </a>
          <a
            href="#self-stepper"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            圖解 self
          </a>
          <a
            href="#code-sandbox"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            實作沙盒
          </a>
          <a
            href="#beginner-quiz"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            觀念測驗
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <a
            href="#object-lab"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            開始動手做
          </a>
        </div>
      </div>
    </header>
  );
}
