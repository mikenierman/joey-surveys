import Link from 'next/link';
import { PageTitle, StubNote, StatCard, DataTable } from '@/components/ui';
import { ReportProxyBanner } from '@/components/report-proxy-banner';
import { getLedgerBrandRows, getLedgerPerformance } from '@/lib/data';

export default function BrandSalesReportPage() {
  const { summary } = getLedgerPerformance();
  const brandRows = getLedgerBrandRows();
  const byBrand = brandRows.reduce<
    Record<string, { valueHeld: number; units: number; reps: number }>
  >((acc, r) => {
    const cur = acc[r.brand] || { valueHeld: 0, units: 0, reps: 0 };
    const value = Number(String(r.valueHeld || '0').replace(/[$,]/g, '')) || 0;
    cur.valueHeld += value;
    cur.units += r.unitsHeld ?? 0;
    cur.reps += 1;
    acc[r.brand] = cur;
    return acc;
  }, {});
  const tableRows = Object.entries(byBrand).sort((a, b) => b[1].valueHeld - a[1].valueHeld);

  return (
    <div>
      <PageTitle
        title="Brand sales"
        subtitle="Derived from consignment ledger until Shopify order sync"
      />
      <ReportProxyBanner
        proxyOf="consignment ledger brand rollups"
        seedHint="ledger-by-rep-brand.json"
      />
      <StubNote>
        Offline mirror of <code>/admin/reports/brand-sales</code>. Stand-in analytics until live
        brand-sales export.
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
          Brand: <strong>All</strong>
        </span>
        <span>
          Period: <strong>All</strong>
        </span>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Value held" value={String(summary?.valueHeld || '—')} />
        <StatCard label="Sell-through" value={String(summary?.sellThrough || '—')} />
        <StatCard label="Units held" value={String(summary?.unitsHeld || '—')} />
      </div>
      {tableRows.length ? (
        <DataTable
          headers={['Brand', 'Value held (rollup)', 'Units held', 'Rep rows']}
          rows={tableRows.map(([brand, agg]) => [
            brand,
            `$${agg.valueHeld.toLocaleString()}`,
            agg.units,
            agg.reps,
          ])}
        />
      ) : (
        <p className="text-sm text-stone-600">
          No brand rollup in seed — summary cards above are the placeholder until live export.
        </p>
      )}
    </div>
  );
}
