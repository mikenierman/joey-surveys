import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { AppShell, PageTitle, StubNote, DataTable } from '@/components/ui';
import { getOrderDrafts } from '@/lib/data';

export default async function RepOrderDraftsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const { headers, drafts } = getOrderDrafts('rep');
  const mine = drafts.filter((d) => !d.Rep || d.Rep === user.name);

  return (
    <AppShell user={user}>
      <PageTitle title="Order drafts" subtitle="Rep drafts (offline twin)" />
      <StubNote>
        Stub for <code>/orders/drafts</code> — no live capture. Submit draft is disabled.{' '}
        <Link className="underline" href="/orders">
          Back to orders
        </Link>
        .
      </StubNote>
      <button
        type="button"
        disabled
        className="mb-4 rounded border border-stone-300 bg-stone-100 px-2 py-1 text-sm text-stone-500"
      >
        Submit draft (stub)
      </button>
      {mine.length ? (
        <DataTable
          headers={[...headers]}
          rows={mine.map((d) => headers.map((h) => d[h] ?? '—'))}
        />
      ) : (
        <p className="text-sm text-stone-600">
          No draft rows for {user.name}. Expected columns: {headers.join(', ')}.
        </p>
      )}
    </AppShell>
  );
}
