import Link from 'next/link';
import { PageTitle, StubNote, StatCard, DataTable, ClusterNav } from '@/components/ui';
import { getCommissions, getCommissionsMeta } from '@/lib/data';
import { PAYOUTS_CLUSTER_NAV } from '@/lib/payouts-nav';

function money(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CommissionsPage() {
  const rows = getCommissions();
  const meta = getCommissionsMeta();
  const pending = rows.filter((r) => r.status === 'pending_review');
  const approvedQ3 = rows.filter(
    (r) => r.period === '2026-Q3' && r.status === 'approved'
  );
  const paidTotal = rows
    .filter((r) => r.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div>
      <PageTitle
        title="Commissions"
        subtitle={`${rows.length} rows · ${String(meta?.source || 'twin seed')}`}
      />
      <ClusterNav items={PAYOUTS_CLUSTER_NAV} current="/admin/commissions" />
      <StubNote>
        Offline mirror of <code>/admin/commissions</code>. Rep/brand names align with ledger +
        orders exports; amounts and statuses are scaffold until live commission rules import.
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/commissions/review"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          Review queue ({pending.length})
        </Link>
        <Link
          href="/admin/settlements"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          Settlements
        </Link>
        <Link
          href="/admin/reports/commissions"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          Commissions report
        </Link>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Calculate (offline)
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
        <StatCard label="Pending review" value={String(pending.length)} />
        <StatCard
          label="Approved (Q3)"
          value={money(approvedQ3.reduce((s, r) => s + r.amount, 0))}
        />
        <StatCard label="Paid (seed total)" value={money(paidTotal)} />
      </div>
      <DataTable
        headers={['ID', 'Rep', 'Brand', 'Period', 'Orders', 'Rate', 'Amount', 'Status', 'Updated']}
        rows={rows.map((r) => [
          r.id,
          r.rep,
          r.brand,
          r.period,
          r.orderCount ?? '—',
          r.rate ?? '—',
          money(r.amount),
          r.status,
          r.updatedAt,
        ])}
      />
    </div>
  );
}
