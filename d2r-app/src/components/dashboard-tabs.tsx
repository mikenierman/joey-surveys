'use client';

import Link from 'next/link';

const TABS = [
  { id: 'overview', href: '/admin/dashboard', label: 'Overview' },
  {
    id: 'merchandising',
    href: '/admin/dashboard?tab=merchandising',
    label: 'Merchandising',
  },
] as const;

export function DashboardTabs({
  active,
}: {
  active: 'overview' | 'merchandising';
}) {
  return (
    <nav className="mb-4 flex flex-wrap gap-2 text-sm" aria-label="Dashboard tabs">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={
              isActive
                ? 'rounded border border-amber-600 bg-amber-50 px-3 py-1 font-medium text-amber-950'
                : 'rounded border border-stone-300 bg-white px-3 py-1 text-stone-700 hover:bg-stone-50'
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
