import Link from 'next/link';
import type { LiveOrderRow } from '@/lib/data';

export function OrdersTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: LiveOrderRow[];
}) {
  return (
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
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-stone-100">
              {headers.map((h) => {
                const cell = row[h];
                const link =
                  h === 'PO Number'
                    ? row._links?.find((l) => l.t === String(cell)) ?? row._links?.[0]
                    : undefined;
                if (h === 'PO Number' && link) {
                  return (
                    <td key={h} className="px-3 py-2 whitespace-nowrap">
                      <Link className="text-amber-800 underline" href={link.h}>
                        {String(cell ?? link.t)}
                      </Link>
                    </td>
                  );
                }
                return (
                  <td key={h} className="px-3 py-2 whitespace-nowrap">
                    {cell != null && !Array.isArray(cell) ? cell : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
