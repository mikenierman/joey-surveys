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
  OfflineScopeBanner,
} from '@/components/ui';
import { resolveRepScope } from '@/lib/rep-scope';

export default async function SalesStatusPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const scope = resolveRepScope(user);

  return (
    <AppShell user={user}>
      <PageTitle
        title="Sales status"
        subtitle={`Rep location sales-status · ${scope.matchedName}`}
      />
      <OfflineScopeBanner text={scope.scopeBanner} />
      <StubNote>
        Offline stub for <code>/locations/sales-status</code>. No live capture —
        table remains PendingLane. Rep filter defaults to {scope.matchedName}.
        Admin pending: <code>/admin/sales-status</code>.
      </StubNote>
      <FilterBar>
        <FilterField
          label="Rep"
          name="rep"
          placeholder="All reps"
          defaultValue={scope.matchedName}
        />
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
        Sales-status table PendingLane — no live capture seeded yet (still
        global shell).
      </div>
    </AppShell>
  );
}
