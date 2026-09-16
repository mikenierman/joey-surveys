import { PageTitle, StubNote, DataTable } from '@/components/ui';
import { getRetailStores } from '@/lib/data';

export default function RetailStoresPage() {
  const { stores, derived } = getRetailStores();

  return (
    <div>
      <PageTitle
        title="Retail stores"
        subtitle={`${stores.length} doors ${derived ? 'derived from assignment sample' : 'from export'}`}
      />
      <StubNote>
        No dedicated <code>retail-stores.json</code> capture yet — unique stores are inferred from{' '}
        <code>rep-assignments.json</code> (page-1 sample). Scrape{' '}
        <code>/admin/retail-stores</code> for the full door list.
      </StubNote>
      <DataTable
        headers={['Store', 'Account', 'City', 'State', 'Rep']}
        rows={stores.map((s) => [s.store, s.account, s.city, s.state, s.rep])}
      />
    </div>
  );
}
