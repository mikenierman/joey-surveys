import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { runBrandLevelsRefreshStub } from '@/lib/automations';

export const runtime = 'nodejs';

/**
 * POST /api/shopify/automations/brand-levels
 * Nightly brand-levels refresh stub — logs a run; no Shopify writes.
 * Admin/manager session, or CRON_SECRET bearer for scheduled offline runs.
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

  const result = runBrandLevelsRefreshStub({
    triggeredBy: cronOk ? 'cron' : 'admin',
  });

  return NextResponse.json({
    ok: true,
    job: 'brand-levels-refresh',
    ...result,
    paths: {
      automationRuns: 'data/runtime/automation-runs.json',
      opsEvents: 'data/runtime/ops-events.jsonl',
    },
  });
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/shopify/automations/brand-levels',
    method: 'POST',
    note: 'Offline-capable stub; logs run under data/runtime/',
  });
}
