import { eq } from 'drizzle-orm';
import { db } from './index';
import { roleSessions } from './schema';

type Role = 'admin' | 'linecook';

export async function openSession(role: Role): Promise<string> {
  const [row] = await db
    .insert(roleSessions)
    .values({ role })
    .returning({ id: roleSessions.id });
  return row.id;
}

export async function closeSession(id: string): Promise<void> {
  await db
    .update(roleSessions)
    .set({ ended_at: new Date() })
    .where(eq(roleSessions.id, id));
}
