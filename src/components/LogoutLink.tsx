'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

export default function LogoutLink({
  variant = 'link',
}: {
  variant?: 'link' | 'button';
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const { lang } = useLanguage();

  const label = lang === 'es' ? 'Cerrar Sesión' : 'Log out';
  const busyLabel = lang === 'es' ? 'Cerrando…' : 'Logging out…';

  async function handle() {
    setBusy(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handle}
        disabled={busy}
        className="border-2 border-[#001b3c] bg-white px-6 py-3 font-grotesk font-bold uppercase tracking-widest text-base text-[#001b3c] hover:bg-[#ba1a1a] hover:text-white hover:border-[#ba1a1a] transition-colors disabled:opacity-50"
      >
        {busy ? busyLabel : label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      className="font-grotesk font-bold uppercase tracking-wide text-sm text-[#526a8d] hover:text-[#ba1a1a] underline disabled:opacity-50"
    >
      {busy ? busyLabel : label}
    </button>
  );
}
