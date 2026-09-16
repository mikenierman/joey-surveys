import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import {
  AppShell,
  PageTitle,
  StubNote,
  DataTable,
  OfflineScopeBanner,
} from '@/components/ui';
import { getOrderDrafts } from '@/lib/data';
import { resolveRepScope, scopeMatchesRep } from '@/lib/rep-scope';

export default async function RepOrderDraftsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const scope = resolveRepScope(user);
  const { headers, drafts } = getOrderDrafts('rep');
  const mine = drafts.filter((d) => {
    const rep = d.Rep || d.rep || '';
    if (!rep) return false;
    return scopeMatchesRep(rep, scope);
  });

  return (
    <AppShell user={user}>
      <PageTitle
        title="Order drafts"
        subtitle={`Drafts for ${scope.matchedName}`}
      />
      <OfflineScopeBanner text={scope.scopeBanner} />
      <StubNote>
        Stub for <code>/orders/drafts</code> — no live capture. Submit draft is
        disabled.{' '}
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
          No draft rows for {scope.matchedName}. Expected columns:{' '}
          {headers.join(', ')}.
        </p>
      )}
    </AppShell>
  );
}
