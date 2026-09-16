import { NextResponse } from 'next/server';
import { getShopifyStatus } from '@/lib/data';
import { probeShopifyShop } from '@/lib/shopify';

export async function GET() {
  const base = getShopifyStatus();
  if (!base.connected) {
    return NextResponse.json(base);
  }
  const probe = await probeShopifyShop();
  return NextResponse.json({
    ...base,
    probe: probe.ok
      ? { ok: true, shop: (probe.data as { shop?: { name?: string } }).shop?.name }
      : { ok: false, error: probe.error },
  });
}
