import Link from 'next/link';
import { PageTitle, StubNote, DataTable } from '@/components/ui';

const SAMPLE_EVENTS = [
  {
    time: '2026-09-16 08:01:12',
    event: 'created',
    detail: 'PO D2R-21939 created by Shay Schnoor',
  },
  {
    time: '2026-09-16 08:02:44',
    event: 'routed',
    detail: 'Routed to Lucy (New!) · Arena Plaza',
  },
  {
    time: '2026-09-16 09:15:03',
    event: 'fulfilled',
    detail: 'Fulfillment marked complete (offline sample)',
  },
];

export default function OrderTimelineDiagnosticsPage() {
  return (
    <div>
      <PageTitle
        title="Order timeline"
        subtitle="Diagnostics · offline stub"
      />
      <StubNote>
        Minimal offline stub for <code>/admin/diagnostics/order-timeline</code>. Lookup is
        display-only; sample events illustrate column shape for PO{' '}
        <code>D2R-21939</code> from orders seed.{' '}
        <Link href="/admin/orders" className="underline">
          Orders
        </Link>
        .
      </StubNote>
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 bg-white p-3 text-sm">
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
            Order ID
          </span>
          <input
            type="text"
            disabled
            defaultValue="D2R-21939"
            className="rounded border border-stone-300 bg-stone-50 px-3 py-1.5 text-stone-600"
          />
        </label>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Lookup (offline)
        </span>
      </div>
      <DataTable
        headers={['Time', 'Event', 'Detail']}
        rows={SAMPLE_EVENTS.map((r) => [r.time, r.event, r.detail])}
      />
    </div>
  );
}
