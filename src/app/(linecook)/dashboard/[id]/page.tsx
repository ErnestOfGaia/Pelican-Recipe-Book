import { getRecipe } from '@/db/recipes';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import RecipeActions from './RecipeActions';
import QuizCTA from './QuizCTA';
import RecipeBody from './RecipeBody';
import { BottomNav } from '@/components/BottomNav';
import { LanguageToggle } from '@/components/LanguageToggle';
import { db } from '@/db/index';
import { recipeViews } from '@/db/schema';

export const dynamic = 'force-dynamic';

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) notFound();

  db.insert(recipeViews).values({ recipe_id: id }).catch(() => {});

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      {/* Top App Bar */}
      <header className="bg-white border-b-2 border-[#001b3c] h-[64px] fixed top-0 z-50 w-full flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center text-[#001b3c] hover:text-[#526a8d] transition-colors"
            aria-label="Back to recipes"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <span className="font-grotesk font-black uppercase text-[#001b3c] text-xl tracking-tight">
            PELLITO HUB
          </span>
        </div>
        <LanguageToggle />
      </header>

      {/* Main content */}
      <main className="pt-[64px] pb-[160px] max-w-6xl mx-auto">
        <RecipeBody recipe={recipe} />

        {/* Quiz CTA */}
        <QuizCTA recipeId={recipe.id} recipeTitle={recipe.title} />
      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab="recipes" />

      {/* Chat FAB + Drawer (client) */}
      <RecipeActions recipeId={recipe.id} />
    </div>
  );
}
