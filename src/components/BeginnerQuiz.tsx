import { useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/curriculum';

export function BeginnerQuiz() {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const totalQuestions = QUIZ_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const correctCount = QUIZ_QUESTIONS.filter(
    (q) => answers[q.id] === q.correctIndex
  ).length;

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleResetQuiz = () => {
    setAnswers({});
  };

  return (
    <section id="beginner-quiz" className="bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs font-medium text-blue-700">
              05. 初學者隨堂檢核 · 確認觀念無誤
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              5 題快速測試：類別與物件入門測驗
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              點選答案後會立即顯示解析，幫助釐清最容易混淆的語法細節。
            </p>
          </div>

          <div className="flex items-center gap-4 self-start sm:self-end">
            <div className="text-right text-xs text-slate-600 font-mono tabular-nums">
              已作答 {answeredCount} / {totalQuestions} 題
              {answeredCount > 0 && (
                <span className="ml-2 font-semibold text-emerald-700">
                  答對 {correctCount} 題
                </span>
              )}
            </div>
            {answeredCount > 0 && (
              <button
                type="button"
                onClick={handleResetQuiz}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>重新測驗</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {QUIZ_QUESTIONS.map((q, qIdx) => {
            const selected = answers[q.id];
            const hasAnswered = selected !== undefined;
            const isCorrect = selected === q.correctIndex;

            return (
              <article
                key={q.id}
                className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-semibold leading-snug text-slate-900">
                    <span className="mr-2 font-mono text-blue-700 tabular-nums">
                      Q{qIdx + 1}.
                    </span>
                    {q.question}
                  </h3>
                  {hasAnswered && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap shrink-0 ${
                        isCorrect ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          <span>答對</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" aria-hidden="true" />
                          <span>需修正</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                {q.codeSnippet && (
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3.5 font-mono text-xs leading-6 text-slate-100">
                    <code>{q.codeSnippet}</code>
                  </pre>
                )}

                <div className="mt-4 grid grid-cols-1 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isPicked = selected === optIdx;
                    const isAnswer = q.correctIndex === optIdx;

                    let optionStyle =
                      'border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-400 hover:bg-blue-50/50';
                    if (hasAnswered) {
                      if (isAnswer) {
                        optionStyle =
                          'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium';
                      } else if (isPicked && !isAnswer) {
                        optionStyle = 'border-red-400 bg-red-50 text-red-900';
                      } else {
                        optionStyle = 'border-slate-200 bg-white text-slate-500';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${optionStyle}`}
                      >
                        <span>
                          <span className="mr-2 font-mono text-xs font-semibold">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          {opt}
                        </span>
                        {hasAnswered && isAnswer && (
                          <span className="text-xs font-semibold text-emerald-700 whitespace-nowrap shrink-0">
                            正解
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {hasAnswered && (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs sm:text-sm leading-relaxed text-slate-700">
                    <span className="font-semibold text-slate-900">觀念解析：</span>
                    {q.explanation}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {answeredCount === totalQuestions && (
          <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <div className="font-display text-xl font-bold text-emerald-950">
              已完成所有題目：答對 {correctCount} / {totalQuestions} 題
            </div>
            <p className="mt-2 text-sm text-emerald-800">
              {correctCount === totalQuestions
                ? '太棒了！你已經完全掌握 Python 類別、__init__、self 與物件獨立性的核心觀念。'
                : '建議查看上方標記「需修正」題目的解析，並回到實作沙盒多練習幾次！'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
