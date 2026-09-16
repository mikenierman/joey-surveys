import { NextResponse } from 'next/server';
import { DEMO_USERS, sessionCookieName } from '@/lib/auth';

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get('email') || '').toLowerCase().trim();
  const user = DEMO_USERS.find((u) => u.email === email) || {
    email: email || 'guest@direct2retailers.com',
    name: email.split('@')[0] || 'Guest',
    role: 'rep' as const,
  };
  const res = NextResponse.redirect(new URL('/admin/dashboard', req.url));
  res.cookies.set(sessionCookieName(), encodeURIComponent(JSON.stringify(user)), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  });
  return res;
}
