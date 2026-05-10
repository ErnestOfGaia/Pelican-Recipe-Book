import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { recipes, quizQuestions } from '@/db/schema';
import { listRecipes } from '@/db/recipes';
import { verifySession, COOKIE_NAME } from '@/lib/session';
import { parseCsvText, parsePipeArray } from '@/lib/csv';
import { buildDistractorPool, generateQuestionsForRecipe } from '@/lib/quiz-generator';

const REQUIRED_COLUMNS = ['title', 'recipe_type', 'ingredients', 'cook_steps', 'plate_steps'];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export interface ImportSummary {
  inserted: number;
  updated: number;
  failed: number;
  errors: string[];
}

async function getRole(req: NextRequest) {
  const cookieValue = req.cookies.get(COOKIE_NAME)?.value ?? null;
  return cookieValue ? await verifySession(cookieValue) : null;
}

export async function POST(req: NextRequest) {
  const role = await getRole(req);
  if (role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file field' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 2MB limit' }, { status: 400 });
  }

  const text = await file.text();
  const { headers, rows } = parseCsvText(text);
  const missing = REQUIRED_COLUMNS.filter(c => !headers.includes(c));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required columns: ${missing.join(', ')}` },
      { status: 400 },
    );
  }

  const summary: ImportSummary = { inserted: 0, updated: 0, failed: 0, errors: [] };
  const newRecipeIds: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; // header is line 1
    const row = rows[i];
    const title = row.title?.trim();

    if (!title) {
      summary.failed++;
      summary.errors.push(`row ${rowNum}: missing title`);
      continue;
    }

    try {
      const record = {
        title,
        recipe_type: row.recipe_type?.trim() || 'Core',
        station: row.station?.trim() || null,
        is_new: row.is_new?.trim().toLowerCase() === 'true',
        yield: row.yield?.trim() || null,
        prep_time: row.prep_time?.trim() || null,
        shelf_life: row.shelf_life?.trim() || null,
        original_date: row.original_date?.trim() || null,
        revision_date: row.revision_date?.trim() || null,
        plateware: row.plateware?.trim() || null,
        ingredients: parsePipeArray(row.ingredients ?? ''),
        cook_steps: parsePipeArray(row.cook_steps ?? ''),
        plate_steps: parsePipeArray(row.plate_steps ?? ''),
        allergens: parsePipeArray(row.allergens ?? ''),
        marketing_lore: row.marketing_lore?.trim() || null,
        status: ((row.status?.trim() as 'draft' | 'published' | 'archived') || 'published'),
        updated_at: new Date(),
      };

      const existing = await db
        .select({ id: recipes.id })
        .from(recipes)
        .where(eq(recipes.title, title))
        .limit(1);

      if (existing.length > 0) {
        await db.update(recipes).set(record).where(eq(recipes.title, title));
        summary.updated++;
      } else {
        const [inserted] = await db.insert(recipes).values(record).returning({ id: recipes.id });
        summary.inserted++;
        if (inserted?.id) newRecipeIds.push(inserted.id);
      }
    } catch (err) {
      summary.failed++;
      const msg = err instanceof Error ? err.message : String(err);
      summary.errors.push(`row ${rowNum} (${title}): ${msg}`);
    }
  }

  // Generate quiz questions for newly inserted recipes only.
  if (newRecipeIds.length > 0) {
    const allRecipes = await listRecipes();
    const pool = buildDistractorPool(allRecipes);
    const newRecipes = allRecipes.filter(r => newRecipeIds.includes(r.id));

    for (const recipe of newRecipes) {
      try {
        const questions = generateQuestionsForRecipe(recipe, pool);
        if (questions.length > 0) {
          await db.insert(quizQuestions).values(questions);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        summary.errors.push(`quiz-gen for ${recipe.title}: ${msg}`);
      }
    }
  }

  return NextResponse.json(summary);
}
