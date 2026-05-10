/**
 * Deterministic quiz-question generator — builds template questions from recipe
 * fields. Same recipe id always yields the same questions/order so re-running
 * import on a brand-new DB produces stable output.
 *
 * No LLM. Future versions can swap the body of `generateQuestionsForRecipe`
 * without changing callers.
 */
import type { RecipeRow } from '@/db/recipes';
import type { quizQuestions } from '@/db/schema';

export type NewQuizQuestion = Omit<typeof quizQuestions.$inferInsert, 'id' | 'created_at'>;

const STATIONS = ['Saute', 'Grill', 'Fryer', 'Pantry', 'Pizza'];
const PREP_DECOYS = ['5 min', '15 min', '30 min', '1 hour'];

/** Tiny seeded RNG (mulberry32) — stable across runs for a given seed. */
function rngFromString(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Pick `count` distinct items from `pool` excluding any in `exclude`. */
function pickDistractors(
  pool: string[],
  exclude: Set<string>,
  count: number,
  rand: () => number,
): string[] {
  const candidates = Array.from(new Set(pool)).filter(p => p && !exclude.has(p));
  const shuffled = shuffle(candidates, rand);
  return shuffled.slice(0, count);
}

function buildChoices(
  correct: string,
  distractors: string[],
  rand: () => number,
): { choices: string[]; correct_index: number } {
  const choices = shuffle([correct, ...distractors], rand);
  return { choices, correct_index: choices.indexOf(correct) };
}

export interface DistractorPool {
  ingredients: string[];
  cookSteps: string[];
}

export function buildDistractorPool(allRecipes: RecipeRow[]): DistractorPool {
  const ingredients: string[] = [];
  const cookSteps: string[] = [];
  for (const r of allRecipes) {
    if (Array.isArray(r.ingredients)) ingredients.push(...r.ingredients);
    if (Array.isArray(r.cook_steps)) cookSteps.push(...r.cook_steps);
  }
  return { ingredients, cookSteps };
}

export function generateQuestionsForRecipe(
  recipe: RecipeRow,
  pool: DistractorPool,
): NewQuizQuestion[] {
  const rand = rngFromString(recipe.id);
  const out: NewQuizQuestion[] = [];

  // Easy: station
  if (recipe.station) {
    const distractors = STATIONS.filter(s => s !== recipe.station).slice(0, 3);
    const { choices, correct_index } = buildChoices(recipe.station, distractors, rand);
    out.push({
      recipe_id: recipe.id,
      difficulty: 'easy',
      question_text: `What station is ${recipe.title} cooked on?`,
      choices,
      correct_index,
      source_field: 'station',
    });
  }

  // Easy: prep_time
  if (recipe.prep_time) {
    const distractors = PREP_DECOYS.filter(d => d !== recipe.prep_time).slice(0, 3);
    const { choices, correct_index } = buildChoices(recipe.prep_time, distractors, rand);
    out.push({
      recipe_id: recipe.id,
      difficulty: 'easy',
      question_text: `What is the prep time for ${recipe.title}?`,
      choices,
      correct_index,
      source_field: 'prep_time',
    });
  }

  // Hard: ingredient
  const ingredients = recipe.ingredients ?? [];
  if (ingredients.length > 0) {
    const correct = ingredients[0];
    const exclude = new Set(ingredients);
    const distractors = pickDistractors(pool.ingredients, exclude, 3, rand);
    if (distractors.length === 3) {
      const { choices, correct_index } = buildChoices(correct, distractors, rand);
      out.push({
        recipe_id: recipe.id,
        difficulty: 'hard',
        question_text: `Which ingredient is in ${recipe.title}?`,
        choices,
        correct_index,
        source_field: 'ingredients',
      });
    }
  }

  // Hard: first cook step
  const cookSteps = recipe.cook_steps ?? [];
  if (cookSteps.length > 0) {
    const correct = cookSteps[0];
    const exclude = new Set(cookSteps);
    const distractors = pickDistractors(pool.cookSteps, exclude, 3, rand);
    if (distractors.length === 3) {
      const { choices, correct_index } = buildChoices(correct, distractors, rand);
      out.push({
        recipe_id: recipe.id,
        difficulty: 'hard',
        question_text: `Which is the first cook step for ${recipe.title}?`,
        choices,
        correct_index,
        source_field: 'cook_steps',
      });
    }
  }

  return out;
}
