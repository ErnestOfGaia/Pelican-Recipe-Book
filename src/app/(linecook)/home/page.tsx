import Link from 'next/link';
import { getRole } from '@/lib/get-role';
import { BottomNav } from '@/components/BottomNav';
import LogoutLink from '@/components/LogoutLink';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const role = (await getRole()) ?? 'linecook';
  const isAdmin = role === 'admin';

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      {/* Top App Bar */}
      <header className="bg-white border-b-2 border-[#001b3c] h-[64px] fixed top-0 z-50 w-full flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#001b3c]">dashboard</span>
          <span className="font-grotesk font-black uppercase text-[#001b3c] text-xl tracking-tight">
            PELLITO HUB
          </span>
        </div>
        <span className="font-grotesk font-bold uppercase text-[#526a8d] text-sm">EN | ES</span>
      </header>

      <main className="pt-[64px] pb-[100px] px-6 max-w-6xl mx-auto">
        <div className="py-6 border-b-2 border-[#001b3c] mb-6">
          <h1 className="font-grotesk font-black uppercase text-[#001b3c] text-5xl md:text-6xl tracking-tight leading-none">
            DASHBOARD
          </h1>
          <p className="text-[#43474e] mt-2 text-lg">
            Signed in as <span className="font-grotesk font-bold uppercase tracking-wide">{role}</span>
            <span className="mx-2 text-[#74777f]">·</span>
            <LogoutLink />
          </p>
        </div>

        {isAdmin ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExplainerCard
              icon="restaurant_menu"
              title="Manage recipes"
              body="Create, edit, publish, and archive recipes. Bulk-import via CSV from the admin area."
              href="/admin/recipes"
              cta="Open admin"
            />
            <ExplainerCard
              icon="quiz"
              title="View quiz activity"
              body="Review the log of quiz attempts across all users — see which recipes are being studied and how staff are scoring."
              href="/quiz"
              cta="View activity"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ExplainerCard
              icon="restaurant_menu"
              title="Browse recipes"
              body="Filter by station — Saute, Grill, Fryer, Pantry, Pizza — and tap any card to see ingredients and cook steps."
              href="/dashboard"
              cta="View recipes"
            />
            <ExplainerCard
              icon="quiz"
              title="Take a quiz"
              body="Open any recipe and scroll to the bottom. Tap the Quiz Yourself CTA to test your recall on ingredients and steps."
              href="/dashboard"
              cta="Pick a recipe"
            />
            <ExplainerCard
              icon="forum"
              title="Ask Pellito Deckhand"
              body="The chat button on any recipe page lets you ask the kitchen agent for prep tips, allergen swaps, and more."
              href="/dashboard"
              cta="Open recipes"
            />
          </div>
        )}
      </main>

      <BottomNav activeTab="dashboard" />
    </div>
  );
}

function ExplainerCard({
  icon,
  title,
  body,
  href,
  cta,
}: {
  icon: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="border-2 border-[#001b3c] bg-white p-6 flex flex-col gap-3 hover:bg-[#f0f3ff] transition-colors"
    >
      <span className="material-symbols-outlined text-[#526a8d] text-4xl">{icon}</span>
      <h2 className="font-grotesk font-bold uppercase text-[#001b3c] text-xl tracking-tight">
        {title}
      </h2>
      <p className="font-sans text-[#43474e] text-base leading-relaxed">{body}</p>
      <span className="mt-auto pt-2 font-grotesk font-bold uppercase tracking-widest text-sm text-[#526a8d]">
        {cta} →
      </span>
    </Link>
  );
}
