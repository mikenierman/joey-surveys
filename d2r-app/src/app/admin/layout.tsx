import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { AppShell, PendingLane } from '@/components/ui';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const h = await headers();
  const pendingLane = h.get('x-pending-lane');

  return (
    <AppShell user={user} pendingLane={pendingLane}>
      {pendingLane ? <PendingLane path={pendingLane} /> : children}
    </AppShell>
  );
}
