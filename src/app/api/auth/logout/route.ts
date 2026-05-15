import { NextRequest } from 'next/server';
import { COOKIE_NAME } from '@/lib/session';
import { closeSession } from '@/db/sessions';

const SESSION_ID_COOKIE = 'pellito_session_id';

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_ID_COOKIE)?.value;
  if (sessionId) {
    await closeSession(sessionId);
  }

  const headers = new Headers();
  headers.append('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
  headers.append('Set-Cookie', `${SESSION_ID_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);

  return Response.json({ ok: true }, { status: 200, headers });
}
