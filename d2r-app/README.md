# D2R Failsafe Twin (`d2r-app`)

Company-owned rebuild of `app.direct2retailers.com` (Next.js). Clean-room — no CTO source.

## Quick start

```bash
cd d2r-app
npm install
cp .env.example .env.local
npm run dev -- --port 3001
```

Open http://localhost:3001 → sign in with `mike@direct2retailers.com` (DEV_AUTH).

Field merch embed expects JOEY surveys on http://localhost:3000:

```bash
cd ..   # joey-surveys / d2r-merch root
npm start
```

### Merch iframe (`NEXT_PUBLIC_MERCH_APP_URL`)

- Default: `http://localhost:3000`
- Twin route `/merchandising` iframes that URL.
- Blank iframe usually means the merch host sends `X-Frame-Options: DENY` or a CSP `frame-ancestors` that excludes the twin origin — allow the twin host (or `*` in local only).
- Simple iframe navigation does not need CORS; fetch APIs across origins would.

## Env

Copy `.env.example` → `.env.local`.

| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_MERCH_APP_URL` | Merch iframe URL (default `http://localhost:3000`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Switch off DEV_AUTH when both set |
| `SHOPIFY_SHOP` / `SHOPIFY_ADMIN_TOKEN` | Read sync |
| `SHOPIFY_WEBHOOK_SECRET` | HMAC for `POST /api/webhooks/shopify` |
| `SHOPIFY_API_VERSION` | Optional Admin API version |

## Shopify

- Webhooks: see [docs/SHOPIFY-WEBHOOKS.md](docs/SHOPIFY-WEBHOOKS.md)
- Read sync: admin **Shopify** page → “Run read sync” or `POST /api/shopify/sync`
- Write path: **disabled** until ledger reconcile
- Verify HMAC helper: `node scripts/verify-webhook-hmac.mjs`

## Data

Vault exports live in `data/seed/`. Runtime writes:

- `data/seed/` — transfers, orders, users (demo)
- `data/webhook-events/` — webhook payloads (gitignored)
- `data/sync/` — Shopify read snapshots (gitignored)

Refresh exports:

```bash
node scripts/import-exports.mjs ../D2R-COMPANY/ops/exports
```

Persistence is JSON-file based (`src/lib/store.ts`) with a clear swap path to Postgres later.

## Auth

- **No Clerk keys** → DEV_AUTH cookie login at `/login`
- **Keys present** → `@clerk/nextjs` middleware + `ClerkProvider`; public routes include login, auth APIs, webhooks

## Deploy (company Vercel)

1. Push this folder to **Direct2Retailers/d2r-app** private repo  
2. Import project on company Vercel team  
3. Set env vars; assign staging domain  
4. Register Shopify webhooks to `https://<host>/api/webhooks/shopify`

## Module map

- P0: dashboard, inventory, ledgers, transfers, warehouses, merchandising, shopify (sync + webhooks), users
- P1: orders (seed + create), reports/*
- P2: commissions, settlements, payouts, pulse (signals)

See [GAPS-FILLED.md](GAPS-FILLED.md) and [PARITY-CHECKLIST.md](PARITY-CHECKLIST.md).
