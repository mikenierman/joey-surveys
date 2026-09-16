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

type SearchParams = Promise<{ rep?: string; state?: string; status?: string }>;

/** Inferred columns for location sales-status board. */
const LIVE_HEADERS = [
  'Location',
  'City',
  'State',
  'Rep',
  'Status',
  'Updated',
] as const;

export default async function AdminSalesStatusPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { locations } = getLocations();
  const reps = [...new Set(locations.map((l) => l.rep).filter(Boolean))].sort();
  const states = [
    ...new Set(locations.map((l) => l.state).filter(Boolean)),
  ].sort();

  return (
    <div>
      <PageTitle
        title="Sales status"
        subtitle="Location sales-status board — no status capture seeded"
      />
      <ClusterNav items={LOCATIONS_CLUSTER_NAV} current="/admin/sales-status" />
      <StubNote>
        Offline shell for <code>/admin/sales-status</code>. Door list exists from
        assignment sample, but sales-status values were never scraped — showing
        honest empty table. Rep counterpart:{' '}
        <Link href="/locations/sales-status" className="underline">
          /locations/sales-status
        </Link>
        .
      </StubNote>
      <FilterBar>
        <FilterField
          label="Rep"
          name="rep"
          defaultValue={params.rep || ''}
          options={reps.map((r) => ({ value: r, label: r }))}
        />
        <FilterField
          label="State"
          name="state"
          defaultValue={params.state || ''}
          options={states.map((s) => ({ value: s, label: s }))}
        />
        <FilterField
          label="Status"
          name="status"
          defaultValue={params.status || ''}
          options={[
            { value: 'open', label: 'Open' },
            { value: 'won', label: 'Won' },
            { value: 'lost', label: 'Lost' },
          ]}
        />
        <FilterActions>
          <FilterSubmit />
          <FilterReset href="/admin/sales-status" />
        </FilterActions>
      </FilterBar>
      <DataTable
        headers={[...LIVE_HEADERS]}
        rows={[]}
        emptyMessage="No sales-status rows seeded — scrape /admin/sales-status for offline parity."
      />
    </div>
  );
}
