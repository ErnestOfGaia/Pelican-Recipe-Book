import Link from 'next/link';

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <header className="bg-white border-b-2 border-[#001b3c] h-[64px] fixed top-0 z-50 w-full flex items-center px-6">
        <span className="font-grotesk font-black uppercase text-[#001b3c] text-xl tracking-tight">
          PELLITO HUB
        </span>
        <span className="ml-3 font-grotesk font-bold uppercase text-[#526a8d] text-sm tracking-widest">
          ADMIN
        </span>
      </header>

      <main className="pt-[64px] px-6 max-w-2xl mx-auto">
        <div className="py-6 border-b-2 border-[#001b3c] mb-8">
          <h1 className="font-grotesk font-black uppercase text-[#001b3c] text-4xl tracking-tight">
            MANAGER DASHBOARD
          </h1>
        </div>

        <Link
          href="/admin/recipes"
          className="flex items-center gap-4 border-2 border-[#001b3c] bg-white px-6 py-5 hover:bg-[#f0f3ff] transition-colors"
        >
          <span className="material-symbols-outlined text-[#526a8d] text-4xl">restaurant_menu</span>
          <div>
            <p className="font-grotesk font-bold uppercase text-[#001b3c] text-lg tracking-tight">
              RECIPE MANAGEMENT
            </p>
            <p className="font-sans text-[#43474e] text-sm mt-0.5">
              Create, edit, publish, and archive recipes
            </p>
          </div>
          <span className="material-symbols-outlined text-[#74777f] ml-auto">arrow_forward</span>
        </Link>

        <Link
          href="/admin/analytics"
          className="flex items-center gap-4 border-2 border-[#001b3c] bg-white px-6 py-5 hover:bg-[#f0f3ff] transition-colors mt-4"
        >
          <span className="material-symbols-outlined text-[#526a8d] text-4xl">bar_chart</span>
          <div>
            <p className="font-grotesk font-bold uppercase text-[#001b3c] text-lg tracking-tight">
              ANALYTICS
            </p>
            <p className="font-sans text-[#43474e] text-sm mt-0.5">
              Quiz performance, session activity, and engagement
            </p>
          </div>
          <span className="material-symbols-outlined text-[#74777f] ml-auto">arrow_forward</span>
        </Link>
      </main>
    </div>
  );
}
