import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import {
  AppShell,
  PageTitle,
  StubNote,
  FilterBar,
  FilterField,
  FilterActions,
  FilterSubmit,
  FilterReset,
  DataTable,
} from '@/components/ui';

const LIVE_HEADERS = [
  'Location',
  'City',
  'State',
  'Rep',
  'Status',
  'Updated',
] as const;

export default async function SalesStatusPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  return (
    <AppShell user={user}>
      <PageTitle
        title="Sales status"
        subtitle="Rep location sales-status shell"
      />
      <StubNote>
        Offline stub for <code>/locations/sales-status</code>. Admin twin:{' '}
        <code>/admin/sales-status</code>. No sales-status capture seeded —
        headers only.
      </StubNote>
      <FilterBar>
        <FilterField label="Rep" name="rep" placeholder="All reps" />
        <FilterField label="State" name="state" placeholder="All states" />
        <FilterField
          label="Status"
          name="status"
          options={[
            { value: 'open', label: 'Open' },
            { value: 'won', label: 'Won' },
            { value: 'lost', label: 'Lost' },
          ]}
        />
        <FilterActions>
          <FilterSubmit />
          <FilterReset href="/locations/sales-status" />
        </FilterActions>
      </FilterBar>
      <DataTable
        headers={[...LIVE_HEADERS]}
        rows={[]}
        emptyMessage="No sales-status rows seeded yet."
      />
    </AppShell>
  );
}
