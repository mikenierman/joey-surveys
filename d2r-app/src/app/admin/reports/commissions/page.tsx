import Link from 'next/link';
import { PageTitle, StubNote, StatCard, DataTable } from '@/components/ui';
import { ReportProxyBanner } from '@/components/report-proxy-banner';
import { getCommissions } from '@/lib/data';

function money(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CommissionsReportPage() {
  const rows = getCommissions();
  const byBrand = rows.reduce<Record<string, { count: number; total: number }>>((acc, r) => {
    const cur = acc[r.brand] || { count: 0, total: 0 };
    cur.count += 1;
    cur.total += r.amount;
    acc[r.brand] = cur;
    return acc;
  }, {});
  const brandRows = Object.entries(byBrand).sort((a, b) => b[1].total - a[1].total);
  const q3Total = rows
    .filter((r) => r.period === '2026-Q3')
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <PageTitle title="Commissions report" subtitle="Aggregated from commission seed" />
      <ReportProxyBanner
        proxyOf="commission seed scaffold (live capture was empty)"
        seedHint="commissions.json"
      />
      <StubNote>
        Offline mirror of <code>/admin/reports/commissions</code>. Not finance truth until live
        export replaces seed.
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/reports"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          ← Reports hub
        </Link>
        <Link
          href="/admin/commissions"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          Commission runs
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
          Period: <strong>All</strong>
        </span>
        <span>
          Rep: <strong>All</strong>
        </span>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Lines" value={String(rows.length)} />
        <StatCard label="Q3 total" value={money(q3Total)} />
        <StatCard label="Brands" value={String(brandRows.length)} />
      </div>
      <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-stone-500">
        By brand
      </h2>
      {brandRows.length ? (
        <DataTable
          headers={['Brand', 'Lines', 'Total']}
          rows={brandRows.map(([brand, agg]) => [brand, agg.count, money(agg.total)])}
        />
      ) : (
        <p className="text-sm text-stone-600">No commission rows in seed.</p>
      )}
    </div>
  );
}
