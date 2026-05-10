'use client';

import { useEffect, useState } from 'react';

interface QuizQuestion {
  id: string;
  recipe_id: string;
  difficulty: 'easy' | 'hard';
  question_text: string;
  choices: string[];
  correct_index: number;
}

interface QuizDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recipeId: string;
  recipeTitle: string;
}

type Phase = 'idle' | 'loading' | 'easy' | 'easy-result' | 'hard' | 'hard-result';

interface Feedback {
  selected: number;
  isCorrect: boolean;
}

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

export function QuizDrawer({ isOpen, onClose, recipeId, recipeTitle }: QuizDrawerProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [easyQs, setEasyQs] = useState<QuizQuestion[]>([]);
  const [hardQs, setHardQs] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [easyScore, setEasyScore] = useState(0);
  const [hardScore, setHardScore] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setPhase('idle');
      setEasyQs([]);
      setHardQs([]);
      setCurrentIdx(0);
      setEasyScore(0);
      setHardScore(0);
      setFeedback(null);
      setError(null);
    }
  }, [isOpen]);

  async function startQuiz() {
    setPhase('loading');
    setError(null);
    try {
      const res = await fetch(`/api/quiz/${recipeId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.easy?.length) throw new Error('No questions available for this recipe.');
      setEasyQs(data.easy);
      setHardQs(data.hard ?? []);
      setCurrentIdx(0);
      setEasyScore(0);
      setHardScore(0);
      setPhase('easy');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz. Try again.');
      setPhase('idle');
    }
  }

  async function handleAnswer(selectedIdx: number) {
    if (feedback) return;
    const q = phase === 'easy' ? easyQs[currentIdx] : hardQs[currentIdx];
    const isCorrect = selectedIdx === q.correct_index;
    setFeedback({ selected: selectedIdx, isCorrect });
    if (phase === 'easy' && isCorrect) setEasyScore(s => s + 1);
    if (phase === 'hard' && isCorrect) setHardScore(s => s + 1);

    // Fire-and-forget metric recording
    fetch('/api/quiz/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_id: recipeId, question_id: q.id, correct: isCorrect }),
    }).catch(() => {});
  }

  function advance() {
    if (!feedback) return;
    const qs = phase === 'easy' ? easyQs : hardQs;
    const limit = phase === 'easy' ? 5 : 3;
    const next = currentIdx + 1;
    setFeedback(null);
    if (next < Math.min(qs.length, limit)) {
      setCurrentIdx(next);
    } else {
      setPhase(phase === 'easy' ? 'easy-result' : 'hard-result');
    }
  }

  function startHard() {
    setCurrentIdx(0);
    setHardScore(0);
    setFeedback(null);
    setPhase('hard');
  }

  const activeQs = (phase === 'easy' || phase === 'hard') ? (phase === 'easy' ? easyQs : hardQs) : [];
  const totalQs = phase === 'easy' ? Math.min(easyQs.length, 5) : Math.min(hardQs.length, 3);
  const currentQ = activeQs[currentIdx];
  const easyTotal = Math.min(easyQs.length, 5);
  const hardTotal = Math.min(hardQs.length, 3);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-40 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Recipe quiz"
        className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-[#f9f9ff] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '82vh', maxHeight: '700px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#001b3c] text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
            <span className="font-grotesk font-bold text-sm tracking-widest uppercase truncate max-w-[220px]">
              {recipeTitle}
            </span>
          </div>
          <button onClick={onClose} aria-label="Close quiz" className="text-white/70 hover:text-white text-xl leading-none ml-2 flex-shrink-0">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-6">

          {/* IDLE */}
          {phase === 'idle' && (
            <div className="flex flex-col items-center gap-6 mt-6 text-center">
              <span className="material-symbols-outlined text-7xl text-[#526a8d]" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
              <div>
                <p className="font-grotesk font-black uppercase text-[#001b3c] text-xl tracking-tight">Test yourself</p>
                <p className="font-sans text-[#74777f] text-sm mt-2 max-w-xs">
                  5 multiple-choice questions on this recipe. Easy questions test recall — ingredients, steps, plateware.
                </p>
              </div>
              {error && <p className="text-red-600 text-sm font-sans">{error}</p>}
              <button
                onClick={startQuiz}
                className="bg-[#001b3c] text-white font-grotesk font-bold uppercase tracking-wide px-10 py-3 hover:bg-[#526a8d] transition-colors"
              >
                Start Quiz
              </button>
            </div>
          )}

          {/* LOADING */}
          {phase === 'loading' && (
            <div className="flex items-center justify-center h-40">
              <p className="font-grotesk text-[#526a8d] animate-pulse tracking-wide">Loading questions…</p>
            </div>
          )}

          {/* EASY / HARD — question */}
          {(phase === 'easy' || phase === 'hard') && currentQ && (
            <div className="flex flex-col gap-5 max-w-lg mx-auto">
              {/* Progress bar */}
              <div className="flex items-center justify-between mb-1">
                <span className="font-grotesk font-bold uppercase text-xs text-[#526a8d] tracking-widest">
                  {phase === 'easy' ? 'Easy' : 'Hard'} · {currentIdx + 1}/{totalQs}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: totalQs }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-6 rounded-sm transition-colors ${
                        i < currentIdx ? 'bg-[#526a8d]' : i === currentIdx ? 'bg-[#001b3c]' : 'bg-[#74777f]/25'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question */}
              <div className="bg-[#001b3c] text-white px-5 py-4 border-l-4 border-[#526a8d]">
                <p className="font-sans text-base leading-relaxed whitespace-pre-wrap">{currentQ.question_text}</p>
              </div>

              {/* Choices */}
              <div className="flex flex-col gap-2">
                {currentQ.choices.map((choice, i) => {
                  const isCorrect = i === currentQ.correct_index;
                  const isSelected = feedback?.selected === i;
                  let cls =
                    'w-full border-2 border-[#001b3c] bg-white px-4 py-3 text-left font-sans text-[#001b3c] text-sm leading-snug flex items-start gap-3 hover:border-[#526a8d] hover:bg-[#f0f3ff] transition-colors cursor-pointer';

                  if (feedback) {
                    if (isCorrect) {
                      cls = 'w-full border-2 border-green-600 bg-green-50 px-4 py-3 text-left font-sans text-green-800 text-sm leading-snug flex items-start gap-3 cursor-default';
                    } else if (isSelected) {
                      cls = 'w-full border-2 border-red-500 bg-red-50 px-4 py-3 text-left font-sans text-red-700 text-sm leading-snug flex items-start gap-3 cursor-default';
                    } else {
                      cls = 'w-full border-2 border-[#74777f]/30 bg-white px-4 py-3 text-left font-sans text-[#74777f] text-sm leading-snug flex items-start gap-3 cursor-default opacity-50';
                    }
                  }

                  return (
                    <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={!!feedback}>
                      <span className="font-grotesk font-bold text-xs flex-shrink-0 mt-0.5 w-4">
                        {CHOICE_LABELS[i]}.
                      </span>
                      <span>{choice}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback + Next */}
              {feedback && (
                <div className="flex flex-col gap-3">
                  <div className={`flex items-start gap-2 px-4 py-3 ${feedback.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-700'}`}>
                    <span className="material-symbols-outlined text-xl flex-shrink-0 mt-0.5">
                      {feedback.isCorrect ? 'check_circle' : 'cancel'}
                    </span>
                    <span className="font-grotesk font-bold text-sm uppercase tracking-wide">
                      {feedback.isCorrect
                        ? 'Correct!'
                        : `Incorrect — answer: ${currentQ.choices[currentQ.correct_index]}`}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={advance}
                      className="bg-[#526a8d] text-white font-grotesk font-bold uppercase tracking-wide px-6 py-2.5 text-sm hover:bg-[#3d5270] transition-colors"
                    >
                      {currentIdx + 1 < totalQs ? 'Next →' : 'Results →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EASY RESULT */}
          {phase === 'easy-result' && (
            <div className="flex flex-col items-center gap-6 mt-4 text-center max-w-sm mx-auto">
              <span className="material-symbols-outlined text-7xl text-[#526a8d]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {easyScore === easyTotal ? 'emoji_events' : easyScore >= Math.ceil(easyTotal / 2) ? 'thumb_up' : 'sentiment_neutral'}
              </span>
              <div>
                <p className="font-grotesk font-black uppercase text-[#001b3c] text-3xl tracking-tight">
                  {easyScore} / {easyTotal}
                </p>
                <p className="font-sans text-[#74777f] text-sm mt-1">
                  {easyScore === easyTotal
                    ? 'Perfect! You know this recipe cold.'
                    : easyScore >= Math.ceil(easyTotal / 2)
                    ? 'Good work — keep it up!'
                    : 'Keep studying this one!'}
                </p>
              </div>

              {hardQs.length > 0 && (
                <div className="w-full flex flex-col gap-3 mt-2">
                  <p className="font-grotesk font-bold uppercase text-xs text-[#526a8d] tracking-widest">Want a challenge?</p>
                  <button
                    onClick={startHard}
                    className="w-full bg-[#001b3c] text-white font-grotesk font-bold uppercase tracking-wide px-6 py-3 hover:bg-[#526a8d] transition-colors"
                  >
                    Try 3 Harder Questions →
                  </button>
                </div>
              )}

              <button onClick={onClose} className="text-[#526a8d] font-grotesk font-bold uppercase text-xs tracking-widest underline mt-1">
                Done
              </button>
            </div>
          )}

          {/* HARD RESULT */}
          {phase === 'hard-result' && (
            <div className="flex flex-col items-center gap-6 mt-4 text-center max-w-sm mx-auto">
              <span className="material-symbols-outlined text-7xl text-[#526a8d]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {hardScore === hardTotal ? 'emoji_events' : hardScore >= 2 ? 'thumb_up' : 'sentiment_neutral'}
              </span>
              <div>
                <p className="font-grotesk font-black uppercase text-[#001b3c] text-3xl tracking-tight">
                  {hardScore} / {hardTotal}
                </p>
                <p className="font-sans text-[#74777f] text-sm mt-1">Hard questions done!</p>
              </div>

              <div className="bg-white border-2 border-[#001b3c] px-6 py-4 w-full">
                <p className="font-grotesk font-bold uppercase text-xs text-[#74777f] tracking-widest mb-1">Total score</p>
                <p className="font-grotesk font-black text-[#001b3c] text-2xl">
                  {easyScore + hardScore} / {easyTotal + hardTotal}
                </p>
              </div>

              <button
                onClick={onClose}
                className="bg-[#001b3c] text-white font-grotesk font-bold uppercase tracking-wide px-10 py-3 hover:bg-[#526a8d] transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
