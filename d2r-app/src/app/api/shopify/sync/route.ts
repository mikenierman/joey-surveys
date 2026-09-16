import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { runShopifyReadSync } from '@/lib/shopify';

/**
 * POST /api/shopify/sync — admin/manager only.
 * Read-only: writes snapshots under data/sync/. Never adjusts Shopify inventory.
 */
export async function POST() {
  const user = await getSessionUser();
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const snapshot = await runShopifyReadSync();
  return NextResponse.json({
    ok: snapshot.errors.length === 0,
    snapshot,
    writePathEnabled: false,
    note: 'Write path disabled — twin does not push inventory adjustments to Shopify.',
  });
}
