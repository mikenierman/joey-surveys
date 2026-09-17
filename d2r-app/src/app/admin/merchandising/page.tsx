import { PageTitle, StatCard, StubNote } from '@/components/ui';
import { MerchPeriodSwitcher } from '@/components/merch-period-switcher';
import { MerchRepTable } from '@/components/merch-rep-table';
import { MerchEmbed } from '@/components/merch-embed';
import { getMerchAppUrl } from '@/lib/merch-app-url';
import {
  getMerchPeriodOptions,
  getMerchProgram,
  getMerchReps,
  getMerchSeedPeriods,
  merchProgramSubtitle,
  normalizeMerchPeriod,
} from '@/lib/merchandising';

export default async function AdminMerchandisingPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: periodParam } = await searchParams;
  const period = normalizeMerchPeriod(periodParam);
  const program = getMerchProgram(period);
  const reps = getMerchReps(program);
  const allPeriods = getMerchPeriodOptions(program);
  const seededPeriods = getMerchSeedPeriods();
  const merchUrl = getMerchAppUrl();

  const totals = reps.reduce(
    (acc, r) => ({
      assigned: acc.assigned + r.assigned,
      completed: acc.completed + r.completed,
      withinWindow: acc.withinWindow + r.withinWindow,
      unpaidVisits: acc.unpaidVisits + r.unpaidVisits,
    }),
    { assigned: 0, completed: 0, withinWindow: 0, unpaidVisits: 0 }
  );
  const completePct =
    totals.assigned > 0
      ? `${Math.round((totals.completed / totals.assigned) * 100)}%`
      : '0%';

  return (
    <div>
      <PageTitle
        title="Merchandising"
        subtitle={merchProgramSubtitle(program, period)}
      />
      <MerchPeriodSwitcher
        allPeriods={allPeriods}
        seededPeriods={seededPeriods}
        active={period}
        basePath="/admin/merchandising"
      />
      <StubNote>
        Admin rollup from vault export — offline-safe. Full field app embeds below from{' '}
        <code>{merchUrl}</code> (also on Dashboard → Merchandising tab). Periods without
        vault files are shown disabled.
      </StubNote>
      {reps.length ? (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Reps" value={String(reps.length)} />
            <StatCard label="Assigned" value={String(totals.assigned)} />
            <StatCard label="Completed" value={String(totals.completed)} />
            <StatCard label="Complete %" value={completePct} />
            <StatCard label="Unpaid visits" value={String(totals.unpaidVisits)} />
          </div>
          <MerchRepTable reps={reps} />
        </>
      ) : (
        <p className="text-sm text-stone-600">
          No merch rows for {period} — check vault JSON at{' '}
          <code>data/seed/merchandising-joey_circle_k-{period}.json</code>.
        </p>
      )}
      <div className="mt-8">
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-stone-500">
          Field app
        </h2>
        <MerchEmbed heightClass="h-[70vh]" />
      </div>
    </div>
  );
}
