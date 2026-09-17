import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import {
  AppShell,
  PageTitle,
  StubNote,
  ClusterNav,
  OfflineScopeBanner,
} from '@/components/ui';
import { REP_INVENTORY_NAV } from '@/lib/rep-inventory-nav';
import { resolveRepScope } from '@/lib/rep-scope';

export default async function TransferPreviewPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const scope = resolveRepScope(user);

  return (
    <AppShell user={user}>
      <PageTitle
        title="Transfer preview"
        subtitle="Confirm before submit — offline stub"
      />
      <OfflineScopeBanner text={scope.scopeBanner} />
      <ClusterNav
        items={REP_INVENTORY_NAV}
        current="/inventory/transfers/preview"
      />
      <StubNote>
        Mapped live route <code>/inventory/transfers/preview</code>. No live capture —
        confirm/submit stays disabled. Warehouse scope:{' '}
        {scope.warehouseNames.length
          ? scope.warehouseNames.join(', ')
          : scope.matchedName}
        .{' '}
        <Link href="/inventory/transfers/create" className="underline">
          Back to create
        </Link>{' '}
        ·{' '}
        <Link href="/inventory/transfers" className="underline">
          Transfer list
        </Link>
        .
      </StubNote>
      <div className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-500">
        <p className="mb-3 font-medium text-stone-700">Transfer preview (offline stub)</p>
        <p className="mb-4">
          Line items, qty, and warehouse confirm will appear here after create/preview
          capture. Submit stays disabled in the twin.
        </p>
        <div className="mx-auto max-w-md overflow-hidden rounded border border-stone-200 text-left">
          <div className="grid grid-cols-3 gap-2 border-b border-stone-200 bg-stone-50 px-3 py-2 text-xs uppercase tracking-wide text-stone-500">
            <span>SKU</span>
            <span>Qty</span>
            <span>Warehouse</span>
          </div>
          <div className="px-3 py-6 text-center text-stone-400">No preview rows</div>
        </div>
      </div>
    </AppShell>
  );
}
