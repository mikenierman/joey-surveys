import fs from 'fs';
import path from 'path';
import { getLastSyncSnapshot } from '@/lib/shopify';
import { getWebhookStats } from '@/lib/webhooks';
import { readSeedStore } from '@/lib/store';

const seedDir = path.join(process.cwd(), 'data', 'seed');

export function readSeed<T = unknown>(name: string): T | null {
  const file = path.join(seedDir, name);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

export type Warehouse = {
  warehouse: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  status?: string;
  created?: string;
  rep?: string;
};

export type InventoryItem = {
  product: string;
  variant: string;
  sku: string;
  onHand: number;
  available: number;
  committed: number;
  incoming: number;
  reserved: number;
  damaged: number;
  levelGid?: string;
};

/** @deprecated use InventoryItem via getInventorySample().items */
export type InventoryRow = Record<string, string | number | null>;

export type LedgerRep = {
  rep: string;
  valueHeld?: string;
  unitsHeld?: number;
  unitsSoldAllTime?: number;
  sellThrough?: string;
  lastSale?: string;
  soldLast7d?: string;
};

export type LedgerBrandRow = {
  rep: string;
  brand: string;
  status?: string;
  valueHeld?: string;
  unitsHeld?: number;
  unitsSoldAllTime?: number;
  sellThrough?: string;
  soldLast7d?: string;
  lastSale?: string;
};

export type BrandLevelRow = {
  brand: string;
  services: number;
  levels: number;
  lastRefresh?: string | null;
};

export type TransferRow = {
  transferId: string;
  store: string;
  warehouse: string;
  status: string;
  items: string;
  approved: string;
  created: string;
  actions: string;
};

function normalizeInventoryItem(raw: Record<string, unknown>): InventoryItem {
  return {
    product: String(raw.product ?? raw.Product ?? ''),
    variant: String(raw.variant ?? raw.Variant ?? ''),
    sku: String(raw.sku ?? raw.SKU ?? ''),
    onHand: Number(raw.onHand ?? raw['On hand'] ?? 0),
    available: Number(raw.available ?? raw.Available ?? 0),
    committed: Number(raw.committed ?? raw.Committed ?? 0),
    incoming: Number(raw.incoming ?? raw.Incoming ?? 0),
    reserved: Number(raw.reserved ?? raw.Reserved ?? 0),
    damaged: Number(raw.damaged ?? raw.Damaged ?? 0),
    levelGid: raw.levelGid
      ? String(raw.levelGid)
      : raw['Level GID']
        ? String(raw['Level GID'])
        : undefined,
  };
}

function normalizeTransfer(raw: Record<string, unknown>): TransferRow {
  if (raw['Transfer ID']) {
    return {
      transferId: String(raw['Transfer ID']),
      store: String(raw['Store'] ?? ''),
      warehouse: String(raw['Warehouse'] ?? ''),
      status: String(raw['Status'] ?? ''),
      items: String(raw['Items'] ?? ''),
      approved: String(raw['Approved'] ?? ''),
      created: String(raw['Created'] ?? ''),
      actions: String(raw['Actions'] ?? ''),
    };
  }
  return {
    transferId: String(raw.id ?? raw.transferId ?? ''),
    store: String(raw.store ?? '—'),
    warehouse: String(raw.warehouse ?? raw.to ?? raw.from ?? '—'),
    status: String(raw.status ?? ''),
    items: raw.qty != null ? `${raw.qty} units` : String(raw.items ?? '—'),
    approved: String(raw.approved ?? '—'),
    created: String(raw.createdAt ?? raw.created ?? ''),
    actions: String(raw.actions ?? ''),
  };
}

function parseBrandLevelsFromRows(rows: string[][] | undefined): BrandLevelRow[] {
  const brands = new Map<string, BrandLevelRow>();
  for (const row of rows || []) {
    for (const cell of row) {
      const match = String(cell).match(/^(.+?)\t(\d+)\t(\d+)$/);
      if (!match) continue;
      brands.set(match[1], {
        brand: match[1],
        services: Number(match[2]),
        levels: Number(match[3]),
      });
    }
  }
  return Array.from(brands.values()).sort((a, b) => a.brand.localeCompare(b.brand));
}

export function getWarehouses(): Warehouse[] {
  const data = readSeed<{ warehouses: Warehouse[] }>('warehouses.json');
  return data?.warehouses || [];
}

export function getInventorySample(): {
  meta?: Record<string, unknown>;
  items: InventoryItem[];
  /** @deprecated use items */
  rows: InventoryRow[];
} {
  const data = readSeed<{
    meta?: Record<string, unknown>;
    items?: Array<Record<string, unknown>>;
    rows?: Array<Record<string, unknown>>;
  }>('inventory-sample.json');
  const rawRows = data?.items?.length ? data.items : data?.rows || [];
  const items = rawRows.map((row) => normalizeInventoryItem(row));
  return {
    meta: data?.meta,
    items,
    rows: items.map((item) => ({
      Product: item.product,
      Variant: item.variant,
      SKU: item.sku,
      'On hand': item.onHand,
      Available: item.available,
      Committed: item.committed,
      Incoming: item.incoming,
      Reserved: item.reserved,
      Damaged: item.damaged,
      'Level GID': item.levelGid ?? null,
    })),
  };
}

export function getInventoryStoreOptions(): string[] {
  const stores = readSeed<{ stores?: Array<Record<string, unknown>> }>('stores.json');
  const names = (stores?.stores || [])
    .map((s) => String(s['Name'] ?? s.name ?? ''))
    .filter(Boolean);
  const sampleStore = getInventorySample().meta?.store;
  if (sampleStore && !names.includes(String(sampleStore))) {
    names.unshift(String(sampleStore));
  }
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}

export function getLedgerPerformance(): {
  summary?: Record<string, unknown>;
  reps: LedgerRep[];
} {
  const data = readSeed<{ summary?: Record<string, unknown>; reps: LedgerRep[] }>(
    'ledger-performance.json'
  );
  return { summary: data?.summary, reps: data?.reps || [] };
}

export function getLedgerByRepBrand(): {
  meta?: Record<string, unknown>;
  reps: Array<{
    rep: string;
    valueHeld?: string;
    brands?: Array<Record<string, unknown>>;
  }>;
} {
  const data = readSeed<{
    meta?: Record<string, unknown>;
    reps?: Array<{
      rep: string;
      valueHeld?: string;
      brands?: Array<Record<string, unknown>>;
    }>;
  }>('ledger-by-rep-brand.json');
  return { meta: data?.meta, reps: data?.reps || [] };
}

export function getLedgerBrandRows(filters?: {
  rep?: string;
  brand?: string;
}): LedgerBrandRow[] {
  const { reps } = getLedgerByRepBrand();
  const rows: LedgerBrandRow[] = [];
  for (const repRow of reps) {
    for (const brandRow of repRow.brands || []) {
      rows.push({
        rep: repRow.rep,
        brand: String(brandRow.brand ?? ''),
        status: brandRow.status ? String(brandRow.status) : undefined,
        valueHeld: brandRow.valueHeld ? String(brandRow.valueHeld) : undefined,
        unitsHeld: brandRow.unitsHeld != null ? Number(brandRow.unitsHeld) : undefined,
        unitsSoldAllTime:
          brandRow.unitsSoldAllTime != null ? Number(brandRow.unitsSoldAllTime) : undefined,
        sellThrough: brandRow.sellThrough ? String(brandRow.sellThrough) : undefined,
        soldLast7d: brandRow.soldLast7d ? String(brandRow.soldLast7d) : undefined,
        lastSale: brandRow.lastSale ? String(brandRow.lastSale) : undefined,
      });
    }
  }
  return rows.filter((row) => {
    if (filters?.rep && row.rep !== filters.rep) return false;
    if (filters?.brand && row.brand !== filters.brand) return false;
    return true;
  });
}

export function getLedgerRepsForBrand(brand?: string): LedgerRep[] {
  const { reps } = getLedgerPerformance();
  if (!brand) return reps;
  const repNames = new Set(getLedgerBrandRows({ brand }).map((r) => r.rep));
  return reps.filter((r) => repNames.has(r.rep));
}

export function getLedgerBrandOptions(): string[] {
  return [...new Set(getLedgerBrandRows().map((r) => r.brand))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export function getBrandLevels(): {
  meta?: Record<string, unknown>;
  brands: BrandLevelRow[];
} {
  const data = readSeed<{
    meta?: Record<string, unknown>;
    brands?: Array<Record<string, unknown>>;
    rows?: string[][];
  }>('brand-levels.json');
  const clean = (data?.brands || []).filter(
    (b) =>
      b.brand &&
      b.services != null &&
      b.levels != null &&
      !String(b.brand).includes('\t') &&
      String(b.brand) !== 'Refresh all'
  ) as BrandLevelRow[];
  if (clean.length) {
    return { meta: data?.meta, brands: clean };
  }
  return { meta: data?.meta, brands: parseBrandLevelsFromRows(data?.rows) };
}

export function getTransfers(): TransferRow[] {
  const data = readSeed<{ transfers?: Array<Record<string, unknown>> }>('transfers.json');
  return (data?.transfers || []).map((row) => normalizeTransfer(row));
}

export function getTransferMeta(): Record<string, unknown> | undefined {
  return readSeed<{ meta?: Record<string, unknown> }>('transfers.json')?.meta;
}

export type StoreRow = {
  id: string;
  Name: string;
  'Shop Domain': string;
  Created: string;
  href?: string;
};

export function getStores(): { meta?: Record<string, unknown>; stores: StoreRow[] } {
  const data = readSeed<{ meta?: Record<string, unknown>; stores?: StoreRow[] }>(
    'stores.json'
  );
  return { meta: data?.meta, stores: data?.stores || [] };
}

export function getShopifyStatus() {
  const shops = readSeed<{ shops?: unknown[] }>('shopify-shops.json');
  const lastSync = getLastSyncSnapshot();
  const webhooks = getWebhookStats();
  return {
    connected: Boolean(process.env.SHOPIFY_ADMIN_TOKEN && process.env.SHOPIFY_SHOP),
    shop: process.env.SHOPIFY_SHOP || null,
    mode: process.env.SHOPIFY_ADMIN_TOKEN ? 'read-ready' : 'unconfigured',
    webhookSecretConfigured: Boolean(process.env.SHOPIFY_WEBHOOK_SECRET),
    shopsFile: shops,
    lastSync,
    webhookEvents: webhooks,
    writePathEnabled: false as const,
    note: 'Read-only sync activates when SHOPIFY_SHOP + SHOPIFY_ADMIN_TOKEN are set. Write path stays off.',
  };
}

export type OrderLink = { t: string; h: string };

export type LiveOrderRow = Record<string, string | OrderLink[] | undefined> & {
  _links?: OrderLink[];
};

export const LIVE_ORDER_HEADERS = [
  'PO Number',
  'Store',
  'Account',
  'Customer',
  'Location',
  'Fulfillment',
  'ETA',
  'Total',
  'Sales Rep',
  'Created',
] as const;

export type OrdersSnapshot = {
  meta?: {
    url?: string;
    capturedAt?: string;
    source?: string;
    page?: number;
    pagesHint?: string;
    approxPages?: number;
    count?: number;
  };
  headers?: string[];
  orders: LiveOrderRow[];
};

export const ORDER_DRAFT_HEADERS = ['Draft', 'Store', 'Rep', 'Updated'] as const;

export type OrderDraftsSnapshot = {
  meta?: { source?: string; note?: string };
  headers?: string[];
  drafts: Array<Record<string, string>>;
};

/** @deprecated scaffold shape — use LiveOrderRow via getOrdersSnapshot */
export type OrderRow = {
  id: string;
  brand: string;
  status: string;
  total: number;
  currency?: string;
  rep?: string;
  createdAt: string;
  notes?: string;
};

export function getOrdersSnapshot(): OrdersSnapshot & { headers: string[] } {
  const data = readSeedStore<OrdersSnapshot>('orders.json', { orders: [] });
  return {
    meta: data.meta,
    headers: data.headers?.length ? data.headers : [...LIVE_ORDER_HEADERS],
    orders: data.orders || [],
  };
}

export function getOrderById(id: string): { id: string; row: LiveOrderRow | null } {
  const { orders } = getOrdersSnapshot();
  for (const row of orders) {
    const hit = row._links?.some((l) => l.h.endsWith(id) || l.h.includes(`/${id}`));
    if (hit) return { id, row };
  }
  return { id, row: null };
}

export function getOrderDrafts(
  scope: 'admin' | 'rep' = 'admin'
): OrderDraftsSnapshot & { headers: string[] } {
  const file = scope === 'admin' ? 'orders-drafts-admin.json' : 'orders-drafts-rep.json';
  const data = readSeedStore<OrderDraftsSnapshot>(file, { drafts: [] });
  return {
    meta: data.meta ?? {
      source: 'inferred',
      note: 'No live capture — headers from SITE-MAP-INTERACTIONS',
    },
    headers: data.headers?.length ? data.headers : [...ORDER_DRAFT_HEADERS],
    drafts: data.drafts || [],
  };
}

export type CommissionRow = {
  id: string;
  rep: string;
  brand: string;
  period: string;
  amount: number;
  status: string;
  updatedAt: string;
  orderCount?: number;
  rate?: string;
  notes?: string;
};

export function getCommissions(): CommissionRow[] {
  return (
    readSeedStore<{ commissions?: CommissionRow[] }>('commissions.json', {
      commissions: [],
    }).commissions || []
  );
}

export function getCommissionsMeta(): Record<string, unknown> | undefined {
  return readSeedStore<{ meta?: Record<string, unknown> }>('commissions.json', {}).meta;
}

export type SettlementRow = {
  id: string;
  period: string;
  brand: string;
  gross: number;
  adjustments: number;
  net: number;
  status: string;
  createdAt: string;
  orderCount?: number;
  commissionTotal?: number;
  notes?: string;
};

export function getSettlements(): SettlementRow[] {
  return (
    readSeedStore<{ settlements?: SettlementRow[] }>('settlements.json', {
      settlements: [],
    }).settlements || []
  );
}

export function getSettlementsMeta(): Record<string, unknown> | undefined {
  return readSeedStore<{ meta?: Record<string, unknown> }>('settlements.json', {}).meta;
}

export type PayoutRow = {
  id: string;
  rep: string;
  method: string;
  amount: number;
  status: string;
  runDate: string | null;
  rule: string;
  commissionIds?: string[];
  notes?: string;
};

export function getPayouts(): PayoutRow[] {
  return (
    readSeedStore<{ payouts?: PayoutRow[] }>('payouts.json', { payouts: [] }).payouts ||
    []
  );
}

export function getPayoutsMeta(): Record<string, unknown> | undefined {
  return readSeedStore<{ meta?: Record<string, unknown> }>('payouts.json', {}).meta;
}

export type PayoutRuleRow = {
  id: string;
  name: string;
  label: string;
  type: string;
  method: string;
  cadence: string;
  minAmount: number;
  active: boolean;
  repCount: number;
};

export function getPayoutRules(): PayoutRuleRow[] {
  return (
    readSeedStore<{ rules?: PayoutRuleRow[] }>('payout-rules.json', { rules: [] })
      .rules || []
  );
}

export type PulseSignalKpis = {
  reorderRate: string;
  reorderMissRate: string;
  newDoors: number;
  orders: number;
  score: number;
  activeStores: number;
  onHandShare: string;
  revenue: number;
  onHandFeePct: string;
  dropShipFeePct: string;
};

export type PulseSignalsCapture = {
  meta?: {
    url?: string;
    capturedAt?: string;
    source?: string;
    rep?: string;
    range?: string;
  };
  signals?: PulseSignalKpis;
};

export const PULSE_SIGNAL_LABELS: Record<keyof PulseSignalKpis, string> = {
  reorderRate: 'Reorder rate',
  reorderMissRate: 'Reorder miss rate',
  newDoors: 'New doors',
  orders: 'Orders',
  score: 'Pulse score',
  activeStores: 'Active stores',
  onHandShare: 'On-hand share',
  revenue: 'Revenue',
  onHandFeePct: 'On-hand fee',
  dropShipFeePct: 'Drop-ship fee',
};

export function getPulseSignalsCapture(): PulseSignalsCapture | null {
  return readSeed<PulseSignalsCapture>('pulse-signals.json');
}

export function getPulseSignalKpis(): PulseSignalKpis | null {
  const capture = getPulseSignalsCapture();
  const signals = capture?.signals;
  if (!signals || Array.isArray(signals)) return null;
  return signals;
}

export function formatPulseSignalValue(
  key: keyof PulseSignalKpis,
  value: number | string
): string {
  if (key === 'revenue' && typeof value === 'number') {
    return `$${value.toLocaleString()}`;
  }
  return String(value);
}

export function pulseSignalTableRows(
  kpis: PulseSignalKpis
): Array<[string, string]> {
  return (Object.keys(PULSE_SIGNAL_LABELS) as Array<keyof PulseSignalKpis>).map(
    (key) => [PULSE_SIGNAL_LABELS[key], formatPulseSignalValue(key, kpis[key])]
  );
}

export function getDashboardKpis() {
  const ledger = getLedgerPerformance();
  const pulseCapture = getPulseSignalsCapture();
  const shopifyHealth = readSeed<{ meta?: { healthy?: number; total?: number } }>(
    'shopify-health.json'
  );
  const ordersSeed = readSeed<{ meta?: { count?: number; approxPages?: number } }>(
    'orders.json'
  );
  const usersSeed = readSeed<{ meta?: { count?: number } }>('users.json');

  return {
    ledgerSummary: ledger.summary,
    repCount: ledger.reps.length,
    pulse: pulseCapture?.signals && !Array.isArray(pulseCapture.signals)
      ? pulseCapture.signals
      : null,
    pulseMeta: pulseCapture?.meta,
    warehouseCount: getWarehouses().length,
    shopifyHealthy: shopifyHealth?.meta?.healthy,
    shopifyTotal: shopifyHealth?.meta?.total,
    ordersSampleCount: ordersSeed?.meta?.count,
    ordersApproxPages: ordersSeed?.meta?.approxPages,
    userCount: usersSeed?.meta?.count,
  };
}

export type UserRow = {
  name: string;
  email: string;
  lastSeen: string;
  role: string;
  created: string;
};

type RawUser = Record<string, string | undefined>;

function normalizeUser(raw: RawUser): UserRow {
  return {
    name: raw.name || raw.Name || '',
    email: raw.email || raw.Email || '',
    lastSeen: raw.lastSeen || raw['Last Seen'] || '',
    role: raw.role || raw.Role || '',
    created: raw.created || raw.Created || '',
  };
}

export type SeedUser = {
  email: string;
  name: string;
  role: string;
};

export function getUsers(): {
  meta?: Record<string, unknown>;
  headers: string[];
  users: UserRow[];
} {
  const data = readSeed<{ meta?: Record<string, unknown>; headers?: string[]; users?: RawUser[] }>(
    'users.json'
  );
  const users = (data?.users || []).map(normalizeUser);
  return {
    meta: data?.meta,
    headers: data?.headers || ['Name', 'Email', 'Last Seen', 'Role', 'Created'],
    users,
  };
}

/** @deprecated use getUsers — kept for auth/demo fallbacks */
export function getSeedUsers(): SeedUser[] {
  return getUsers().users.map((u) => ({
    name: u.name,
    email: u.email,
    role: u.role || 'rep',
  }));
}

export type BusinessRow = {
  salesRep: string;
  businessName: string;
  address: string;
  created: string;
  href?: string;
};

export function getBusinesses(): {
  meta?: Record<string, unknown>;
  businesses: BusinessRow[];
} {
  const data = readSeed<{
    meta?: Record<string, unknown>;
    businesses?: Array<Record<string, string | { t: string; h: string }[] | undefined>>;
  }>('businesses.json');
  const businesses = (data?.businesses || []).map((b) => ({
    salesRep: String(b['Sales Rep'] || ''),
    businessName: String(b['Business Name'] || ''),
    address: String(b.Address || ''),
    created: String(b.Created || ''),
    href: Array.isArray(b._links) && b._links[0]?.h ? String(b._links[0].h) : undefined,
  }));
  return { meta: data?.meta, businesses };
}

export type RepAssignmentRow = {
  rep: string;
  storeName: string;
  city: string;
  state: string;
  account: string;
  role: string;
  from: string;
  to: string;
};

export function getRepAssignments(): {
  meta?: Record<string, unknown>;
  headers: string[];
  assignments: RepAssignmentRow[];
} {
  const data = readSeed<{
    meta?: Record<string, unknown>;
    headers?: string[];
    assignments?: Array<Record<string, string | undefined>>;
  }>('rep-assignments.json');
  const assignments = (data?.assignments || []).map((a) => ({
    rep: a.Rep || '',
    storeName: a['Store Name'] || '',
    city: a.City || '',
    state: a.State || '',
    account: a.Account || '',
    role: a.Role || '',
    from: a.From || '',
    to: a.To || '—',
  }));
  return {
    meta: data?.meta,
    headers: (data?.headers || []).filter((h) => h),
    assignments,
  };
}

export type RetailStoreRow = {
  store: string;
  account: string;
  city: string;
  state: string;
  rep: string;
};

/** Door list derived from assignment sample until retail-stores export exists. */
export function getRetailStores(): {
  meta?: Record<string, unknown>;
  stores: RetailStoreRow[];
  derived: boolean;
} {
  const { meta, assignments } = getRepAssignments();
  const byKey = new Map<string, RetailStoreRow>();
  for (const a of assignments) {
    const key = [a.storeName, a.city, a.state, a.account].join('|').toLowerCase();
    const existing = byKey.get(key);
    const rep =
      a.role === 'Primary' ? a.rep : existing?.rep && existing.rep !== '—' ? existing.rep : a.rep;
    byKey.set(key, {
      store: a.storeName,
      account: a.account,
      city: a.city,
      state: a.state,
      rep: rep || '—',
    });
  }
  const stores = [...byKey.values()].sort((a, b) =>
    a.store.localeCompare(b.store, undefined, { sensitivity: 'base' })
  );
  return {
    meta,
    stores,
    derived: true,
  };
}
