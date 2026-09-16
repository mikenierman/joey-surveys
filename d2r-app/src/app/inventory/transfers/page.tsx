import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import {
  AppShell,
  PageTitle,
  StubNote,
  ClusterNav,
} from '@/components/ui';
import { getTransferMeta, getTransfers } from '@/lib/data';
import { REP_INVENTORY_NAV } from '@/lib/rep-inventory-nav';

function pagesHintTotal(pagesHint: unknown): number | null {
  if (typeof pagesHint !== 'string') return null;
  const parts = pagesHint
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const last = parts[parts.length - 1];
  const n = Number(last);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default async function RepTransfersPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const transfers = getTransfers();
  const meta = getTransferMeta();
  const page = Number(meta?.page) || 1;
  const totalPages = pagesHintTotal(meta?.pagesHint) ?? 21;

  return (
    <AppShell user={user}>
      <PageTitle title="Transfers" subtitle="Your transfer activity" />
      <ClusterNav items={REP_INVENTORY_NAV} current="/inventory/transfers" />
      <StubNote>
        Offline sample mirror of admin page {page} of ~{totalPages}. Transfer IDs
        open detail stubs; create is at{' '}
        <Link href="/inventory/transfers/create" className="underline">
          Create transfer
        </Link>
        .
      </StubNote>
      <div className="overflow-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              {[
                'Transfer ID',
                'Store',
                'Warehouse',
                'Status',
                'Items',
                'Approved',
                'Created',
                'Actions',
              ].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transfers.map((r) => (
              <tr key={r.transferId} className="border-t border-stone-100">
                <td className="px-3 py-2 whitespace-nowrap">
                  <Link
                    href={`/inventory/transfers/${encodeURIComponent(r.transferId)}`}
                    className="text-amber-800 underline"
                  >
                    {r.transferId}
                  </Link>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{r.store}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.warehouse}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.status}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.items}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.approved}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.created}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <Link
                    href={`/inventory/transfers/${encodeURIComponent(r.transferId)}/receive`}
                    className="underline"
                  >
                    Receive
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
