export interface GeneratedQuestion {
  difficulty: 'easy' | 'hard';
  question_text: string;
  choices: string[];
  correct_index: number;
  source_field: string;
}

interface RecipeFields {
  ingredients: string[];
  plateware?: string | null;
  cook_steps: string[];
  plate_steps: string[];
}

const PLATEWARE_POOL = [
  'round dinner plate', 'oval ceramic plate', 'square plate', 'coupe bowl',
  'pasta bowl', 'soup bowl', 'cast iron skillet', 'wooden board',
  'wide-rim bowl', 'shallow bowl', 'ceramic ramekin', 'slate tile',
  'long rectangular plate', 'wicker basket', 'parchment-lined tray',
];

const FAKE_INGREDIENTS = [
  'truffle oil', 'saffron threads', 'tahini', 'miso paste', 'harissa',
  'anchovy paste', 'preserved lemon', 'sumac', "za'atar", 'pomegranate molasses',
  'fish sauce', 'oyster sauce', 'galangal', 'lemongrass', 'coconut cream',
  'tamarind paste', 'cardamom pods', 'fenugreek', 'dried hibiscus', 'mirin',
  'ras el hanout', 'black sesame oil', 'nori flakes', 'bonito flakes', 'yuzu juice',
];

const FAKE_QUANTITIES = [
  '1 oz', '2 oz', '3 oz', '4 oz', '6 oz', '8 oz', '1/2 cup', '1 cup',
  '2 cups', '1 Tbsp', '2 Tbsp', '1/4 cup', '1 tsp', '2 tsp', '1 lb', '2 lb',
  '1/2 lb', '1 each', '2 each', '3 each', '1/2 tsp', '3 Tbsp',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickN<T>(pool: T[], n: number, exclude: string[] = []): T[] {
  const excLower = exclude.map(s => s.toLowerCase());
  return shuffle(pool.filter(x => !excLower.includes(String(x).toLowerCase()))).slice(0, n);
}

function makeChoices(correct: string, distractors: string[]): { choices: string[]; correct_index: number } {
  const all = shuffle([correct, ...distractors.slice(0, 3)]);
  return { choices: all, correct_index: all.indexOf(correct) };
}

function trunc(s: string, max = 110): string {
  return s.length > max ? s.slice(0, max).trimEnd() + '…' : s;
}

function parseIngredient(s: string): { qty: string; name: string } {
  const m = s.match(/^([\d.\/]+(?:\s+(?:each|fl oz|oz|tsp|Tbsp|cup|lb|g|kg))?)\s+(.+)$/i);
  return m ? { qty: m[1].trim(), name: m[2].trim() } : { qty: '', name: s };
}

function push(arr: GeneratedQuestion[], q: GeneratedQuestion | null) {
  if (q) arr.push(q);
}

// ---------------------------------------------------------------------------
// Easy generators
// ---------------------------------------------------------------------------

function qPlateware(recipe: RecipeFields): GeneratedQuestion | null {
  if (!recipe.plateware) return null;
  const correct = recipe.plateware;
  const distractors = pickN(PLATEWARE_POOL, 3, [correct.toLowerCase()]);
  if (distractors.length < 3) return null;
  const { choices, correct_index } = makeChoices(correct, distractors);
  return { difficulty: 'easy', question_text: 'What plateware is used for this dish?', choices, correct_index, source_field: 'plateware' };
}

function qIngredientIs(recipe: RecipeFields): GeneratedQuestion | null {
  if (!recipe.ingredients.length) return null;
  const parsed = recipe.ingredients.map(parseIngredient);
  const { name } = parsed[0];
  const recipeNames = parsed.map(p => p.name.toLowerCase());
  const distractors = pickN(FAKE_INGREDIENTS, 3, recipeNames);
  if (distractors.length < 3) return null;
  const { choices, correct_index } = makeChoices(name, distractors);
  return { difficulty: 'easy', question_text: 'Which of these is an ingredient in this dish?', choices, correct_index, source_field: 'ingredients' };
}

function qIngredientIsNot(recipe: RecipeFields): GeneratedQuestion | null {
  if (recipe.ingredients.length < 3) return null;
  const parsed = recipe.ingredients.map(parseIngredient);
  const recipeNames = parsed.map(p => p.name);
  const fakes = pickN(FAKE_INGREDIENTS, 1, recipeNames.map(n => n.toLowerCase()));
  if (!fakes.length) return null;
  const distractors = shuffle(recipeNames).slice(0, 3);
  if (distractors.length < 3) return null;
  const { choices, correct_index } = makeChoices(fakes[0], distractors);
  return { difficulty: 'easy', question_text: 'Which of these is NOT an ingredient in this dish?', choices, correct_index, source_field: 'ingredients' };
}

function qCookStep(recipe: RecipeFields, idx: number): GeneratedQuestion | null {
  const steps = recipe.cook_steps;
  if (!steps.length) return null;
  const allSteps = [...steps, ...recipe.plate_steps];
  if (allSteps.length < 4) return null;
  const step = steps[idx % steps.length];
  const correct = trunc(step);
  const pool = allSteps.filter(s => s !== step).map(s => trunc(s));
  const distractors = pickN(pool, 3, [correct]);
  if (distractors.length < 3) return null;
  const { choices, correct_index } = makeChoices(correct, distractors);
  return { difficulty: 'easy', question_text: `What happens in cook step ${(idx % steps.length) + 1}?`, choices, correct_index, source_field: 'cook_steps' };
}

function qPlateStep(recipe: RecipeFields, idx: number): GeneratedQuestion | null {
  const steps = recipe.plate_steps;
  if (!steps.length) return null;
  const allSteps = [...recipe.cook_steps, ...steps];
  if (allSteps.length < 4) return null;
  const step = steps[idx % steps.length];
  const correct = trunc(step);
  const pool = allSteps.filter(s => s !== step).map(s => trunc(s));
  const distractors = pickN(pool, 3, [correct]);
  if (distractors.length < 3) return null;
  const { choices, correct_index } = makeChoices(correct, distractors);
  return { difficulty: 'easy', question_text: `What happens in plating step ${(idx % steps.length) + 1}?`, choices, correct_index, source_field: 'plate_steps' };
}

// ---------------------------------------------------------------------------
// Hard generators
// ---------------------------------------------------------------------------

function qStepAfter(recipe: RecipeFields, idx: number): GeneratedQuestion | null {
  const steps = recipe.cook_steps;
  if (steps.length < 3) return null;
  const i = idx % (steps.length - 1);
  const correct = trunc(steps[i + 1]);
  const pool = steps.filter((_, j) => j !== i && j !== i + 1).map(s => trunc(s));
  const distractors = pickN(pool, 3, [correct]);
  if (distractors.length < 3) return null;
  const { choices, correct_index } = makeChoices(correct, distractors);
  return {
    difficulty: 'hard',
    question_text: `In the cook process, what step comes AFTER:\n"${trunc(steps[i], 80)}"`,
    choices, correct_index, source_field: 'cook_steps',
  };
}

function qIngredientQty(recipe: RecipeFields): GeneratedQuestion | null {
  const withQty = recipe.ingredients.map(parseIngredient).filter(p => p.qty);
  if (!withQty.length) return null;
  const { qty, name } = withQty[0];
  const distractors = pickN(FAKE_QUANTITIES, 3, [qty]);
  if (distractors.length < 3) return null;
  const { choices, correct_index } = makeChoices(qty, distractors);
  return { difficulty: 'hard', question_text: `How much ${name} does this recipe use?`, choices, correct_index, source_field: 'ingredients' };
}

function qStepCount(recipe: RecipeFields, field: 'cook_steps' | 'plate_steps'): GeneratedQuestion | null {
  const steps = recipe[field];
  if (!steps.length) return null;
  const n = steps.length;
  const opts = shuffle([n - 2, n - 1, n + 1, n + 2, n + 3].filter(x => x > 0 && x !== n)).slice(0, 3);
  if (opts.length < 3) return null;
  const { choices, correct_index } = makeChoices(String(n), opts.map(String));
  const label = field === 'cook_steps' ? 'cook' : 'plating';
  return { difficulty: 'hard', question_text: `How many ${label} steps does this recipe have?`, choices, correct_index, source_field: field };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function generateQuestions(recipe: RecipeFields): GeneratedQuestion[] {
  const qs: GeneratedQuestion[] = [];

  push(qs, qPlateware(recipe));
  push(qs, qIngredientIs(recipe));
  push(qs, qIngredientIsNot(recipe));
  for (let i = 0; i < Math.min(recipe.cook_steps.length, 3); i++) push(qs, qCookStep(recipe, i));
  for (let i = 0; i < Math.min(recipe.plate_steps.length, 2); i++) push(qs, qPlateStep(recipe, i));

  for (let i = 0; i < Math.min(Math.max(recipe.cook_steps.length - 1, 0), 3); i++) push(qs, qStepAfter(recipe, i));
  push(qs, qIngredientQty(recipe));
  push(qs, qStepCount(recipe, 'cook_steps'));
  push(qs, qStepCount(recipe, 'plate_steps'));

  return qs;
}
