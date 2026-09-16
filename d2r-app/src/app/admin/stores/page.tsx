import Link from 'next/link';
import { PageTitle, StubNote, StatCard, DataTable } from '@/components/ui';
import { getStores } from '@/lib/data';
import { getShopifyHealth } from '@/lib/shopify';

export default function StoresPage() {
  const { meta, stores } = getStores();
  const health = getShopifyHealth();
  const healthy = health.meta?.healthy ?? 0;
  const total = health.meta?.total ?? health.shops.length;
  const needAttention = Math.max(0, total - healthy);
  const capturedAt = meta?.capturedAt
    ? new Date(String(meta.capturedAt)).toLocaleString()
    : null;

  return (
    <div>
      <PageTitle
        title="Brand stores"
        subtitle={`${stores.length} Shopify stores from vault export${capturedAt ? ` · captured ${capturedAt}` : ''}`}
      />
      <StubNote>
        Registry from live scrape of <code>/admin/stores</code>. Detail routes (
        <code>/admin/stores/:id</code>) are mapped but not built in the twin yet.
        Scope health: {healthy}/{total} healthy · {needAttention} need attention — see{' '}
        <Link href="/admin/shopify" className="underline">
          Shopify Apps
        </Link>
        . Seeds contain public domains only (no API tokens).
      </StubNote>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Stores" value={String(stores.length)} />
        <StatCard label="Healthy shops" value={`${healthy} / ${total}`} />
        <StatCard label="Source" value={String(meta?.source || 'vault')} />
        <StatCard
          label="Live URL"
          value={meta?.url ? 'app.direct2retailers.com' : '—'}
        />
      </div>
      <DataTable
        headers={['Name', 'Shop domain', 'Created', 'Store ID']}
        rows={stores.map((s) => [s.Name, s['Shop Domain'], s.Created, s.id])}
      />
    </div>
  );
}
