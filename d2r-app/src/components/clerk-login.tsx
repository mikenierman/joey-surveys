'use client';

import { SignIn } from '@clerk/nextjs';

/** Only mounted when Clerk env keys are present (see login page). */
export function ClerkLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-amber-400">
            Failsafe twin
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-stone-50">Sign in to D2R</h1>
          <p className="mt-2 text-sm text-stone-400">Clerk auth enabled</p>
        </div>
        <SignIn routing="hash" />
      </div>
    </div>
  );
}
