import Link from 'next/link';
import { PageTitle, StubNote, DataTable } from '@/components/ui';
import { getSettlements } from '@/lib/data';

function money(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
}

export default function SettlementBatchPreviewPage() {
  const preview = getSettlements().filter((r) => r.status === 'preview');
  const totalNet = preview.reduce((sum, r) => sum + r.net, 0);

  return (
    <div>
      <PageTitle
        title="Settlement batch preview"
        subtitle={`${preview.length} batches · ${money(totalNet)} net before commit`}
      />
      <StubNote>
        Stub for <code>/admin/settlements/batch/preview</code>. Commit / Cancel are offline until
        settlement engine is wired.
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/settlements"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          ← All settlements
        </Link>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Commit (offline)
        </span>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Cancel (offline)
        </span>
      </div>
      {preview.length ? (
        <DataTable
          headers={['ID', 'Period', 'Brand', 'Gross', 'Adjustments', 'Net', 'Commissions', 'Notes']}
          rows={preview.map((r) => [
            r.id,
            r.period,
            r.brand,
            money(r.gross),
            money(r.adjustments),
            money(r.net),
            r.commissionTotal != null ? money(r.commissionTotal) : '—',
            r.notes || '—',
          ])}
        />
      ) : (
        <p className="text-sm text-stone-600">No preview batches in seed.</p>
      )}
    </div>
  );
}
