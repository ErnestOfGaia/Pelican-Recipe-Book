import Link from 'next/link';
import {
  getAttemptCounts,
  getAvgScore,
  getMissedQuestions,
  getSessionsPerDay,
  getTopViewedRecipes,
} from '@/db/analytics';

export const dynamic = 'force-dynamic';

function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="border-2 border-[#001b3c] bg-white p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[#526a8d]">{icon}</span>
        <h2 className="font-grotesk font-bold uppercase text-[#001b3c] text-sm tracking-widest">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="font-sans text-[#74777f] text-sm">No data yet.</p>;
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-grotesk font-black text-[#001b3c] text-3xl">{value}</span>
      <span className="font-sans text-[#526a8d] text-sm">{label}</span>
    </div>
  );
}

export default async function AnalyticsPage() {
  const [attempts, missed, topViewed, sessionsPerDay, avgScore] = await Promise.all([
    getAttemptCounts(),
    getMissedQuestions(),
    getTopViewedRecipes(),
    getSessionsPerDay(),
    getAvgScore(),
  ]);

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <header className="bg-white border-b-2 border-[#001b3c] h-[64px] fixed top-0 z-50 w-full flex items-center px-6">
        <Link href="/admin" className="font-grotesk font-black uppercase text-[#001b3c] text-xl tracking-tight hover:text-[#526a8d] transition-colors">
          PELLITO HUB
        </Link>
        <span className="ml-3 font-grotesk font-bold uppercase text-[#526a8d] text-sm tracking-widest">
          ADMIN
        </span>
      </header>

      <main className="pt-[64px] px-6 max-w-4xl mx-auto">
        <div className="py-6 border-b-2 border-[#001b3c] mb-8 flex items-center gap-4">
          <Link href="/admin" className="material-symbols-outlined text-[#526a8d] hover:text-[#001b3c] transition-colors">
            arrow_back
          </Link>
          <h1 className="font-grotesk font-black uppercase text-[#001b3c] text-4xl tracking-tight">
            ANALYTICS
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pb-12">
          {/* Metric 1 — Quiz attempts */}
          <Card title="Quiz Attempts" icon="quiz">
            {attempts.last30 === 0 ? (
              <Empty />
            ) : (
              <div className="flex gap-8">
                <Stat value={attempts.last7} label="last 7 days" />
                <Stat value={attempts.last30} label="last 30 days" />
              </div>
            )}
          </Card>

          {/* Metric 5 — Average score */}
          <Card title="Avg Quiz Score (30 days)" icon="grade">
            {avgScore === null ? (
              <Empty />
            ) : (
              <Stat value={`${avgScore}%`} label="correct" />
            )}
          </Card>

          {/* Metric 2 — Most-missed questions */}
          <Card title="Top Missed Questions" icon="help">
            {missed.length === 0 ? (
              <Empty />
            ) : (
              <ol className="space-y-3">
                {missed.map((q, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="font-grotesk font-black text-[#526a8d] text-sm w-5 shrink-0">
                      {i + 1}.
                    </span>
                    <div className="min-w-0">
                      <p className="font-sans text-[#001b3c] text-sm leading-snug line-clamp-2">
                        {q.question_text}
                      </p>
                      <p className="font-grotesk font-bold text-[#c0392b] text-xs mt-0.5">
                        {q.missRate}% miss rate
                        <span className="text-[#74777f] font-normal ml-1">({q.total} attempts)</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          {/* Metric 3 — Most-viewed recipes */}
          <Card title="Top Viewed Recipes" icon="menu_book">
            {topViewed.length === 0 ? (
              <Empty />
            ) : (
              <ol className="space-y-2">
                {topViewed.map((r, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="font-grotesk font-black text-[#526a8d] text-sm w-5 shrink-0">
                      {i + 1}.
                    </span>
                    <span className="font-sans text-[#001b3c] text-sm flex-1 truncate">
                      {r.title}
                    </span>
                    <span className="font-grotesk font-bold text-[#526a8d] text-sm shrink-0">
                      {r.views} views
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          {/* Metric 4 — Sessions per day */}
          <Card title="Active Sessions (14 days)" icon="bar_chart">
            {sessionsPerDay.length === 0 ? (
              <Empty />
            ) : (
              <div className="space-y-2">
                {sessionsPerDay.map(s => {
                  const maxCount = Math.max(...sessionsPerDay.map(x => x.count));
                  const pct = maxCount > 0 ? Math.round((s.count / maxCount) * 100) : 0;
                  return (
                    <div key={s.date} className="flex items-center gap-3">
                      <span className="font-sans text-[#74777f] text-xs w-20 shrink-0">{s.date}</span>
                      <div className="flex-1 bg-[#f0f3ff] h-5 relative">
                        <div
                          className="bg-[#526a8d] h-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-grotesk font-bold text-[#001b3c] text-sm w-4 text-right shrink-0">
                        {s.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
