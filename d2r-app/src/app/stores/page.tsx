import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import {
  AppShell,
  PageTitle,
  StubNote,
  OfflineScopeBanner,
  DataTable,
} from '@/components/ui';
import { getStores } from '@/lib/data';
import {
  filterBrandStoresForRep,
  resolveRepScope,
} from '@/lib/rep-scope';

export default async function RepStoresPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const scope = resolveRepScope(user);
  const { stores: all } = getStores();
  const { stores, filtered } = filterBrandStoresForRep(all, scope);

  return (
    <AppShell user={user}>
      <PageTitle
        title="Stores"
        subtitle={
          filtered
            ? `${stores.length} brand stores for ${scope.matchedName} (from ledger brands)`
            : `${stores.length} brand stores from stores.json`
        }
      />
      <OfflineScopeBanner text={scope.scopeBanner} />
      <StubNote>
        Rep-facing brand list from seed <code>stores.json</code> (Shopify registry). Same
        columns as admin <code>/admin/stores</code>; scoped by ledger brands when matched.
        Detail routes are not built in the twin yet.
        {filtered
          ? ` Filtered to brands held by ${scope.matchedName} in ledger seed.`
          : scope.brands.length
            ? ' No store Name matched ledger brands — showing full registry.'
            : ' No ledger brands for this rep — showing full registry.'}
      </StubNote>
      <DataTable
        headers={['Name', 'Shop domain', 'Created', 'Store ID']}
        rows={stores.map((s) => [s.Name, s['Shop Domain'], s.Created, s.id])}
      />
    </AppShell>
  );
}
