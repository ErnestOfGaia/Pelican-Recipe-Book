import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { metrics, quizQuestions, recipes } from '@/db/schema';
import { getRole } from '@/lib/get-role';
import { BottomNav } from '@/components/BottomNav';

export const dynamic = 'force-dynamic';

export default async function QuizHistoryPage() {
  const role = (await getRole()) ?? 'linecook';
  const isAdmin = role === 'admin';

  const limit = isAdmin ? 100 : 20;
  const baseQuery = db
    .select({
      id: metrics.id,
      correct: metrics.correct,
      created_at: metrics.created_at,
      role: metrics.role,
      recipe_title: recipes.title,
      question_text: quizQuestions.question_text,
    })
    .from(metrics)
    .leftJoin(recipes, eq(metrics.recipe_id, recipes.id))
    .leftJoin(quizQuestions, eq(metrics.question_id, quizQuestions.id))
    .orderBy(desc(metrics.created_at))
    .limit(limit);

  const rows = isAdmin
    ? await baseQuery
    : await baseQuery.where(eq(metrics.role, role));

  const totals = {
    attempts: rows.length,
    correct: rows.filter(r => r.correct).length,
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <header className="bg-white border-b-2 border-[#001b3c] h-[64px] fixed top-0 z-50 w-full flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#001b3c]">quiz</span>
          <span className="font-grotesk font-black uppercase text-[#001b3c] text-xl tracking-tight">
            PELLITO HUB
          </span>
        </div>
        <span className="font-grotesk font-bold uppercase text-[#526a8d] text-sm">EN | ES</span>
      </header>

      <main className="pt-[64px] pb-[100px] px-6 max-w-6xl mx-auto">
        <div className="py-6 border-b-2 border-[#001b3c] mb-6">
          <h1 className="font-grotesk font-black uppercase text-[#001b3c] text-5xl md:text-6xl tracking-tight leading-none">
            {isAdmin ? 'QUIZ ACTIVITY' : 'YOUR QUIZZES'}
          </h1>
          <p className="text-[#43474e] mt-2 text-lg">
            {isAdmin
              ? 'Most recent 100 attempts across all roles.'
              : 'Most recent 20 attempts on this account.'}
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="border-2 border-[#001b3c] bg-white p-12 text-center">
            <span className="material-symbols-outlined text-[#74777f] text-6xl block">quiz</span>
            <p className="font-grotesk uppercase font-bold text-[#001b3c] mt-4 text-lg tracking-wide">
              No quizzes taken yet
            </p>
            <p className="text-[#43474e] mt-2 text-base">
              Open a recipe and tap the Quiz Yourself CTA at the bottom.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Stat label="Attempts" value={totals.attempts.toString()} />
              <Stat
                label="Correct"
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

      <BottomNav activeTab="quizzes" />
    </div>
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
