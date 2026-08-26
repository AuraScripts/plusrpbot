import { NextResponse } from 'next/server';

export function middleware(request) {
  const authed = request.cookies.get('dashboard_auth')?.value === process.env.DASHBOARD_PASSWORD;
  if (authed) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const url = new URL('/login', request.url);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/dashboard', '/api/invite'],
};
