import Link from 'next/link';
import { PageTitle, StubNote, DataTable, ClusterNav } from '@/components/ui';
import { PAYOUTS_CLUSTER_NAV } from '@/lib/payouts-nav';

/** Scaffold rows — no live finance capture yet. */
const SAMPLE = [
  {
    id: 'DEP-501',
    bank: 'Operating · ****2144',
    depositDate: '2026-09-13',
    amount: '$12,450.00',
    status: 'reconciled',
    matched: '1',
    variance: '$0.00',
  },
  {
    id: 'DEP-502',
    bank: 'Operating · ****2144',
    depositDate: '2026-09-15',
    amount: '$8,220.50',
    status: 'open',
    matched: '0',
    variance: '—',
  },
  {
    id: 'DEP-503',
    bank: 'Settlement · ****8891',
    depositDate: '2026-09-16',
    amount: '$3,075.00',
    status: 'exception',
    matched: '1',
    variance: '-$25.00',
  },
];

export default function DepositsPage() {
  return (
    <div>
      <PageTitle
        title="Deposits"
        subtitle="Bank deposit tracking · offline scaffold"
      />
      <ClusterNav items={PAYOUTS_CLUSTER_NAV} current="/admin/deposits" />
      <StubNote>
        Offline twin for <code>/admin/deposits</code> — no live bank capture. Sample rows are
        scaffold only; account masks are fictional. Reconcile / Record deposit are
        display-only.{' '}
        <Link href="/admin/payments" className="underline">
          Payments
        </Link>
        {' · '}
        <Link href="/admin/receipts" className="underline">
          Receipts
        </Link>
        .
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Record deposit (offline)
        </span>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Reconcile (offline)
        </span>
      </div>
      <DataTable
        headers={[
          'ID',
          'Bank account',
          'Deposit date',
          'Amount',
          'Status',
          'Matched payments',
          'Variance',
        ]}
        rows={SAMPLE.map((r) => [
          r.id,
          r.bank,
          r.depositDate,
          r.amount,
          r.status,
          r.matched,
          r.variance,
        ])}
      />
    </div>
  );
}
