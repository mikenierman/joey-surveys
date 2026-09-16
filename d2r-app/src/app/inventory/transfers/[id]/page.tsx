import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import {
  AppShell,
  PageTitle,
  StubNote,
  ClusterNav,
  DataTable,
} from '@/components/ui';
import { REP_INVENTORY_NAV } from '@/lib/rep-inventory-nav';
import { getTransfers } from '@/lib/data';

export default async function TransferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const { id } = await params;
  const transfers = getTransfers();
  const row =
    transfers.find((t) => t.transferId === id) ||
    transfers.find((t) => String(t.transferId).includes(id));

  return (
    <AppShell user={user}>
      <PageTitle
        title={`Transfer ${row?.transferId || id}`}
        subtitle={row ? `${row.store} · ${row.status}` : 'Offline detail stub'}
      />
      <ClusterNav items={REP_INVENTORY_NAV} current="/inventory/transfers" />
      <StubNote>
        Detail stub for <code>/inventory/transfers/{id}</code>. Receive action:{' '}
        <Link
          href={`/inventory/transfers/${id}/receive`}
          className="underline"
        >
          Receive
        </Link>
        .
      </StubNote>
      <DataTable
        headers={['Field', 'Value']}
        rows={[
          ['Transfer ID', row?.transferId ?? id],
          ['Store', row?.store ?? '—'],
          ['Warehouse', row?.warehouse ?? '—'],
          ['Status', row?.status ?? '—'],
          ['Items', row?.items ?? '—'],
          ['Approved', row?.approved ?? '—'],
          ['Created', row?.created ?? '—'],
        ]}
      />
    </AppShell>
  );
}
