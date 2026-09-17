import { NextResponse } from 'next/server';
import { sessionCookieName } from '@/lib/auth';

function requestOrigin(req: Request): string {
  const xfProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const xfHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const host = xfHost || req.headers.get('host') || '127.0.0.1:3000';
  const proto =
    xfProto ||
    (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  const origin = requestOrigin(req);
  const res = NextResponse.redirect(new URL('/login', origin), 303);
  res.cookies.set(sessionCookieName(), '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    secure: origin.startsWith('https://'),
  });
  return res;
}
