# Capture report — 2026-09-16

**Live admin scrape:** SUCCESS  
**Login success:** YES (`mike@direct2retailers.com` via vault Clerk env)  
**Target:** https://app.direct2retailers.com  
**Runner:** `node D2R-SECURE-BACKUP/2026-09-13/scripts/live-admin-scrape.mjs` (out-of-sandbox Playwright Chromium, headless)  
**Output:** `D2R-COMPANY/ops/exports/2026-09-16/live/` (+ screenshots)

## Credentials handling (no password in this report)

- Email: `mike@direct2retailers.com`
- Password only in gitignored vault: `D2R-SECURE-BACKUP/2026-09-13/secrets/d2r-app-clerk.env` (mode `600`)
- Secrets were not printed and were not committed

## Live module results

| Module | File | Rows | Notes |
|--------|------|------|-------|
| Warehouses | `live/warehouses-all-2026-09-16.json` | 60 | Full table |
| Inventory | `live/inventory-admin-2026-09-16.json` | 27 | Default filter view (ALP / Adam Scott–scale sample, not all warehouses) |
| Ledgers | `live/inventory-ledgers-2026-09-16.json` | 7+ | Custom list UI; rows parsed from body text (page also shows Value held $892,447 / 97,149 units) |
| Transfers | `live/inventory-transfers-2026-09-16.json` | 20 | First page / visible table |
| Shopify shops | `live/shopify-shops-2026-09-16.json` | 29 | Full visible table |
| Shopify apps | `live/shopify-apps-2026-09-16.json` | 0 | Create/manage form — no list table |
| Users | `live/users-2026-09-16.json` | 189 | Full table |
| Businesses | `live/businesses-2026-09-16.json` | 51 | Full visible table |
| Retail stores | `live/retail-stores-2026-09-16.json` | 50 | Likely first page (pagination) |
| Rep assignments | `live/rep-assignments-2026-09-16.json` | 50 | Likely first page |
| Orders | `live/orders-2026-09-16.json` | 20 | First page |
| Merchandising | `live/merchandising-2026-09-16.json` | 41 | Rep scoreboard table |
| Commissions | `live/commissions-2026-09-16.json` | 0 | `/admin/commissions` → review UI stuck on “Loading orders…” |
| Settlements | `live/settlements-2026-09-16.json` | 26 | Table |
| Payouts | `live/payouts-2026-09-16.json` | 31 | Redirected to `/admin/payouts/rules/rep_commission` |
| Dashboard KPI | `live/dashboard-kpi-2026-09-16.json` | KPI text | MTD $93,300.10; week $19,901.11; orders 7d 179 / 24h 27 |

Summary sidecar: `live/_scrape-summary-2026-09-16.json`

## Import into twin

```bash
node d2r-app/scripts/import-exports.mjs D2R-COMPANY/ops/exports/2026-09-16
```

Import script updated to prefer dated `live/` captures and avoid `inventory-*` clobbering transfers/ledgers. Seeds refreshed for warehouses, inventory sample, users, shopify shops, transfers, orders, settlements, payouts, merchandising, ledger-performance (partial).

## Still missing / incomplete

| Gap | Why |
|-----|-----|
| Full inventory by warehouse | Admin default view only returned 27 SKU rows |
| Full ledger table (all reps) | Non-`<table>` UI; body-text parse is partial vs vault 50-rep export |
| Retail stores / assignments beyond page 1 | Captured 50 rows each — may be paginated |
| Orders / transfers beyond page 1 | Captured 20 rows each |
| Commissions rows | Review page loading state; no table |
| Shopify apps list | Form-only page |
| Pagination / Export buttons | Script does not click “next” or native CSV Export yet |

## Blockers cleared

- Prior Cursor browser MCP tab vanish / Smart Mode bubble failure — bypassed via Playwright outside sandbox
- Prior sandbox network block — `required_permissions: ["all"]` + approval allowed Chromium install + live login
