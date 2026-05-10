'use client';

import { useState } from 'react';
import { QuizDrawer } from '@/components/QuizDrawer';

export default function QuizCTA({
  recipeId,
  recipeTitle,
}: {
  recipeId: string;
  recipeTitle: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="px-6 pt-2 pb-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-3 bg-[#001b3c] text-white border-2 border-[#001b3c] py-5 font-grotesk font-black uppercase tracking-widest text-base hover:bg-[#526a8d] active:bg-[#3d5270] transition-colors"
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            quiz
          </span>
          Quiz Yourself On This Recipe
        </button>
      </section>

      <QuizDrawer
        isOpen={open}
        onClose={() => setOpen(false)}
        recipeId={recipeId}
        recipeTitle={recipeTitle}
      />
    </>
  );
}
