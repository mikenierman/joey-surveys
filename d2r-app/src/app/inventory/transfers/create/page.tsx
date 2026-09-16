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
  OfflineScopeBanner,
} from '@/components/ui';
import { REP_INVENTORY_NAV } from '@/lib/rep-inventory-nav';
import { resolveRepScope } from '@/lib/rep-scope';

export default async function CreateTransferPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const scope = resolveRepScope(user);
  const warehouseOptions = scope.warehouseNames.length
    ? scope.warehouseNames.map((w) => ({ value: w, label: w }))
    : [{ value: scope.matchedName, label: scope.matchedName }];

  return (
    <AppShell user={user}>
      <PageTitle
        title="Create transfer"
        subtitle="Offline form shell — writes disabled"
      />
      <OfflineScopeBanner text={scope.scopeBanner} />
      <ClusterNav
        items={REP_INVENTORY_NAV}
        current="/inventory/transfers/create"
      />
      <StubNote>
        Mapped live route <code>/inventory/transfers/create</code>. Submit stays
        offline; preview at{' '}
        <Link href="/inventory/transfers/preview" className="underline">
          /inventory/transfers/preview
        </Link>
        . Warehouse options scoped to {scope.matchedName}.
      </StubNote>
      <FilterBar>
        <FilterField
          label="Warehouse"
          name="warehouse"
          options={warehouseOptions}
          defaultValue={warehouseOptions[0]?.value}
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
