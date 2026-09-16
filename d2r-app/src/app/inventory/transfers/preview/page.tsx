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
        Preview line items PendingLane — awaiting transfer create/preview capture.
      </div>
    </AppShell>
  );
}
