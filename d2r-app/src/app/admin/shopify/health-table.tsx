'use client';

import { useMemo, useState } from 'react';

export type HealthRow = {
  Store: string;
  Domain: string;
  Scopes: string;
  Status: string;
  Install?: string;
};

const STATUS_OPTIONS = [
  'All',
  'Healthy',
  'Missing scopes',
  'Not installed',
  'Unreachable',
] as const;

function statusClass(status: string): string {
  switch (status) {
    case 'Healthy':
      return 'text-emerald-800';
    case 'Missing scopes':
      return 'text-amber-800';
    case 'Not installed':
      return 'text-stone-700';
    case 'Unreachable':
      return 'text-red-800';
    default:
      return 'text-stone-800';
  }
}

export function ShopifyHealthTable({
  headers,
  shops,
}: {
  headers: string[];
  shops: HealthRow[];
}) {
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('All');

  const rows = useMemo(() => {
    if (status === 'All') return shops;
    return shops.filter((s) => s.Status === status);
  }, [shops, status]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <label className="text-sm text-stone-600" htmlFor="shopify-status-filter">
          Status
        </label>
        <select
          id="shopify-status-filter"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as (typeof STATUS_OPTIONS)[number])
          }
          className="rounded border border-stone-300 bg-white px-2 py-1.5 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="text-sm text-stone-500">
          Showing {rows.length} of {shops.length}
        </span>
      </div>
      <div className="overflow-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((shop) => (
              <tr key={shop.Domain} className="border-t border-stone-100">
                <td className="px-3 py-2 whitespace-nowrap">{shop.Store}</td>
                <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">
                  {shop.Domain}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{shop.Scopes}</td>
                <td
                  className={`px-3 py-2 whitespace-nowrap font-medium ${statusClass(shop.Status)}`}
                >
                  {shop.Status}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-stone-400">
                  {shop.Install || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
