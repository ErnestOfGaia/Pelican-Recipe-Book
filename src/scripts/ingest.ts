/**
 * RAG brain builder — embeds all published recipes via Voyage AI and writes brain.json.
 * Run with: npm run ingest
 *
 * Re-runnable: skips chunks whose content hash matches the existing brain entry.
 * Embeds both English and Spanish (when _es fields are populated) so the agent
 * can retrieve cross-lingually.
 *
 * Env: VOYAGE_API_KEY required. BRAIN_PATH optional (defaults to data/brain.json).
 */
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { recipes } from '../db/schema';
import { brainPath, embedDocuments, type Brain, type BrainChunk } from '../lib/brain';

type Recipe = typeof recipes.$inferSelect;

function pick<T>(es: T[] | null | undefined, en: T[]): T[] {
  return es && es.length ? es : en;
}

function serializeRecipe(r: Recipe, lang: 'en' | 'es'): string {
  const title = lang === 'es' && r.title_es ? r.title_es : r.title;
  const plateware = lang === 'es' && r.plateware_es ? r.plateware_es : r.plateware;
  const ingredients = lang === 'es' ? pick(r.ingredients_es, r.ingredients) : r.ingredients;
  const cookSteps = lang === 'es' ? pick(r.cook_steps_es, r.cook_steps) : r.cook_steps;
  const plateSteps = lang === 'es' ? pick(r.plate_steps_es, r.plate_steps) : r.plate_steps;

  const lines: (string | false | null)[] = [
    `Recipe: ${title}`,
    `Type: ${r.recipe_type}`,
    r.station && `Station: ${r.station}`,
    plateware && `Plateware: ${plateware}`,
    r.yield && `Yield: ${r.yield}`,
    r.prep_time && `Prep time: ${r.prep_time}`,
    r.shelf_life && `Shelf life: ${r.shelf_life}`,
    ingredients.length > 0 && `Ingredients: ${ingredients.join(' | ')}`,
    cookSteps.length > 0 && `Cook steps: ${cookSteps.map((s, i) => `${i + 1}. ${s}`).join(' ')}`,
    plateSteps.length > 0 && `Plating: ${plateSteps.map((s, i) => `${i + 1}. ${s}`).join(' ')}`,
    r.allergens?.length ? `Allergens: ${r.allergens.join(', ')}` : null,
    r.marketing_lore && `Description: ${r.marketing_lore}`,
  ];
  return lines.filter(Boolean).join('\n');
}

function hashContent(s: string): string {
  return createHash('sha256').update(s).digest('hex').slice(0, 16);
}

function hasAnySpanishContent(r: Recipe): boolean {
  return Boolean(
    r.title_es ||
      r.plateware_es ||
      r.ingredients_es?.length ||
      r.cook_steps_es?.length ||
      r.plate_steps_es?.length,
  );
}

async function ingest() {
  if (!process.env.VOYAGE_API_KEY) {
    console.error('❌ VOYAGE_API_KEY is not set. Add it to .env and re-run.');
    process.exit(1);
  }

  const client = createClient({ url: `file:${path.join(process.cwd(), 'data/dev.db')}` });
  const db = drizzle(client);

  const allRecipes = await db.select().from(recipes).where(eq(recipes.status, 'published'));
  console.log(`📚 ${allRecipes.length} published recipes`);

  const outPath = brainPath();
  let existing: Brain = { model: 'voyage-3-lite', generated_at: '', chunks: [] };
  if (fs.existsSync(outPath)) {
    existing = JSON.parse(fs.readFileSync(outPath, 'utf-8')) as Brain;
    console.log(`🧠 Existing brain: ${existing.chunks.length} chunks (${existing.generated_at || 'unknown date'})`);
  }
  const existingByKey = new Map<string, BrainChunk>();
  for (const c of existing.chunks) existingByKey.set(`${c.recipe_id}-${c.lang}`, c);

  type Pending = {
    key: string;
    recipe_id: string;
    recipe_title: string;
    lang: 'en' | 'es';
    content: string;
    content_hash: string;
  };
  const toEmbed: Pending[] = [];
  const reusable: BrainChunk[] = [];

  for (const r of allRecipes) {
    const langs: ('en' | 'es')[] = ['en'];
    if (hasAnySpanishContent(r)) langs.push('es');

    for (const lang of langs) {
      const content = serializeRecipe(r, lang);
      const content_hash = hashContent(content);
      const key = `${r.id}-${lang}`;
      const prev = existingByKey.get(key);
      if (prev && prev.content_hash === content_hash) {
        reusable.push(prev);
      } else {
        toEmbed.push({ key, recipe_id: r.id, recipe_title: r.title, lang, content, content_hash });
      }
    }
  }

  console.log(`✅ ${reusable.length} unchanged (skipped)`);
  console.log(`🔁 ${toEmbed.length} to (re)embed`);

  const startedAt = Date.now();
  const newChunks: BrainChunk[] = [];
  const BATCH = 64;

  for (let i = 0; i < toEmbed.length; i += BATCH) {
    const batch = toEmbed.slice(i, i + BATCH);
    const n = Math.floor(i / BATCH) + 1;
    const total = Math.ceil(toEmbed.length / BATCH);
    console.log(`  Batch ${n}/${total} — ${batch.length} items…`);
    const vectors = await embedDocuments(batch.map((b) => b.content));
    for (let j = 0; j < batch.length; j++) {
      const b = batch[j];
      newChunks.push({
        recipe_id: b.recipe_id,
        recipe_title: b.recipe_title,
        lang: b.lang,
        content: b.content,
        content_hash: b.content_hash,
        embedding: vectors[j],
      });
    }
  }

  const brain: Brain = {
    model: 'voyage-3-lite',
    generated_at: new Date().toISOString(),
    chunks: [...reusable, ...newChunks],
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(brain));

  const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);

  // voyage-3-lite is $0.02 / 1M tokens. Recipe chunks average ~400-600 tokens.
  const estTokens = toEmbed.reduce((acc, p) => acc + Math.ceil(p.content.length / 4), 0);
  const estCost = (estTokens * 0.02) / 1_000_000;

  console.log('');
  console.log(`✨ Wrote ${brain.chunks.length} chunks to ${outPath} (${sizeKB} KB)`);
  console.log(`⏱  ${elapsedSec}s elapsed for ${toEmbed.length} new embeddings`);
  console.log(`💸 Estimated cost: ~$${estCost.toFixed(4)} (${estTokens.toLocaleString()} tokens @ $0.02/1M)`);
}

ingest().catch((err) => {
  console.error('❌ Ingest failed:', err);
  process.exit(1);
});
