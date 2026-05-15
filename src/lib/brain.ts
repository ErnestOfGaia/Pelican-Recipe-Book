/**
 * Brain loader + retrieval — semantic search over recipe embeddings.
 * brain.json is produced by `npm run ingest` and lives at data/brain.json by default.
 */
import fs from 'fs';
import path from 'path';

export interface BrainChunk {
  recipe_id: string;
  recipe_title: string;
  lang: 'en' | 'es';
  content: string;        // serialized recipe text used for embedding + grounding
  content_hash: string;   // sha256(content), used by ingest to skip unchanged chunks
  embedding: number[];
}

export interface Brain {
  model: string;
  generated_at: string;
  chunks: BrainChunk[];
}

const VOYAGE_EMBED_URL = 'https://api.voyageai.com/v1/embeddings';
const VOYAGE_MODEL = 'voyage-3-lite';

let cached: Brain | null = null;

export function brainPath(): string {
  return process.env.BRAIN_PATH || path.join(process.cwd(), 'data/brain.json');
}

export function loadBrain(): Brain {
  if (cached) return cached;
  const p = brainPath();
  if (!fs.existsSync(p)) {
    cached = { model: VOYAGE_MODEL, generated_at: '', chunks: [] };
    return cached;
  }
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    const parsed = JSON.parse(raw) as Brain;
    if (!parsed || !Array.isArray(parsed.chunks)) {
      throw new Error('brain.json missing chunks array');
    }
    cached = parsed;
  } catch (err) {
    // Malformed brain.json (truncated write, corrupted file) — fall back to the
    // empty-brain behavior so the route hits the full-corpus fallback path
    // instead of 500-ing every request until someone SSHes in.
    console.error(`[brain] failed to load ${p}, falling back to empty brain:`, err);
    cached = { model: VOYAGE_MODEL, generated_at: '', chunks: [] };
  }
  return cached;
}

export function clearBrainCache() {
  cached = null;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function callVoyage(
  input: string[],
  inputType: 'query' | 'document',
  attempt = 1,
): Promise<number[][]> {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) throw new Error('VOYAGE_API_KEY is not set');
  const res = await fetch(VOYAGE_EMBED_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ input, model: VOYAGE_MODEL, input_type: inputType }),
  });

  // Retry on rate-limit with exponential backoff (free tier is 3 RPM / 10K TPM).
  if (res.status === 429 && attempt <= 5) {
    const wait = Math.min(60_000, 20_000 * attempt);
    console.warn(`  ⏳ Voyage 429 — waiting ${wait / 1000}s before retry ${attempt}/5…`);
    await sleep(wait);
    return callVoyage(input, inputType, attempt + 1);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Voyage API ${res.status}: ${body}`);
  }
  const json = (await res.json()) as { data: Array<{ embedding: number[]; index: number }> };
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

export async function embedQuery(text: string): Promise<number[]> {
  const [vec] = await callVoyage([text], 'query');
  return vec;
}

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  return callVoyage(texts, 'document');
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export interface RetrievedChunk extends BrainChunk {
  score: number;
}

/**
 * Search the brain for the top-k most relevant recipe chunks for a query.
 * Pass `lang` to bias toward that language's chunks (the cosine score is multiplied by 1.05
 * for matching-language chunks). Cross-language matches still rank when content overlaps.
 */
export async function searchBrain(
  query: string,
  opts: { topK?: number; lang?: 'en' | 'es' } = {},
): Promise<RetrievedChunk[]> {
  const { topK = 4, lang } = opts;
  const brain = loadBrain();
  if (brain.chunks.length === 0) return [];
  const qVec = await embedQuery(query);
  return brain.chunks
    .map((c) => {
      const base = cosine(qVec, c.embedding);
      const score = lang && c.lang === lang ? base * 1.05 : base;
      return { ...c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
