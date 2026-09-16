import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { AppShell, PageTitle, StubNote } from '@/components/ui';
import { OrdersTable } from '@/components/orders-table';
import { getOrdersSnapshot } from '@/lib/data';

export default async function RepOrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const { headers, orders } = getOrdersSnapshot();
  const mine = orders.filter((o) => {
    const rep = String(o['Sales Rep'] ?? '');
    return !rep || rep === user.name;
  });

  return (
    <AppShell user={user}>
      <PageTitle title="Orders" subtitle="Rep order list (offline twin)" />
      <StubNote>
        Rep-facing mirror of <code>/orders</code>. Showing rows for{' '}
        <strong>{user.name}</strong> when rep is set; otherwise full page-1 sample.{' '}
        <Link className="underline" href="/orders/drafts">
          My drafts
        </Link>
        .
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
        <p className="text-sm text-stone-600">No orders for this rep in the current seed.</p>
      )}
    </AppShell>
  );
}
