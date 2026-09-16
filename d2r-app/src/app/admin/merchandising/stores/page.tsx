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
        Store-level grid shell for <code>/admin/merchandising/stores</code>. Rep
        rollup exists at{' '}
        <Link href={`/admin/merchandising?period=${encodeURIComponent(period)}`} className="underline">
          /admin/merchandising
        </Link>{' '}
        ({reps.length} reps for {period}), but no live store-level capture was
        exported — table is intentionally empty. Program / period / rep filters
        are stubs until a stores dump lands.
      </StubNote>
      <FilterBar>
        <FilterField
          label="Program"
          name="program"
          defaultValue={programKey}
          options={[
            { value: 'joey_circle_k', label: 'JOEY × Circle K' },
          ]}
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
      <DataTable
        headers={[...LIVE_HEADERS]}
        rows={[]}
        emptyMessage="No store-level merch capture — scrape /admin/merchandising/stores for offline rows."
      />
    </div>
  );
}
