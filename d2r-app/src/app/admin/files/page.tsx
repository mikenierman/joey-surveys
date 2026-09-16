import { PageTitle, StubNote, DataTable } from '@/components/ui';

const SAMPLE = [
  {
    name: 'alp-ach-sep.pdf',
    type: 'receipt',
    size: '124 KB',
    uploaded: '2026-09-12',
    owner: 'finance',
  },
  {
    name: 'q3-settlement-preview.csv',
    type: 'export',
    size: '48 KB',
    uploaded: '2026-09-10',
    owner: 'admin',
  },
  {
    name: 'transfer-terms-v1.2.txt',
    type: 'terms',
    size: '6 KB',
    uploaded: '2026-07-01',
    owner: 'ops',
  },
];

export default function FilesPage() {
  return (
    <div>
      <PageTitle title="Files" subtitle="Uploaded file browser · offline stub" />
      <StubNote>
        Minimal offline stub for <code>/admin/files</code> — no blobs stored in the twin.
        Filenames are placeholders. Upload / Download / Delete are display-only.
      </StubNote>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Upload (offline)
        </span>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Download (offline)
        </span>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Delete (offline)
        </span>
      </div>
      <DataTable
        headers={['Name', 'Type', 'Size', 'Uploaded', 'Owner']}
        rows={SAMPLE.map((r) => [r.name, r.type, r.size, r.uploaded, r.owner])}
      />
    </div>
  );
}
