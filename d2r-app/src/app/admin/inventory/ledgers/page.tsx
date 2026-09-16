import {
  PageTitle,
  StatCard,
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
import {
  getLedgerPerformance,
  getLedgerRepsForBrand,
  getLedgerBrandOptions,
} from '@/lib/data';

type SearchParams = Promise<{ brand?: string; sort?: string }>;

export default async function LedgersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const brand = params.brand || '';
  const sort = params.sort || 'value';
  const { summary, reps: allReps } = getLedgerPerformance();
  let reps = getLedgerRepsForBrand(brand || undefined);
  const brands = getLedgerBrandOptions();

  if (sort === 'units') {
    reps = [...reps].sort((a, b) => (b.unitsHeld ?? 0) - (a.unitsHeld ?? 0));
  } else if (sort === 'sellThrough') {
    reps = [...reps].sort(
      (a, b) => parseFloat(b.sellThrough || '0') - parseFloat(a.sellThrough || '0')
    );
  } else {
    // Most value held (default) — seed is already ordered; re-sort for brand filter
    const valueNum = (v?: string) =>
      Number(String(v || '0').replace(/[^0-9.-]/g, '')) || 0;
    reps = [...reps].sort((a, b) => valueNum(b.valueHeld) - valueNum(a.valueHeld));
  }

  const quiet = summary?.quiet8PlusDays as
    | { count?: string; description?: string }
    | undefined;

  return (
    <div>
      <PageTitle
        title="Ledger performance"
        subtitle="What every rep holds and how fast it is moving — offline seed from live capture 2026-09-16"
      />
      <ClusterNav items={INVENTORY_CLUSTER_NAV} current="/admin/inventory/ledgers" />
      <StubNote>
        Offline twin — {allReps.length} reps from <code>ledger-performance.json</code>
        {brand ? (
          <>
            . Filtered to {reps.length} with <strong>{brand}</strong> holdings (see{' '}
            <a className="underline" href="/admin/inventory/performance">
              Performance
            </a>{' '}
            for rep × brand rows).
          </>
        ) : (
          <>
            . Showing {reps.length} of {allReps.length}.
          </>
        )}
      </StubNote>
      <FilterBar>
        <FilterField
          label="Brand"
          name="brand"
          defaultValue={brand}
          options={brands.map((b) => ({ value: b, label: b }))}
          placeholder="All brands"
        />
        <FilterField
          label="Sort"
          name="sort"
          defaultValue={sort}
          options={[
            { value: 'value', label: 'Most value held' },
            { value: 'units', label: 'Most units held' },
            { value: 'sellThrough', label: 'Highest sell-through' },
          ]}
          placeholder="Most value held"
        />
        <FilterActions>
          <FilterSubmit />
          <FilterReset href="/admin/inventory/ledgers" />
        </FilterActions>
      </FilterBar>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Value held"
          value={String(summary?.valueHeld || '—')}
        />
        <StatCard
          label="Unpriced excluded"
          value={String(summary?.unpricedItemsExcluded ?? '—')}
        />
        <StatCard label="Units held" value={String(summary?.unitsHeld || '—')} />
        <StatCard label="Sell-through" value={String(summary?.sellThrough || '—')} />
        <StatCard label="Quiet 8+ days" value={String(quiet?.count || '—')} />
      </div>
      {quiet?.description ? (
        <p className="mb-4 text-xs text-stone-500">{quiet.description}</p>
      ) : null}
      <DataTable
        headers={[
          'Rep',
          'Value held',
          'Units held',
          'Sold all time',
          'Sell-through',
          'Sold last 7d',
          'Last sale',
        ]}
        rows={reps.map((r) => [
          r.rep,
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
