import Link from 'next/link';
import { PageTitle, StatCard, StubNote } from '@/components/ui';
import { PulseKpiGrid } from '@/components/pulse-kpi-grid';
import {
  formatPulseSignalValue,
  getDashboardKpis,
  getInventorySample,
} from '@/lib/data';

export default function AdminDashboardPage() {
  const kpis = getDashboardKpis();
  const inv = getInventorySample();
  const skuCount = inv.items.length;
  const summary = kpis.ledgerSummary || {};
  const pulseMeta = kpis.pulseMeta;
  const pulseSubtitle = pulseMeta?.rep
    ? `${pulseMeta.rep}${pulseMeta.range ? ` · ${pulseMeta.range}` : ''}`
    : 'No pulse capture seeded';

  return (
    <div>
      <PageTitle
        title="Admin dashboard"
        subtitle="Ops overview from live continuity exports (2026-09-16)."
      />
      <StubNote>
        Offline twin — ledger + Adam Scott pulse KPIs from{' '}
        <code>pulse-signals.json</code>. No dedicated dashboard capture yet; company
        numbers cross-ref ledger performance.
      </StubNote>

      <div className="mb-4 flex flex-wrap gap-3 text-xs text-stone-600">
        <span>
          Date range: <strong>Export as-of 2026-09-16</strong>
        </span>
        <span className="rounded border border-dashed border-stone-300 px-2 py-0.5 text-stone-500">
          Refresh (offline)
        </span>
      </div>

      <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-stone-500">
        Inventory ledger
      </h2>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Value held" value={String(summary.valueHeld || '—')} />
        <StatCard label="Units held" value={String(summary.unitsHeld || '—')} />
        <StatCard label="Sell-through" value={String(summary.sellThrough || '—')} />
        <StatCard
          label="Quiet 8+ days"
          value={String(
            (summary.quiet8PlusDays as { count?: string } | undefined)?.count || '—'
          )}
        />
      </div>

      <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-stone-500">
        Pulse sample ({pulseSubtitle})
      </h2>
      {kpis.pulse ? (
        <PulseKpiGrid
          kpis={kpis.pulse}
          keys={['score', 'revenue', 'orders', 'activeStores', 'reorderRate']}
        />
      ) : (
        <p className="mb-6 text-sm text-stone-600">
          Seed <code>data/seed/pulse-signals.json</code> from live capture to show pulse
          KPIs.
        </p>
      )}

      <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-stone-500">
        Platform snapshot
      </h2>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Reps (ledger)" value={String(kpis.repCount)} />
        <StatCard label="Warehouses" value={String(kpis.warehouseCount)} />
        <StatCard label="Users" value={String(kpis.userCount ?? '—')} />
        <StatCard
          label="Shopify healthy"
          value={
            kpis.shopifyHealthy != null && kpis.shopifyTotal != null
              ? `${kpis.shopifyHealthy} / ${kpis.shopifyTotal}`
              : '—'
          }
        />
        <StatCard
          label="Orders (page 1 sample)"
          value={
            kpis.ordersSampleCount != null
              ? `${kpis.ordersSampleCount}${kpis.ordersApproxPages ? ` · ~${kpis.ordersApproxPages} pages` : ''}`
              : '—'
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h2 className="font-medium">Quick links</h2>
          <ul className="mt-2 space-y-1 text-sm text-amber-800">
            <li>
              <Link href="/admin/inventory">Inventory ({skuCount} sample SKUs)</Link>
            </li>
            <li>
              <Link href="/admin/inventory/ledgers">
                Ledger performance ({kpis.repCount} reps)
              </Link>
            </li>
            <li>
              <Link href="/admin/pulse">Pulse overview</Link>
            </li>
            <li>
              <Link href="/admin/pulse/signals">
                Pulse signals
                {kpis.pulse
                  ? ` — score ${formatPulseSignalValue('score', kpis.pulse.score)}`
                  : ''}
              </Link>
            </li>
            <li>
              <Link href="/admin/pulse/scores">Pulse scores (stub)</Link>
            </li>
            <li>
              <Link href="/admin/pulse/goals">Pulse goals (stub)</Link>
            </li>
            <li>
              <Link href="/admin/pulse/health">Pulse health (stub)</Link>
            </li>
            <li>
              <Link href="/admin/merchandising">Merchandising / JOEY</Link>
            </li>
            <li>
              <Link href="/admin/shopify">Shopify connection</Link>
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
          <h2 className="font-medium text-stone-900">Parity status</h2>
          <p className="mt-2">
            Dashboard: ledger + platform snapshot + Adam Scott pulse sample.
          </p>
          <p className="mt-1">
            Pulse signals: full 10-KPI dict offline. Goals / scores / health: stub
            placeholders.
          </p>
          <p className="mt-2 text-xs text-stone-500">
            Activity feed (Event / Actor / When) not captured — deferred.
          </p>
        </div>
      </div>
    </div>
  );
}
