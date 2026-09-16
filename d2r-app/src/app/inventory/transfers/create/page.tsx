import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import {
  AppShell,
  PageTitle,
  StubNote,
  ClusterNav,
  FilterBar,
  FilterField,
  FilterActions,
  FilterSubmit,
  FilterReset,
} from '@/components/ui';
import { REP_INVENTORY_NAV } from '@/lib/rep-inventory-nav';

export default async function CreateTransferPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  return (
    <AppShell user={user}>
      <PageTitle
        title="Create transfer"
        subtitle="Offline form shell — writes disabled"
      />
      <ClusterNav
        items={REP_INVENTORY_NAV}
        current="/inventory/transfers/create"
      />
      <StubNote>
        Mapped live route <code>/inventory/transfers/create</code>. Submit stays
        offline; use{' '}
        <Link href="/inventory/transfers" className="underline">
          Transfers
        </Link>{' '}
        for the seed list.
      </StubNote>
      <FilterBar>
        <FilterField
          label="Warehouse"
          name="warehouse"
          options={[
            { value: 'ALP', label: 'ALP' },
            { value: 'sample', label: 'Sample warehouse' },
          ]}
        />
        <FilterField label="Store / door" name="store" placeholder="Search store" />
        <FilterField
          label="Status"
          name="status"
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'submit', label: 'Ready to submit' },
          ]}
        />
        <FilterActions>
          <FilterSubmit />
          <FilterReset href="/inventory/transfers/create" />
        </FilterActions>
      </FilterBar>
      <div className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-500">
        Line-item picker PendingLane — awaiting transfers create capture.
      </div>
    </AppShell>
  );
}
