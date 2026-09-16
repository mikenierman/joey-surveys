import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import {
  AppShell,
  PageTitle,
  StubNote,
  ClusterNav,
  DataTable,
  OfflineScopeBanner,
} from '@/components/ui';
import { REP_INVENTORY_NAV } from '@/lib/rep-inventory-nav';
import { getLedgerBrandRows } from '@/lib/data';
import { resolveRepScope, scopeMatchesRep } from '@/lib/rep-scope';

export default async function RepLedgersPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const scope = resolveRepScope(user);
  const rows = getLedgerBrandRows().filter((r) => scopeMatchesRep(r.rep, scope));

  return (
    <AppShell user={user}>
      <PageTitle
        title="Ledgers"
        subtitle={`Brand ledger for ${scope.matchedName}`}
      />
      <OfflineScopeBanner text={scope.scopeBanner} />
      <ClusterNav items={REP_INVENTORY_NAV} current="/inventory/ledgers" />
      <StubNote>
        Offline mirror of <code>/inventory/ledgers</code> filtered to{' '}
        {scope.matchedName}. Admin: <code>/admin/inventory/ledgers</code>.
      </StubNote>
      <DataTable
        headers={['Rep', 'Brand', 'Value held', 'Units', 'Sell-through']}
        rows={
          rows.length
            ? rows.map((r) => [
                r.rep,
                r.brand,
                r.valueHeld ?? '—',
                r.unitsHeld ?? '—',
                r.sellThrough ?? '—',
              ])
            : [['—', `No ledger rows for ${scope.matchedName}`, '—', '—', '—']]
        }
      />
    </AppShell>
  );
}
