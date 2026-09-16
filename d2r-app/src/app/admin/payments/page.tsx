import Link from 'next/link';
import { PageTitle, StubNote, DataTable, ClusterNav } from '@/components/ui';
import { PAYOUTS_CLUSTER_NAV } from '@/lib/payouts-nav';

/** Scaffold rows — no live finance capture yet. */
const SAMPLE = [
  {
    id: 'PAY-1001',
    date: '2026-09-12',
    payer: 'ALP Brand Remittance',
    amount: '$12,450.00',
    method: 'ach',
    reference: 'ACH-SEP-ALP-01',
    status: 'cleared',
    settlement: 'SET-2026-Q3-ALP',
  },
  {
    id: 'PAY-1002',
    date: '2026-09-14',
    payer: 'JOEY Circle K',
    amount: '$8,220.50',
    method: 'wire',
    reference: 'WIRE-JOEY-0914',
    status: 'pending',
    settlement: '—',
  },
  {
    id: 'PAY-1003',
    date: '2026-09-15',
    payer: 'FÜM Wholesale',
    amount: '$3,100.00',
    method: 'check',
    reference: 'CHK-4412',
    status: 'reconciled',
    settlement: 'SET-2026-Q3-FUM',
  },
];

export default function PaymentsPage() {
  return (
    <div>
      <PageTitle
        title="Payments"
        subtitle="Inbound brand remittances · offline scaffold"
      />
      <ClusterNav items={PAYOUTS_CLUSTER_NAV} current="/admin/payments" />
      <StubNote>
        Offline twin for <code>/admin/payments</code> — no live cash-ops capture. Sample
        rows are scaffold only. Record / Export / Mark cleared are display-only.{' '}
        <Link href="/admin/deposits" className="underline">
          Deposits
        </Link>
        {' · '}
        <Link href="/admin/receipts" className="underline">
          Receipts
        </Link>
        .
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Record payment (offline)
        </span>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Export (offline)
        </span>
      </div>
      <DataTable
        headers={[
          'ID',
          'Date',
          'Payer',
          'Amount',
          'Method',
          'Reference',
          'Status',
          'Linked settlement',
        ]}
        rows={SAMPLE.map((r) => [
          r.id,
          r.date,
          r.payer,
          r.amount,
          r.method,
          r.reference,
          r.status,
          r.settlement,
        ])}
      />
    </div>
  );
}
