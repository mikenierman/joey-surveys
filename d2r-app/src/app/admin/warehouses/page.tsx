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
import { getWarehouses } from '@/lib/data';

type SearchParams = Promise<{ status?: string; state?: string; q?: string }>;

/** Live column order: Warehouse | Address | City | State | ZIP | Phone | Status | Created | Rep */
const LIVE_HEADERS = [
  'Warehouse',
  'Address',
  'City',
  'State',
  'ZIP',
  'Phone',
  'Status',
  'Created',
  'Rep',
] as const;

export default async function WarehousesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const all = getWarehouses();
  const status = params.status || '';
  const state = params.state || '';
  const query = (params.q || '').trim().toLowerCase();
  const statuses = [...new Set(all.map((w) => w.status).filter(Boolean))] as string[];
  const states = [...new Set(all.map((w) => w.state).filter(Boolean))].sort() as string[];
  const missingPhone = all.filter((w) => !w.phone || w.phone === '-').length;

  const warehouses = all.filter((w) => {
    if (status && w.status !== status) return false;
    if (state && w.state !== state) return false;
    if (!query) return true;
    const hay = [w.warehouse, w.rep, w.city, w.address].join(' ').toLowerCase();
    return hay.includes(query);
  });

  return (
    <div>
      <PageTitle
        title="Warehouses"
        subtitle={`Manage all warehouses · ${all.length} offline from warehouses.json`}
      />
      <ClusterNav items={INVENTORY_CLUSTER_NAV} current="/admin/warehouses" />
      <StubNote>
        Offline seed mirror of live <code>/admin/warehouses</code> (
        {all.length} rows, all Active in capture). Columns match live export.
        {missingPhone > 0 ? (
          <>
            {' '}
            {missingPhone} warehouses have phone <code>-</code>.
          </>
        ) : null}{' '}
        Add Warehouse / Export actions are UI stubs only.
      </StubNote>
      <FilterBar>
        <FilterField
          label="Status"
          name="status"
          defaultValue={status}
          options={statuses.map((s) => ({ value: s, label: s }))}
        />
        <FilterField
          label="State"
          name="state"
          defaultValue={state}
          options={states.map((s) => ({ value: s, label: s }))}
        />
        <FilterField
          label="Search"
          name="q"
          defaultValue={params.q || ''}
          placeholder="Warehouse or rep"
        />
        <FilterActions>
          <FilterSubmit />
          <FilterReset href="/admin/warehouses" />
        </FilterActions>
      </FilterBar>
      <DataTable
        headers={[...LIVE_HEADERS]}
        rows={warehouses.map((w) => [
          w.warehouse,
          w.address,
          w.city,
          w.state,
          w.zip,
          w.phone,
          w.status,
          w.created,
          w.rep,
        ])}
      />
    </div>
  );
}
