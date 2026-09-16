/**
 * Offline automation stubs — log runs without requiring live Shopify tokens.
 */
import { getShopifyConfig, getShopifyHealth } from '@/lib/shopify';
import { recordAutomationRun, type AutomationRunRecord } from '@/lib/ops-logs';
import { readSeedStore } from '@/lib/store';

export type BrandLevelsRefreshResult = {
  run: AutomationRunRecord;
  brandCount: number;
  mode: 'offline-seed' | 'live-token';
};

export type InventorySyncTriggerResult = {
  run: AutomationRunRecord;
  mode: 'offline-stub' | 'read-sync-queued';
  tokenPresent: boolean;
};

/** Nightly brand-levels refresh stub: counts seed brands and logs a run. */
export function runBrandLevelsRefreshStub(opts?: {
  triggeredBy?: string;
}): BrandLevelsRefreshResult {
  const seed = readSeedStore<{
    brands?: unknown[];
    meta?: { count?: number };
  }>('brand-levels.json', {});
  const brandCount =
    seed.brands?.length ??
    seed.meta?.count ??
    0;
  const cfg = getShopifyConfig();
  const mode = cfg ? 'live-token' : 'offline-seed';
  const health = getShopifyHealth();
  const healthy = health.meta?.healthy ?? 0;
  const total = health.meta?.total ?? health.shops.length;

  const run = recordAutomationRun({
    job: 'brand-levels-refresh',
    status: mode === 'offline-seed' ? 'offline' : 'ok',
    shopDomain: cfg?.shop ?? null,
    message:
      mode === 'offline-seed'
        ? `Offline stub: logged brand-levels refresh over ${brandCount} seed brands (no Shopify token). Scope health ${healthy}/${total}.`
        : `Stub with token present: would refresh brand levels for ${cfg!.shop}; seed has ${brandCount} brands. Scope health ${healthy}/${total}.`,
    meta: {
      brandCount,
      mode,
      healthy,
      total,
      triggeredBy: opts?.triggeredBy || 'manual',
      writePathEnabled: false,
    },
  });

  return { run, brandCount, mode };
}

/**
 * Inventory sync trigger stub.
 * Without SHOPIFY_SHOP + SHOPIFY_ADMIN_TOKEN: logs offline skip (no network).
 * With tokens: logs a "queued" stub (actual read sync remains POST /api/shopify/sync).
 */
export function runInventorySyncTriggerStub(opts?: {
  triggeredBy?: string;
}): InventorySyncTriggerResult {
  const cfg = getShopifyConfig();
  const tokenPresent = Boolean(cfg);
  const mode = tokenPresent ? 'read-sync-queued' : 'offline-stub';

  const run = recordAutomationRun({
    job: 'inventory-sync',
    status: tokenPresent ? 'ok' : 'offline',
    shopDomain: cfg?.shop ?? null,
    message: tokenPresent
      ? `Stub: inventory sync trigger logged for ${cfg!.shop}. Run POST /api/shopify/sync for read snapshot (write path disabled).`
      : 'Offline stub: SHOPIFY_SHOP / SHOPIFY_ADMIN_TOKEN missing — logged without calling Shopify.',
    meta: {
      mode,
      tokenPresent,
      triggeredBy: opts?.triggeredBy || 'manual',
      writePathEnabled: false,
      hint: 'Set SHOPIFY_SHOP + SHOPIFY_ADMIN_TOKEN then POST /api/shopify/sync',
    },
  });

  return { run, mode, tokenPresent };
}
