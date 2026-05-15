'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export type BottomNavTab = 'dashboard' | 'recipes' | 'quizzes' | 'settings';

const TABS: { id: BottomNavTab; labelKey: 'navDashboard' | 'navRecipes' | 'navQuizzes' | 'navSettings'; icon: string; href: string }[] = [
  { id: 'dashboard', labelKey: 'navDashboard', icon: 'dashboard', href: '/home' },
  { id: 'recipes', labelKey: 'navRecipes', icon: 'restaurant_menu', href: '/dashboard' },
  { id: 'quizzes', labelKey: 'navQuizzes', icon: 'quiz', href: '/quiz' },
  { id: 'settings', labelKey: 'navSettings', icon: 'settings', href: '/settings' },
];

export function BottomNav({ activeTab }: { activeTab: BottomNavTab }) {
  const { t } = useLanguage();

  return (
    <nav className="bg-white border-t-2 border-[#001b3c] h-[80px] fixed bottom-0 w-full flex justify-around z-40">
      {TABS.map(tab => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
            tab.id === activeTab
              ? 'bg-[#526a8d] text-white'
              : 'text-[#001b3c] hover:bg-[#f0f3ff]'
          }`}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={tab.id === activeTab ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            {tab.icon}
          </span>
          <span className="font-grotesk font-bold uppercase tracking-wider text-xs">
            {t(tab.labelKey)}
          </span>
        </Link>
      ))}
    </nav>
  );
}
