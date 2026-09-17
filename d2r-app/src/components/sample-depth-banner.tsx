import type { ReactNode } from 'react';

/**
 * Honest depth banner for page-1 / sample seeds — do not imply full production dump.
 */
export function SampleDepthBanner({
  page = 1,
  totalPages,
  sampleRows,
  prodTotal,
  unit = 'rows',
  seedFile,
  extra,
}: {
  page?: number;
  totalPages?: number | null;
  sampleRows: number;
  prodTotal?: number | null;
  unit?: string;
  seedFile?: string;
  extra?: ReactNode;
}) {
  const pagesLabel =
    totalPages != null && totalPages > 0 ? `page ${page} of ~${totalPages}` : `page ${page} sample`;
  const prodLabel =
    prodTotal != null && prodTotal > 0
      ? ` · production ~${prodTotal.toLocaleString()} ${unit}`
      : '';

  return (
    <div
      className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
      role="status"
    >
      <strong>Offline sample only.</strong> Showing {sampleRows.toLocaleString()} {unit} (
      {pagesLabel}
      {prodLabel}
      ). Full paginated dump still required before cutover
      {seedFile ? (
        <>
          {' '}
          (<code>{seedFile}</code>)
        </>
      ) : null}
      .
      {extra ? <span className="mt-1 block text-amber-900/80">{extra}</span> : null}
    </div>
  );
}
