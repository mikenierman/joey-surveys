import Link from 'next/link';
import { PageTitle, StubNote } from '@/components/ui';

const REPORTS = [
  { href: '/admin/reports/brand-sales', label: 'Brand sales', path: '/admin/reports/brand-sales' },
  { href: '/admin/reports/rep-sales', label: 'Rep sales', path: '/admin/reports/rep-sales' },
  {
    href: '/admin/reports/inventory-reports',
    label: 'Inventory reports',
    path: '/admin/reports/inventory-reports',
  },
  {
    href: '/admin/reports/commissions',
    label: 'Commissions',
    path: '/admin/reports/commissions',
  },
];

export default function ReportsPage() {
  return (
    <div>
      <PageTitle
        title="Reports"
        subtitle="Offline hub matching live /admin/reports nav"
      />
      <StubNote>
        Report routes scaffolded for parity with live <code>/admin/reports/*</code>. Brand/rep
        sales use ledger proxies; commissions report reads <code>commissions.json</code>.
      </StubNote>
      <ul className="space-y-2">
        {REPORTS.map((r) => (
          <li key={r.href} className="flex flex-wrap items-baseline gap-2">
            <Link className="text-amber-800 underline" href={r.href}>
              {r.label}
            </Link>
            <code className="text-xs text-stone-500">{r.path}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
