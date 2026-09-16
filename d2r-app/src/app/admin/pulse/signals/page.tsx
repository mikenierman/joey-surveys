import { PageTitle, StubNote, DataTable } from '@/components/ui';
import { PulseKpiGrid } from '@/components/pulse-kpi-grid';
import {
  getPulseSignalsCapture,
  getPulseSignalKpis,
  pulseSignalTableRows,
} from '@/lib/data';
import { PulseNav } from '../_components/pulse-nav';

export default function PulseSignalsPage() {
  const capture = getPulseSignalsCapture();
  const kpis = getPulseSignalKpis();
  const meta = capture?.meta;
  const subtitle = meta
    ? [
        meta.rep,
        meta.range,
        meta.capturedAt ? `captured ${new Date(meta.capturedAt).toLocaleString()}` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : 'Rep KPI signals — offline mirror';

  return (
    <div>
      <PageTitle title="Pulse signals" subtitle={subtitle} />
      <PulseNav current="/admin/pulse/signals" />
      <StubNote>
        Live route <code>/admin/pulse/signals</code> — KPI dict (not alert rows) from{' '}
        <code>pulse-signals.json</code>. Adam Scott sample: Jun 19 – Sep 16. Rep and
        date-range comboboxes mapped but not wired for multi-rep yet.
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

      {kpis ? (
        <>
          <PulseKpiGrid kpis={kpis} />
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-stone-500">
            All signals
          </h2>
          <DataTable headers={['Signal', 'Value']} rows={pulseSignalTableRows(kpis)} />
          {meta?.url ? (
            <p className="mt-4 text-xs text-stone-500">
              Source: {meta.url}
              {meta.source ? ` (${meta.source})` : ''}
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-stone-600">
          Expected seed shape:{' '}
          <code>{'{ meta, signals: { reorderRate, score, revenue, ... } }'}</code>. Current
          file missing or uses legacy list shape.
        </p>
      )}
    </div>
  );
}
