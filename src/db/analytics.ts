import { sql } from 'drizzle-orm';
import { db } from './index';

function daysAgo(n: number): number {
  return Math.floor((Date.now() - n * 86400_000) / 1000);
}

export async function getAttemptCounts(): Promise<{ last7: number; last30: number }> {
  const [r7, r30] = await Promise.all([
    db.get<{ n: number }>(
      sql`SELECT COUNT(*) AS n FROM metrics WHERE created_at >= ${daysAgo(7)}`
    ),
    db.get<{ n: number }>(
      sql`SELECT COUNT(*) AS n FROM metrics WHERE created_at >= ${daysAgo(30)}`
    ),
  ]);
  return { last7: r7?.n ?? 0, last30: r30?.n ?? 0 };
}

export async function getMissedQuestions(): Promise<
  Array<{ question_text: string; missRate: number; total: number }>
> {
  const rows = await db.all<{ question_text: string; missed: number; total: number }>(
    sql`
      SELECT qq.question_text,
             SUM(CASE WHEN m.correct = 0 THEN 1 ELSE 0 END) AS missed,
             COUNT(*) AS total
      FROM metrics m
      JOIN quiz_questions qq ON qq.id = m.question_id
      GROUP BY m.question_id
      HAVING total > 0
      ORDER BY (missed * 1.0 / total) DESC
      LIMIT 5
    `
  );
  return rows.map(r => ({
    question_text: r.question_text,
    missRate: r.total > 0 ? Math.round((r.missed / r.total) * 100) : 0,
    total: r.total,
  }));
}

export async function getTopViewedRecipes(): Promise<
  Array<{ title: string; views: number }>
> {
  return db.all<{ title: string; views: number }>(
    sql`
      SELECT r.title, COUNT(*) AS views
      FROM recipe_views rv
      JOIN recipes r ON r.id = rv.recipe_id
      GROUP BY rv.recipe_id
      ORDER BY views DESC
      LIMIT 5
    `
  );
}

export async function getSessionsPerDay(): Promise<
  Array<{ date: string; count: number }>
> {
  return db.all<{ date: string; count: number }>(
    sql`
      SELECT date(started_at, 'unixepoch') AS date, COUNT(*) AS count
      FROM role_sessions
      WHERE started_at >= ${daysAgo(14)}
      GROUP BY date
      ORDER BY date ASC
    `
  );
}

export async function getAvgScore(): Promise<number | null> {
  const row = await db.get<{ avg: number | null }>(
    sql`
      SELECT AVG(CASE WHEN correct = 1 THEN 100.0 ELSE 0.0 END) AS avg
      FROM metrics
      WHERE created_at >= ${daysAgo(30)}
    `
  );
  return row?.avg != null ? Math.round(row.avg) : null;
}
