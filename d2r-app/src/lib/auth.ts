import { cookies } from 'next/headers';

export type DevUser = {
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'rep' | 'client';
};

const COOKIE = 'd2r_twin_user';

export const DEMO_USERS: DevUser[] = [
  { email: 'mike@direct2retailers.com', name: 'Mike (Admin)', role: 'admin' },
  { email: 'manager@direct2retailers.com', name: 'Manager', role: 'manager' },
  { email: 'rep@direct2retailers.com', name: 'Field Rep', role: 'rep' },
  { email: 'joey@joeypouches.com', name: 'JOEY Client', role: 'client' },
];

export function sessionCookieName() {
  return COOKIE;
}

export function authMode(): 'dev' | 'clerk' {
  if (
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
  ) {
    return 'clerk';
  }
  return 'dev';
}

function mapClerkRole(meta: Record<string, unknown> | undefined): DevUser['role'] {
  const role = String(meta?.role || meta?.d2rRole || 'rep').toLowerCase();
  if (role === 'admin' || role === 'manager' || role === 'client') return role;
  return 'rep';
}

export async function getSessionUser(): Promise<DevUser | null> {
  if (authMode() === 'clerk') {
    try {
      const { auth, currentUser } = await import('@clerk/nextjs/server');
      const session = await auth();
      if (!session.userId) return null;
      const user = await currentUser();
      if (!user) return null;
      const email =
        user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses[0]?.emailAddress ||
        'unknown@direct2retailers.com';
      const name =
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.username ||
        email;
      return {
        email,
        name,
        role: mapClerkRole(user.publicMetadata as Record<string, unknown>),
      };
    } catch {
      return null;
    }
  }

  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as DevUser;
  } catch {
    return null;
  }
}
