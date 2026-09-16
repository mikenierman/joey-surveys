import Link from 'next/link';
import { PageTitle, StubNote, StatCard } from '@/components/ui';
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
        Registry from live scrape of <code>/admin/stores</code>. Row names link to
        detail stubs at <code>/admin/stores/:id</code>. Scope health: {healthy}/
        {total} healthy · {needAttention} need attention — see{' '}
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
      <div className="overflow-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              {['Name', 'Shop domain', 'Created', 'Store ID'].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id} className="border-t border-stone-100">
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/stores/${s.id}`}
                    className="text-amber-800 underline"
                  >
                    {s.Name}
                  </Link>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{s['Shop Domain']}</td>
                <td className="px-3 py-2 whitespace-nowrap">{s.Created}</td>
                <td className="px-3 py-2 font-mono text-xs text-stone-500">
                  {s.id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
