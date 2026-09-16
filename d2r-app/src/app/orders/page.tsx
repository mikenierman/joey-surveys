import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import {
  AppShell,
  PageTitle,
  StubNote,
  OfflineScopeBanner,
} from '@/components/ui';
import { OrdersTable } from '@/components/orders-table';
import { getOrdersSnapshot } from '@/lib/data';
import { resolveRepScope, scopeMatchesRep } from '@/lib/rep-scope';

export default async function RepOrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const scope = resolveRepScope(user);
  const { headers, orders } = getOrdersSnapshot();
  const mine = orders.filter((o) =>
    scopeMatchesRep(String(o['Sales Rep'] ?? ''), scope)
  );

  return (
    <AppShell user={user}>
      <PageTitle
        title="Orders"
        subtitle={`Sales rep: ${scope.matchedName}`}
      />
      <OfflineScopeBanner text={scope.scopeBanner} />
      <StubNote>
        Rep-facing <code>/orders</code> filtered to {scope.matchedName} (
        {mine.length} of {orders.length} page-1 rows).{' '}
        <Link className="underline" href="/orders/drafts">
          My drafts
        </Link>
        .
        {!mine.length
          ? ' Page-1 orders seed has no rows for this rep — still global elsewhere until full dump.'
          : ''}
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <span className="rounded border border-stone-300 bg-white px-2 py-1 text-stone-600">
          Status filter (stub)
        </span>
        <button
          type="button"
          disabled
          className="rounded border border-stone-300 bg-stone-100 px-2 py-1 text-stone-500"
        >
          Create order (stub)
        </button>
      </div>
      {mine.length ? (
        <OrdersTable headers={headers} rows={mine} />
      ) : (
        <p className="text-sm text-stone-600">
          No orders for {scope.matchedName} in the current seed.
        </p>
      )}
    </AppShell>
  );
}
