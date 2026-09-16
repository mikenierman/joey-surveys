import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import {
  AppShell,
  PageTitle,
  StubNote,
  ClusterNav,
  DataTable,
} from '@/components/ui';
import { REP_INVENTORY_NAV } from '@/lib/rep-inventory-nav';
import { getLedgerBrandRows } from '@/lib/data';

export default async function RepLedgersPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const rows = getLedgerBrandRows().slice(0, 40);

  return (
    <AppShell user={user}>
      <PageTitle
        title="Ledgers"
        subtitle="Rep-facing brand ledger proxy from seed"
      />
      <ClusterNav items={REP_INVENTORY_NAV} current="/inventory/ledgers" />
      <StubNote>
        Offline mirror of <code>/inventory/ledgers</code>. Full admin ledgers live
        at <code>/admin/inventory/ledgers</code>.
      </StubNote>
      <DataTable
        headers={['Rep', 'Brand', 'Value held', 'Units', 'Sell-through']}
        rows={
          rows.length
            ? rows.map((r) => [
                r.rep,
                r.brand,
                r.valueHeld ?? '—',
                r.unitsHeld ?? '—',
                r.sellThrough ?? '—',
              ])
            : [['—', 'No ledger rows in seed', '—', '—', '—']]
        }
      />
    </AppShell>
  );
}
