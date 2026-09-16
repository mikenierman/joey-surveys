import Link from 'next/link';

export function MerchPeriodSwitcher({
  allPeriods,
  seededPeriods,
  active,
  basePath,
}: {
  allPeriods: string[];
  seededPeriods: string[];
  active: string;
  basePath: string;
}) {
  const seeded = new Set(seededPeriods);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-stone-500">Period</span>
      {allPeriods.map((period) => {
        const available = seeded.has(period);
        const isActive = period === active;
        if (!available) {
          return (
            <span
              key={period}
              className="rounded-full border border-stone-200 px-3 py-1 text-sm text-stone-400"
              title="No vault export for this period"
            >
              {period}
            </span>
          );
        }
        return (
          <Link
            key={period}
            href={`${basePath}?period=${encodeURIComponent(period)}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              isActive
                ? 'border-amber-500 bg-amber-50 font-medium text-amber-950'
                : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            {period}
          </Link>
        );
      })}
    </div>
  );
}
