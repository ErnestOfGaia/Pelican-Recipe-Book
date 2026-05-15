'use client';

import { useLanguage } from '@/lib/LanguageContext';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center border-2 border-[#001b3c] overflow-hidden font-grotesk font-bold text-sm">
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1 transition-colors ${
          lang === 'en'
            ? 'bg-[#526a8d] text-white'
            : 'bg-white text-[#001b3c] hover:bg-[#f0f3ff]'
        }`}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => setLang('es')}
        className={`px-3 py-1 transition-colors border-l-2 border-[#001b3c] ${
          lang === 'es'
            ? 'bg-[#526a8d] text-white'
            : 'bg-white text-[#001b3c] hover:bg-[#f0f3ff]'
        }`}
        aria-pressed={lang === 'es'}
      >
        ES
      </button>
    </div>
  );
}
