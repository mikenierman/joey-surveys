import { DEMO_USERS, authMode } from '@/lib/auth';

export default async function LoginPage() {
  if (authMode() === 'clerk') {
    const { ClerkLogin } = await import('@/components/clerk-login');
    return <ClerkLogin />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-700 bg-stone-900 p-8 text-stone-50 shadow-xl">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.25em] text-amber-400">
            Failsafe twin
          </div>
          <h1 className="mt-2 text-2xl font-semibold">Sign in to D2R</h1>
          <p className="mt-2 text-sm text-stone-400">
            DEV_AUTH mode (Clerk keys not configured). Pick a demo role or enter any
            email. Set <code className="text-amber-300">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{' '}
            and <code className="text-amber-300">CLERK_SECRET_KEY</code> to switch on Clerk.
          </p>
        </div>
        <form action="/api/auth/login" method="post" className="space-y-3">
          <label className="block text-sm">
            Email
            <input
              name="email"
              type="email"
              required
              defaultValue={DEMO_USERS[0].email}
              className="mt-1 w-full rounded-lg border border-stone-600 bg-stone-950 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-amber-500 px-3 py-2 font-medium text-stone-950 hover:bg-amber-400"
          >
            Continue
          </button>
        </form>
        <ul className="mt-6 space-y-1 text-xs text-stone-400">
          {DEMO_USERS.map((u) => (
            <li key={u.email}>
              {u.role}: {u.email}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
