import Link from 'next/link';

const ITEMS = [
  { href: '/admin/pulse', label: 'Overview' },
  { href: '/admin/pulse/signals', label: 'Signals' },
  { href: '/admin/pulse/scores', label: 'Scores' },
  { href: '/admin/pulse/goals', label: 'Goals' },
  { href: '/admin/pulse/health', label: 'Health' },
] as const;

export type PulseNavKey = (typeof ITEMS)[number]['href'];

export function PulseNav({ current }: { current: PulseNavKey }) {
  return (
    <nav className="mb-4 flex flex-wrap gap-1">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded px-3 py-1 text-sm ${
            current === item.href
              ? 'bg-stone-900 text-white'
              : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
