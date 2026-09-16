import {
  PageTitle,
  DataTable,
  ClusterNav,
  StubNote,
} from '@/components/ui';
import { INVENTORY_CLUSTER_NAV } from '@/lib/inventory-nav';

export default function InventoryAuditPage() {
  return (
    <div>
      <PageTitle
        title="Inventory audit"
        subtitle="Level change trail (When, SKU, Warehouse, Delta, Actor)"
      />
      <ClusterNav items={INVENTORY_CLUSTER_NAV} current="/admin/inventory/audit" />
      <StubNote>
        No audit export captured yet — mapped UI only per site map. Add weekly audit trail export
        to seed before cutover. Filter and Export controls are placeholders.
      </StubNote>
      <DataTable
        headers={['When', 'SKU', 'Warehouse', 'Delta', 'Actor']}
        rows={[]}
      />
    </div>
  );
}
