import { PageTitle, StubNote, StatCard, DataTable } from '@/components/ui';
import { getRepAssignments } from '@/lib/data';

export default function RepAssignmentsPage() {
  const { meta, headers, assignments } = getRepAssignments();
  const tableHeaders =
    headers.length > 0
      ? headers
      : ['Rep', 'Store Name', 'City', 'State', 'Account', 'Role', 'From', 'To'];

  const active = Number(meta?.activeAssignments ?? 0);
  const primary = Number(meta?.primary ?? active);
  const covering = Number(meta?.covering ?? 0);
  const delegate = Number(meta?.delegate ?? 0);
  const pages = Number(meta?.pages ?? 0);
  const sampleCount = Number(meta?.sampleCount ?? assignments.length);

  return (
    <div>
      <PageTitle
        title="Rep assignments"
        subtitle={`Offline sample · ${assignments.length} of ${active || '—'} active (page 1 of ~${pages || '?'})`}
      />
      <StubNote>
        Live export captured page 1 only (<code>rep-assignments.json</code>
        {sampleCount ? ` · sampleCount ${sampleCount}` : ''}). Full paginated dump (~
        {pages || 227} pages) still needed before cutover — see IMPROVEMENTS-BACKLOG
        (assignment scale / export).
      </StubNote>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active (prod)" value={active ? active.toLocaleString() : '—'} />
        <StatCard label="Primary" value={primary ? primary.toLocaleString() : '—'} />
        <StatCard label="Covering" value={covering ? covering.toLocaleString() : '—'} />
        <StatCard label="Delegate" value={delegate ? delegate.toLocaleString() : '—'} />
      </div>
      <p className="mb-3 text-sm text-stone-600">
        Showing <strong>{assignments.length}</strong> sample rows · prod has{' '}
        <strong>{active ? active.toLocaleString() : '—'}</strong> active primary assignments.
      </p>
      <DataTable
        headers={tableHeaders}
        rows={assignments.map((a) => [
          a.rep,
          a.storeName,
          a.city,
          a.state,
          a.account,
          a.role,
          a.from,
          a.to,
        ])}
      />
    </div>
  );
}
