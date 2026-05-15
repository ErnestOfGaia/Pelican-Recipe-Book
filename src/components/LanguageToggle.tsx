'use client';

import { useLanguage } from '@/lib/LanguageContext';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1 font-grotesk font-bold text-sm">
      <button
        onClick={() => setLang('en')}
        className={`px-1 transition-colors ${
          lang === 'en' ? 'text-[#526a8d]' : 'text-[#74777f] hover:text-[#001b3c]'
        }`}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <span className="text-[#74777f]">|</span>
      <button
        onClick={() => setLang('es')}
        className={`px-1 transition-colors ${
          lang === 'es' ? 'text-[#526a8d]' : 'text-[#74777f] hover:text-[#001b3c]'
        }`}
        aria-pressed={lang === 'es'}
      >
        ES
      </button>
    </div>
  );
}
