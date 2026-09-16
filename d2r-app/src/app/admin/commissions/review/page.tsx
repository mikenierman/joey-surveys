import Link from 'next/link';
import { ClusterNav, PageTitle, StubNote, DataTable } from '@/components/ui';
import { PAYOUTS_CLUSTER_NAV } from '@/lib/payouts-nav';
import { getCommissions } from '@/lib/data';

function money(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CommissionReviewPage() {
  const pending = getCommissions().filter((r) => r.status === 'pending_review');

  return (
    <div>
      <PageTitle
        title="Commission review"
        subtitle={`${pending.length} lines awaiting approval`}
      />
      <ClusterNav items={PAYOUTS_CLUSTER_NAV} current="/admin/commissions/review" />
      <StubNote>
        Stub for <code>/admin/commissions/review</code>. Approve / Reject / Adjust actions are
        offline-only until payout rules import.
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/commissions"
          className="rounded border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
        >
          ← All commissions
        </Link>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Approve (offline)
        </span>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Reject (offline)
        </span>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Adjust (offline)
        </span>
      </div>
      <div className="mb-4 flex flex-wrap gap-3 text-xs text-stone-600">
        <span>
          Period: <strong>All</strong>
        </span>
      </div>
      {pending.length ? (
        <DataTable
          headers={[
            'Rep',
            'Brand',
            'Period',
            'Line item',
            'Basis',
            'Rate',
            'Amount',
            'Variance',
            'Status',
          ]}
          rows={pending.map((r) => [
            r.rep,
            r.brand,
            r.period,
            r.id,
            r.orderCount != null ? `${r.orderCount} orders` : '—',
            r.rate ?? '—',
            money(r.amount),
            '—',
            r.status,
          ])}
        />
      ) : (
        <p className="text-sm text-stone-600">No pending commission lines in seed.</p>
      )}
    </div>
  );
}
