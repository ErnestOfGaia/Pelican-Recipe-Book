import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession, COOKIE_NAME } from '@/lib/session';
import { getQuestionsForRecipe, insertQuestions } from '@/db/quiz';
import { getRecipe } from '@/db/recipes';
import { generateQuestions } from '@/lib/quiz-generator';

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = await verifySession(sessionCookie.value);
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { recipeId } = await params;
  let questions = await getQuestionsForRecipe(recipeId);

  // Lazy generation if questions were never seeded for this recipe
  if (!questions.length) {
    const recipe = await getRecipe(recipeId);
    if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    const generated = generateQuestions(recipe);
    await insertQuestions(recipeId, generated);
    questions = await getQuestionsForRecipe(recipeId);
  }

  const easy = pickRandom(questions.filter(q => q.difficulty === 'easy'), 5);
  const hard = pickRandom(questions.filter(q => q.difficulty === 'hard'), 3);

  return NextResponse.json({ easy, hard });
}
