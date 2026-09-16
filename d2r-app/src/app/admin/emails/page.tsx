import { PageTitle, StubNote, DataTable } from '@/components/ui';

const SAMPLE = [
  {
    when: '2026-09-16 09:12',
    template: 'invite_rep',
    to: 'rep@example.com',
    status: 'sent',
    subject: 'You are invited to Direct2Retailers',
  },
  {
    when: '2026-09-15 16:40',
    template: 'transfer_approved',
    to: 'warehouse@example.com',
    status: 'sent',
    subject: 'Transfer approved',
  },
  {
    when: '2026-09-14 11:02',
    template: 'password_reset',
    to: 'user@example.com',
    status: 'bounced',
    subject: 'Reset your password',
  },
];

export default function EmailsPage() {
  return (
    <div>
      <PageTitle title="Emails" subtitle="Outbound email log · offline stub" />
      <StubNote>
        Minimal offline stub for <code>/admin/emails</code> — no live mail capture. Sample
        addresses are placeholders. Resend / Preview are display-only.
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <span className="rounded border border-stone-300 bg-stone-100 px-2 py-1 text-stone-600">
          Template filter (stub)
        </span>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Resend (offline)
        </span>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Preview (offline)
        </span>
      </div>
      <DataTable
        headers={['When', 'Template', 'To', 'Status', 'Subject']}
        rows={SAMPLE.map((r) => [r.when, r.template, r.to, r.status, r.subject])}
      />
    </div>
  );
}
