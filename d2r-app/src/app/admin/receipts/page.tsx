import Link from 'next/link';
import { PageTitle, StubNote, DataTable, ClusterNav } from '@/components/ui';
import { PAYOUTS_CLUSTER_NAV } from '@/lib/payouts-nav';

/** Scaffold rows — no live receipt archive capture yet. */
const SAMPLE = [
  {
    id: 'RCP-901',
    date: '2026-09-12',
    payer: 'ALP Brand Remittance',
    amount: '$12,450.00',
    type: 'ACH advice',
    linkedPayment: 'PAY-1001',
    file: 'alp-ach-sep.pdf',
  },
  {
    id: 'RCP-902',
    date: '2026-09-15',
    payer: 'FÜM Wholesale',
    amount: '$3,100.00',
    type: 'Check image',
    linkedPayment: 'PAY-1003',
    file: 'fum-chk-4412.pdf',
  },
];

export default function ReceiptsPage() {
  return (
    <div>
      <PageTitle
        title="Receipts"
        subtitle="Receipt archive · offline scaffold"
      />
      <ClusterNav items={PAYOUTS_CLUSTER_NAV} current="/admin/receipts" />
      <StubNote>
        Offline twin for <code>/admin/receipts</code> — no live archive capture. Sample
        filenames are placeholders (no files stored). Upload / Export are display-only.{' '}
        <Link href="/admin/payments" className="underline">
          Payments
        </Link>
        {' · '}
        <Link href="/admin/deposits" className="underline">
          Deposits
        </Link>
        .
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Upload (offline)
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
          'Type',
          'Linked payment',
          'File',
        ]}
        rows={SAMPLE.map((r) => [
          r.id,
          r.date,
          r.payer,
          r.amount,
          r.type,
          r.linkedPayment,
          r.file,
        ])}
      />
    </div>
  );
}
