import Link from 'next/link';
import {
  PageTitle,
  ClusterNav,
  StubNote,
} from '@/components/ui';
import { LOCATIONS_CLUSTER_NAV } from '@/lib/customers-nav';

export default function LocationsImportPage() {
  return (
    <div>
      <PageTitle
        title="Import locations"
        subtitle="CSV / bulk location ingest — offline stub"
      />
      <ClusterNav
        items={LOCATIONS_CLUSTER_NAV}
        current="/admin/locations/import"
      />
      <StubNote>
        Mapped UI for <code>/admin/locations/import</code>. Upload / Validate /
        Commit are non-functional in the twin — no import pipeline offline.
        Return to{' '}
        <Link href="/admin/locations" className="underline">
          Locations
        </Link>{' '}
        for the derived door list.
      </StubNote>
      <div className="max-w-xl space-y-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <label className="flex flex-col gap-1 text-xs text-stone-600">
          <span className="font-medium uppercase tracking-wide">CSV file</span>
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            disabled
            className="rounded border border-dashed border-stone-300 px-2 py-6 text-sm text-stone-400"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled
            className="rounded bg-stone-900 px-3 py-1.5 text-sm text-white opacity-50"
          >
            Upload
          </button>
          <button
            type="button"
            disabled
            className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-500"
          >
            Validate
          </button>
          <button
            type="button"
            disabled
            className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-500"
          >
            Commit
          </button>
        </div>
        <p className="text-xs text-stone-500">
          Offline twin — file ingest disabled. Live controls: Upload · Validate ·
          Commit.
        </p>
      </div>
    </div>
  );
}
