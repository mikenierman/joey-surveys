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
import { REP_INVENTORY_NAV } from '@/lib/rep-inventory-nav';
import { resolveRepScope, scopedInventorySample } from '@/lib/rep-scope';

export default async function RepInventoryPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const scope = resolveRepScope(user);
  const { meta, items, inScope } = scopedInventorySample(scope);

  return (
    <AppShell user={user}>
      <PageTitle
        title="My inventory"
        subtitle={
          inScope && meta
            ? `${String(meta.warehouse)} · sample seed`
            : `Scoped to ${scope.matchedName}`
        }
      />
      <OfflineScopeBanner text={scope.scopeBanner} />
      <ClusterNav items={REP_INVENTORY_NAV} current="/inventory" />
      <StubNote>
        {inScope
          ? `Showing consignment seed for warehouse matched to ${scope.matchedName}. Admin: /admin/inventory.`
          : `No inventory seed for ${scope.matchedName} / ${
              scope.warehouseNames.join(', ') || 'no warehouse'
            }. Twin only has ALP × D2R - Adam Scott sample until more exports land.`}
      </StubNote>
      {inScope ? (
        <DataTable
          headers={['Product', 'Variant', 'SKU', 'On hand', 'Available', 'Committed']}
          rows={items.map((item) => [
            item.product,
            item.variant,
            item.sku,
            item.onHand,
            item.available,
            item.committed,
          ])}
        />
      ) : (
        <p className="text-sm text-stone-600">No in-scope inventory rows.</p>
      )}
    </AppShell>
  );
}
