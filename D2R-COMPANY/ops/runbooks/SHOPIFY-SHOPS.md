# Shopify shops — inventory (fill during Week 0)

Document every Shopify store the live D2R app syncs. Source: admin `/admin/shopify` + Partner dashboard.

| Shop domain | Brand / merchant | Custom app name | Owner of Partner org | Sync uses (inventory / orders / both) | Notes |
|-------------|------------------|-----------------|----------------------|---------------------------------------|-------|
| | | | | | |

## Staging tokens

- Store **only** in vault `secrets/shopify-staging.env` (never commit).
- Twin env vars: `SHOPIFY_SHOP`, `SHOPIFY_ADMIN_TOKEN`, `SHOPIFY_API_VERSION`, `SHOPIFY_WEBHOOK_SECRET`.
- Webhook endpoint (twin): `POST /api/webhooks/shopify` — see `d2r-app/docs/SHOPIFY-WEBHOOKS.md`.
- Read sync: `POST /api/shopify/sync` (admin). Write path remains off until ledger reconcile.

## Cutover

1. Install company custom app on each shop (or transfer existing).
2. Switch twin from read-only to write after ledger reconcile.
3. Retarget webhooks from live CTO app → company twin (`https://<twin-host>/api/webhooks/shopify`).
4. Confirm HMAC with twin secret; check Admin → Shopify for event count + last sync.
