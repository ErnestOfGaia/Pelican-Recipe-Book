'use client';

import { useState } from 'react';
import { ChatDrawer } from '@/components/ChatDrawer';
import { QuizDrawer } from '@/components/QuizDrawer';

export default function RecipeActions({
  recipeId,
  recipeTitle,
}: {
  recipeId: string;
  recipeTitle: string;
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      {/* Quiz FAB — sits above chat FAB */}
      <button
        onClick={() => setQuizOpen(true)}
        aria-label="Quiz yourself on this recipe"
        className="fixed bottom-[172px] right-6 w-14 h-14 bg-[#001b3c] rounded-full shadow-xl flex items-center justify-center text-white hover:bg-[#526a8d] active:bg-[#3d5270] transition-colors z-40"
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          quiz
        </span>
      </button>

      {/* Chat FAB */}
      <button
        onClick={() => setChatOpen(true)}
        aria-label="Ask Pellito about this recipe"
        className="fixed bottom-[100px] right-6 w-16 h-16 bg-[#526a8d] rounded-full shadow-xl flex items-center justify-center text-white hover:bg-[#3d5270] active:bg-[#2e3f55] transition-colors z-40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>

      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        recipeId={recipeId}
      />

      <QuizDrawer
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        recipeId={recipeId}
        recipeTitle={recipeTitle}
      />
    </>
  );
}
