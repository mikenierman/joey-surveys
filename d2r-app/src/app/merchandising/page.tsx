import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import {
  AppShell,
  PageTitle,
  StatCard,
  StubNote,
  OfflineScopeBanner,
} from '@/components/ui';
import { MerchPeriodSwitcher } from '@/components/merch-period-switcher';
import { MerchRepTable } from '@/components/merch-rep-table';
import {
  findMerchRep,
  getMerchPeriodOptions,
  getMerchProgram,
  getMerchReps,
  getMerchSeedPeriods,
  merchProgramSubtitle,
  normalizeMerchPeriod,
  type MerchRep,
} from '@/lib/merchandising';
import { resolveRepScope } from '@/lib/rep-scope';
import { MerchRouteShell } from './route-shell';
import {
  getMerchRouteStores,
  resolveMerchRouteIdentity,
} from './route-stores';

function resolveRepRow(reps: MerchRep[], user: Awaited<ReturnType<typeof getSessionUser>>) {
  if (!user) return null;
  const direct = findMerchRep(reps, user);
  if (direct) return direct;
  const { names } = resolveMerchRouteIdentity(user);
  for (const name of names) {
    const hit = reps.find((r) => r.rep === name);
    if (hit) return hit;
  }
  return null;
}

export default async function MerchandisingEmbedPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const { period: periodParam } = await searchParams;
  const period = normalizeMerchPeriod(periodParam);
  const program = getMerchProgram(period);
  const reps = getMerchReps(program);
  const repRow = resolveRepRow(reps, user);
  const allPeriods = getMerchPeriodOptions(program);
  const seededPeriods = getMerchSeedPeriods();
  const merchUrl = process.env.NEXT_PUBLIC_MERCH_APP_URL;
  const { stores, demoMappedTo, source } = getMerchRouteStores(user);
  const scope = resolveRepScope(user);

  return (
    <AppShell user={user}>
      <PageTitle
        title="Field merchandising"
        subtitle={merchProgramSubtitle(program, period)}
      />
      <OfflineScopeBanner text={scope.scopeBanner} />
      <MerchPeriodSwitcher
        allPeriods={allPeriods}
        seededPeriods={seededPeriods}
        active={period}
        basePath="/merchandising"
      />
      <StubNote>
        Offline twin: period rollup + Circle K route list/status from vault seed
        {source ? ` (${source})` : ''}. GPS visits, photos, and the 7-phase survey
        stay in the field app
        {merchUrl ? ` (${merchUrl})` : ''}.
        {demoMappedTo
          ? ` Demo rep is mapped to ${demoMappedTo} for route preview.`
          : ''}
      </StubNote>
      {repRow ? (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Assigned" value={String(repRow.assigned)} />
            <StatCard label="Completed" value={String(repRow.completed)} />
            <StatCard label="Within window" value={String(repRow.withinWindow)} />
            <StatCard label="Complete %" value={repRow.completePct} />
            <StatCard label="Unpaid visits" value={String(repRow.unpaidVisits)} />
          </div>
          <MerchRepTable reps={[repRow]} />
        </>
      ) : (
        <p className="mb-6 text-sm text-stone-600">
          No merchandising rollup row matched for <strong>{user.name}</strong> (
          {user.email}) in {period}. Sign in with a vault rep email or use the
          demo Field Rep account.
        </p>
      )}

      {stores.length ? (
        <MerchRouteShell
          stores={stores}
          period={period}
          rollupCompleted={repRow?.completed ?? 0}
        />
      ) : (
        <p className="mt-6 text-sm text-stone-600">
          No Circle K route stores matched for this user. Expected{' '}
          <code>public/data/stores.json</code> (or{' '}
          <code>data/seed/circle-k-stores.json</code>) with{' '}
          <code>assigned_to</code> / <code>rep_name</code>.
        </p>
      )}

      {merchUrl ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-stone-300 bg-white shadow-sm">
          <div className="border-b border-stone-200 bg-stone-50 px-3 py-2 text-xs uppercase tracking-wide text-stone-500">
            Live field app (online only)
          </div>
          <iframe
            title="JOEY merchandising"
            src={merchUrl}
            className="h-[70vh] w-full border-0"
            allow="geolocation; camera; microphone"
          />
        </div>
      ) : null}
    </AppShell>
  );
}
