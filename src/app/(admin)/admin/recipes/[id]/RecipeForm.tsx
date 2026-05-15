'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { RecipeRow, QuizQuestionRow } from '@/db/recipes';

interface RecipeFormProps {
  recipe: RecipeRow | null;
  questions: QuizQuestionRow[];
}

function splitLines(raw: string): string[] {
  return raw.split('\n').map(s => s.trim()).filter(Boolean);
}
function splitPipes(raw: string): string[] {
  return raw.split('|').map(s => s.trim()).filter(Boolean);
}

const RECIPE_TYPES = ['Core', 'Specials'];
const STATIONS = ['', 'Saute', 'Grill', 'Fryer', 'Pantry', 'Pizza'];
const STATUSES = ['draft', 'published', 'archived'] as const;

const inputClass =
  'w-full px-4 py-2.5 border-2 border-[#001b3c] bg-white text-[#001b3c] font-sans text-sm focus:border-[#526a8d] outline-none';
const labelClass = 'block font-grotesk font-bold uppercase text-[#001b3c] text-xs tracking-wide mb-1';
const sectionClass = 'mb-8';
const sectionHeadingClass =
  'font-grotesk font-black uppercase text-[#001b3c] text-sm tracking-widest border-b-2 border-[#001b3c] pb-2 mb-4';

type Status = 'draft' | 'published' | 'archived';

export default function RecipeForm({ recipe, questions }: RecipeFormProps) {
  const router = useRouter();
  const isNew = recipe === null;

  const [title, setTitle] = useState(recipe?.title ?? '');
  const [recipeType, setRecipeType] = useState(recipe?.recipe_type ?? 'Core');
  const [station, setStation] = useState(recipe?.station ?? '');
  const [status, setStatus] = useState<Status>((recipe?.status as Status) ?? 'draft');
  const [isNewFlag, setIsNewFlag] = useState(recipe?.is_new ?? false);
  const [yieldVal, setYieldVal] = useState(recipe?.yield ?? '');
  const [prepTime, setPrepTime] = useState(recipe?.prep_time ?? '');
  const [shelfLife, setShelfLife] = useState(recipe?.shelf_life ?? '');
  const [originalDate, setOriginalDate] = useState(recipe?.original_date ?? '');
  const [revisionDate, setRevisionDate] = useState(recipe?.revision_date ?? '');
  const [plateware, setPlateware] = useState(recipe?.plateware ?? '');
  const [marketingLore, setMarketingLore] = useState(recipe?.marketing_lore ?? '');
  const [ingredientsRaw, setIngredientsRaw] = useState((recipe?.ingredients ?? []).join('\n'));
  const [cookStepsRaw, setCookStepsRaw] = useState((recipe?.cook_steps ?? []).join('\n'));
  const [plateStepsRaw, setPlateStepsRaw] = useState((recipe?.plate_steps ?? []).join('\n'));
  const [allergensRaw, setAllergensRaw] = useState((recipe?.allergens ?? []).join(' | '));

  const [titleEs, setTitleEs] = useState(recipe?.title_es ?? '');
  const [platewareEs, setPlatewareEs] = useState(recipe?.plateware_es ?? '');
  const [ingredientsEsRaw, setIngredientsEsRaw] = useState((recipe?.ingredients_es ?? []).join('\n'));
  const [cookStepsEsRaw, setCookStepsEsRaw] = useState((recipe?.cook_steps_es ?? []).join('\n'));
  const [plateStepsEsRaw, setPlateStepsEsRaw] = useState((recipe?.plate_steps_es ?? []).join('\n'));

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const [questionEdits, setQuestionEdits] = useState<Record<string, string>>(
    Object.fromEntries(questions.map(q => [q.id, q.question_text])),
  );
  const [questionSaving, setQuestionSaving] = useState<Record<string, boolean>>({});
  const [questionFeedback, setQuestionFeedback] = useState<
    Record<string, { ok: boolean; message: string } | null>
  >({});

  async function handleSave() {
    if (!title.trim()) {
      setFeedback({ ok: false, message: 'Title is required.' });
      return;
    }
    setSaving(true);
    setFeedback(null);

    const body = {
      title: title.trim(),
      recipe_type: recipeType,
      station: station || null,
      status,
      is_new: isNewFlag,
      yield: yieldVal || null,
      prep_time: prepTime || null,
      shelf_life: shelfLife || null,
      original_date: originalDate || null,
      revision_date: revisionDate || null,
      plateware: plateware || null,
      marketing_lore: marketingLore || null,
      ingredients: splitLines(ingredientsRaw),
      cook_steps: splitLines(cookStepsRaw),
      plate_steps: splitLines(plateStepsRaw),
      allergens: splitPipes(allergensRaw),
      title_es: titleEs.trim() || null,
      plateware_es: platewareEs.trim() || null,
      ingredients_es: splitLines(ingredientsEsRaw).length ? splitLines(ingredientsEsRaw) : null,
      cook_steps_es: splitLines(cookStepsEsRaw).length ? splitLines(cookStepsEsRaw) : null,
      plate_steps_es: splitLines(plateStepsEsRaw).length ? splitLines(plateStepsEsRaw) : null,
    };

    const url = isNew ? '/api/admin/recipes' : `/api/admin/recipes/${recipe!.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const saved = await res.json();
        setFeedback({ ok: true, message: 'Recipe saved.' });
        if (isNew) {
          router.replace(`/admin/recipes/${saved.id}`);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setFeedback({ ok: false, message: (err as { error?: string }).error ?? 'Save failed.' });
      }
    } catch {
      setFeedback({ ok: false, message: 'Network error — save failed.' });
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm('Delete this recipe? This cannot be undone.')) return;
    const res = await fetch(`/api/admin/recipes/${recipe!.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/recipes');
    } else {
      setFeedback({ ok: false, message: 'Delete failed.' });
    }
  }

  async function handleSaveQuestion(questionId: string) {
    setQuestionSaving(prev => ({ ...prev, [questionId]: true }));
    setQuestionFeedback(prev => ({ ...prev, [questionId]: null }));
    try {
      const res = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_text: questionEdits[questionId] }),
      });
      setQuestionFeedback(prev => ({
        ...prev,
        [questionId]: res.ok
          ? { ok: true, message: 'Saved.' }
          : { ok: false, message: 'Save failed.' },
      }));
    } catch {
      setQuestionFeedback(prev => ({
        ...prev,
        [questionId]: { ok: false, message: 'Network error.' },
      }));
    }
    setQuestionSaving(prev => ({ ...prev, [questionId]: false }));
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      {/* Fixed header */}
      <header className="bg-white border-b-2 border-[#001b3c] h-[64px] fixed top-0 z-50 w-full flex items-center justify-between px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/recipes" className="flex items-center text-[#526a8d] hover:text-[#001b3c] shrink-0">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </Link>
          <span className="font-grotesk font-black uppercase text-[#001b3c] text-base tracking-tight truncate">
            {isNew ? 'NEW RECIPE' : title || 'EDIT RECIPE'}
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 px-4 py-2 bg-[#526a8d] text-white border-2 border-[#001b3c] font-grotesk font-bold uppercase tracking-wide text-xs hover:bg-[#3a5273] transition-colors disabled:opacity-50 shrink-0"
        >
          <span className="material-symbols-outlined text-base">save</span>
          {saving ? 'SAVING…' : 'SAVE'}
        </button>
      </header>

      <main className="pt-[64px] pb-16 px-6 max-w-3xl mx-auto">
        <div className="py-6 border-b-2 border-[#001b3c] mb-8">
          <h1 className="font-grotesk font-black uppercase text-[#001b3c] text-3xl tracking-tight">
            {isNew ? 'NEW RECIPE' : 'EDIT RECIPE'}
          </h1>
        </div>

        {/* Basic Info */}
        <div className={sectionClass}>
          <p className={sectionHeadingClass}>BASIC INFO</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>
                Title <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className={inputClass}
                placeholder="Recipe title"
              />
            </div>
            <div>
              <label className={labelClass}>Recipe Type</label>
              <select
                value={recipeType}
                onChange={e => setRecipeType(e.target.value)}
                className={inputClass}
              >
                {RECIPE_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Station</label>
              <select
                value={station}
                onChange={e => setStation(e.target.value)}
                className={inputClass}
              >
                {STATIONS.map(s => (
                  <option key={s} value={s}>{s || '— none —'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Status)}
                className={inputClass}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                id="is_new"
                type="checkbox"
                checked={isNewFlag}
                onChange={e => setIsNewFlag(e.target.checked)}
                className="w-5 h-5 border-2 border-[#001b3c] accent-[#526a8d]"
              />
              <label htmlFor="is_new" className={labelClass + ' mb-0 cursor-pointer'}>
                Mark as New
              </label>
            </div>
          </div>
        </div>

        {/* Timing & Details */}
        <div className={sectionClass}>
          <p className={sectionHeadingClass}>TIMING &amp; DETAILS</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Yield</label>
              <input type="text" value={yieldVal} onChange={e => setYieldVal(e.target.value)} className={inputClass} placeholder="e.g. 1 portion" />
            </div>
            <div>
              <label className={labelClass}>Prep Time</label>
              <input type="text" value={prepTime} onChange={e => setPrepTime(e.target.value)} className={inputClass} placeholder="e.g. 5 min" />
            </div>
            <div>
              <label className={labelClass}>Shelf Life</label>
              <input type="text" value={shelfLife} onChange={e => setShelfLife(e.target.value)} className={inputClass} placeholder="e.g. 2 days" />
            </div>
            <div>
              <label className={labelClass}>Original Date</label>
              <input type="text" value={originalDate} onChange={e => setOriginalDate(e.target.value)} className={inputClass} placeholder="e.g. Jan 2024" />
            </div>
            <div>
              <label className={labelClass}>Revision Date</label>
              <input type="text" value={revisionDate} onChange={e => setRevisionDate(e.target.value)} className={inputClass} placeholder="e.g. Mar 2025" />
            </div>
            <div>
              <label className={labelClass}>Plateware</label>
              <input type="text" value={plateware} onChange={e => setPlateware(e.target.value)} className={inputClass} placeholder="e.g. 10″ round plate" />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className={sectionClass}>
          <p className={sectionHeadingClass}>INGREDIENTS</p>
          <p className="font-sans text-[#74777f] text-xs mb-2">One ingredient per line</p>
          <textarea
            value={ingredientsRaw}
            onChange={e => setIngredientsRaw(e.target.value)}
            rows={8}
            className={inputClass + ' resize-y'}
            placeholder={'6 oz salmon fillet&#10;2 tbsp olive oil&#10;1 lemon, sliced'}
          />
        </div>

        {/* Cook Steps */}
        <div className={sectionClass}>
          <p className={sectionHeadingClass}>COOK STEPS</p>
          <p className="font-sans text-[#74777f] text-xs mb-2">One step per line</p>
          <textarea
            value={cookStepsRaw}
            onChange={e => setCookStepsRaw(e.target.value)}
            rows={8}
            className={inputClass + ' resize-y'}
            placeholder={'Season salmon with salt and pepper&#10;Heat oil in pan over medium-high&#10;Cook 4 min per side'}
          />
        </div>

        {/* Plate Steps */}
        <div className={sectionClass}>
          <p className={sectionHeadingClass}>PLATE STEPS</p>
          <p className="font-sans text-[#74777f] text-xs mb-2">One step per line</p>
          <textarea
            value={plateStepsRaw}
            onChange={e => setPlateStepsRaw(e.target.value)}
            rows={6}
            className={inputClass + ' resize-y'}
            placeholder={'Place salmon at 6 o&#39;clock&#10;Fan lemon slices at 12 o&#39;clock'}
          />
        </div>

        {/* Allergens */}
        <div className={sectionClass}>
          <p className={sectionHeadingClass}>ALLERGENS</p>
          <p className="font-sans text-[#74777f] text-xs mb-2">Pipe-separated — e.g. Fish | Gluten | Dairy</p>
          <input
            type="text"
            value={allergensRaw}
            onChange={e => setAllergensRaw(e.target.value)}
            className={inputClass}
            placeholder="Fish | Gluten | Tree Nuts"
          />
        </div>

        {/* Marketing Lore */}
        <div className={sectionClass}>
          <p className={sectionHeadingClass}>MARKETING LORE</p>
          <textarea
            value={marketingLore}
            onChange={e => setMarketingLore(e.target.value)}
            rows={4}
            className={inputClass + ' resize-y'}
            placeholder="Flavour description shown to guests…"
          />
        </div>

        {/* Spanish Translations */}
        <div className={sectionClass}>
          <p className={sectionHeadingClass}>SPANISH TRANSLATIONS (ES)</p>
          <p className="font-sans text-[#74777f] text-xs mb-4">
            Leave blank to fall back to English. All fields optional.
          </p>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelClass}>Title (ES)</label>
              <input
                type="text"
                value={titleEs}
                onChange={e => setTitleEs(e.target.value)}
                className={inputClass}
                placeholder="Título en español"
              />
            </div>
            <div>
              <label className={labelClass}>Plateware (ES)</label>
              <input
                type="text"
                value={platewareEs}
                onChange={e => setPlatewareEs(e.target.value)}
                className={inputClass}
                placeholder="Vajilla"
              />
            </div>
            <div>
              <label className={labelClass}>Ingredients (ES) — one per line</label>
              <textarea
                value={ingredientsEsRaw}
                onChange={e => setIngredientsEsRaw(e.target.value)}
                rows={6}
                className={inputClass + ' resize-y'}
                placeholder={'6 oz filete de salmón\n2 cucharadas de aceite de oliva'}
              />
            </div>
            <div>
              <label className={labelClass}>Cook Steps (ES) — one per line</label>
              <textarea
                value={cookStepsEsRaw}
                onChange={e => setCookStepsEsRaw(e.target.value)}
                rows={6}
                className={inputClass + ' resize-y'}
                placeholder={'Sazonar el salmón con sal y pimienta\nCalentar el aceite a fuego medio-alto'}
              />
            </div>
            <div>
              <label className={labelClass}>Plate Steps (ES) — one per line</label>
              <textarea
                value={plateStepsEsRaw}
                onChange={e => setPlateStepsEsRaw(e.target.value)}
                rows={4}
                className={inputClass + ' resize-y'}
                placeholder={'Colocar el salmón a las 6 en punto'}
              />
            </div>
          </div>
        </div>

        {/* Feedback banner */}
        {feedback && (
          <div
            className={`flex items-center gap-2 border-2 px-4 py-3 mb-4 font-grotesk font-bold uppercase text-xs tracking-wide ${
              feedback.ok
                ? 'border-[#1a7a45] bg-[#d6f5e3] text-[#1a7a45]'
                : 'border-[#ba1a1a] bg-[#ffdad6] text-[#ba1a1a]'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {feedback.ok ? 'check_circle' : 'error'}
            </span>
            {feedback.message}
          </div>
        )}

        {/* Bottom save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-[#526a8d] text-white border-2 border-[#001b3c] font-grotesk font-bold uppercase tracking-widest text-sm hover:bg-[#3a5273] transition-colors disabled:opacity-50"
        >
          {saving ? 'SAVING…' : 'SAVE RECIPE'}
        </button>

        {/* Quiz Questions */}
        {!isNew && questions.length > 0 && (
          <div className="mt-12">
            <p className={sectionHeadingClass}>
              QUIZ QUESTIONS
              <span className="ml-2 font-sans font-normal normal-case text-[#74777f] text-xs">
                ({questions.length})
              </span>
            </p>
            <p className="font-sans text-[#74777f] text-xs mb-4">
              Edit question text only. Choices and answers are AI-generated.
            </p>
            <div className="space-y-4">
              {questions.map(q => (
                <div key={q.id} className="border-2 border-[#001b3c] bg-white p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-grotesk font-bold uppercase text-[10px] text-white bg-[#526a8d] px-2 py-0.5">
                      {q.difficulty}
                    </span>
                    <span className="font-sans text-[#74777f] text-xs">{q.source_field}</span>
                  </div>
                  <textarea
                    value={questionEdits[q.id] ?? q.question_text}
                    onChange={e =>
                      setQuestionEdits(prev => ({ ...prev, [q.id]: e.target.value }))
                    }
                    rows={3}
                    className={inputClass + ' resize-y'}
                  />
                  {questionFeedback[q.id] && (
                    <p
                      className={`font-grotesk text-xs mt-1 ${
                        questionFeedback[q.id]!.ok ? 'text-[#1a7a45]' : 'text-[#ba1a1a]'
                      }`}
                    >
                      {questionFeedback[q.id]!.message}
                    </p>
                  )}
                  <button
                    onClick={() => handleSaveQuestion(q.id)}
                    disabled={questionSaving[q.id]}
                    className="mt-2 px-4 py-1.5 border-2 border-[#001b3c] bg-[#526a8d] text-white font-grotesk font-bold uppercase tracking-wide text-xs hover:bg-[#3a5273] transition-colors disabled:opacity-50"
                  >
                    {questionSaving[q.id] ? 'SAVING…' : 'SAVE QUESTION'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete */}
        {!isNew && (
          <div className="mt-12 pt-8 border-t-2 border-[#e7eeff]">
            <p className={sectionHeadingClass + ' border-[#ba1a1a] text-[#ba1a1a]'}>
              DANGER ZONE
            </p>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-6 py-3 border-2 border-[#ba1a1a] text-[#ba1a1a] bg-white font-grotesk font-bold uppercase tracking-wide text-sm hover:bg-[#ffdad6] transition-colors"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              DELETE RECIPE
            </button>
            <p className="font-sans text-[#74777f] text-xs mt-2">
              Permanently removes this recipe and all associated quiz questions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
