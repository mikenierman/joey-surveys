/**
 * Admin + rep navigation for the offline twin.
 * Groups mirror live admin sidebar (SITE-MAP.md + URLS.txt + domain packs).
 */

export type NavLink = {
  href: string;
  label: string;
  children?: NavLink[];
};

export type NavGroup = {
  /** Section heading in the sidebar (omit for single top-level items). */
  label?: string;
  items: NavLink[];
};

/**
 * Live-mapped routes that do not yet have a twin page — middleware → pending lane.
 * CRM/locations + merch stores promoted to table shells — removed from this list.
 */
export const PENDING_ADMIN_PATHS: string[] = [
  // Inventory / platform gaps
  '/admin/inventory/transfers/terms',
  '/admin/shopify/apps',
  '/admin/shopify/test',
  // Finance cash ops (outside payouts lane seeds)
  '/admin/payments',
  '/admin/deposits',
  '/admin/receipts',
  // Misc admin
  '/admin/emails',
  '/admin/files',
  '/admin/diagnostics/order-timeline',
];
// Note: /admin/pulse/{goals,health,scores} owned by pulse lane — not pending.
// Inventory levels/warehouses/businesses/transfers owned by inventory lanes.
// CRM/locations + merch stores owned by table-shell pages (seed or honest empty).

/** Live H1 / sidebar labels for pending-lane chrome (match SITE-MAP.md). */
export const PENDING_LANE_TITLES: Record<string, string> = {
  '/admin/inventory/transfers/terms': 'Transfer terms',
  '/admin/shopify/apps': 'Shopify apps',
  '/admin/shopify/test': 'Shopify test',
  '/admin/payments': 'Payments',
  '/admin/deposits': 'Deposits',
  '/admin/receipts': 'Receipts',
  '/admin/emails': 'Emails',
  '/admin/files': 'Files',
  '/admin/diagnostics/order-timeline': 'Order timeline',
};

export function isPendingAdminPath(pathname: string): boolean {
  const path = pathname.replace(/\/$/, '') || '/';
  return PENDING_ADMIN_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );
}

export function pendingLaneTitle(pathname: string): string {
  const path = pathname.replace(/\/$/, '') || '/';
  if (PENDING_LANE_TITLES[path]) return PENDING_LANE_TITLES[path];
  const prefix = PENDING_ADMIN_PATHS.find(
    (p) => path === p || path.startsWith(`${p}/`)
  );
  if (prefix && PENDING_LANE_TITLES[prefix]) return PENDING_LANE_TITLES[prefix];
  return path;
}

/**
 * Live admin nav groups (order matches ops brief):
 * Dashboard, Pulse, Brands, Users, Orders, Inventory, Customers,
 * Merchandising, Locations, Payouts, Reports, Platform/Shopify.
 */
export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    items: [{ href: '/admin/dashboard', label: 'Dashboard' }],
  },
  {
    label: 'Pulse',
    items: [
      { href: '/admin/pulse', label: 'Overview' },
      { href: '/admin/pulse/signals', label: 'Signals' },
      { href: '/admin/pulse/goals', label: 'Goals' },
      { href: '/admin/pulse/health', label: 'Health' },
      { href: '/admin/pulse/scores', label: 'Scores' },
    ],
  },
  {
    label: 'Brands',
    items: [{ href: '/admin/stores', label: 'Brand stores' }],
  },
  {
    items: [{ href: '/admin/users', label: 'Users' }],
  },
  {
    label: 'Orders',
    items: [
      { href: '/admin/orders', label: 'All orders' },
      { href: '/admin/orders/drafts', label: 'Drafts' },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { href: '/admin/inventory', label: 'Levels' },
      { href: '/admin/inventory/ledgers', label: 'Ledgers' },
      { href: '/admin/inventory/performance', label: 'Performance' },
      { href: '/admin/inventory/transfers', label: 'Transfers' },
      { href: '/admin/inventory/transfers/terms', label: 'Transfer terms' },
      { href: '/admin/inventory/refresh', label: 'Brand levels' },
      { href: '/admin/inventory/audit', label: 'Audit' },
      { href: '/admin/warehouses', label: 'Warehouses' },
    ],
  },
  {
    label: 'Customers',
    items: [
      { href: '/admin/accounts', label: 'Accounts' },
      { href: '/admin/businesses', label: 'Businesses' },
      { href: '/admin/contacts', label: 'Contacts' },
    ],
  },
  {
    label: 'Merchandising',
    items: [
      { href: '/admin/merchandising', label: 'Programs' },
      { href: '/admin/merchandising/stores', label: 'Stores' },
    ],
  },
  {
    label: 'Locations',
    items: [
      { href: '/admin/locations', label: 'Locations' },
      { href: '/admin/locations/import', label: 'Import' },
      { href: '/admin/retail-stores', label: 'Retail stores' },
      { href: '/admin/rep-assignments', label: 'Rep assignments' },
      {
        href: '/admin/rep-assignments/relationships',
        label: 'Relationships',
      },
      { href: '/admin/sales-status', label: 'Sales status' },
    ],
  },
  {
    label: 'Payouts',
    items: [
      { href: '/admin/payouts', label: 'Payouts' },
      { href: '/admin/payouts/rules', label: 'Rules' },
      { href: '/admin/commissions', label: 'Commissions' },
      { href: '/admin/commissions/review', label: 'Commission review' },
      { href: '/admin/settlements', label: 'Settlements' },
      { href: '/admin/payments', label: 'Payments' },
      { href: '/admin/deposits', label: 'Deposits' },
      { href: '/admin/receipts', label: 'Receipts' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { href: '/admin/reports', label: 'Hub' },
      { href: '/admin/reports/brand-sales', label: 'Brand sales' },
      { href: '/admin/reports/rep-sales', label: 'Rep sales' },
      {
        href: '/admin/reports/inventory-reports',
        label: 'Inventory reports',
      },
      { href: '/admin/reports/commissions', label: 'Commissions' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { href: '/admin/shopify', label: 'Shopify' },
      { href: '/admin/shopify/apps', label: 'Apps' },
      { href: '/admin/shopify/test', label: 'Test' },
      { href: '/admin/stores', label: 'Brand stores' },
    ],
  },
];

/** Flat list for legacy consumers / active-path helpers. */
export const ADMIN_NAV: NavLink[] = ADMIN_NAV_GROUPS.flatMap((g) =>
  g.items.flatMap((item) =>
    item.children?.length ? [item, ...item.children] : [item]
  )
);

/**
 * Live rep nav tree (SITE-MAP § Nav tree rep-facing).
 * Flat top-nav links — cluster pages also use REP_INVENTORY_NAV.
 */
export const REP_NAV: NavLink[] = [
  { href: '/inventory', label: 'My inventory' },
  { href: '/inventory/transfers', label: 'Transfers' },
  { href: '/orders', label: 'Orders' },
  { href: '/merchandising', label: 'Merchandising' },
];
