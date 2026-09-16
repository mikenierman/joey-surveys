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
import { getAccounts } from '@/lib/data';

type SearchParams = Promise<{ rep?: string; status?: string; q?: string }>;

/** Inferred live columns: Account · Rep · City · State · Status */
const LIVE_HEADERS = ['Account', 'Rep', 'City', 'State', 'Status'] as const;

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { accounts: all, derived } = getAccounts();
  const rep = params.rep || '';
  const status = params.status || '';
  const query = (params.q || '').trim().toLowerCase();
  const reps = [...new Set(all.map((a) => a.rep).filter(Boolean))].sort();

  const accounts = all.filter((a) => {
    if (rep && a.rep !== rep) return false;
    if (status && a.status !== status) return false;
    if (!query) return true;
    return (
      a.account.toLowerCase().includes(query) ||
      a.city.toLowerCase().includes(query) ||
      a.state.toLowerCase().includes(query) ||
      a.rep.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <PageTitle
        title="Accounts"
        subtitle={
          derived
            ? `${all.length} accounts derived from assignment sample`
            : `${all.length} accounts`
        }
      />
      <ClusterNav items={CUSTOMERS_CLUSTER_NAV} current="/admin/accounts" />
      <StubNote>
        No dedicated <code>accounts.json</code> capture — unique Account values
        inferred from <code>rep-assignments.json</code> (page-1 sample). Status
        defaults to Active. Scrape <code>/admin/accounts</code> for full CRM
        parity.
      </StubNote>
      <FilterBar>
        <FilterField
          label="Rep"
          name="rep"
          defaultValue={rep}
          options={reps.map((r) => ({ value: r, label: r }))}
        />
        <FilterField
          label="Status"
          name="status"
          defaultValue={status}
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
          ]}
        />
        <FilterField
          label="Search"
          name="q"
          defaultValue={params.q || ''}
          placeholder="Account, city, or rep"
        />
        <FilterActions>
          <FilterSubmit />
          <FilterReset href="/admin/accounts" />
        </FilterActions>
      </FilterBar>
      <DataTable
        headers={[...LIVE_HEADERS]}
        emptyMessage="No accounts match filters — or await accounts export."
        rows={accounts.map((a) => [a.account, a.rep, a.city, a.state, a.status])}
      />
    </div>
  );
}
