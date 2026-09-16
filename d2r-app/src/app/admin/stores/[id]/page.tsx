import Link from 'next/link';
import { PageTitle, StubNote, DataTable } from '@/components/ui';
import { getStores } from '@/lib/data';

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { stores } = getStores();
  const store = stores.find((s) => s.id === id);

  return (
    <div>
      <PageTitle
        title={store?.Name || 'Brand store'}
        subtitle={store?.['Shop Domain'] || id}
      />
      <StubNote>
        Offline detail stub for <code>/admin/stores/{id}</code>. Live Shopify
        install / sync controls are not mirrored — see{' '}
        <Link href="/admin/shopify" className="underline">
          Shopify health
        </Link>{' '}
        and{' '}
        <Link href="/admin/stores" className="underline">
          Brand stores
        </Link>
        .
      </StubNote>
      <DataTable
        headers={['Field', 'Value']}
        rows={[
          ['Store ID', id],
          ['Name', store?.Name ?? '—'],
          ['Shop domain', store?.['Shop Domain'] ?? '—'],
          ['Created', store?.Created ?? '—'],
        ]}
      />
    </div>
  );
}
