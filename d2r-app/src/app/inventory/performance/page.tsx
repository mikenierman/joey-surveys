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
  OfflineScopeBanner,
} from '@/components/ui';
import { REP_INVENTORY_NAV } from '@/lib/rep-inventory-nav';
import { getLedgerBrandRows } from '@/lib/data';
import { resolveRepScope, scopeMatchesRep } from '@/lib/rep-scope';

export default async function RepPerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const scope = resolveRepScope(user);
  const { brand: brandParam } = await searchParams;
  const brandFilter = (brandParam || '').trim();

  const rows = getLedgerBrandRows()
    .filter((r) => scopeMatchesRep(r.rep, scope))
    .filter((r) => !brandFilter || r.brand === brandFilter);

  const brands = [...new Set(rows.map((r) => r.brand).concat(scope.brands))].sort(
    (a, b) => a.localeCompare(b)
  );

  return (
    <AppShell user={user}>
      <PageTitle
        title="Performance"
        subtitle={`Inventory performance for ${scope.matchedName}`}
      />
      <OfflineScopeBanner text={scope.scopeBanner} />
      <ClusterNav items={REP_INVENTORY_NAV} current="/inventory/performance" />
      <StubNote>
        Offline stub for <code>/inventory/performance</code> scoped to{' '}
        {scope.matchedName}. Admin: <code>/admin/inventory/performance</code>.
      </StubNote>
      <FilterBar>
        <FilterField
          label="Brand"
          name="brand"
          defaultValue={brandFilter}
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
            : [
                [
                  '—',
                  `No performance rows for ${scope.matchedName}`,
                  '—',
                  '—',
                  '—',
                  '—',
                ],
              ]
        }
      />
    </AppShell>
  );
}
