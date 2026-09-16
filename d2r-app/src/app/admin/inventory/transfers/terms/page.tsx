import Link from 'next/link';
import {
  PageTitle,
  StubNote,
  DataTable,
  ClusterNav,
} from '@/components/ui';
import { INVENTORY_CLUSTER_NAV } from '@/lib/inventory-nav';

const TERM_VERSIONS = [
  {
    version: 'v1.2',
    effective: '2026-07-01',
    status: 'active',
    summary: 'Standard consignment transfer terms (offline placeholder)',
  },
  {
    version: 'v1.1',
    effective: '2026-01-15',
    status: 'superseded',
    summary: 'Prior terms — liability clause update',
  },
];

export default function TransferTermsPage() {
  return (
    <div>
      <PageTitle
        title="Transfer terms"
        subtitle="Terms shown on transfer create / approve"
      />
      <ClusterNav
        items={INVENTORY_CLUSTER_NAV}
        current="/admin/inventory/transfers"
      />
      <StubNote>
        Offline stub for <code>/admin/inventory/transfers/terms</code> — no live HTML/JSON
        capture. Body below is placeholder copy; Save / Cancel are display-only.{' '}
        <Link href="/admin/inventory/transfers" className="underline">
          Back to transfers
        </Link>
        .
      </StubNote>
      <DataTable
        headers={['Version', 'Effective', 'Status', 'Summary']}
        rows={TERM_VERSIONS.map((r) => [
          r.version,
          r.effective,
          r.status,
          r.summary,
        ])}
      />
      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4">
        <label className="mb-2 block text-sm font-medium text-stone-700">
          Terms body (offline)
        </label>
        <textarea
          readOnly
          rows={8}
          className="w-full rounded border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-700"
          defaultValue={`By initiating or approving an inventory transfer, the receiving party acknowledges title and risk terms as defined by Direct2Retailers consignment policy. Quantities must be verified on receive. Damages and shortages must be reported within the stated window. (Offline twin placeholder — replace with live capture.)`}
        />
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
            Save (offline)
          </span>
          <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
            Cancel (offline)
          </span>
        </div>
      </div>
    </div>
  );
}
