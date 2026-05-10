/**
 * Generate and store quiz questions for all published recipes.
 * Run with: npm run seed:questions
 * Idempotent — skips recipes that already have questions.
 */
import { mkdirSync } from 'fs';
import path from 'path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { recipes, quizQuestions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateQuestions } from '../lib/quiz-generator';

mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });

const client = createClient({
  url: `file:${path.join(process.cwd(), 'data/dev.db')}`,
});
const db = drizzle(client);

async function seedQuestions() {
  const allRecipes = await db
    .select()
    .from(recipes)
    .where(eq(recipes.status, 'published'));

  console.log(`🧩 Generating questions for ${allRecipes.length} recipes…`);

  let generated = 0;
  let skipped = 0;

  for (const recipe of allRecipes) {
    const existing = await db
      .select({ id: quizQuestions.id })
      .from(quizQuestions)
      .where(eq(quizQuestions.recipe_id, recipe.id))
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    const questions = generateQuestions(recipe);
    if (questions.length > 0) {
      await db.insert(quizQuestions).values(
        questions.map(q => ({ ...q, recipe_id: recipe.id })),
      );
    }
    console.log(`  ✓  ${recipe.title}: ${questions.filter(q => q.difficulty === 'easy').length} easy, ${questions.filter(q => q.difficulty === 'hard').length} hard`);
    generated++;
  }

  console.log(`\n✅ Done — ${generated} recipes with new questions, ${skipped} already had questions`);
  process.exit(0);
}

seedQuestions().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
