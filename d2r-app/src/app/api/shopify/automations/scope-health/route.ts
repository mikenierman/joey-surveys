import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getShopifyHealth } from '@/lib/shopify';
import { recordInstallLog } from '@/lib/ops-logs';

export const runtime = 'nodejs';

/**
 * POST /api/shopify/automations/scope-health
 * Offline scope-health probe: walks seed health rows and appends install logs.
 * No live Shopify tokens required.
 */
export async function POST(req: Request) {
  const cron = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  const cronOk = Boolean(cron && auth === `Bearer ${cron}`);

  if (!cronOk) {
    const user = await getSessionUser();
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const health = getShopifyHealth();
  const logged = [];
  for (const shop of health.shops) {
    const status =
      shop.Status === 'Healthy'
        ? 'ok'
        : shop.Status === 'Not installed'
          ? 'skipped'
          : 'error';
    const record = recordInstallLog({
      shopDomain: shop.Domain,
      event: 'scope_health',
      status,
      scopesSummary: shop.Scopes || 'unknown',
      note: `Scope probe: ${shop.Store} — ${shop.Status}`,
    });
    logged.push({
      shop: shop.Domain,
      status: record.status,
      scopes: record.scopesSummary,
    });
  }

  return NextResponse.json({
    ok: true,
    job: 'scope-health',
    checked: logged.length,
    healthy: health.meta?.healthy,
    total: health.meta?.total,
    sample: logged.slice(0, 5),
    paths: {
      installLogs: 'data/runtime/install-logs.json',
      opsEvents: 'data/runtime/ops-events.jsonl',
    },
  });
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/shopify/automations/scope-health',
    method: 'POST',
    note: 'Offline seed-based scope probe; writes install logs',
  });
}
