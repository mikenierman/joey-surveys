# Shopify webhooks + automation logs (failsafe twin)

Endpoint: `POST /api/webhooks/shopify`

## Env

Copy `d2r-app/.env.example` → `.env.local`. **Never commit secrets.**

| Variable | Purpose |
|----------|---------|
| `SHOPIFY_WEBHOOK_SECRET` | Shared secret for HMAC-SHA256 verification (**required** for POST) |
| `SHOPIFY_SHOP` | Shop domain for Admin API read sync |
| `SHOPIFY_ADMIN_TOKEN` | Admin API access token (read scopes) |
| `SHOPIFY_API_VERSION` | Optional, default `2024-10` |
| `CRON_SECRET` | Optional Bearer token for automation POST routes (nightly stubs) |

## HMAC verification

- Header: `X-Shopify-Hmac-Sha256` (base64 HMAC-SHA256 of **raw** body)
- Timing-safe compare in `src/lib/shopify.ts` → `verifyShopifyWebhookHmac`
- Bad HMAC → **401** (+ reject line in ops log)
- Missing `SHOPIFY_WEBHOOK_SECRET` → **503**
- Duplicate `X-Shopify-Webhook-Id` → **200** `{ duplicate: true }`
- Success → **200** quickly after persist

Verify locally:

```bash
node scripts/verify-webhook-hmac.mjs
# or: npm run verify:webhook
```

## Persistence paths (gitignored runtime)

| Path | Contents |
|------|----------|
| `data/webhook-events/` | Per-event JSON + `_index.json` (idempotent by webhook id) |
| `data/runtime/ops-events.jsonl` | Append-only structured ops stream (webhook, install, automation) |
| `data/runtime/install-logs.json` | Rolling install / auth / scope-health records |
| `data/runtime/automation-runs.json` | Rolling automation stub runs |
| `data/sync/` | Optional Admin API read snapshots |

**Seed (committed):** `data/seed/shopify-install-logs.json` — sample install/auth/scope events for offline admin UI.

Never store access tokens or webhook secrets in these files.

## Handled topics

| Topic | Twin behavior |
|-------|----------------|
| `inventory_levels/update` | Persist event; note for next local reconcile |
| `products/update` / `products/create` | Persist; refresh via read sync |
| `orders/create` / `orders/updated` | Persist order signal |
| `app/uninstalled` | Persist + **install log** (uninstall) |
| `app/scopes_update` | Persist + **install log** (scope_health) |

Unknown topics are still stored (raw) and return 200.

## Registration (Shopify admin / Partner)

1. In the shop or custom app: **Settings → Notifications → Webhooks** (or app webhook subscriptions).
2. Create subscriptions for the topics above.
3. URL: `https://<your-twin-host>/api/webhooks/shopify`
4. Format: JSON
5. Copy the webhook signing secret into `SHOPIFY_WEBHOOK_SECRET`.

Cutover: retarget live CTO webhooks to this URL (see `D2R-COMPANY/ops/runbooks/CUTOVER-RUNBOOK.md`).

## Automation stubs (offline-capable)

| Trigger | What it does |
|---------|----------------|
| `POST /api/shopify/automations/brand-levels` | Nightly brand-levels refresh stub — logs run from seed counts |
| `POST /api/shopify/automations/inventory-sync` | Inventory sync trigger stub — logs without Shopify when env missing |
| `POST /api/shopify/automations/scope-health` | Walks seed health table; appends install/scope logs |
| `node scripts/run-brand-levels-refresh.mjs` | CLI equivalent of brand-levels stub |
| `node scripts/run-inventory-sync.mjs` | CLI equivalent of inventory-sync stub |

Auth: admin/manager session, **or** `Authorization: Bearer $CRON_SECRET`.

## View install + automation logs

1. Open **Admin → Shopify** (`/admin/shopify`).
2. Sections **Install / auth / scope logs** and **Automation runs** merge seed + `data/runtime/*`.
3. Or inspect files directly under `data/runtime/` (gitignored).

## Read sync (not webhooks)

`POST /api/shopify/sync` (admin session) fetches shop + products + inventory levels and writes `data/sync/`.

**Write path is disabled** — the twin does not call inventory adjust / product write APIs until ledger reconcile is approved.
