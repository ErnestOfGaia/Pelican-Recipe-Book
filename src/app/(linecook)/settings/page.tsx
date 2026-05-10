import Link from 'next/link';
import { getRole } from '@/lib/get-role';
import { BottomNav } from '@/components/BottomNav';
import LogoutLink from '@/components/LogoutLink';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const role = (await getRole()) ?? 'linecook';

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <header className="bg-white border-b-2 border-[#001b3c] h-[64px] fixed top-0 z-50 w-full flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#001b3c]">settings</span>
          <span className="font-grotesk font-black uppercase text-[#001b3c] text-xl tracking-tight">
            PELLITO HUB
          </span>
        </div>
        <span className="font-grotesk font-bold uppercase text-[#526a8d] text-sm">EN | ES</span>
      </header>

      <main className="pt-[64px] pb-[100px] px-6 max-w-2xl mx-auto">
        <div className="py-6 border-b-2 border-[#001b3c] mb-6">
          <h1 className="font-grotesk font-black uppercase text-[#001b3c] text-5xl md:text-6xl tracking-tight leading-none">
            SETTINGS
          </h1>
        </div>

        {/* Account */}
        <section className="mb-8">
          <h2 className="font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-xl border-l-4 border-[#526a8d] pl-4 mb-4">
            Account
          </h2>
          <div className="border-2 border-[#001b3c] bg-white p-6 space-y-4">
            <Row label="Signed in as" value={role} />
            <div className="pt-4 border-t border-[#74777f]/30 flex flex-col sm:flex-row gap-3">
              <LogoutLink variant="button" />
              <Link
                href="/login"
                className="border-2 border-[#001b3c] bg-white px-6 py-3 font-grotesk font-bold uppercase tracking-widest text-base text-[#001b3c] hover:bg-[#f0f3ff] transition-colors text-center"
              >
                Switch user
              </Link>
            </div>
            <p className="font-sans text-sm text-[#74777f]">
              "Switch user" sends you to the login page without clearing the current session.
              Use "Log out" to fully end the session before signing in as another role.
            </p>
          </div>
        </section>

        {/* Language */}
        <section className="mb-8">
          <h2 className="font-grotesk font-bold uppercase tracking-wide text-[#001b3c] text-xl border-l-4 border-[#526a8d] pl-4 mb-4">
            Language
          </h2>
          <div className="border-2 border-[#001b3c] bg-white p-6">
            {/* TODO: wire up i18n — toggle is display-only for now */}
            <div className="flex gap-2">
              <button
                type="button"
                className="px-6 py-3 font-grotesk font-bold uppercase tracking-[0.1em] text-base border-2 border-[#001b3c] bg-[#526a8d] text-white"
              >
                EN
              </button>
              <button
                type="button"
                disabled
                className="px-6 py-3 font-grotesk font-bold uppercase tracking-[0.1em] text-base border-2 border-[#001b3c] bg-white text-[#001b3c] opacity-50 cursor-not-allowed"
              >
                ES
              </button>
            </div>
            <p className="font-sans text-sm text-[#74777f] mt-3">
              Spanish translations coming soon.
            </p>
          </div>
        </section>

        {role === 'admin' && (
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

      <BottomNav activeTab="settings" />
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
