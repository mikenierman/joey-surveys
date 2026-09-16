import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import {
  AppShell,
  PageTitle,
  StubNote,
  DataTable,
  OfflineScopeBanner,
} from '@/components/ui';
import { getRetailStores } from '@/lib/data';
import { resolveRepScope, scopeMatchesRep } from '@/lib/rep-scope';

export default async function RepRetailStoresPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const scope = resolveRepScope(user);
  const { stores: all, derived } = getRetailStores();
  const stores = all.filter((s) => scopeMatchesRep(s.rep, scope));

  return (
    <AppShell user={user}>
      <PageTitle
        title="Retail stores"
        subtitle={`${stores.length} doors for ${scope.matchedName}${
          derived ? ' (derived from assignments)' : ''
        }`}
      />
      <OfflineScopeBanner text={scope.scopeBanner} />
      <StubNote>
        Rep-facing <code>/retail-stores</code> filtered from assignment-derived
        doors ({stores.length} of {all.length} in page-1 sample). Admin:{' '}
        <code>/admin/retail-stores</code>.
        {!stores.length
          ? ' Assignment page-1 seed may not include this rep — list stays empty until full dump.'
          : ''}
      </StubNote>
      {stores.length ? (
        <DataTable
          headers={['Store', 'Account', 'City', 'State', 'Rep']}
          rows={stores.map((s) => [s.store, s.account, s.city, s.state, s.rep])}
        />
      ) : (
        <p className="text-sm text-stone-600">
          No retail doors for {scope.matchedName} in the current assignment
          sample.
        </p>
      )}
    </AppShell>
  );
}
