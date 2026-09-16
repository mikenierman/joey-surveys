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
import { appendOpsEvent, recordInstallLog } from '@/lib/ops-logs';

export const runtime = 'nodejs';

/**
 * POST /api/webhooks/shopify
 * Verifies HMAC, idempotent by X-Shopify-Webhook-Id, persists raw event + ops log,
 * returns 200 quickly. Never logs secrets.
 */
export async function POST(req: Request) {
  const secret = getWebhookSecret();
  if (!secret) {
    appendOpsEvent({
      kind: 'webhook_reject',
      status: 'error',
      message: 'SHOPIFY_WEBHOOK_SECRET not configured',
    });
    return NextResponse.json(
      { error: 'SHOPIFY_WEBHOOK_SECRET not configured' },
      { status: 503 }
    );
  }

  const rawBody = await req.text();
  const hmac = req.headers.get('x-shopify-hmac-sha256');
  const shopDomain = req.headers.get('x-shopify-shop-domain');
  const topic = req.headers.get('x-shopify-topic') || 'unknown';

  if (!verifyShopifyWebhookHmac(rawBody, hmac, secret)) {
    appendOpsEvent({
      kind: 'webhook_reject',
      status: 'rejected',
      shopDomain,
      topic,
      message: 'Invalid HMAC',
      meta: { hmacPresent: Boolean(hmac), bodyBytes: rawBody.length },
    });
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
  }

  const webhookId =
    req.headers.get('x-shopify-webhook-id') ||
    req.headers.get('x-shopify-event-id') ||
    `no-id-${Date.now()}`;

  const existing = findWebhookEvent(webhookId);
  if (existing) {
    appendOpsEvent({
      kind: 'webhook',
      status: 'duplicate',
      shopDomain,
      topic,
      message: `Duplicate webhook id ${webhookId}`,
      meta: { webhookId },
    });
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

  appendOpsEvent({
    kind: 'webhook',
    status: result.handled ? 'ok' : 'skipped',
    shopDomain,
    topic,
    message: result.note,
    meta: { webhookId, handled: result.handled },
  });

  // Install / uninstall → install audit trail
  if (topic === 'app/uninstalled' && shopDomain) {
    recordInstallLog({
      shopDomain,
      event: 'uninstall',
      status: 'ok',
      scopesSummary: '0 / 32',
      note: 'Webhook app/uninstalled',
    });
  }
  if (
    (topic === 'app/scopes_update' || topic === 'app_subscriptions/update') &&
    shopDomain
  ) {
    recordInstallLog({
      shopDomain,
      event: 'scope_health',
      status: 'ok',
      scopesSummary: 'updated',
      note: `Webhook ${topic}`,
    });
  }

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
    runtimeLogs: 'data/runtime/ops-events.jsonl',
    webhookStore: 'data/webhook-events/',
  });
}
