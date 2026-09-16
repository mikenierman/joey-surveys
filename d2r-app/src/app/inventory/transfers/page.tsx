import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import {
  AppShell,
  PageTitle,
  DataTable,
  StubNote,
  ClusterNav,
  OfflineScopeBanner,
} from '@/components/ui';
import { getTransferMeta, getTransfers } from '@/lib/data';
import { REP_INVENTORY_NAV } from '@/lib/rep-inventory-nav';
import { resolveRepScope, scopeMatchesWarehouse } from '@/lib/rep-scope';

function pagesHintTotal(pagesHint: unknown): number | null {
  if (typeof pagesHint !== 'string') return null;
  const parts = pagesHint
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const last = parts[parts.length - 1];
  const n = Number(last);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default async function RepTransfersPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const scope = resolveRepScope(user);
  const all = getTransfers();
  const transfers = all.filter((r) => scopeMatchesWarehouse(r.warehouse, scope));
  const meta = getTransferMeta();
  const page = Number(meta?.page) || 1;
  const totalPages = pagesHintTotal(meta?.pagesHint) ?? 21;

  return (
    <AppShell user={user}>
      <PageTitle
        title="Transfers"
        subtitle={`Warehouse scope: ${
          scope.warehouseNames[0] || scope.matchedName
        }`}
      />
      <OfflineScopeBanner text={scope.scopeBanner} />
      <ClusterNav items={REP_INVENTORY_NAV} current="/inventory/transfers" />
      <StubNote>
        Offline sample page {page} of ~{totalPages}, filtered to warehouses for{' '}
        {scope.matchedName} ({transfers.length} of {all.length} seeded rows).
        Create / preview are stubs; approve stays admin-side.
      </StubNote>
      {transfers.length ? (
        <DataTable
          headers={[
            'Transfer ID',
            'Store',
            'Warehouse',
            'Status',
            'Items',
            'Approved',
            'Created',
            'Actions',
          ]}
          rows={transfers.map((r) => [
            r.transferId,
            r.store,
            r.warehouse,
            r.status,
            r.items,
            r.approved,
            r.created,
            r.actions || '—',
          ])}
        />
      ) : (
        <p className="text-sm text-stone-600">
          No transfers for {scope.matchedName} in the page-1 seed.
        </p>
      )}
    </AppShell>
  );
}
