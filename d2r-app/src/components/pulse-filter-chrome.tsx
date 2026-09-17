'use client';

/**
 * Shared stub filter chrome for Pulse pages (rep + period).
 * Comboboxes are display-only until multi-rep capture lands.
 */
export function PulseFilterChrome({
  repLabel = 'All reps',
  periodLabel = '—',
}: {
  repLabel?: string;
  periodLabel?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 bg-white px-3 py-3">
      <label className="flex flex-col gap-1 text-xs text-stone-500">
        Rep
        <select
          disabled
          className="min-w-[10rem] rounded border border-stone-300 bg-stone-50 px-2 py-1.5 text-sm text-stone-700"
          value={repLabel}
        >
          <option>{repLabel}</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-stone-500">
        Period
        <select
          disabled
          className="min-w-[8rem] rounded border border-stone-300 bg-stone-50 px-2 py-1.5 text-sm text-stone-700"
          value={periodLabel}
        >
          <option>{periodLabel}</option>
        </select>
      </label>
      <span className="rounded border border-dashed border-stone-300 px-2 py-1.5 text-xs text-stone-500">
        Refresh (offline)
      </span>
    </div>
  );
}
