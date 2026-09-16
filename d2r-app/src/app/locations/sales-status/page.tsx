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
} from '@/components/ui';

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
        Offline stub for <code>/locations/sales-status</code>. Admin pending lane:{' '}
        <code>/admin/sales-status</code>.
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
      <div className="rounded-xl border border-dashed border-amber-400/80 bg-amber-50 px-6 py-10 text-center text-sm text-stone-600">
        Sales-status table PendingLane — no live capture seeded yet.
      </div>
    </AppShell>
  );
}
