import Link from 'next/link';
import {
  PageTitle,
  ClusterNav,
  FilterBar,
  FilterField,
  FilterActions,
  FilterSubmit,
  FilterReset,
  StubNote,
} from '@/components/ui';
import { INVENTORY_CLUSTER_NAV } from '@/lib/inventory-nav';
import { getBusinesses } from '@/lib/data';

type SearchParams = Promise<{ rep?: string; q?: string }>;

/** Live column order: Sales Rep | Business Name | Address | Created | Actions */
const LIVE_HEADERS = [
  'Sales Rep',
  'Business Name',
  'Address',
  'Created',
  'Actions',
] as const;

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { meta, businesses: all } = getBusinesses();
  const rep = params.rep || '';
  const query = (params.q || '').trim().toLowerCase();
  const reps = [...new Set(all.map((b) => b.salesRep).filter(Boolean))].sort();
  const withDetailHref = all.filter((b) => b.href).length;

  const businesses = all.filter((b) => {
    if (rep && b.salesRep !== rep) return false;
    if (!query) return true;
    return (
      b.businessName.toLowerCase().includes(query) ||
      b.address.toLowerCase().includes(query) ||
      b.salesRep.toLowerCase().includes(query)
    );
  });

  const captured =
    meta?.capturedAt != null ? String(meta.capturedAt).slice(0, 10) : null;

  return (
    <div>
      <PageTitle
        title="Businesses"
        subtitle={`Legal entities · ${all.length} offline from businesses.json`}
      />
      <ClusterNav items={INVENTORY_CLUSTER_NAV} current="/admin/businesses" />
      <StubNote>
        Offline seed mirror of live <code>/admin/businesses</code>
        {captured ? <> (captured {captured})</> : null}. Columns match live
        scrape. {withDetailHref} row names link to{' '}
        <code>/admin/businesses/:uuid</code> detail stubs. Add Business / Export
        are UI stubs only.
      </StubNote>
      <FilterBar>
        <FilterField
          label="Sales rep"
          name="rep"
          defaultValue={rep}
          options={reps.map((r) => ({ value: r, label: r }))}
        />
        <FilterField
          label="Search"
          name="q"
          defaultValue={params.q || ''}
          placeholder="Business or address"
        />
        <FilterActions>
          <FilterSubmit />
          <FilterReset href="/admin/businesses" />
        </FilterActions>
      </FilterBar>
      <div className="overflow-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              {LIVE_HEADERS.map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {businesses.map((b, i) => {
              const idFromHref = b.href?.split('/').filter(Boolean).pop();
              return (
                <tr key={`${b.businessName}-${i}`} className="border-t border-stone-100">
                  <td className="px-3 py-2 whitespace-nowrap">{b.salesRep}</td>
                  <td className="px-3 py-2">
                    {idFromHref ? (
                      <Link
                        href={`/admin/businesses/${idFromHref}`}
                        className="text-amber-800 underline"
                      >
                        {b.businessName}
                      </Link>
                    ) : (
                      b.businessName
                    )}
                  </td>
                  <td className="px-3 py-2">{b.address}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{b.created}</td>
                  <td className="px-3 py-2 text-stone-400">
                    {b.href ? (
                      <Link href={b.href} className="underline">
                        Open
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
