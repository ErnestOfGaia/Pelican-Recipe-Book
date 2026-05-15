'use client';

import Link from 'next/link';
import LogoutLink from '@/components/LogoutLink';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/lib/LanguageContext';

export default function SettingsContent({ role }: { role: string }) {
  const { t } = useLanguage();
  const isAdmin = role === 'admin';

  return (
    <main className="pt-[64px] pb-[100px] px-6 max-w-2xl mx-auto">
      <div className="py-6 border-b-2 border-[#001b3c] mb-6">
        <h1 className="font-grotesk font-black uppercase text-[#001b3c] text-5xl md:text-6xl tracking-tight leading-none">
          {t('settingsTitle')}
        </h1>
      </div>

      {/* Account */}
      <section className="mb-8">
        <h2 className="font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-xl border-l-4 border-[#526a8d] pl-4 mb-4">
          {t('settingsAccount')}
        </h2>
        <div className="border-2 border-[#001b3c] bg-white p-6 space-y-4">
          <Row label={t('settingsSignedInAs')} value={role} />
          <div className="pt-4 border-t border-[#74777f]/30 flex flex-col sm:flex-row gap-3">
            <LogoutLink variant="button" />
            <Link
              href="/login"
              className="border-2 border-[#001b3c] bg-white px-6 py-3 font-grotesk font-bold uppercase tracking-widest text-base text-[#001b3c] hover:bg-[#f0f3ff] transition-colors text-center"
            >
              {t('settingsSwitchRole')}
            </Link>
          </div>
          <p className="font-sans text-sm text-[#74777f]">
            {t('settingsSwitchRole')} {t('settingsSignedInAs').toLowerCase()} — use &ldquo;{t('settingsLogOut')}&rdquo; to fully end your session.
          </p>
        </div>
      </section>

      {/* Language */}
      <section className="mb-8">
        <h2 className="font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-xl border-l-4 border-[#526a8d] pl-4 mb-4">
          {t('settingsLanguage')}
        </h2>
        <div className="border-2 border-[#001b3c] bg-white p-6">
          <p className="font-sans text-sm text-[#43474e] mb-4">{t('settingsSelectLanguage')}</p>
          <LanguageToggleLarge />
        </div>
      </section>

      {isAdmin && (
        <section>
          <h2 className="font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-xl border-l-4 border-[#526a8d] pl-4 mb-4">
            Admin
          </h2>
          <Link
            href="/admin"
            className="border-2 border-[#001b3c] bg-white px-6 py-5 flex items-center gap-4 hover:bg-[#f0f3ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[#526a8d] text-3xl">build</span>
            <div className="flex-1">
              <p className="font-grotesk font-bold uppercase text-[#001b3c] text-lg tracking-tight">
                Manager dashboard
              </p>
              <p className="font-sans text-sm text-[#43474e] mt-0.5">
                Recipe CRUD, CSV import, and quiz generation.
              </p>
            </div>
            <span className="material-symbols-outlined text-[#74777f]">arrow_forward</span>
          </Link>
        </section>
      )}
    </main>
  );
}

function LanguageToggleLarge() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-6 py-3 font-grotesk font-bold uppercase tracking-[0.1em] text-base border-2 border-[#001b3c] transition-colors ${
          lang === 'en' ? 'bg-[#526a8d] text-white' : 'bg-white text-[#001b3c] hover:bg-[#f0f3ff]'
        }`}
      >
        EN — English
      </button>
      <button
        type="button"
        onClick={() => setLang('es')}
        className={`px-6 py-3 font-grotesk font-bold uppercase tracking-[0.1em] text-base border-2 border-[#001b3c] transition-colors ${
          lang === 'es' ? 'bg-[#526a8d] text-white' : 'bg-white text-[#001b3c] hover:bg-[#f0f3ff]'
        }`}
      >
        ES — Español
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-grotesk font-bold uppercase tracking-wide text-sm text-[#74777f]">
        {label}
      </span>
      <span className="font-grotesk font-bold uppercase text-[#001b3c] text-base tracking-tight">
        {value}
      </span>
    </div>
  );
}
