'use client';

import { useLanguage } from '@/lib/LanguageContext';

interface QuizRow {
  id: string;
  correct: boolean | null;
  created_at: Date | null;
  role: string | null;
  recipe_title: string | null;
  question_text: string | null;
}

interface Totals {
  attempts: number;
  correct: number;
}

export default function QuizHistoryContent({
  rows,
  totals,
  isAdmin,
}: {
  rows: QuizRow[];
  totals: Totals;
  isAdmin: boolean;
}) {
  const { t } = useLanguage();

  return (
    <main className="pt-[64px] pb-[100px] px-6 max-w-6xl mx-auto">
      <div className="py-6 border-b-2 border-[#001b3c] mb-6">
        <h1 className="font-grotesk font-black uppercase text-[#001b3c] text-5xl md:text-6xl tracking-tight leading-none">
          {isAdmin ? t('quizActivityTitle') : t('quizHistoryTitle')}
        </h1>
        <p className="text-[#43474e] mt-2 text-lg">
          {isAdmin ? t('quizHistorySubtextAdmin') : t('quizHistorySubtextUser')}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="border-2 border-[#001b3c] bg-white p-12 text-center">
          <span className="material-symbols-outlined text-[#74777f] text-6xl block">quiz</span>
          <p className="font-grotesk uppercase font-bold text-[#001b3c] mt-4 text-lg tracking-wide">
            {t('quizHistoryEmpty')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Stat label={t('quizHistoryAttempts')} value={totals.attempts.toString()} />
            <Stat
              label={t('quizHistoryCorrect')}
              value={`${totals.correct} / ${totals.attempts}`}
            />
          </div>

          <div className="border-2 border-[#001b3c] bg-white divide-y divide-[#74777f]/30">
            {rows.map(r => (
              <div key={r.id} className="px-4 py-3 flex items-start gap-4">
                <span
                  className={`material-symbols-outlined text-2xl flex-shrink-0 ${
                    r.correct ? 'text-[#0a6c3d]' : 'text-[#ba1a1a]'
                  }`}
                >
                  {r.correct ? 'check_circle' : 'cancel'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-grotesk font-bold uppercase text-[#001b3c] text-base tracking-tight truncate">
                    {r.recipe_title ?? '(deleted recipe)'}
                  </p>
                  <p className="font-sans text-[#43474e] text-sm mt-0.5 line-clamp-2">
                    {r.question_text ?? '(question removed)'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {isAdmin && (
                    <p className="font-grotesk font-bold uppercase text-xs text-[#526a8d] tracking-wide">
                      {r.role}
                    </p>
                  )}
                  <p className="font-sans text-xs text-[#74777f] mt-0.5">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-[#001b3c] bg-white p-4">
      <div className="font-grotesk font-bold uppercase tracking-wide text-xs text-[#74777f]">
        {label}
      </div>
      <div className="font-grotesk font-black text-[#001b3c] text-2xl mt-1">{value}</div>
    </div>
  );
}
