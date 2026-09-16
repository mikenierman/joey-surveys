import Link from 'next/link';
import { PageTitle, StatCard, StubNote, DataTable } from '@/components/ui';
import { PulseKpiGrid } from '@/components/pulse-kpi-grid';
import {
  getDashboardKpis,
  getLedgerPerformance,
  pulseSignalTableRows,
} from '@/lib/data';
import { PulseNav } from './_components/pulse-nav';

export default function PulsePage() {
  const { summary, reps } = getLedgerPerformance();
  const dashboard = getDashboardKpis();
  const pulse = dashboard.pulse;
  const meta = dashboard.pulseMeta;
  const subtitle = meta?.rep
    ? `${meta.rep}${meta.range ? ` · ${meta.range}` : ''} — live capture 2026-09-16`
    : 'Rep health KPIs (seed from pulse-signals.json)';

  return (
    <div>
      <PageTitle title="Pulse" subtitle={subtitle} />
      <PulseNav current="/admin/pulse" />
      <StubNote>
        Hub view — signals KPI dict from{' '}
        <code>data/seed/pulse-signals.json</code> (Adam Scott). Rep/date filters are
        display-only until multi-rep captures land. Goals, scores, and health are route
        stubs.
      </StubNote>

      <div className="mb-4 flex flex-wrap gap-3 text-xs text-stone-600">
        <span>
          Rep: <strong>{meta?.rep || '—'}</strong>
        </span>
        <span>
          Range: <strong>{meta?.range || '—'}</strong>
        </span>
        <span className="rounded border border-dashed border-stone-300 px-2 py-0.5 text-stone-500">
          Refresh (offline)
        </span>
      </div>

      <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-stone-500">
        Ledger context
      </h2>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Reps tracked" value={String(reps.length)} />
        <StatCard label="Sell-through" value={String(summary?.sellThrough || '—')} />
        <StatCard
          label="Quiet stock"
          value={String(
            (summary?.quiet8PlusDays as { count?: string } | undefined)?.count || '—'
          )}
        />
      </div>

      {pulse ? (
        <>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-stone-500">
              Signals — {meta?.rep || 'sample rep'}
            </h2>
            <Link href="/admin/pulse/signals" className="text-sm text-amber-800 hover:underline">
              Open signals detail →
            </Link>
          </div>
          <PulseKpiGrid kpis={pulse} />
          <DataTable
            headers={['Signal', 'Value']}
            rows={pulseSignalTableRows(pulse)}
          />
        </>
      ) : (
        <p className="text-sm text-stone-600">
          No pulse signal dict in seed. Copy live capture to{' '}
          <code>data/seed/pulse-signals.json</code>.
        </p>
      )}
    </div>
  );
}
