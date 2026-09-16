import Link from 'next/link';
import { PageTitle, StubNote, DataTable } from '@/components/ui';
import { getShopifyShops, getShopifyHealth } from '@/lib/shopify';

export default function ShopifyTestPage() {
  const { shops } = getShopifyShops();
  const health = getShopifyHealth();
  const sample = shops.slice(0, 8);

  const byDomain = new Map(
    health.shops.map((row) => [row.Domain.toLowerCase(), row])
  );

  const resultRows = sample.map((s) => {
    const domain = (s.domain || '').toLowerCase();
    const h = domain ? byDomain.get(domain) : undefined;
    const status = !h
      ? 'not in health seed'
      : h.Status === 'Healthy'
        ? 'pass (seed)'
        : `${h.Status} (seed)`;
    return [
      s.name,
      s.domain,
      status,
      h?.Scopes || '—',
      h?.Install || '—',
    ];
  });

  return (
    <div>
      <PageTitle
        title="Shopify test"
        subtitle="Connectivity / scopes harness · offline"
      />
      <StubNote>
        Offline stub for <code>/admin/shopify/test</code>. No live API calls from this page.
        Results below are derived from health seed only — Run test is display-only.{' '}
        <Link href="/admin/shopify" className="underline">
          Shopify health
        </Link>
        {' · '}
        <Link href="/admin/shopify/apps" className="underline">
          Apps
        </Link>
        .
      </StubNote>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 bg-white p-3 text-sm">
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
            Shop
          </span>
          <select
            disabled
            className="rounded border border-stone-300 bg-stone-50 px-3 py-1.5 text-stone-600"
            defaultValue=""
          >
            <option value="">All (offline)</option>
            {shops.map((s) => (
              <option key={s.storeId} value={s.domain}>
                {s.name} · {s.domain}
              </option>
            ))}
          </select>
        </label>
        <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
          Run test (offline)
        </span>
      </div>

      <DataTable
        headers={['Shop', 'Domain', 'Result', 'Scopes', 'Install']}
        rows={resultRows}
      />
    </div>
  );
}
