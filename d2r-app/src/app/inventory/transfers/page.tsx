import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { AppShell, PageTitle, DataTable, StubNote } from '@/components/ui';
import { getTransferMeta, getTransfers } from '@/lib/data';

function pagesHintTotal(pagesHint: unknown): number | null {
  if (typeof pagesHint !== 'string') return null;
  const parts = pagesHint
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const last = parts[parts.length - 1];
  const n = Number(last);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default async function RepTransfersPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const transfers = getTransfers();
  const meta = getTransferMeta();
  const page = Number(meta?.page) || 1;
  const totalPages = pagesHintTotal(meta?.pagesHint) ?? 21;

  return (
    <AppShell user={user}>
      <PageTitle title="Transfers" subtitle="Your transfer activity" />
      <StubNote>
        Offline sample mirror of admin page {page} of ~{totalPages}. Row actions stay on the
        admin queue; this list is read-only in the twin.
      </StubNote>
      <DataTable
        headers={[
          'Transfer ID',
          'Store',
          'Warehouse',
          'Status',
          'Items',
          'Approved',
          'Created',
          'Actions',
        ]}
        rows={transfers.map((r) => [
          r.transferId,
          r.store,
          r.warehouse,
          r.status,
          r.items,
          r.approved,
          r.created,
          r.actions || '—',
        ])}
      />
    </AppShell>
  );
}
