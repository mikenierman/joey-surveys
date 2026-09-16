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
  StatCard,
} from '@/components/ui';
import { LOCATIONS_CLUSTER_NAV } from '@/lib/customers-nav';
import { getRepAssignments } from '@/lib/data';

type SearchParams = Promise<{ role?: string; q?: string }>;

/**
 * Inferred relationship graph columns (covering / delegate between reps).
 * Live schema not captured — headers are best-effort from assignment roles.
 */
const LIVE_HEADERS = [
  'Primary rep',
  'Related rep',
  'Role',
  'Store',
  'From',
  'To',
] as const;

export default async function RelationshipsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { meta } = getRepAssignments();
  const covering = Number(meta?.covering ?? 0);
  const delegate = Number(meta?.delegate ?? 0);

  return (
    <div>
      <PageTitle
        title="Relationships"
        subtitle="Covering / delegate assignment graph — no live capture"
      />
      <ClusterNav
        items={LOCATIONS_CLUSTER_NAV}
        current="/admin/rep-assignments/relationships"
      />
      <StubNote>
        Offline stub for{' '}
        <code>/admin/rep-assignments/relationships</code>. Live meta reports{' '}
        {covering.toLocaleString()} covering · {delegate.toLocaleString()}{' '}
        delegate assignments, but page-1 sample is Primary-only and the
        relationship table schema was never scraped. Back to{' '}
        <Link href="/admin/rep-assignments" className="underline">
          Rep assignments
        </Link>
        .
      </StubNote>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Covering (prod meta)"
          value={covering ? covering.toLocaleString() : '—'}
        />
        <StatCard
          label="Delegate (prod meta)"
          value={delegate ? delegate.toLocaleString() : '—'}
        />
        <StatCard label="Offline rows" value="0" />
      </div>
      <FilterBar>
        <FilterField
          label="Role"
          name="role"
          defaultValue={params.role || ''}
          options={[
            { value: 'Covering', label: 'Covering' },
            { value: 'Delegate', label: 'Delegate' },
          ]}
        />
        <FilterField
          label="Search"
          name="q"
          defaultValue={params.q || ''}
          placeholder="Rep or store"
        />
        <FilterActions>
          <FilterSubmit />
          <FilterReset href="/admin/rep-assignments/relationships" />
        </FilterActions>
      </FilterBar>
      <DataTable
        headers={[...LIVE_HEADERS]}
        rows={[]}
        emptyMessage="No relationship rows seeded — scrape /admin/rep-assignments/relationships."
      />
    </div>
  );
}
