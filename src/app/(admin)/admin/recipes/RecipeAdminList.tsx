'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { RecipeRow } from '@/db/recipes';
import ImportButton from './ImportButton';

type StatusFilter = 'ALL' | 'draft' | 'published' | 'archived';

const STATUS_FILTERS: StatusFilter[] = ['ALL', 'draft', 'published', 'archived'];

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-[#e7eeff] text-[#526a8d] border border-[#526a8d]',
  published: 'bg-[#d6f5e3] text-[#1a7a45] border border-[#1a7a45]',
  archived: 'bg-[#f5f5f5] text-[#74777f] border border-[#74777f]',
};

export default function RecipeAdminList({ initialRecipes }: { initialRecipes: RecipeRow[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const filtered = useMemo(() => {
    return initialRecipes.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [initialRecipes, search, statusFilter]);

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <header className="bg-white border-b-2 border-[#001b3c] h-[64px] fixed top-0 z-50 w-full flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center text-[#526a8d] hover:text-[#001b3c]">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </Link>
          <span className="font-grotesk font-black uppercase text-[#001b3c] text-lg tracking-tight">
            RECIPE MANAGEMENT
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ImportButton />
          <Link
            href="/admin/recipes/new"
            className="flex items-center gap-1 px-4 py-2 bg-[#526a8d] text-white border-2 border-[#001b3c] font-grotesk font-bold uppercase tracking-wide text-xs hover:bg-[#3a5273] transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            NEW RECIPE
          </Link>
        </div>
      </header>

      <main className="pt-[64px] pb-10 px-6 max-w-5xl mx-auto">
        <div className="py-6 border-b-2 border-[#001b3c] mb-6">
          <h1 className="font-grotesk font-black uppercase text-[#001b3c] text-3xl tracking-tight">
            ALL RECIPES
            <span className="ml-3 font-sans font-normal text-[#74777f] text-lg normal-case">
              ({initialRecipes.length})
            </span>
          </h1>
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#74777f]">
            search
          </span>
          <input
            type="text"
            placeholder="SEARCH RECIPES"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-[52px] w-full bg-white border-b-2 border-[#001b3c] pl-12 pr-4 font-grotesk uppercase tracking-widest text-[#001b3c] focus:border-[#526a8d] outline-none text-sm"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-5 py-1.5 font-grotesk font-bold uppercase tracking-[0.1em] text-xs border-2 border-[#001b3c] transition-colors ${
                statusFilter === f
                  ? 'bg-[#526a8d] text-white'
                  : 'bg-white text-[#001b3c] hover:bg-[#f0f3ff]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <p className="font-grotesk text-[#74777f] uppercase tracking-wide text-sm py-8 text-center border-2 border-[#001b3c] bg-white">
            No recipes match
          </p>
        ) : (
          <div className="border-2 border-[#001b3c] bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#001b3c] bg-[#e7eeff]">
                  <th className="text-left px-4 py-3 font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-xs">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-xs hidden sm:table-cell">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-xs hidden md:table-cell">
                    Station
                  </th>
                  <th className="text-left px-4 py-3 font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-xs">
                    Status
                  </th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((recipe, i) => (
                  <tr
                    key={recipe.id}
                    className={`border-b border-[#e7eeff] hover:bg-[#f0f3ff] transition-colors ${
                      i === filtered.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-sans text-[#001b3c] font-medium">
                      {recipe.title}
                      {recipe.is_new && (
                        <span className="ml-2 text-[10px] font-grotesk font-bold uppercase bg-[#526a8d] text-white px-1.5 py-0.5">
                          NEW
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-sans text-[#43474e] hidden sm:table-cell">
                      {recipe.recipe_type}
                    </td>
                    <td className="px-4 py-3 font-sans text-[#43474e] hidden md:table-cell">
                      {recipe.station ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 font-grotesk font-bold uppercase text-[10px] tracking-wide ${
                          STATUS_BADGE[recipe.status ?? 'draft']
                        }`}
                      >
                        {recipe.status ?? 'draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/recipes/${recipe.id}`}
                        className="inline-flex items-center text-[#526a8d] hover:text-[#001b3c]"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
