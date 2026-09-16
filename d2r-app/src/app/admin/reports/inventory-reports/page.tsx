import Link from 'next/link';
import { PageTitle, StubNote, DataTable } from '@/components/ui';
import { getInventorySample } from '@/lib/data';

export default function InventoryReportsPage() {
  const { rows } = getInventorySample();

  return (
    <div>
      <PageTitle title="Inventory reports" subtitle="On-hand vs available (sample warehouse)" />
      <StubNote>
        Offline mirror of <code>/admin/reports/inventory-reports</code>. Expand with full warehouse
        exports; sample SKUs stand in until live report runner capture.
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/reports"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          ← Reports hub
        </Link>
        <Link
          href="/admin/inventory/ledgers"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          Inventory ledgers
        </Link>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Run (offline)
        </span>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Export (offline)
        </span>
      </div>
      <div className="mb-4 flex flex-wrap gap-3 text-xs text-stone-600">
        <span>
          Warehouse: <strong>All</strong>
        </span>
        <span>
          Brand: <strong>All</strong>
        </span>
      </div>
      {rows.length ? (
        <DataTable
          headers={['SKU', 'On hand', 'Available', 'Committed']}
          rows={rows.map((r) => [r.SKU, r['On hand'], r.Available, r.Committed])}
        />
      ) : (
        <p className="text-sm text-stone-600">No inventory sample rows in seed.</p>
      )}
    </div>
  );
}
