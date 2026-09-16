import {
  PageTitle,
  DataTable,
  ClusterNav,
  FilterBar,
  FilterField,
  FilterActions,
  FilterSubmit,
  FilterReset,
  StubNote,
} from '@/components/ui';
import { INVENTORY_CLUSTER_NAV } from '@/lib/inventory-nav';
import { getLedgerBrandRows, getLedgerByRepBrand, getLedgerBrandOptions } from '@/lib/data';

type SearchParams = Promise<{ rep?: string; brand?: string }>;

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const rep = params.rep || '';
  const brand = params.brand || '';
  const { meta } = getLedgerByRepBrand();
  const rows = getLedgerBrandRows({
    rep: rep || undefined,
    brand: brand || undefined,
  });
  const reps = [...new Set(getLedgerBrandRows().map((r) => r.rep))].sort();
  const brands = getLedgerBrandOptions();

  return (
    <div>
      <PageTitle
        title="Inventory performance"
        subtitle="Rep × brand holdings from expanded ledger export"
      />
      <ClusterNav items={INVENTORY_CLUSTER_NAV} current="/admin/inventory/performance" />
      <FilterBar>
        <FilterField
          label="Rep"
          name="rep"
          defaultValue={rep}
          options={reps.map((r) => ({ value: r, label: r }))}
        />
        <FilterField
          label="Brand"
          name="brand"
          defaultValue={brand}
          options={brands.map((b) => ({ value: b, label: b }))}
        />
        <FilterActions>
          <FilterSubmit />
          <FilterReset href="/admin/inventory/performance" />
        </FilterActions>
      </FilterBar>
      <StubNote>
        {meta?.repCount ? (
          <>
            Vault expand: {String(meta.repCount)} reps · {String(meta.brandRows)} brand rows.
            Product detail lines live in seed but are not rendered in the twin table yet.
          </>
        ) : (
          <>Brand-level performance from ledger-by-rep-brand seed.</>
        )}
      </StubNote>
      <DataTable
        headers={[
          'Rep',
          'Brand',
          'Status',
          'Value held',
          'Units',
          'Sold all time',
          'Sell-through',
          'Sold 7d',
          'Last sale',
        ]}
        rows={rows.map((r) => [
          r.rep,
          r.brand,
          r.status,
          r.valueHeld,
          r.unitsHeld,
          r.unitsSoldAllTime ?? '—',
          r.sellThrough,
          r.soldLast7d,
          r.lastSale,
        ])}
      />
    </div>
  );
}
