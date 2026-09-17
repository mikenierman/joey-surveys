import Link from 'next/link';
import { PageTitle, DataTable, StubNote } from '@/components/ui';
import { ReportProxyBanner } from '@/components/report-proxy-banner';
import { getLedgerPerformance } from '@/lib/data';

export default function RepSalesReportPage() {
  const { reps } = getLedgerPerformance();

  return (
    <div>
      <PageTitle title="Rep sales" subtitle="Sell-through and recent movement by rep" />
      <ReportProxyBanner
        proxyOf="ledger performance sell-through metrics"
        seedHint="ledger-performance.json"
      />
      <StubNote>
        Offline mirror of <code>/admin/reports/rep-sales</code>. Proxy until live rep-sales
        report capture.
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/reports"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          ← Reports hub
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
          Rep: <strong>All</strong>
        </span>
        <span>
          Period: <strong>All</strong>
        </span>
      </div>
      {reps.length ? (
        <DataTable
          headers={['Rep', 'Sell-through', 'Sold 7d', 'Last sale', 'Value held']}
          rows={reps.map((r) => [r.rep, r.sellThrough, r.soldLast7d, r.lastSale, r.valueHeld])}
        />
      ) : (
        <p className="text-sm text-stone-600">No rep rows in ledger performance seed.</p>
      )}
    </div>
  );
}
