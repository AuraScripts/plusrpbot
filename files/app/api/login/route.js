import { NextResponse } from 'next/server';

export async function POST(request) {
  const { origin } = new URL(request.url);
  const form = await request.formData();
  const password = form.get('password');

  if (password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.redirect(`${origin}/dashboard?error=1`);
  }

  const res = NextResponse.redirect(`${origin}/dashboard`);
  res.cookies.set('dashboard_auth', process.env.DASHBOARD_PASSWORD, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  return res;
}
