/**
 * translate-recipes.ts — Auto-translate all published recipes to Spanish.
 * Run with: npm run translate
 *
 * Translates: title, plateware, ingredients[], cook_steps[], plate_steps[]
 * One Claude call per recipe. Skips recipes that already have title_es set.
 *
 * Env: ANTHROPIC_API_KEY required (loaded from .env automatically via tsx --env-file-if-exists).
 */
import path from 'path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { recipes } from '../db/schema';

// ---------------------------------------------------------------------------
// DB setup (mirrors seed-from-csv.ts)
// ---------------------------------------------------------------------------
const client = createClient({
  url: `file:${path.join(process.cwd(), 'data/dev.db')}`,
});
const db = drizzle(client);

// ---------------------------------------------------------------------------
// Claude setup
// ---------------------------------------------------------------------------
// Pin the API base URL explicitly. Some environments (e.g. the Claude Code CLI)
// set ANTHROPIC_BASE_URL=https://api.anthropic.com without the /v1 path segment,
// which the AI SDK would otherwise pick up and produce 404s on /messages.
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://api.anthropic.com/v1',
});

const TranslationSchema = z.object({
  title_es: z.string().describe('Recipe title in Spanish'),
  plateware_es: z.string().nullable().describe('Plateware name in Spanish, or null if none'),
  ingredients_es: z.array(z.string()).describe('Each ingredient string translated to Spanish, preserving quantity format'),
  cook_steps_es: z.array(z.string()).describe('Each cook step translated to Spanish'),
  plate_steps_es: z.array(z.string()).describe('Each plate step translated to Spanish'),
});

type Translation = z.infer<typeof TranslationSchema>;

async function translateRecipe(recipe: typeof recipes.$inferSelect): Promise<Translation> {
  const { object } = await generateObject({
    model: anthropic('claude-haiku-4-5-20251001'),
    schema: TranslationSchema,
    prompt: `You are a professional culinary translator specializing in kitchen/restaurant Spanish for the United States.

Translate the following recipe fields from English to Spanish. Follow these rules:
- Keep quantity abbreviations in English (oz, fl oz, Tbsp, tsp, lb, each)
- Translate ingredient names, step instructions, and plateware naturally
- Use kitchen-standard Spanish (e.g. "saltear" not "sofreír" for sauté, "gratinar" for broil)
- Keep proper nouns (Sriracha, etc.) unchanged
- Maintain the same tone — brief, imperative kitchen instructions

Recipe title: ${recipe.title}
Plateware: ${recipe.plateware ?? 'none'}
Ingredients: ${JSON.stringify(recipe.ingredients)}
Cook steps: ${JSON.stringify(recipe.cook_steps)}
Plate steps: ${JSON.stringify(recipe.plate_steps)}`,
  });
  return object;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const allRecipes = await db
    .select()
    .from(recipes)
    .where(eq(recipes.status, 'published'));

  const toTranslate = allRecipes.filter((r) => !r.title_es);

  if (toTranslate.length === 0) {
    console.log('✅ All recipes already have Spanish translations.');
    process.exit(0);
  }

  console.log(`🌐 Translating ${toTranslate.length} recipe(s) to Spanish…\n`);

  let success = 0;
  let failed = 0;

  for (const recipe of toTranslate) {
    try {
      const translation = await translateRecipe(recipe);
      await db
        .update(recipes)
        .set({
          title_es: translation.title_es,
          plateware_es: translation.plateware_es,
          ingredients_es: translation.ingredients_es,
          cook_steps_es: translation.cook_steps_es,
          plate_steps_es: translation.plate_steps_es,
          updated_at: new Date(),
        })
        .where(eq(recipes.id, recipe.id));
      console.log(`  ✓  ${recipe.title} → ${translation.title_es}`);
      success++;
    } catch (err) {
      console.error(`  ✗  ${recipe.title}: ${err}`);
      failed++;
    }
  }

  console.log(`\n✅ Done — ${success} translated, ${failed} failed`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Translation failed:', err);
  process.exit(1);
});
