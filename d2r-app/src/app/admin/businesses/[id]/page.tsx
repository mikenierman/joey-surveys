import Link from 'next/link';
import { PageTitle, StubNote, DataTable } from '@/components/ui';
import { getBusinesses } from '@/lib/data';

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { businesses } = getBusinesses();
  const match = businesses.find((b) => b.href?.includes(id));

  return (
    <div>
      <PageTitle
        title={match?.businessName || 'Business'}
        subtitle={match?.salesRep ? `Rep · ${match.salesRep}` : id}
      />
      <StubNote>
        Offline detail stub for <code>/admin/businesses/{id}</code>. Full CRM
        entity editor is PendingLane-adjacent — list lives at{' '}
        <Link href="/admin/businesses" className="underline">
          Businesses
        </Link>
        .
      </StubNote>
      <DataTable
        headers={['Field', 'Value']}
        rows={[
          ['Business ID', id],
          ['Business name', match?.businessName ?? '—'],
          ['Sales rep', match?.salesRep ?? '—'],
          ['Address', match?.address ?? '—'],
          ['Created', match?.created ?? '—'],
        ]}
      />
    </div>
  );
}
