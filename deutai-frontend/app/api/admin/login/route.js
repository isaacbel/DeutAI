import { NextResponse } from 'next/server';

export async function POST(request) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json(
      { error: 'CONFIG', message: 'Admin non configuré (ADMIN_PASSWORD).' },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  if (body.password !== password) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Mot de passe incorrect.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('deutai_admin', '1', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return res;
}

export const dynamic = 'force-dynamic';
