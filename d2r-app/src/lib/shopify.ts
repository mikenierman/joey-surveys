/**
 * Shopify Admin API read helpers + webhook HMAC verify.
 * Write path intentionally not implemented until ledger reconcile.
 * Seed readers for offline health / shop registry (no API tokens in seeds).
 */
import crypto from 'crypto';
import {
  dataPath,
  readJsonFile,
  readSeedStore,
  writeJsonFile,
} from '@/lib/store';

export type ShopifyConfig = {
  shop: string;
  token: string;
  apiVersion: string;
};

export type ShopifyHealthRow = {
  Store: string;
  Domain: string;
  Scopes: string;
  Status: string;
  Install?: string;
  missingScopes?: boolean;
};

export type ShopifyHealthSnapshot = {
  meta?: {
    url?: string;
    capturedAt?: string;
    source?: string;
    healthy?: number;
    total?: number;
    count?: number;
  };
  headers: string[];
  shops: ShopifyHealthRow[];
};

export type ShopifyShopRow = {
  name: string;
  domain: string;
  storeId: string;
  created?: string;
};

/** Normalize Title-Case / camelCase health rows from live scrapes. */
function normalizeHealthRow(raw: Record<string, unknown>): ShopifyHealthRow {
  const domain = String(raw.Domain ?? raw.domain ?? '');
  const store = String(raw.Store ?? raw.store ?? raw.Name ?? raw.name ?? '');
  const scopes = String(raw.Scopes ?? raw.scopes ?? '');
  const status = String(raw.Status ?? raw.status ?? '');
  const install = raw.Install ?? raw.install;
  return {
    Store: store,
    Domain: domain,
    Scopes: scopes,
    Status: status,
    Install: install != null ? String(install) : undefined,
    missingScopes: Boolean(raw.missingScopes),
  };
}

/** Offline scope-health table from vault scrape (no tokens). */
export function getShopifyHealth(): ShopifyHealthSnapshot {
  const data = readSeedStore<{
    meta?: ShopifyHealthSnapshot['meta'];
    headers?: string[];
    shops?: Record<string, unknown>[];
  }>('shopify-health.json', {});
  const shops = (data.shops || []).map(normalizeHealthRow);
  const healthy =
    data.meta?.healthy ??
    shops.filter((s) => s.Status === 'Healthy').length;
  const total = data.meta?.total ?? data.meta?.count ?? shops.length;
  return {
    meta: {
      ...data.meta,
      healthy,
      total,
      count: shops.length,
    },
    headers: data.headers?.length
      ? data.headers
      : ['Store', 'Domain', 'Scopes', 'Status', 'Install'],
    shops,
  };
}

/** Normalized shop registry from /admin/stores scrape (domains only). */
export function getShopifyShops(): {
  meta?: Record<string, unknown>;
  shops: ShopifyShopRow[];
} {
  const data = readSeedStore<{
    meta?: Record<string, unknown>;
    shops?: ShopifyShopRow[];
  }>('shopify-shops.json', { shops: [] });
  return { meta: data.meta, shops: data.shops || [] };
}

export function getShopifyConfig(): ShopifyConfig | null {
  const shop = process.env.SHOPIFY_SHOP;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!shop || !token) return null;
  return {
    shop: shop.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    token,
    apiVersion: process.env.SHOPIFY_API_VERSION || '2024-10',
  };
}

export function getWebhookSecret(): string | null {
  return process.env.SHOPIFY_WEBHOOK_SECRET || null;
}

/**
 * Verify Shopify webhook HMAC-SHA256 (base64) over the raw body.
 * Exported for scripts/verify-webhook-hmac.mjs via compile or duplicate check.
 */
export function verifyShopifyWebhookHmac(
  rawBody: string | Buffer,
  hmacHeader: string | null | undefined,
  secret?: string | null
): boolean {
  const key = secret ?? getWebhookSecret();
  if (!key || !hmacHeader) return false;
  const digest = crypto
    .createHmac('sha256', key)
    .update(rawBody)
    .digest('base64');
  const a = Buffer.from(digest);
  const b = Buffer.from(hmacHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function shopifyGet(path: string) {
  const cfg = getShopifyConfig();
  if (!cfg) {
    return { ok: false as const, error: 'Shopify not configured' };
  }
  const url = `https://${cfg.shop}/admin/api/${cfg.apiVersion}${path}`;
  const res = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': cfg.token,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    return { ok: false as const, error: `Shopify HTTP ${res.status}` };
  }
  const data = await res.json();
  const link = res.headers.get('link');
  return { ok: true as const, data, link };
}

/** Lightweight probe: shop name via /shop.json */
export async function probeShopifyShop() {
  return shopifyGet('/shop.json');
}

function nextPageInfo(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  const m = linkHeader.match(/<[^>]*[?&]page_info=([^&>]+)[^>]*>;\s*rel="next"/);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Fetch a few pages of products (light pagination). */
export async function fetchProductsLight(maxPages = 3) {
  const products: unknown[] = [];
  let pageInfo: string | null = null;
  for (let page = 0; page < maxPages; page += 1) {
    const path = pageInfo
      ? `/products.json?limit=50&page_info=${encodeURIComponent(pageInfo)}`
      : '/products.json?limit=50';
    const res = await shopifyGet(path);
    if (!res.ok) {
      return { ok: false as const, error: res.error, products };
    }
    const batch = (res.data as { products?: unknown[] }).products || [];
    products.push(...batch);
    pageInfo = nextPageInfo(res.link ?? null);
    if (!pageInfo || batch.length === 0) break;
  }
  return { ok: true as const, products };
}

/** Inventory levels (locations-scoped; light sample). */
export async function fetchInventoryLevelsLight(limit = 50) {
  const locs = await shopifyGet('/locations.json');
  if (!locs.ok) {
    return { ok: false as const, error: locs.error, levels: [] as unknown[] };
  }
  const locations = (locs.data as { locations?: Array<{ id: number }> }).locations || [];
  const levels: unknown[] = [];
  for (const loc of locations.slice(0, 3)) {
    const res = await shopifyGet(
      `/inventory_levels.json?location_ids=${loc.id}&limit=${limit}`
    );
    if (res.ok) {
      const batch =
        (res.data as { inventory_levels?: unknown[] }).inventory_levels || [];
      levels.push(...batch);
    }
  }
  return { ok: true as const, levels, locationCount: locations.length };
}

export type SyncSnapshot = {
  syncedAt: string;
  shop: string | null;
  shopName: string | null;
  productCount: number;
  inventoryLevelCount: number;
  locationCount: number;
  errors: string[];
  writePathEnabled: false;
};

export function getLastSyncSnapshot(): SyncSnapshot | null {
  return readJsonFile<SyncSnapshot | null>(
    dataPath('sync', 'last-snapshot.json'),
    null
  );
}

export async function runShopifyReadSync(): Promise<SyncSnapshot> {
  const cfg = getShopifyConfig();
  const errors: string[] = [];
  let shopName: string | null = null;
  let productCount = 0;
  let inventoryLevelCount = 0;
  let locationCount = 0;

  if (!cfg) {
    const snap: SyncSnapshot = {
      syncedAt: new Date().toISOString(),
      shop: null,
      shopName: null,
      productCount: 0,
      inventoryLevelCount: 0,
      locationCount: 0,
      errors: ['Shopify not configured (SHOPIFY_SHOP / SHOPIFY_ADMIN_TOKEN)'],
      writePathEnabled: false,
    };
    writeJsonFile(dataPath('sync', 'last-snapshot.json'), snap);
    return snap;
  }

  const shopProbe = await probeShopifyShop();
  if (shopProbe.ok) {
    shopName =
      (shopProbe.data as { shop?: { name?: string } }).shop?.name || null;
    writeJsonFile(dataPath('sync', 'shop.json'), shopProbe.data);
  } else {
    errors.push(`shop: ${shopProbe.error}`);
  }

  const products = await fetchProductsLight(3);
  if (products.ok) {
    productCount = products.products.length;
    writeJsonFile(dataPath('sync', 'products.json'), {
      syncedAt: new Date().toISOString(),
      count: productCount,
      products: products.products,
    });
  } else {
    errors.push(`products: ${products.error}`);
  }

  const inventory = await fetchInventoryLevelsLight(50);
  if (inventory.ok) {
    inventoryLevelCount = inventory.levels.length;
    locationCount = inventory.locationCount;
    writeJsonFile(dataPath('sync', 'inventory-levels.json'), {
      syncedAt: new Date().toISOString(),
      count: inventoryLevelCount,
      locationCount,
      levels: inventory.levels,
    });
  } else {
    errors.push(`inventory: ${inventory.error}`);
  }

  const snap: SyncSnapshot = {
    syncedAt: new Date().toISOString(),
    shop: cfg.shop,
    shopName,
    productCount,
    inventoryLevelCount,
    locationCount,
    errors,
    writePathEnabled: false,
  };
  writeJsonFile(dataPath('sync', 'last-snapshot.json'), snap);
  return snap;
}
