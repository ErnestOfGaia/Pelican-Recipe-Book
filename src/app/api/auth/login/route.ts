import { NextRequest } from 'next/server';
import { signSession, COOKIE_NAME } from '@/lib/session';
import { openSession } from '@/db/sessions';

const SESSION_ID_COOKIE = 'pellito_session_id';

type Role = 'admin' | 'linecook';

const CREDENTIALS: Record<string, Role> = {
  'admin:admin': 'admin',
  'linecook:linecook': 'linecook',
};

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const role = CREDENTIALS[`${username}:${password}`];

  if (!role) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const sessionValue = await signSession(role);
  const sessionId = await openSession(role);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const cookieHeader = `${COOKIE_NAME}=${sessionValue}; HttpOnly; SameSite=Lax; Path=/${secure}`;
  const sessionIdCookie = `${SESSION_ID_COOKIE}=${sessionId}; HttpOnly; SameSite=Lax; Path=/${secure}`;

  const headers = new Headers();
  headers.append('Set-Cookie', cookieHeader);
  headers.append('Set-Cookie', sessionIdCookie);

  return Response.json({ role }, { status: 200, headers });
}
