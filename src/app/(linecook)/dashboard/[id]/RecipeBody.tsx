'use client';

import { useLanguage } from '@/lib/LanguageContext';
import type { RecipeRow } from '@/db/recipes';

function parseIngredient(s: string): { qty: string; name: string } {
  const m = s.match(/^([\d.\/]+(?:\s+(?:each|fl oz|oz|tsp|Tbsp|cup|lb|g|kg))?)\s+(.+)$/i);
  return m ? { qty: m[1].trim(), name: m[2].trim() } : { qty: '', name: s };
}

export default function RecipeBody({ recipe }: { recipe: RecipeRow }) {
  const { lang, t } = useLanguage();

  const title = (lang === 'es' && recipe.title_es) ? recipe.title_es : recipe.title;
  const plateware = (lang === 'es' && recipe.plateware_es) ? recipe.plateware_es : recipe.plateware;
  const ingredients = (lang === 'es' && recipe.ingredients_es?.length) ? recipe.ingredients_es : recipe.ingredients;
  const cookSteps = (lang === 'es' && recipe.cook_steps_es?.length) ? recipe.cook_steps_es : recipe.cook_steps;
  const plateSteps = (lang === 'es' && recipe.plate_steps_es?.length) ? recipe.plate_steps_es : recipe.plate_steps;

  return (
    <>
      {/* Recipe header band */}
      <div className="bg-[#526a8d]/10 border-b-2 border-[#001b3c] px-6 py-8">
        <span className="inline-block font-grotesk font-bold uppercase tracking-widest text-xs text-[#526a8d] border border-[#526a8d] px-2 py-1 mb-3">
          {recipe.recipe_type}
        </span>
        <h1 className="font-grotesk font-black uppercase text-[#001b3c] text-4xl md:text-5xl leading-tight tracking-tight">
          {title}
        </h1>

        {/* Utility details grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {recipe.yield && (
            <div className="border-2 border-[#001b3c] bg-white p-3">
              <div className="font-grotesk font-bold uppercase tracking-wide text-xs text-[#74777f]">
                {t('labelYield')}
              </div>
              <div className="font-grotesk font-bold text-[#001b3c] mt-1 text-base">{recipe.yield}</div>
            </div>
          )}
          {recipe.prep_time && (
            <div className="border-2 border-[#001b3c] bg-white p-3">
              <div className="font-grotesk font-bold uppercase tracking-wide text-xs text-[#74777f]">
                {t('labelPrepTime')}
              </div>
              <div className="font-grotesk font-bold text-[#001b3c] mt-1 text-base">{recipe.prep_time}</div>
            </div>
          )}
          {recipe.shelf_life && (
            <div className="border-2 border-[#001b3c] bg-white p-3">
              <div className="font-grotesk font-bold uppercase tracking-wide text-xs text-[#74777f]">
                {t('labelShelfLife')}
              </div>
              <div className="font-grotesk font-bold text-[#001b3c] mt-1 text-base">{recipe.shelf_life}</div>
            </div>
          )}
          {plateware && (
            <div className="border-2 border-[#001b3c] bg-white p-3">
              <div className="font-grotesk font-bold uppercase tracking-wide text-xs text-[#74777f]">
                {t('labelPlateware')}
              </div>
              <div className="font-grotesk font-bold text-[#001b3c] mt-1 text-base">{plateware}</div>
            </div>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="px-6 py-6 space-y-8">
        {/* Ingredients */}
        {ingredients.length > 0 && (
          <section>
            <h2 className="font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-xl md:text-2xl border-l-4 border-[#526a8d] pl-4 mb-4">
              {t('sectionIngredients')}
            </h2>
            <div className="border-2 border-[#001b3c] bg-white divide-y divide-[#74777f]/30">
              {ingredients.map((ing, i) => {
                const { qty, name } = parseIngredient(ing);
                return (
                  <div key={i} className="py-3 flex justify-between items-center px-4">
                    <span className="font-sans text-[#001b3c] text-lg">{name}</span>
                    {qty && (
                      <span className="font-grotesk font-bold text-sm bg-[#e7eeff] border border-[#74777f] px-2 py-1 ml-4 whitespace-nowrap flex-shrink-0">
                        {qty}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Cook Steps */}
        {cookSteps.length > 0 && (
          <section>
            <h2 className="font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-xl md:text-2xl border-l-4 border-[#526a8d] pl-4 mb-4">
              {t('sectionCookSteps')}
            </h2>
            <div className="space-y-3">
              {cookSteps.map((step, i) => (
                <div
                  key={i}
                  className="border border-[#74777f] bg-white p-6 flex gap-4 hover:border-[#526a8d] transition-colors group relative"
                >
                  <span className="absolute top-4 right-6 text-xl font-bold text-[#526a8d] opacity-30 group-hover:opacity-100 font-grotesk transition-opacity">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[#526a8d] font-grotesk font-black text-xl flex-shrink-0 leading-none mt-0.5">
                    {i + 1}.
                  </span>
                  <p className="font-sans text-[#001b3c] text-lg leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Plate Steps */}
        {plateSteps.length > 0 && (
          <section>
            <h2 className="font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-xl md:text-2xl border-l-4 border-[#526a8d] pl-4 mb-4">
              {t('sectionPlatingSteps')}
            </h2>
            <div className="space-y-3">
              {plateSteps.map((step, i) => (
                <div
                  key={i}
                  className="border border-[#74777f] bg-white p-6 flex gap-4 hover:border-[#526a8d] transition-colors group relative"
                >
                  <span className="absolute top-4 right-6 text-xl font-bold text-[#526a8d] opacity-30 group-hover:opacity-100 font-grotesk transition-opacity">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[#526a8d] font-grotesk font-black text-xl flex-shrink-0 leading-none mt-0.5">
                    {i + 1}.
                  </span>
                  <p className="font-sans text-[#001b3c] text-lg leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Allergens */}
        {recipe.allergens && recipe.allergens.length > 0 && (
          <section>
            <h2 className="font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-xl md:text-2xl border-l-4 border-[#526a8d] pl-4 mb-4">
              {t('sectionAllergens')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {recipe.allergens.map((allergen, i) => (
                <span
                  key={i}
                  className="font-grotesk font-bold uppercase tracking-wide text-xs bg-[#ffdad6] border border-[#ba1a1a] text-[#ba1a1a] px-3 py-2"
                >
                  {allergen}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
