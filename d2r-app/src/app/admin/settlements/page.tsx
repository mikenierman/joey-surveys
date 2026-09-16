import Link from 'next/link';
import { ClusterNav, PageTitle, StubNote, StatCard, DataTable } from '@/components/ui';
import { PAYOUTS_CLUSTER_NAV } from '@/lib/payouts-nav';
import { getSettlements, getSettlementsMeta } from '@/lib/data';

function money(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
}

export default function SettlementsPage() {
  const rows = getSettlements();
  const meta = getSettlementsMeta();
  const preview = rows.filter((r) => r.status === 'preview');
  const closedNet = rows
    .filter((r) => r.status === 'closed')
    .reduce((sum, r) => sum + r.net, 0);

  return (
    <div>
      <PageTitle
        title="Settlements"
        subtitle={`${rows.length} batches · ${String(meta?.source || 'twin seed')}`}
      />
      <ClusterNav items={PAYOUTS_CLUSTER_NAV} current="/admin/settlements" />
      <StubNote>
        Offline mirror of <code>/admin/settlements</code>. Brand gross/net figures are
        scaffold aligned to store registry (ALP, JOEY, FÜM, Bangers) until live batch export.
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/settlements/batch/preview"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          Batch preview ({preview.length})
        </Link>
        <Link
          href="/admin/commissions"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          Commissions
        </Link>
        <Link
          href="/admin/payouts"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          Payouts
        </Link>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Create batch (offline)
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
          Brand: <strong>All</strong>
        </span>
        <span>
          Status: <strong>All</strong>
        </span>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Preview batches" value={String(preview.length)} />
        <StatCard
          label="Preview net"
          value={money(preview.reduce((s, r) => s + r.net, 0))}
        />
        <StatCard label="Closed net (seed)" value={money(closedNet)} />
      </div>
      <DataTable
        headers={[
          'ID',
          'Period',
          'Brand',
          'Orders',
          'Gross',
          'Adjustments',
          'Net',
          'Commissions',
          'Status',
          'Created',
        ]}
        rows={rows.map((r) => [
          r.id,
          r.period,
          r.brand,
          r.orderCount ?? '—',
          money(r.gross),
          money(r.adjustments),
          money(r.net),
          r.commissionTotal != null ? money(r.commissionTotal) : '—',
          r.status,
          r.createdAt,
        ])}
      />
    </div>
  );
}
