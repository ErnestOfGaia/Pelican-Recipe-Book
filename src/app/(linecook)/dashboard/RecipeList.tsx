'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { RecipeRow } from '@/db/recipes';
import { ChatDrawer } from '@/components/ChatDrawer';
import { BottomNav } from '@/components/BottomNav';

type FilterType = 'ALL' | 'Saute' | 'Grill' | 'Fryer' | 'Pantry' | 'Pizza';

const STATIONS: FilterType[] = ['ALL', 'Saute', 'Grill', 'Fryer', 'Pantry', 'Pizza'];

export default function RecipeList({ initialRecipes }: { initialRecipes: RecipeRow[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [chatOpen, setChatOpen] = useState(false);

  const filtered = useMemo(() => {
    return initialRecipes.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'ALL' || r.station === filter;
      return matchesSearch && matchesFilter;
    });
  }, [initialRecipes, search, filter]);

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      {/* Top App Bar */}
      <header className="bg-white border-b-2 border-[#001b3c] h-[64px] fixed top-0 z-50 w-full flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#001b3c] cursor-pointer">menu</span>
          <span className="font-grotesk font-black uppercase text-[#001b3c] text-xl tracking-tight">
            PELLITO HUB
          </span>
        </div>
        <span className="font-grotesk font-bold uppercase text-[#526a8d] text-sm">EN | ES</span>
      </header>

      {/* Main content */}
      <main className="pt-[64px] pb-[100px] px-6 max-w-6xl mx-auto">
        {/* Page heading */}
        <div className="py-6 border-b-2 border-[#001b3c] mb-6">
          <h1 className="font-grotesk font-black uppercase text-[#001b3c] text-5xl md:text-6xl tracking-tight leading-none">
            GALLEY RECIPES
          </h1>
          <p className="text-[#43474e] mt-2 text-lg">Pelican Brewery Kitchen Operations</p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#74777f] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="SEARCH RECIPES"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-[64px] w-full bg-white border-b-2 border-[#001b3c] pl-12 pr-4 font-grotesk uppercase tracking-widest text-[#001b3c] placeholder:text-[#74777f]/50 focus:border-2 focus:border-[#526a8d] outline-none text-base"
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {STATIONS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 font-grotesk font-bold uppercase tracking-[0.1em] text-base border-2 border-[#001b3c] transition-colors active:translate-y-[2px] active:translate-x-[2px] ${
                filter === f
                  ? 'bg-[#526a8d] text-white'
                  : 'bg-white text-[#001b3c] hover:bg-[#f0f3ff]'
              }`}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-[#43474e] text-sm font-grotesk uppercase tracking-wide self-center">
            {filtered.length} recipes
          </span>
        </div>

        {/* Recipe grid */}
        {filtered.length === 0 ? (
          <div className="border-2 border-[#001b3c] bg-white p-16 text-center">
            <span className="material-symbols-outlined text-[#74777f] text-6xl block">restaurant_menu</span>
            <p className="font-grotesk uppercase font-bold text-[#001b3c] mt-4 text-lg tracking-wide">
              No recipes found
            </p>
            <p className="text-[#43474e] mt-2 text-base">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab="recipes" />

      {/* Pellito Chat FAB */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-[100px] right-6 w-16 h-16 bg-[#526a8d] rounded-full border-2 border-white/20 z-50 flex items-center justify-center text-white active:scale-95 transition-transform"
        aria-label="Ask Pellito"
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          forum
        </span>
      </button>

      <ChatDrawer isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: RecipeRow }) {
  return (
    <Link href={`/dashboard/${recipe.id}`} className="flex">
      <article className="bg-white border-2 border-[#001b3c] flex flex-col overflow-hidden hover:border-[#526a8d] transition-colors duration-200 cursor-pointer w-full group">
        {/* Placeholder band — no image field in schema */}
        <div className="h-32 bg-[#526a8d]/10 border-b-2 border-[#001b3c] flex items-center justify-center relative">
          <span className="font-grotesk font-bold uppercase tracking-[0.15em] text-xs text-[#526a8d]">
            {recipe.station ?? recipe.recipe_type}
          </span>
          {recipe.prep_time && (
            <div className="absolute top-3 right-3 bg-[#e7eeff] border border-[#74777f] px-2 py-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-[#001b3c]">timer</span>
              <span className="font-grotesk font-bold text-xs uppercase tracking-wide text-[#001b3c]">
                {recipe.prep_time}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 gap-1">
          <h2 className="font-grotesk font-semibold uppercase text-[#001b3c] text-lg leading-tight">
            {recipe.title}
          </h2>
          {recipe.yield && (
            <p className="text-[#43474e] text-base">Yield: {recipe.yield}</p>
          )}
          {recipe.shelf_life && (
            <p className="text-[#43474e] text-base">Shelf life: {recipe.shelf_life}</p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f0f3ff] border-t-2 border-[#001b3c] px-4 py-3 flex items-center justify-between">
          <span className="text-[#43474e] text-xs font-grotesk uppercase tracking-wide">
            {recipe.ingredients.length} items
          </span>
          <span className="font-grotesk font-bold uppercase tracking-widest text-xs text-[#526a8d] border-2 border-[#001b3c] bg-white px-3 py-2 group-hover:bg-[#526a8d] group-hover:text-white transition-colors">
            VIEW OPS
          </span>
        </div>
      </article>
    </Link>
  );
}

