import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import {
  AppShell,
  PageTitle,
  DataTable,
  StubNote,
  ClusterNav,
} from '@/components/ui';
import { getInventorySample } from '@/lib/data';
import { REP_INVENTORY_NAV } from '@/lib/rep-inventory-nav';

export default async function RepInventoryPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const { meta, items } = getInventorySample();
  return (
    <AppShell user={user}>
      <PageTitle
        title="My inventory"
        subtitle={
          meta
            ? `${String(meta.warehouse)} · sample seed`
            : 'Rep-facing consignment view'
        }
      />
      <ClusterNav items={REP_INVENTORY_NAV} current="/inventory" />
      <StubNote>
        Showing sample warehouse seed until per-rep assignment import lands. Admin view has full
        column set at /admin/inventory.
      </StubNote>
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
    </AppShell>
  );
}
