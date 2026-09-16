import { PageTitle, StubNote, DataTable, StatCard } from '@/components/ui';
import { AddUserForm } from '@/components/add-user-form';
import { DEMO_USERS } from '@/lib/auth';
import { getUsers } from '@/lib/data';

export default function UsersPage() {
  const { meta, headers, users } = getUsers();
  const rows = users.length
    ? users
    : DEMO_USERS.map((u) => ({
        name: u.name,
        email: u.email,
        lastSeen: '',
        role: u.role,
        created: '',
      }));
  const tableHeaders =
    headers.length > 0 ? headers : ['Name', 'Email', 'Last Seen', 'Role', 'Created'];
  const liveTotal = typeof meta?.count === 'number' ? meta.count : rows.length;

  const roleCounts = rows.reduce(
    (acc, u) => {
      const key = (u.role || '').trim() || '(empty)';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div>
      <PageTitle
        title="Users"
        subtitle={`${rows.length} of ${liveTotal} accounts from live capture`}
      />
      <StubNote>
        Offline seed from <code>users.json</code> (full 189-row scrape). Add demo users below
        writes the same seed file. Invite / Clerk cutover still pending.
      </StubNote>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Seed rows" value={String(rows.length)} />
        <StatCard label="Prod count" value={String(liveTotal)} />
        <StatCard label="Rep" value={String(roleCounts.rep || 0)} />
        <StatCard label="Delegate" value={String(roleCounts.delegate || 0)} />
        <StatCard label="Empty role" value={String(roleCounts['(empty)'] || 0)} />
      </div>
      <AddUserForm />
      <DataTable
        headers={tableHeaders}
        rows={rows.map((u) => [u.name, u.email, u.lastSeen || '—', u.role || '—', u.created || '—'])}
      />
    </div>
  );
}
