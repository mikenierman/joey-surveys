import { PageTitle, StubNote } from '@/components/ui';
import { PulseFilterChrome } from '@/components/pulse-filter-chrome';
import { PulseNav, type PulseNavKey } from './pulse-nav';

export function PulseStubPage({
  title,
  current,
  purpose,
  headers,
  emptyHint,
}: {
  title: string;
  current: PulseNavKey;
  purpose: string;
  headers: string[];
  emptyHint: string;
}) {
  return (
    <div>
      <PageTitle title={title} subtitle="Mapped route — awaiting live capture" />
      <PulseNav current={current} />
      <StubNote>
        Offline placeholder for <code>{current}</code>. {purpose} Seed from a live scrape
        before wiring filters or export. Shared filter chrome matches Signals / hub pattern.
      </StubNote>
      <PulseFilterChrome />

      <div className="overflow-x-auto rounded-xl border border-dashed border-stone-300 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                className="px-3 py-8 text-center text-stone-500"
                colSpan={headers.length}
              >
                {emptyHint}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
