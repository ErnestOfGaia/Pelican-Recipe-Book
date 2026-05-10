import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession, COOKIE_NAME } from '@/lib/session';
import { recordAnswer } from '@/db/quiz';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = await verifySession(sessionCookie.value);
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { recipe_id: string; question_id: string; correct: boolean; language?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { recipe_id, question_id, correct, language } = body;
  if (!recipe_id || !question_id || typeof correct !== 'boolean') {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await recordAnswer({ recipe_id, question_id, correct, role, language });
  return NextResponse.json({ ok: true });
}
