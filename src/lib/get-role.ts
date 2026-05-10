import { cookies } from 'next/headers';
import { verifySession, COOKIE_NAME } from '@/lib/session';

export async function getRole(): Promise<'admin' | 'linecook' | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return null;
  return verifySession(value);
}
