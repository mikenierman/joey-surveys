import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { AppShell, PageTitle, StubNote, DataTable } from '@/components/ui';
import { getRetailStores } from '@/lib/data';

export default async function RepRetailStoresPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const { stores, derived } = getRetailStores();

  return (
    <AppShell user={user}>
      <PageTitle
        title="Retail stores"
        subtitle={`${stores.length} doors ${derived ? 'derived from assignments' : 'from export'}`}
      />
      <StubNote>
        Rep-facing mirror of <code>/retail-stores</code> (admin:{' '}
        <code>/admin/retail-stores</code>).
      </StubNote>
      <DataTable
        headers={['Store', 'Account', 'City', 'State', 'Rep']}
        rows={stores.map((s) => [s.store, s.account, s.city, s.state, s.rep])}
      />
    </AppShell>
  );
}
