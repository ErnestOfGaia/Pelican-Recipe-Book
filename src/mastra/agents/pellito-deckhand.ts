import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { listRecipes, getRecipe } from '@/db/recipes';
import type { RecipeRow } from '@/db/recipes';
import { searchBrain, loadBrain } from '@/lib/brain';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ---------------------------------------------------------------------------
// Keyword classifier — routes obviously off-topic messages without LLM call
// ---------------------------------------------------------------------------
const RECIPE_PATTERNS = [
  // English food/recipe keywords
  /\bingredients?\b/i,
  /\brecipes?\b/i,
  /\bdish(es)?\b/i,
  /\bstep(s)?\b/i,
  /\bcook(ing|ed|s)?\b/i,
  /\bprepare\b|preparation|prep(ping)?\b/i,
  /\bplate(d|ing|s)?\b/i,
  /\bgarnish/i,
  /\bserv(e|ing|ings|ed|es)\b/i,
  /\ballergen|allerg(y|ic)/i,
  /\b(soy|gluten|dairy|nuts?|shellfish|fish|eggs?|wheat|lactose)\b/i,
  /\bshelf[ -]?life\b/i,
  /\byield\b/i,
  /\bsauces?\b|\bdressings?\b|\bmarinades?\b/i,
  /\bplateware\b/i,
  /\boz\b|\bounce(s)?\b|\bportion(s)?\b/i,
  // English compound patterns
  /how (do|to|can|should) (i|we|you) (make|cook|prep|plate|garnish|serve)/i,
  /what (is|are) (the )?(ingredients?|allergens?|steps?|yield|plateware|cook|plate)/i,
  /what goes (in|into)/i,
  /tell me (about|how)/i,
  /how (long|much|many) (do|does|should|will|to)/i,
  /\bpare?|pare?\b/i,
  /\bstation\b/i,
  /\b(saute|grill|fryer|pantry|pizza)\b/i,
  // Spanish food/recipe keywords
  /\bingredientes?\b/i,
  /\breceta\b/i,
  /\bpasos?\b/i,
  /\bcocinar?\b|\bcocción\b|\bcoc(ido|ina)\b/i,
  /\bpreparar?\b|\bpreparación\b/i,
  /\bemplatad[oa]\b|\bemplatar?\b/i,
  /\bservir\b|\bservicio\b/i,
  /\balérgenos?\b|\baler(gia|génico)\b/i,
  /\bvida útil\b/i,
  /\bvajilla\b/i,
  /\bporcione?s?\b/i,
  /\bsalsa\b|\baderez[oa]\b/i,
  /cuánto(s)?\b|\bcómo\b|\bqué (es|son|lleva|tiene)\b/i,
  /\bdime\b|\bcuéntame\b/i,
];

export function isRecipeQuery(message: string): boolean {
  return RECIPE_PATTERNS.some((p) => p.test(message));
}

// ---------------------------------------------------------------------------
// Context formatter — used when no brain is built yet (fallback) or for a known recipe
// ---------------------------------------------------------------------------
export function formatRecipesContext(recipes: RecipeRow[]): string {
  return recipes
    .map((r) => {
      const lines: (string | null)[] = [
        `RECIPE: ${r.title}`,
        `TYPE: ${r.recipe_type}`,
        r.station ? `STATION: ${r.station}` : null,
        r.yield ? `YIELD: ${r.yield}` : null,
        r.prep_time ? `PREP TIME: ${r.prep_time}` : null,
        r.shelf_life ? `SHELF LIFE: ${r.shelf_life}` : null,
        r.plateware ? `PLATEWARE: ${r.plateware}` : null,
        `INGREDIENTS: ${r.ingredients.join(' | ')}`,
        r.cook_steps.length > 0
          ? `COOK STEPS: ${r.cook_steps.map((s, i) => `${i + 1}. ${s}`).join(' | ')}`
          : null,
        r.plate_steps.length > 0
          ? `PLATE STEPS: ${r.plate_steps.map((s, i) => `${i + 1}. ${s}`).join(' | ')}`
          : null,
        r.allergens?.length ? `ALLERGENS: ${r.allergens.join(', ')}` : null,
        r.marketing_lore ? `DESCRIPTION: ${r.marketing_lore}` : null,
      ];
      return lines.filter(Boolean).join('\n');
    })
    .join('\n---\n');
}

export function isBrainReady(): boolean {
  return loadBrain().chunks.length > 0;
}

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------
const searchKnowledgeTool = createTool({
  id: 'searchKnowledge',
  description:
    'Semantic search over the Pelican Brewery recipe knowledge base. ' +
    'Use this first for any recipe question — pass the user\'s natural-language query ' +
    'and you\'ll get the most relevant recipe chunks back. Returns recipe content as text.',
  inputSchema: z.object({
    query: z.string().describe('The natural-language question to search for'),
    lang: z.enum(['en', 'es']).optional().describe('Preferred response language for ranking'),
    topK: z.number().int().min(1).max(8).optional().describe('How many chunks to return (default 4)'),
  }),
  execute: async ({ query, lang, topK = 4 }: { query: string; lang?: 'en' | 'es'; topK?: number }) => {
    try {
      const hits = await searchBrain(query, { topK, lang });
      if (hits.length === 0) {
        return {
          chunks: [],
          note: 'Brain is empty. Run `npm run ingest` to build it.',
        };
      }
      return {
        chunks: hits.map((h) => ({
          recipe_title: h.recipe_title,
          lang: h.lang,
          score: Number(h.score.toFixed(4)),
          content: h.content,
        })),
      };
    } catch (err) {
      return {
        chunks: [],
        error: err instanceof Error ? err.message : 'Unknown error during retrieval',
      };
    }
  },
});

const getRecipeTool = createTool({
  id: 'getRecipe',
  description:
    'Fetch one recipe by its UUID, or list every published recipe. Use this when you already ' +
    'know the recipe ID (e.g. when the chat is anchored to a specific recipe page) or when you ' +
    'need the full menu rather than a semantic search.',
  inputSchema: z.object({
    recipeId: z.string().optional().describe('Recipe UUID — omit to list all published recipes'),
  }),
  execute: async ({ recipeId }: { recipeId?: string }) => {
    if (recipeId) {
      const recipe = await getRecipe(recipeId);
      return recipe ? { recipes: [recipe] } : { recipes: [], error: 'Recipe not found' };
    }
    const recipes = await listRecipes({ status: 'published' });
    return { recipes };
  },
});

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------
export const pellitoDeckhhandAgent = new Agent({
  id: 'pellito-deckhand',
  name: 'Pellito Deckhand',
  instructions: `You are Pellito the Deckhand, a knowledgeable galley hand at Pelican Brewery in Pacific City, Oregon.
You help line cooks find and execute recipes quickly and confidently.

For ANY recipe question, ALWAYS call the searchKnowledge tool first with the user's question.
Use the chunks it returns as your grounded source of truth. Do not answer recipe questions from prior knowledge — answer only from the retrieved chunks.

If searchKnowledge returns no relevant chunks, say plainly: "I don't have that in my recipe book."
Do not make up ingredients, steps, timings, or other facts.

When the chat is already anchored to a specific recipe (you'll see a system note with the recipe ID), prefer getRecipe with that ID over search.

Keep answers practical and concise — line cooks are busy.
Do not discuss topics unrelated to the recipes (legal, personal, medical, staffing, etc.).
IMPORTANT: If the user's message is written in Spanish or contains primarily Spanish words, respond entirely in Spanish, and pass lang: 'es' to searchKnowledge to bias toward Spanish chunks.`,
  model: anthropic('claude-haiku-4-5-20251001'),
  tools: { searchKnowledgeTool, getRecipeTool },
});
