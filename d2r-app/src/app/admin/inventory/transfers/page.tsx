import {
  PageTitle,
  DataTable,
  StubNote,
  ClusterNav,
  FilterBar,
  FilterField,
  FilterActions,
  FilterSubmit,
  FilterReset,
} from '@/components/ui';
import { INVENTORY_CLUSTER_NAV } from '@/lib/inventory-nav';
import { getTransferMeta, getTransfers } from '@/lib/data';

type SearchParams = Promise<{ status?: string; store?: string; warehouse?: string }>;

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

export default async function AdminTransfersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const meta = getTransferMeta();
  const all = getTransfers();
  const status = (params.status || '').trim();
  const store = (params.store || '').trim();
  const warehouse = (params.warehouse || '').trim();

  const statuses = [...new Set(all.map((r) => r.status).filter(Boolean))].sort();
  const stores = [...new Set(all.map((r) => r.store).filter(Boolean))].sort();
  const warehouses = [...new Set(all.map((r) => r.warehouse).filter(Boolean))].sort();

  const rows = all.filter((r) => {
    if (status && r.status !== status) return false;
    if (store && r.store !== store) return false;
    if (warehouse && r.warehouse !== warehouse) return false;
    return true;
  });

  const page = Number(meta?.page) || 1;
  const totalPages = pagesHintTotal(meta?.pagesHint) ?? 21;
  const sampleCount = Number(meta?.count) || all.length;

  return (
    <div>
      <PageTitle
        title="Transfers"
        subtitle="Admin transfer queue — approve / receive workflow"
      />
      <ClusterNav items={INVENTORY_CLUSTER_NAV} current="/admin/inventory/transfers" />
      <StubNote>
        Offline sample: page {page} of ~{totalPages} ({sampleCount} rows from live scrape).
        Production holds ~{totalPages * 20}+ transfers across pagination. Approve / Receive /
        Export / Create are display-only in the twin until write paths are wired.
      </StubNote>
      <FilterBar>
        <FilterField
          label="Status"
          name="status"
          defaultValue={status}
          options={statuses.map((s) => ({ value: s, label: s }))}
        />
        <FilterField
          label="Store"
          name="store"
          defaultValue={store}
          options={stores.map((s) => ({ value: s, label: s }))}
        />
        <FilterField
          label="Warehouse"
          name="warehouse"
          defaultValue={warehouse}
          options={warehouses.map((w) => ({ value: w, label: w }))}
        />
        <FilterActions>
          <FilterSubmit />
          <FilterReset href="/admin/inventory/transfers" />
        </FilterActions>
      </FilterBar>
      <p className="mb-3 text-sm text-stone-600">
        Showing {rows.length} of {all.length} sample rows
        {status || store || warehouse ? ' (filtered)' : ''}.
      </p>
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
        rows={rows.map((r) => [
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
    </div>
  );
}
