import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { metrics, quizQuestions, recipes } from '@/db/schema';
import { getRole } from '@/lib/get-role';
import { BottomNav } from '@/components/BottomNav';
import { LanguageToggle } from '@/components/LanguageToggle';
import QuizHistoryContent from './QuizHistoryContent';

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
        <LanguageToggle />
      </header>

      <QuizHistoryContent rows={rows} totals={totals} isAdmin={isAdmin} />

      <BottomNav activeTab="quizzes" />
    </div>
  );
}
