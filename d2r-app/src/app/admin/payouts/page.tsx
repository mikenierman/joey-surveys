import Link from 'next/link';
import { PageTitle, StubNote, StatCard, DataTable, ClusterNav } from '@/components/ui';
import { getPayouts, getPayoutsMeta } from '@/lib/data';
import { PAYOUTS_CLUSTER_NAV } from '@/lib/payouts-nav';

function money(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PayoutsPage() {
  const rows = getPayouts();
  const meta = getPayoutsMeta();
  const scheduled = rows.filter((r) => r.status === 'scheduled' || r.status === 'processing');
  const paid = rows.filter((r) => r.status === 'paid');
  const onHold = rows.filter((r) => r.status === 'on_hold' || r.status === 'failed');

  return (
    <div>
      <PageTitle
        title="Payouts"
        subtitle={`${rows.length} runs · ${String(meta?.source || 'twin seed')}`}
      />
      <ClusterNav items={PAYOUTS_CLUSTER_NAV} current="/admin/payouts" />
      <StubNote>
        Offline mirror of <code>/admin/payouts</code>. ACH/check rows link to approved commissions
        in seed; rule names match <code>/admin/payouts/rules</code> scaffold.
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/payouts/rules"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          Payout rules
        </Link>
        <Link
          href="/admin/settlements"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          Settlements
        </Link>
        <Link
          href="/admin/commissions"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          Commissions
        </Link>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Run payouts (offline)
        </span>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Export (offline)
        </span>
      </div>
      <div className="mb-4 flex flex-wrap gap-3 text-xs text-stone-600">
        <span>
          Status: <strong>All</strong>
        </span>
        <span>
          Method: <strong>All</strong>
        </span>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Scheduled / processing"
          value={money(scheduled.reduce((s, r) => s + r.amount, 0))}
        />
        <StatCard label="Paid (seed)" value={money(paid.reduce((s, r) => s + r.amount, 0))} />
        <StatCard label="Hold / failed" value={String(onHold.length)} />
      </div>
      <DataTable
        headers={['ID', 'Rep', 'Method', 'Amount', 'Status', 'Run date', 'Rule', 'Notes']}
        rows={rows.map((r) => [
          r.id,
          r.rep,
          r.method,
          money(r.amount),
          r.status,
          r.runDate || '—',
          r.rule,
          r.notes || '—',
        ])}
      />
    </div>
  );
}
