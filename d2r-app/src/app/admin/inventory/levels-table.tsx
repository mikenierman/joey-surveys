import type { InventoryItem } from '@/lib/data';

const HEADERS = [
  'Product',
  'Variant',
  'SKU',
  'On hand',
  'Available',
  'Committed',
  'Incoming',
  'Reserved',
  'Damaged',
  'Level GID',
  '',
] as const;

function shortGid(gid: string | undefined): string {
  if (!gid) return '—';
  const q = gid.indexOf('?');
  if (q === -1) return gid.length > 36 ? `${gid.slice(0, 36)}…` : gid;
  const base = gid.slice(0, q);
  return base.length > 28 ? `${base.slice(0, 28)}…?…` : `${base}?…`;
}

export function InventoryLevelsTable({ items }: { items: InventoryItem[] }) {
  return (
    <div className="overflow-auto rounded-xl border border-stone-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
          <tr>
            {HEADERS.map((h, i) => (
              <th key={h || `actions-${i}`} className="px-3 py-2 font-medium">
                {h || <span className="sr-only">Actions</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={HEADERS.length}
                className="px-3 py-6 text-center text-stone-500"
              >
                No inventory levels for this store / warehouse filter.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.levelGid || item.sku} className="border-t border-stone-100">
                <td className="max-w-[16rem] truncate px-3 py-2" title={item.product}>
                  {item.product}
                </td>
                <td className="whitespace-nowrap px-3 py-2">{item.variant}</td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{item.sku}</td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{item.onHand}</td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{item.available}</td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{item.committed}</td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{item.incoming}</td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{item.reserved}</td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{item.damaged}</td>
                <td
                  className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-stone-600"
                  title={item.levelGid || undefined}
                >
                  {shortGid(item.levelGid)}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <button
                    type="button"
                    disabled
                    title="Adjust is UI-only in the offline twin"
                    className="rounded border border-stone-300 bg-stone-100 px-2 py-1 text-xs text-stone-500"
                  >
                    Adjust
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
