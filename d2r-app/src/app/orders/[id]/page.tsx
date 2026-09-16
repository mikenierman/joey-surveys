import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { AppShell, PageTitle, StubNote, DataTable } from '@/components/ui';
import { getOrderById, LIVE_ORDER_HEADERS } from '@/lib/data';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const { id } = await params;
  const { row } = getOrderById(id);
  const headers = [...LIVE_ORDER_HEADERS];

  return (
    <AppShell user={user}>
      <PageTitle
        title={row ? String(row['PO Number'] ?? 'Order detail') : 'Order detail'}
        subtitle={`/orders/${id}`}
      />
      <StubNote>
        Detail stub for live <code>/orders/:uuid</code>. Line items, timeline, and fulfillment
        actions are not mirrored yet.{' '}
        <Link className="underline" href="/admin/orders">
          Admin orders
        </Link>
        .
      </StubNote>
      {row ? (
        <DataTable
          headers={headers}
          rows={[headers.map((h) => String(row[h] ?? '—'))]}
        />
      ) : (
        <p className="text-sm text-stone-600">
          Order <code>{id}</code> not found in page-1 seed. Full catalog requires paginated
          export (~1034 pages).
        </p>
      )}
    </AppShell>
  );
}
