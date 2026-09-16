import Link from 'next/link';
import { PageTitle, StubNote, DataTable } from '@/components/ui';
import { getOrderDrafts } from '@/lib/data';

export default function AdminOrderDraftsPage() {
  const { headers, drafts, meta } = getOrderDrafts('admin');

  return (
    <div>
      <PageTitle title="Order drafts" subtitle="Unsubmitted POs (admin)" />
      <StubNote>
        Mapped from live <code>/admin/orders/drafts</code> — no row capture yet (
        {meta?.source ?? 'inferred'}). Submit and delete actions are stubbed.{' '}
        <Link className="underline" href="/admin/orders">
          Back to orders
        </Link>
        .
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <span className="rounded border border-stone-300 bg-white px-2 py-1 text-stone-600">
          Rep filter (stub)
        </span>
        <button
          type="button"
          disabled
          className="rounded border border-stone-300 bg-stone-100 px-2 py-1 text-stone-500"
        >
          Submit (stub)
        </button>
        <button
          type="button"
          disabled
          className="rounded border border-stone-300 bg-stone-100 px-2 py-1 text-stone-500"
        >
          Delete draft (stub)
        </button>
      </div>
      {drafts.length ? (
        <DataTable
          headers={[...headers]}
          rows={drafts.map((d) => headers.map((h) => d[h] ?? '—'))}
        />
      ) : (
        <p className="text-sm text-stone-600">
          No draft rows in seed. Expected columns: {headers.join(', ')}.
        </p>
      )}
    </div>
  );
}
