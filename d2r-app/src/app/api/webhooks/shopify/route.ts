import { NextResponse } from 'next/server';
import {
  getWebhookSecret,
  verifyShopifyWebhookHmac,
} from '@/lib/shopify';
import {
  findWebhookEvent,
  handleWebhookTopic,
  persistWebhookEvent,
} from '@/lib/webhooks';

export const runtime = 'nodejs';

/**
 * POST /api/webhooks/shopify
 * Verifies HMAC, idempotent by X-Shopify-Webhook-Id, persists raw event, returns 200 quickly.
 */
export async function POST(req: Request) {
  const secret = getWebhookSecret();
  if (!secret) {
    return NextResponse.json(
      { error: 'SHOPIFY_WEBHOOK_SECRET not configured' },
      { status: 503 }
    );
  }

  const rawBody = await req.text();
  const hmac = req.headers.get('x-shopify-hmac-sha256');
  if (!verifyShopifyWebhookHmac(rawBody, hmac, secret)) {
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
  }

  const webhookId =
    req.headers.get('x-shopify-webhook-id') ||
    req.headers.get('x-shopify-event-id') ||
    `no-id-${Date.now()}`;
  const topic = req.headers.get('x-shopify-topic') || 'unknown';
  const shopDomain = req.headers.get('x-shopify-shop-domain');

  const existing = findWebhookEvent(webhookId);
  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
  }

  let payload: unknown = null;
  try {
    payload = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    payload = { raw: rawBody.slice(0, 2000) };
  }

  const result = handleWebhookTopic(topic);
  persistWebhookEvent({
    id: webhookId,
    topic,
    shopDomain,
    receivedAt: new Date().toISOString(),
    payload,
    handled: result.handled,
    note: result.note,
  });

  return NextResponse.json(
    { ok: true, topic, handled: result.handled },
    { status: 200 }
  );
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/webhooks/shopify',
    docs: '/docs/SHOPIFY-WEBHOOKS.md',
    note: 'POST only; HMAC required',
  });
}
