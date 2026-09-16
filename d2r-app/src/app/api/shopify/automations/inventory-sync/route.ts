import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { runInventorySyncTriggerStub } from '@/lib/automations';

export const runtime = 'nodejs';

/**
 * POST /api/shopify/automations/inventory-sync
 * Inventory sync trigger stub — logs without live Shopify when env missing.
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

  const result = runInventorySyncTriggerStub({
    triggeredBy: cronOk ? 'cron' : 'admin',
  });

  return NextResponse.json({
    ok: true,
    job: 'inventory-sync',
    ...result,
    paths: {
      automationRuns: 'data/runtime/automation-runs.json',
      opsEvents: 'data/runtime/ops-events.jsonl',
    },
  });
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/shopify/automations/inventory-sync',
    method: 'POST',
    note: 'Logs offline when Shopify tokens absent; does not write to Shopify',
  });
}
