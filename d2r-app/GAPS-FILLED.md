# Gaps filled (failsafe twin)

Snapshot of technical gap-fill vs still owner-blocked items.

## Filled in code

| Gap | Status |
|-----|--------|
| Shopify webhook route + HMAC + topic handlers | Done — `POST /api/webhooks/shopify` |
| Idempotent webhook persistence | Done — `data/webhook-events/` |
| Shopify read sync loop | Done — `POST /api/shopify/sync` → `data/sync/` |
| Admin Shopify page: last sync + counts + webhook count | Done |
| Write path to Shopify | Explicitly **disabled** (documented) |
| Clerk scaffold | Done — keys switch middleware/provider; else DEV_AUTH |
| File persistence helpers | Done — `src/lib/store.ts` (JSON; clear Postgres swap path) |
| P1 Orders CRUD-ish | Done — seed + create form |
| P2 commissions / settlements / payouts tables | Done — seed rows + status |
| Pulse signal list | Done |
| Users add-to-seed | Done — admin form → `users.json` |
| Webhook HMAC verify script | Done — `scripts/verify-webhook-hmac.mjs` |
| Docs: README, PARITY, `.env.example`, MERCH iframe notes | Done |

## Still owner-blocked

- GitHub private repo **Direct2Retailers/d2r-app** + Vercel project / domains
- Live Clerk production billing / org keys (scaffold only until keys exist)
- Real Shopify Partner app + webhook retarget from live CTO endpoints
- Fresh weekly admin exports (orders, users, commissions rules) into `data/seed/`
- Pixel-perfect UI parity with live app (awaiting design input)
- Shopify **write** / inventory adjust after ledger reconcile sign-off
- Postgres production persistence (file store is the interim)
