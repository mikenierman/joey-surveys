import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import {
  AppShell,
  PageTitle,
  StubNote,
  ClusterNav,
} from '@/components/ui';
import { REP_INVENTORY_NAV } from '@/lib/rep-inventory-nav';

export default async function TransferReceivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  const { id } = await params;

  return (
    <AppShell user={user}>
      <PageTitle
        title="Receive transfer"
        subtitle={`Transfer ${id} · offline stub`}
      />
      <ClusterNav items={REP_INVENTORY_NAV} current="/inventory/transfers" />
      <StubNote>
        Mapped live route <code>/inventory/transfers/{id}/receive</code>. Confirm /
        reject writes are disabled in the twin.{' '}
        <Link href={`/inventory/transfers/${id}`} className="underline">
          Back to detail
        </Link>
        .
      </StubNote>
      <div className="rounded-xl border border-dashed border-amber-400/80 bg-amber-50 px-6 py-10 text-center text-sm text-stone-600">
        Receive checklist PendingLane — awaiting live capture of receive UI.
      </div>
    </AppShell>
  );
}
