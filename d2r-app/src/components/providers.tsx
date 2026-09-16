'use client';

import { ClerkProvider } from '@clerk/nextjs';

/**
 * Wraps with ClerkProvider only when publishable key is present (client-visible).
 * Without keys, children render as-is for DEV_AUTH.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!pk) {
    return <>{children}</>;
  }
  return <ClerkProvider publishableKey={pk}>{children}</ClerkProvider>;
}
