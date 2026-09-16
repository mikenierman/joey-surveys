import Link from 'next/link';
import { PageTitle, StubNote, DataTable } from '@/components/ui';
import { getShopifyShops } from '@/lib/shopify';

export default function ShopifyAppsPage() {
  const { shops } = getShopifyShops();

  return (
    <div>
      <PageTitle
        title="Shopify apps"
        subtitle="Create and manage Shopify app credentials (offline)"
      />
      <StubNote>
        Offline twin of <code>/admin/shopify/apps</code>. Live page is a credential form;
        twin never stores Client Secret / tokens. Shop list is public domains from{' '}
        <code>shopify-shops.json</code>.{' '}
        <Link href="/admin/shopify" className="underline">
          Shopify health
        </Link>
        {' · '}
        <Link href="/admin/shopify/test" className="underline">
          Connectivity test
        </Link>
        .
      </StubNote>

      <div className="mb-6 rounded-xl border border-stone-200 bg-white p-4 text-sm">
        <h2 className="font-medium">App credentials (offline form)</h2>
        <p className="mt-1 text-stone-600">
          Fields mirror live labels. Values are empty placeholders — do not paste secrets
          into the twin.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            ['Shop Domain', 'Example kitchen-sink-goods.myshopify.com'],
            ['Client ID', 'Shopify app client ID'],
            ['Client Secret', '(never stored in twin)'],
            ['Install Url', 'https://…'],
          ].map(([label, placeholder]) => (
            <label key={label} className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
                {label}
              </span>
              <input
                type="text"
                disabled
                placeholder={placeholder}
                className="w-full rounded border border-stone-300 bg-stone-50 px-3 py-2 text-stone-500"
              />
            </label>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
            Save (offline)
          </span>
          <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
            Install app (offline)
          </span>
          <span className="rounded border border-dashed border-stone-300 px-3 py-1.5 text-stone-500">
            Rotate credentials (offline)
          </span>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-stone-500">
        Connected shops ({shops.length})
      </h2>
      <DataTable
        headers={['Name', 'Domain', 'Store ID', 'Created', 'Credentials']}
        rows={shops.map((s) => [
          s.name,
          s.domain,
          s.storeId,
          s.created || '—',
          'not in twin',
        ])}
      />
    </div>
  );
}
