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
} from '@/components/ui';
import { CUSTOMERS_CLUSTER_NAV } from '@/lib/customers-nav';

type SearchParams = Promise<{ account?: string; q?: string }>;

/** Inferred live columns: Name · Email · Phone · Account · Role */
const LIVE_HEADERS = ['Name', 'Email', 'Phone', 'Account', 'Role'] as const;

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <div>
      <PageTitle
        title="Contacts"
        subtitle="CRM people at accounts — no live capture seeded"
      />
      <ClusterNav items={CUSTOMERS_CLUSTER_NAV} current="/admin/contacts" />
      <StubNote>
        Offline shell for <code>/admin/contacts</code>. No contacts export in
        vault — table headers match site-map inferred columns. Seed from a live
        scrape before wiring row actions.
      </StubNote>
      <FilterBar>
        <FilterField
          label="Account"
          name="account"
          defaultValue={params.account || ''}
          placeholder="All accounts"
        />
        <FilterField
          label="Search"
          name="q"
          defaultValue={params.q || ''}
          placeholder="Name or email"
        />
        <FilterActions>
          <FilterSubmit />
          <FilterReset href="/admin/contacts" />
        </FilterActions>
      </FilterBar>
      <DataTable
        headers={[...LIVE_HEADERS]}
        rows={[]}
        emptyMessage="No contacts seeded — scrape /admin/contacts for offline rows."
      />
    </div>
  );
}
