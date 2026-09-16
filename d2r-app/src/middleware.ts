import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { isPendingAdminPath } from '@/lib/nav';

/**
 * Auth middleware scaffold:
 * - Without Clerk keys → DEV_AUTH no-op (cookie session via /api/auth/login).
 * - With NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY → Clerk protect.
 * - Pending admin lanes (no twin page yet) rewrite to dashboard with
 *   x-pending-lane so the shell can render the offline placeholder.
 */
const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/api/auth(.*)',
  '/api/webhooks(.*)',
  '/',
]);

function withPendingLane(req: NextRequest): NextResponse | null {
  const path = req.nextUrl.pathname.replace(/\/$/, '') || '/';
  if (!path.startsWith('/admin') || !isPendingAdminPath(path)) {
    return null;
  }
  const rewriteUrl = req.nextUrl.clone();
  rewriteUrl.pathname = '/admin/dashboard';
  rewriteUrl.search = '';
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pending-lane', path);
  return NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });
}

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  const pending = withPendingLane(req);
  if (pending) return pending;
});

export default function middleware(req: NextRequest, event: unknown) {
  if (!clerkEnabled) {
    const pending = withPendingLane(req);
    if (pending) return pending;
    return NextResponse.next();
  }
  // Clerk handler is a Next middleware fn
  return (clerkHandler as (req: NextRequest, event: unknown) => unknown)(
    req,
    event
  );
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
