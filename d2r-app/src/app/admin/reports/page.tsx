import Link from 'next/link';
import { PageTitle, StubNote } from '@/components/ui';
import { ReportProxyBanner } from '@/components/report-proxy-banner';

const REPORTS = [
  {
    href: '/admin/reports/brand-sales',
    label: 'Brand sales',
    path: '/admin/reports/brand-sales',
    proxy: 'ledger brand rollups',
  },
  {
    href: '/admin/reports/rep-sales',
    label: 'Rep sales',
    path: '/admin/reports/rep-sales',
    proxy: 'ledger performance',
  },
  {
    href: '/admin/reports/inventory-reports',
    label: 'Inventory reports',
    path: '/admin/reports/inventory-reports',
    proxy: 'inventory sample SKUs',
  },
  {
    href: '/admin/reports/commissions',
    label: 'Commissions',
    path: '/admin/reports/commissions',
    proxy: 'commissions.json scaffold',
  },
];

export default function ReportsPage() {
  return (
    <div>
      <PageTitle
        title="Reports"
        subtitle="Offline hub matching live /admin/reports nav"
      />
      <ReportProxyBanner proxyOf="ledger / commission seed proxies — not dedicated live report captures" />
      <StubNote>
        Report routes scaffolded for parity with live <code>/admin/reports/*</code>. Treat every
        runner as a <strong>proxy</strong> until a dedicated export replaces it.
      </StubNote>
      <ul className="space-y-2">
        {REPORTS.map((r) => (
          <li key={r.href} className="flex flex-wrap items-baseline gap-2">
            <Link className="text-amber-800 underline" href={r.href}>
              {r.label}
            </Link>
            <code className="text-xs text-stone-500">{r.path}</code>
            <span className="text-xs text-stone-500">proxy: {r.proxy}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
