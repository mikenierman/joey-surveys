import {
  PageTitle,
  DataTable,
  ClusterNav,
  StubNote,
  StatCard,
} from '@/components/ui';
import { INVENTORY_CLUSTER_NAV } from '@/lib/inventory-nav';
import { getBrandLevels } from '@/lib/data';

export default function BrandLevelsPage() {
  const { meta, brands } = getBrandLevels();
  const totalLevels =
    typeof meta?.levels === 'number'
      ? Number(meta.levels)
      : brands.reduce((sum, b) => sum + b.levels, 0);
  const zeroLevelBrands = brands.filter((b) => b.levels === 0);

  return (
    <div>
      <PageTitle
        title="Brand levels"
        subtitle="Re-read on hand and available for every level from Shopify"
      />
      <ClusterNav items={INVENTORY_CLUSTER_NAV} current="/admin/inventory/refresh" />
      <StubNote>
        Offline twin from <code>brand-levels.json</code>. A backstop for missed inventory
        webhooks — runs nightly in production; Refresh all / per-brand are disabled here
        until company Shopify tokens are live.
      </StubNote>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded bg-stone-300 px-3 py-1.5 text-sm text-stone-600"
          title="Disabled in offline twin"
        >
          Refresh all
        </button>
        <span className="text-sm text-stone-600">
          {brands.length} brand(s), {totalLevels.toLocaleString()} inventory level(s).
          Pulls on hand and available straight from Shopify.
        </span>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Brands" value={String(brands.length)} />
        <StatCard label="Inventory levels" value={String(totalLevels)} />
        <StatCard
          label="Zero-level brands"
          value={String(zeroLevelBrands.length)}
        />
      </div>
      {zeroLevelBrands.length ? (
        <StubNote>
          {zeroLevelBrands.map((b) => b.brand).join(', ')} show Services &gt; 0 but Levels
          = 0 — likely misconfigured Shopify linkage or stale brand registry.
        </StubNote>
      ) : null}
      <DataTable
        headers={['Brand', 'Services', 'Levels', 'Refresh']}
        rows={brands.map((b) => [
          b.brand,
          b.services,
          b.levels,
          'Refresh (offline)',
        ])}
      />
    </div>
  );
}
