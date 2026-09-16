import Link from 'next/link';
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
import { LOCATIONS_CLUSTER_NAV } from '@/lib/customers-nav';
import { getLocations } from '@/lib/data';

type SearchParams = Promise<{ state?: string; rep?: string; q?: string }>;

/** Inferred live columns: Name · Address · City · State · Rep */
const LIVE_HEADERS = ['Name', 'Address', 'City', 'State', 'Rep'] as const;

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { locations: all, derived } = getLocations();
  const state = params.state || '';
  const rep = params.rep || '';
  const query = (params.q || '').trim().toLowerCase();
  const states = [...new Set(all.map((l) => l.state).filter(Boolean))].sort();
  const reps = [...new Set(all.map((l) => l.rep).filter(Boolean))].sort();

  const locations = all.filter((l) => {
    if (state && l.state !== state) return false;
    if (rep && l.rep !== rep) return false;
    if (!query) return true;
    return (
      l.name.toLowerCase().includes(query) ||
      l.city.toLowerCase().includes(query) ||
      l.rep.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <PageTitle
        title="Locations"
        subtitle={
          derived
            ? `${all.length} doors derived from assignment sample`
            : `${all.length} locations`
        }
      />
      <ClusterNav items={LOCATIONS_CLUSTER_NAV} current="/admin/locations" />
      <StubNote>
        No dedicated locations capture — rows derived from retail-store sample
        (assignment page-1). Address not in assignment scrape (shown as —).{' '}
        <Link href="/admin/locations/import" className="underline">
          Import
        </Link>{' '}
        is a UI stub only.
      </StubNote>
      <FilterBar>
        <FilterField
          label="State"
          name="state"
          defaultValue={state}
          options={states.map((s) => ({ value: s, label: s }))}
        />
        <FilterField
          label="Rep"
          name="rep"
          defaultValue={rep}
          options={reps.map((r) => ({ value: r, label: r }))}
        />
        <FilterField
          label="Search"
          name="q"
          defaultValue={params.q || ''}
          placeholder="Name, city, or rep"
        />
        <FilterActions>
          <FilterSubmit />
          <FilterReset href="/admin/locations" />
          <Link
            href="/admin/locations/import"
            className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
          >
            Import
          </Link>
        </FilterActions>
      </FilterBar>
      <DataTable
        headers={[...LIVE_HEADERS]}
        emptyMessage="No locations match filters."
        rows={locations.map((l) => [l.name, l.address, l.city, l.state, l.rep])}
      />
    </div>
  );
}
