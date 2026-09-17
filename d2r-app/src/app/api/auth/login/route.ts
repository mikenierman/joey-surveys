import { NextResponse } from 'next/server';
import { DEMO_USERS, sessionCookieName, type DevUser } from '@/lib/auth';

function requestOrigin(req: Request): string {
  const xfProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const xfHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const host = xfHost || req.headers.get('host') || '127.0.0.1:3000';
  const proto =
    xfProto ||
    (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function homePathForRole(role: DevUser['role']): string {
  if (role === 'admin' || role === 'manager') return '/admin/dashboard';
  if (role === 'client') return '/admin/merchandising';
  return '/merchandising';
}

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get('email') || '').toLowerCase().trim();
  const user = DEMO_USERS.find((u) => u.email === email) || {
    email: email || 'guest@direct2retailers.com',
    name: email.split('@')[0] || 'Guest',
    role: 'rep' as const,
  };
  const origin = requestOrigin(req);
  // 303 so browsers convert the form POST into a GET of the destination.
  const res = NextResponse.redirect(new URL(homePathForRole(user.role), origin), 303);
  const secure = origin.startsWith('https://');
  res.cookies.set(sessionCookieName(), JSON.stringify(user), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure,
  });
  return res;
}
