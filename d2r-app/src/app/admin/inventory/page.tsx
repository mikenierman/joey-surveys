import Link from 'next/link';
import {
  PageTitle,
  StubNote,
  ClusterNav,
  FilterBar,
  FilterField,
  FilterActions,
  FilterSubmit,
  FilterReset,
} from '@/components/ui';
import { INVENTORY_CLUSTER_NAV } from '@/lib/inventory-nav';
import { getInventorySample, getInventoryStoreOptions, getWarehouses } from '@/lib/data';
import { InventoryLevelsTable } from './levels-table';

type SearchParams = Promise<{ store?: string; warehouse?: string; q?: string }>;

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { meta, items } = getInventorySample();
  const stores = getInventoryStoreOptions();
  const warehouses = getWarehouses();
  const selectedStore = params.store || String(meta?.store || stores[0] || '');
  const selectedWarehouse =
    params.warehouse || String(meta?.warehouse || warehouses[0]?.warehouse || '');
  const query = (params.q || '').trim().toLowerCase();

  const filtered = items.filter((item) => {
    if (!query) return true;
    return (
      item.product.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      item.variant.toLowerCase().includes(query)
    );
  });

  const hasSample =
    selectedStore === String(meta?.store || '') &&
    selectedWarehouse === String(meta?.warehouse || '');

  const rows = hasSample ? filtered : [];

  return (
    <div>
      <PageTitle
        title="Inventory"
        subtitle={
          meta
            ? `Live capture · ${String(meta.store)} / ${String(meta.warehouse)} · ${items.length} SKUs`
            : 'Consignment levels'
        }
      />
      <ClusterNav items={INVENTORY_CLUSTER_NAV} current="/admin/inventory" />
      <FilterBar>
        <FilterField
          label="Brand / store"
          name="store"
          defaultValue={selectedStore}
          options={stores.map((s) => ({ value: s, label: s }))}
        />
        <FilterField
          label="Warehouse"
          name="warehouse"
          defaultValue={selectedWarehouse}
          options={warehouses.map((w) => ({
            value: w.warehouse,
            label: w.warehouse,
          }))}
        />
        <FilterField
          label="Search"
          name="q"
          defaultValue={params.q || ''}
          placeholder="Product or SKU"
        />
        <FilterActions>
          <FilterSubmit />
          <FilterReset href="/admin/inventory" />
        </FilterActions>
      </FilterBar>
      {!hasSample ? (
        <StubNote>
          Seed covers {String(meta?.store)} / {String(meta?.warehouse)} only. Selected filters
          show empty table until more warehouse exports land via weekly SOP.
        </StubNote>
      ) : (
        <StubNote>
          Sample consignment snapshot from live scrape (
          <code>inventory-sample.json</code> ← ALP @ D2R - Adam Scott). Columns match live:{' '}
          Product through Level GID. Adjust is stubbed. Export / Refresh are UI-only — use{' '}
          <Link className="underline" href="/admin/inventory/refresh">
            Brand levels
          </Link>{' '}
          for Shopify level refresh status.
        </StubNote>
      )}
      <InventoryLevelsTable items={rows} />
    </div>
  );
}
