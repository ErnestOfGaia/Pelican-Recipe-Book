import { getRecipe } from '@/db/recipes';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import RecipeActions from './RecipeActions';

export const dynamic = 'force-dynamic';

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) notFound();

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      {/* Top App Bar */}
      <header className="bg-white border-b-2 border-[#001b3c] h-[64px] fixed top-0 z-50 w-full flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center text-[#001b3c] hover:text-[#526a8d] transition-colors"
            aria-label="Back to recipes"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <span className="font-grotesk font-black uppercase text-[#001b3c] text-xl tracking-tight">
            PELLITO HUB
          </span>
        </div>
        <span className="font-grotesk font-bold uppercase text-[#526a8d] text-sm">EN | ES</span>
      </header>

      {/* Main content */}
      <main className="pt-[64px] pb-[160px] max-w-4xl mx-auto">
        {/* Recipe header band */}
        <div className="bg-[#526a8d]/10 border-b-2 border-[#001b3c] px-6 py-8">
          <span className="inline-block font-grotesk font-bold uppercase tracking-widest text-xs text-[#526a8d] border border-[#526a8d] px-2 py-1 mb-3">
            {recipe.recipe_type}
          </span>
          <h1 className="font-grotesk font-black uppercase text-[#001b3c] text-3xl leading-tight tracking-tight">
            {recipe.title}
          </h1>

          {/* Utility details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {recipe.yield && (
              <div className="border-2 border-[#001b3c] bg-white p-3">
                <div className="font-grotesk font-bold uppercase tracking-wide text-xs text-[#74777f]">
                  Yield
                </div>
                <div className="font-grotesk font-bold text-[#001b3c] mt-1 text-sm">{recipe.yield}</div>
              </div>
            )}
            {recipe.prep_time && (
              <div className="border-2 border-[#001b3c] bg-white p-3">
                <div className="font-grotesk font-bold uppercase tracking-wide text-xs text-[#74777f]">
                  Prep Time
                </div>
                <div className="font-grotesk font-bold text-[#001b3c] mt-1 text-sm">{recipe.prep_time}</div>
              </div>
            )}
            {recipe.shelf_life && (
              <div className="border-2 border-[#001b3c] bg-white p-3">
                <div className="font-grotesk font-bold uppercase tracking-wide text-xs text-[#74777f]">
                  Shelf Life
                </div>
                <div className="font-grotesk font-bold text-[#001b3c] mt-1 text-sm">{recipe.shelf_life}</div>
              </div>
            )}
            {recipe.plateware && (
              <div className="border-2 border-[#001b3c] bg-white p-3">
                <div className="font-grotesk font-bold uppercase tracking-wide text-xs text-[#74777f]">
                  Plateware
                </div>
                <div className="font-grotesk font-bold text-[#001b3c] mt-1 text-sm">{recipe.plateware}</div>
              </div>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="px-6 py-6 space-y-8">
          {/* Ingredients */}
          {recipe.ingredients.length > 0 && (
            <section>
              <h2 className="font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-lg border-l-4 border-[#526a8d] pl-4 mb-4">
                Ingredients
              </h2>
              <div className="border-2 border-[#001b3c] bg-white divide-y divide-[#74777f]/30">
                {recipe.ingredients.map((ing, i) => {
                  const { qty, name } = parseIngredient(ing);
                  return (
                    <div key={i} className="py-3 flex justify-between items-center px-4">
                      <span className="font-sans text-[#001b3c] text-base">{name}</span>
                      {qty && (
                        <span className="font-grotesk font-bold text-xs bg-[#e7eeff] border border-[#74777f] px-2 py-1 ml-4 whitespace-nowrap flex-shrink-0">
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
          {recipe.cook_steps.length > 0 && (
            <section>
              <h2 className="font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-lg border-l-4 border-[#526a8d] pl-4 mb-4">
                Cook Steps
              </h2>
              <div className="space-y-3">
                {recipe.cook_steps.map((step, i) => (
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
                    <p className="font-sans text-[#001b3c] text-base leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Plate Steps */}
          {recipe.plate_steps.length > 0 && (
            <section>
              <h2 className="font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-lg border-l-4 border-[#526a8d] pl-4 mb-4">
                Plating Steps
              </h2>
              <div className="space-y-3">
                {recipe.plate_steps.map((step, i) => (
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
                    <p className="font-sans text-[#001b3c] text-base leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Allergens */}
          {recipe.allergens && recipe.allergens.length > 0 && (
            <section>
              <h2 className="font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-lg border-l-4 border-[#526a8d] pl-4 mb-4">
                Allergens
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
      </main>

      {/* Bottom Nav */}
      <nav className="bg-white border-t-2 border-[#001b3c] h-[80px] fixed bottom-0 w-full flex justify-around z-40">
        {[
          { label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
          { label: 'Recipes', icon: 'restaurant_menu', href: '/dashboard', active: true },
          { label: 'Quizzes', icon: 'quiz', href: '/quiz' },
          { label: 'Settings', icon: 'settings', href: '/settings' },
        ].map(tab => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              tab.active ? 'bg-[#526a8d] text-white' : 'text-[#001b3c] hover:bg-[#f0f3ff]'
            }`}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={tab.active ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {tab.icon}
            </span>
            <span className="font-grotesk font-bold uppercase tracking-wider text-xs">{tab.label}</span>
          </Link>
        ))}
      </nav>

      {/* FABs + Drawers (client) */}
      <RecipeActions recipeId={recipe.id} recipeTitle={recipe.title} />
    </div>
  );
}

function parseIngredient(s: string): { qty: string; name: string } {
  const m = s.match(/^([\d.\/]+(?:\s+(?:each|fl oz|oz|tsp|Tbsp|cup|lb|g|kg))?)\s+(.+)$/i);
  return m ? { qty: m[1].trim(), name: m[2].trim() } : { qty: '', name: s };
}
