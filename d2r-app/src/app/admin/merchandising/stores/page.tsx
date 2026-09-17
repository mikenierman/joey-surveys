import Link from 'next/link';
import {
  PageTitle,
  DataTable,
  FilterBar,
  FilterField,
  FilterActions,
  FilterSubmit,
  FilterReset,
  StubNote,
} from '@/components/ui';
import { MerchPeriodSwitcher } from '@/components/merch-period-switcher';
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

type SearchParams = Promise<{
  period?: string;
  program?: string;
  rep?: string;
  status?: string;
  q?: string;
}>;

/**
 * Store grid headers from merchandising domain MAP (inferred — no live dump).
 * SITE-MAP-INTERACTIONS also lists Store · Rep · Status · Last visit.
 */
const LIVE_HEADERS = [
  'Store',
  'Rep',
  'Status',
  'Completed',
  'Last visit',
  'Within window',
  'Unpaid',
] as const;

export default async function MerchandisingStoresPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const period = normalizeMerchPeriod(params.period);
  const program = getMerchProgram(period);
  const reps = getMerchReps(program);
  const allPeriods = getMerchPeriodOptions(program);
  const seededPeriods = getMerchSeedPeriods();
  const programKey =
    params.program ||
    String(program?.meta?.programKey || 'joey_circle_k');
  const merchUrl = getMerchAppUrl();
  const hasFilters = Boolean(
    params.rep || params.status || (params.q && params.q.trim())
  );

  const emptyMessage = hasFilters
    ? `No store rows match these filters (rep=${params.rep || 'any'}, status=${params.status || 'any'}, q=${params.q || '—'}). Store-level seed still missing — filters are UI-only.`
    : 'No store-level merch capture seeded. Scrape /admin/merchandising/stores (authenticated) into data/seed, or use the field app embed below for live visits.';

  return (
    <div>
      <PageTitle
        title="Merchandising stores"
        subtitle={merchProgramSubtitle(program, period)}
      />
      <MerchPeriodSwitcher
        allPeriods={allPeriods}
        seededPeriods={seededPeriods}
        active={period}
        basePath="/admin/merchandising/stores"
      />
      <StubNote>
        Store grid for <code>/admin/merchandising/stores</code>. Program rollup ({' '}
        <Link
          href={`/admin/merchandising?period=${encodeURIComponent(period)}`}
          className="underline"
        >
          Programs
        </Link>
        , {reps.length} reps in {period}) is seeded; <strong>store-level rows are not</strong>.
        Filters below preserve URL state for parity but do not query a dump yet. Field visits:{' '}
        <Link href="/admin/dashboard?tab=merchandising" className="underline">
          Dashboard → Merchandising
        </Link>{' '}
        or open <code>{merchUrl}</code>.
      </StubNote>
      <FilterBar>
        <FilterField
          label="Program"
          name="program"
          defaultValue={programKey}
          options={[{ value: 'joey_circle_k', label: 'JOEY × Circle K' }]}
        />
        <FilterField
          label="Period"
          name="period"
          defaultValue={period}
          options={allPeriods.map((p) => ({ value: p, label: p }))}
        />
        <FilterField
          label="Rep"
          name="rep"
          defaultValue={params.rep || ''}
          options={reps.map((r) => ({ value: r.rep, label: r.rep }))}
        />
        <FilterField
          label="Status"
          name="status"
          defaultValue={params.status || ''}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Completed' },
            { value: 'within_window', label: 'Within window' },
          ]}
        />
        <FilterField
          label="Search"
          name="q"
          defaultValue={params.q || ''}
          placeholder="Store # or city"
        />
        <FilterActions>
          <FilterSubmit />
          <FilterReset href="/admin/merchandising/stores" />
        </FilterActions>
      </FilterBar>
      <p className="mb-2 text-xs text-stone-500">
        Active filters: program=<strong>{programKey}</strong> · period=
        <strong>{period}</strong>
        {params.rep ? (
          <>
            {' '}
            · rep=<strong>{params.rep}</strong>
          </>
        ) : null}
        {params.status ? (
          <>
            {' '}
            · status=<strong>{params.status}</strong>
          </>
        ) : null}
        {params.q ? (
          <>
            {' '}
            · q=<strong>{params.q}</strong>
          </>
        ) : null}
      </p>
      <DataTable
        headers={[...LIVE_HEADERS]}
        rows={[]}
        emptyMessage={emptyMessage}
      />
      <div className="mt-8">
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-stone-500">
          Field app (until stores dump lands)
        </h2>
        <MerchEmbed heightClass="h-[60vh]" />
      </div>
    </div>
  );
}
