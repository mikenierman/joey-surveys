import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import {
  AppShell,
  PageTitle,
  StubNote,
  ClusterNav,
  DataTable,
  FilterBar,
  FilterField,
  FilterActions,
  FilterSubmit,
  FilterReset,
} from '@/components/ui';
import { REP_INVENTORY_NAV } from '@/lib/rep-inventory-nav';
import {
  getLedgerBrandRows,
  getLedgerBrandOptions,
} from '@/lib/data';

export default async function RepPerformancePage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const rows = getLedgerBrandRows().slice(0, 50);
  const brands = getLedgerBrandOptions();

  return (
    <AppShell user={user}>
      <PageTitle
        title="Performance"
        subtitle="Rep-facing inventory performance (seed proxy)"
      />
      <ClusterNav items={REP_INVENTORY_NAV} current="/inventory/performance" />
      <StubNote>
        Offline stub for <code>/inventory/performance</code>. Admin twin:{' '}
        <code>/admin/inventory/performance</code>.
      </StubNote>
      <FilterBar>
        <FilterField
          label="Brand"
          name="brand"
          options={brands.map((b) => ({ value: b, label: b }))}
        />
        <FilterField label="Period" name="period" placeholder="Q3" />
        <FilterActions>
          <FilterSubmit />
          <FilterReset href="/inventory/performance" />
        </FilterActions>
      </FilterBar>
      <DataTable
        headers={[
          'Rep',
          'Brand',
          'Units',
          'Sold all time',
          'Sell-through',
          'Last sale',
        ]}
        rows={
          rows.length
            ? rows.map((r) => [
                r.rep,
                r.brand,
                r.unitsHeld ?? '—',
                r.unitsSoldAllTime ?? '—',
                r.sellThrough ?? '—',
                r.lastSale ?? '—',
              ])
            : [['—', 'No performance rows in seed', '—', '—', '—', '—']]
        }
      />
    </AppShell>
  );
}
