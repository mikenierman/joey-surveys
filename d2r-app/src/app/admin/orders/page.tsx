import Link from 'next/link';
import { PageTitle, StubNote } from '@/components/ui';
import { CreateOrderForm } from '@/components/create-order-form';
import { OrdersTable } from '@/components/orders-table';
import { SampleDepthBanner } from '@/components/sample-depth-banner';
import { getOrdersSnapshot } from '@/lib/data';

export default function OrdersPage() {
  const { meta, headers: orderHeaders, orders } = getOrdersSnapshot();
  const headers = orderHeaders;
  const page = meta?.page ?? 1;
  const approxPages = meta?.approxPages ?? 1034;
  const pageHint = `page ${page} of ~${approxPages}`;
  const approxProdRows = approxPages * 20;

  return (
    <div>
      <PageTitle
        title="Orders"
        subtitle={
          meta?.capturedAt
            ? `Offline sample · ${pageHint} · ${orders.length} rows · captured ${meta.capturedAt.slice(0, 10)}`
            : `Offline sample · ${pageHint} · ${orders.length} rows`
        }
      />
      <SampleDepthBanner
        page={page}
        totalPages={approxPages}
        sampleRows={orders.length}
        prodTotal={approxProdRows}
        unit="orders"
        seedFile="orders.json"
        extra={
          <>
            Filters, export, and pagination are stubbed.{' '}
            <Link className="underline" href="/admin/orders/drafts">
              View drafts
            </Link>
            .
          </>
        }
      />
      <StubNote>
        Live headers: PO Number, Store, Account, Customer, Location, Fulfillment, ETA,
        Total, Sales Rep, Created.
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <span className="rounded border border-stone-300 bg-white px-2 py-1 text-stone-600">
          Fulfillment filter (stub)
        </span>
        <span className="rounded border border-stone-300 bg-white px-2 py-1 text-stone-600">
          Store filter (stub)
        </span>
        <span className="rounded border border-stone-300 bg-white px-2 py-1 text-stone-600">
          Sales rep filter (stub)
        </span>
        <span className="rounded border border-stone-300 bg-white px-2 py-1 text-stone-600">
          Date range (stub)
        </span>
        <span className="rounded border border-stone-300 bg-white px-2 py-1 text-stone-600">
          Export (stub)
        </span>
      </div>
      <CreateOrderForm />
      {orders.length ? (
        <OrdersTable headers={headers} rows={orders} />
      ) : (
        <p className="text-sm text-stone-600">
          No orders in seed — run ingest on <code>orders-page1-live.json</code>.
        </p>
      )}
    </div>
  );
}
