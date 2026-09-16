import Link from 'next/link';
import { PageTitle, StubNote, StatCard, DataTable } from '@/components/ui';
import { ShopifySyncButton } from '@/components/shopify-sync-button';
import { getShopifyStatus } from '@/lib/data';
import {
  getShopifyHealth,
  getShopifyShops,
} from '@/lib/shopify';
import { listRecentWebhookEvents } from '@/lib/webhooks';
import {
  getOpsLogPaths,
  listAutomationRuns,
  listInstallLogs,
} from '@/lib/ops-logs';
import { ShopifyHealthTable } from './health-table';

export default function ShopifyAdminPage() {
  const health = getShopifyHealth();
  const { shops: registry } = getShopifyShops();
  const status = getShopifyStatus();
  const recent = listRecentWebhookEvents(10);
  const installLogs = listInstallLogs(25);
  const automationRuns = listAutomationRuns(15);
  const lastSync = status.lastSync;
  const paths = getOpsLogPaths();

  const healthy = health.meta?.healthy ?? 0;
  const total = health.meta?.total ?? health.shops.length;
  const needAttention = Math.max(0, total - healthy);
  const capturedAt = health.meta?.capturedAt
    ? new Date(String(health.meta.capturedAt)).toLocaleString()
    : null;

  return (
    <div>
      <PageTitle
        title="Shopify Apps"
        subtitle={`Live API scope health across every connected store. ${healthy} of ${total} healthy · ${needAttention} need attention.`}
      />
      <StubNote>
        Offline twin from vault scrape
        {capturedAt ? ` (${capturedAt})` : ''}. No API tokens in seed. Configure{' '}
        <code>SHOPIFY_SHOP</code> + <code>SHOPIFY_ADMIN_TOKEN</code> for optional
        single-shop read sync. Write path stays off. Brand registry:{' '}
        <Link href="/admin/stores" className="underline">
          Brand stores
        </Link>
        . Runtime logs:{' '}
        <code>{paths.eventsJsonl}</code> (gitignored).
      </StubNote>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Healthy" value={`${healthy} / ${total}`} />
        <StatCard label="Need attention" value={String(needAttention)} />
        <StatCard label="Mode" value={status.mode} />
        <StatCard label="Env shop" value={status.shop || 'not set'} />
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-stone-500">
          Scope health
        </h2>
        <ShopifyHealthTable headers={health.headers} shops={health.shops} />
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-stone-500">
          Shop registry ({registry.length})
        </h2>
        <DataTable
          headers={['Name', 'Domain', 'Store ID', 'Created']}
          rows={registry.map((s) => [
            s.name,
            s.domain,
            s.storeId,
            s.created || '—',
          ])}
        />
      </div>

      <div className="mb-8 rounded-xl border border-stone-200 bg-white p-4 text-sm">
        <h2 className="font-medium">Install / auth / scope logs</h2>
        <p className="mt-1 text-stone-600">
          Read-only. Seed samples + runtime{' '}
          <code>{paths.installLogs}</code>.
        </p>
        {installLogs.length === 0 ? (
          <p className="mt-2 text-stone-600">No install logs yet.</p>
        ) : (
          <DataTable
            headers={['When', 'Shop', 'Event', 'Status', 'Scopes', 'Note']}
            rows={installLogs.map((e) => [
              e.timestamp,
              e.shopDomain,
              e.event,
              e.status,
              e.scopesSummary,
              e.note || '—',
            ])}
          />
        )}
      </div>

      <div className="mb-8 rounded-xl border border-stone-200 bg-white p-4 text-sm">
        <h2 className="font-medium">Automation runs</h2>
        <p className="mt-1 text-stone-600">
          Stubs: <code>POST /api/shopify/automations/brand-levels</code>,{' '}
          <code>POST /api/shopify/automations/inventory-sync</code>, or{' '}
          <code>npm run automation:brand-levels</code> /{' '}
          <code>npm run automation:inventory-sync</code>.
        </p>
        {automationRuns.length === 0 ? (
          <p className="mt-2 text-stone-600">
            No automation runs yet — trigger a stub to populate{' '}
            <code>{paths.automationRuns}</code>.
          </p>
        ) : (
          <DataTable
            headers={['When', 'Job', 'Status', 'Shop', 'Message']}
            rows={automationRuns.map((r) => [
              r.timestamp,
              r.job,
              r.status,
              r.shopDomain || '—',
              r.message,
            ])}
          />
        )}
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Last sync"
          value={
            lastSync?.syncedAt
              ? new Date(lastSync.syncedAt).toLocaleString()
              : 'never'
          }
        />
        <StatCard
          label="Products (last sync)"
          value={String(lastSync?.productCount ?? '—')}
        />
        <StatCard
          label="Inventory levels"
          value={String(lastSync?.inventoryLevelCount ?? '—')}
        />
        <StatCard
          label="Webhook events"
          value={String(status.webhookEvents.count)}
        />
      </div>

      <ShopifySyncButton />
      <p className="mb-4 text-sm text-stone-600">
        POST <code>/api/shopify/sync</code> · webhook{' '}
        <code>POST /api/webhooks/shopify</code> · write path:{' '}
        <strong>disabled</strong>
      </p>
      {lastSync?.errors?.length ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          Sync errors: {lastSync.errors.join('; ')}
        </div>
      ) : null}

      <div className="rounded-xl border border-stone-200 bg-white p-4 text-sm">
        <h2 className="font-medium">Recent webhook events</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-stone-600">No events stored yet.</p>
        ) : (
          <DataTable
            headers={['Received', 'Topic', 'Shop', 'Handled']}
            rows={recent.map((e) => [
              e.receivedAt,
              e.topic,
              e.shopDomain || '—',
              e.handled ? 'yes' : 'no',
            ])}
          />
        )}
        <p className="mt-3 text-stone-600">{status.note}</p>
      </div>
    </div>
  );
}
