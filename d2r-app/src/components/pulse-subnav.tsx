'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/admin/pulse', label: 'Overview' },
  { href: '/admin/pulse/signals', label: 'Signals' },
  { href: '/admin/pulse/scores', label: 'Scores' },
  { href: '/admin/pulse/goals', label: 'Goals' },
  { href: '/admin/pulse/health', label: 'Health' },
] as const;

export function PulseSubnav({
  active,
}: {
  active?: 'overview' | 'signals' | 'scores' | 'goals' | 'health';
}) {
  const pathname = (usePathname() || '').replace(/\/$/, '') || '/';
  return (
    <nav className="mb-4 flex flex-wrap gap-2 text-sm">
      {ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (active === 'overview' && item.href === '/admin/pulse') ||
          (active === 'signals' && item.href === '/admin/pulse/signals') ||
          (active === 'scores' && item.href === '/admin/pulse/scores') ||
          (active === 'goals' && item.href === '/admin/pulse/goals') ||
          (active === 'health' && item.href === '/admin/pulse/health');

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive
                ? 'rounded border border-amber-600 bg-amber-50 px-3 py-1 font-medium text-amber-950'
                : 'rounded border border-stone-300 bg-white px-3 py-1 text-stone-700 hover:bg-stone-50'
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
