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
import { getBusinesses } from '@/lib/data';

type SearchParams = Promise<{ rep?: string; q?: string }>;

/** Live column order: Sales Rep | Business Name | Address | Created | Actions */
const LIVE_HEADERS = [
  'Sales Rep',
  'Business Name',
  'Address',
  'Created',
  'Actions',
] as const;

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { meta, businesses: all } = getBusinesses();
  const rep = params.rep || '';
  const query = (params.q || '').trim().toLowerCase();
  const reps = [...new Set(all.map((b) => b.salesRep).filter(Boolean))].sort();
  const withDetailHref = all.filter((b) => b.href).length;

  const businesses = all.filter((b) => {
    if (rep && b.salesRep !== rep) return false;
    if (!query) return true;
    return (
      b.businessName.toLowerCase().includes(query) ||
      b.address.toLowerCase().includes(query) ||
      b.salesRep.toLowerCase().includes(query)
    );
  });

  const captured =
    meta?.capturedAt != null ? String(meta.capturedAt).slice(0, 10) : null;

  return (
    <div>
      <PageTitle
        title="Businesses"
        subtitle={`Legal entities · ${all.length} offline from businesses.json`}
      />
      <ClusterNav items={INVENTORY_CLUSTER_NAV} current="/admin/businesses" />
      <StubNote>
        Offline seed mirror of live <code>/admin/businesses</code>
        {captured ? <> (captured {captured})</> : null}. Columns match live
        scrape. Actions column empty in capture (icon menu likely).{' '}
        {withDetailHref} row detail hrefs present as{' '}
        <code>/admin/businesses/:uuid</code> — detail pages not built in twin
        yet. Add Business / Export are UI stubs only.
      </StubNote>
      <FilterBar>
        <FilterField
          label="Sales rep"
          name="rep"
          defaultValue={rep}
          options={reps.map((r) => ({ value: r, label: r }))}
        />
        <FilterField
          label="Search"
          name="q"
          defaultValue={params.q || ''}
          placeholder="Business or address"
        />
        <FilterActions>
          <FilterSubmit />
          <FilterReset href="/admin/businesses" />
        </FilterActions>
      </FilterBar>
      <DataTable
        headers={[...LIVE_HEADERS]}
        rows={businesses.map((b) => [
          b.salesRep,
          b.businessName,
          b.address,
          b.created,
          // Live scrape: Actions empty on all 51 rows
          '',
        ])}
      />
    </div>
  );
}
