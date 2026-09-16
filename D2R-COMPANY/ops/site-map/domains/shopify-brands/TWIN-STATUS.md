# Shopify / Brands — twin builder status

**Domain:** Shopify install health + brand store registry  
**Updated:** 2026-09-16  
**Twin app:** `d2r-app/`  
**Branch:** `sandbox/shopify/stores-and-health`  
**Live reference:** `https://app.direct2retailers.com`

## Summary

| Live route | Twin route | Seed file | Rows | Status |
|------------|------------|-----------|------|--------|
| `/admin/stores` | `/admin/stores` | `data/seed/stores.json` | 29 | **wired** — audit table |
| `/admin/shopify` | `/admin/shopify` | `data/seed/shopify-health.json` | 29 | **wired** — scope health table + status filter |
| — | `/admin/shopify` (registry) | `data/seed/shopify-shops.json` | 29 | **wired** — shop registry (no tokens) |
| — | `/admin/shopify` (sync) | env + webhooks | — | **wired** — optional read sync when env set |
| `/admin/stores/:id` | — | — | — | **not built** (detail stub) |
| `/admin/shopify/apps` | — | — | — | mapped-ui-only |
| `/admin/shopify/test` | — | — | — | mapped-ui-only |

**Health snapshot (2026-09-16 live scrape):** 9 of 29 healthy · 20 need attention.

## Seed files

| File | Source export | Captured | Notes |
|------|---------------|----------|-------|
| `stores.json` | `live/stores-live.json` | 2026-09-16T19:44:53Z | Name, Shop Domain, Created, id, href |
| `shopify-shops.json` | `live/shopify-shops-live.json` | 2026-09-16T19:44:53Z | Normalized shop list; no API tokens |
| `shopify-health.json` | `live/shopify-health-live.json` | 2026-09-16T19:45:36Z | Store, Domain, Scopes, Status, Install |

All three seeds are read-only vault captures. No secrets committed.

## Twin implementation

### Data / lib

- `getStores()` → `stores.json` (`src/lib/data.ts`, data-loaders lane)
- `getShopifyShops()` / `getShopifyHealth()` → seeds (`src/lib/shopify.ts`, this lane)
- `getShopifyStatus()` — env mode, last sync, webhooks (`data.ts`)

### Pages

**`/admin/stores`** — brand Shopify registry

- Columns: Name, Shop domain, Created, Store ID
- Stat cards: store count, healthy shops cross-ref, source, live URL
- Links to Shopify Apps for scope health

**`/admin/shopify`** — install / scope health + sync ops

- Title/subtitle match live: “Shopify Apps” · `9 of 29 healthy · 20 need attention`
- Primary table from `shopify-health.json` (Store, Domain, Scopes, Status, Install)
- Client status filter (All / Healthy / Missing scopes / Not installed / Unreachable)
- Shop registry table from `shopify-shops.json`
- Sync button + recent webhook events (runtime; write path disabled)

## Audit checklist

1. **Stores** — 29 rows; ALP → `karpatt.myshopify.com`, Joey → `sasur5-ib.myshopify.com`
2. **Shopify** — 9 Healthy (32/32); Unreachable / Not installed at top of seed order
3. **Cross-ref** — every health Domain appears in `stores.json` Shop Domain
4. **No secrets** — unset env → mode `unconfigured`; tables still render from seed

## Gaps / next

- [ ] Store detail page (`/admin/stores/:id`)
- [ ] Per-shop Install / Reconnect row actions (live has them; twin Install column empty)
- [ ] `/admin/shopify/apps` and `/admin/shopify/test` stubs
- [ ] Product improvements → `ops/IMPROVEMENTS-BACKLOG.md` (scope gate, alerts, missing-scope names)
