'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Lang } from './i18n';
import { i18n, type I18nKey } from './i18n';

const STORAGE_KEY = 'pellito_lang';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: I18nKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key) => i18n.en[key],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'es') setLangState('es');
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback((key: I18nKey) => i18n[lang][key], [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
