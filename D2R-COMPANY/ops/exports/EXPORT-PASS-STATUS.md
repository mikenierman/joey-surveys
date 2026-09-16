# Export pass status — failsafe twin

**Updated:** 2026-09-16  
**Source vault:** `D2R-SECURE-BACKUP/2026-09-13/app-data/`  
**Seeded into twin:** `d2r-app/data/seed/`  
**Today’s folder:** `D2R-COMPANY/ops/exports/2026-09-16/`  
**Live scrape dir:** `D2R-COMPANY/ops/exports/2026-09-16/live/`  
**Live scrape today:** IN PROGRESS (parent agent)

**Credentials:** vault only — `D2R-SECURE-BACKUP/2026-09-13/secrets/d2r-app-clerk.env` (600, gitignored).  
**Fallback scrape:** `D2R-SECURE-BACKUP/2026-09-13/scripts/live-admin-scrape.mjs`  
**Live ingest:** `node d2r-app/scripts/ingest-live-exports.mjs`

## Live capture → seed pipeline

1. Parent (or Terminal scrape) writes pretty JSON into `ops/exports/2026-09-16/live/`
2. Run ingest:
   ```bash
   node d2r-app/scripts/ingest-live-exports.mjs
   # or: node d2r-app/scripts/ingest-live-exports.mjs /path/to/live
   ```
3. Script maps filename patterns → `d2r-app/data/seed/*.json`, pretty-prints, prints row counts
4. Restart twin / redeploy staging

### Filename → seed map

| Live filename pattern | Seed file |
|-----------------------|-----------|
| `*warehouse*` | `warehouses.json` |
| `*inventory*` | `inventory-sample.json` |
| `*ledger*performance*` / `*ledger*perf*` | `ledger-performance.json` |
| `*ledger*by*rep*brand*product*` | `ledger-by-rep-brand-product.json` |
| `*ledger*by*rep*brand*` | `ledger-by-rep-brand.json` |
| `*brand*level*` | `brand-levels.json` |
| `*merchandising*Q2*` | `merchandising-joey_circle_k-2026-Q2.json` |
| `*merchandising*Q3*` (or bare merch) | `merchandising-joey_circle_k-2026-Q3.json` |
| `*user*` | `users.json` |
| `*shopify*` | `shopify-shops.json` |
| `*transfer*` | `transfers.json` |
| `*order*` | `orders.json` |
| `*commission*` | `commissions.json` |
| `*settlement*` | `settlements.json` |
| `*payout*` | `payouts.json` |
| `*business*` | `businesses.json` |
| `*retail*store*` | `retail-stores.json` |
| `*rep*assign*` | `rep-assignments.json` |
| `*pulse*` | `pulse-signals.json` |
| `*dashboard*` / `*kpi*` | `dashboard-kpis.json` |

Unmatched JSON stays in `live/` and is listed in the ingest summary.

## Captured and loaded into twin

| Dataset | Vault / export file | Twin seed | Rows / notes |
|---------|---------------------|-----------|--------------|
| Warehouses | `inventory/warehouses-all-2026-09-13.json` (+ `2026-09-16/...from-vault`) | `warehouses.json` | 60 warehouses |
| Inventory sample | `inventory/inventory-admin-ALP-AdamScott-2026-09-13.json` | `inventory-sample.json` | 27 SKUs (ALP / Adam Scott only) |
| Brand levels | `inventory/brand-levels-summary-2026-09-13.json` | `brand-levels.json` | 17 brands summary |
| Ledger performance | `ledger/ledger-performance-all-brands-2026-09-13.json` | `ledger-performance.json` | 50 reps |
| Ledger by rep/brand | `ledger/ledger-by-rep-brand-2026-09-13.json` | `ledger-by-rep-brand.json` | Detail |
| Merch Q2 | `merchandising/merchandising-joey_circle_k-2026-Q2.json` | same | 41 reps |
| Merch Q3 | `merchandising/merchandising-joey_circle_k-2026-Q3.json` | same | 41 reps |
| Users | — | `users.json` | Scaffold only (4 demo roles) — replace on live ingest |
| Shopify | — | `shopify-shops.json` | Empty scaffold |
| Transfers | — | `transfers.json` | Empty scaffold |
| Orders / commissions / settlements / payouts | — | scaffold seeds | Placeholders |
| Businesses / retail stores / rep assignments | — | created on first live ingest | — |

### Live ingest results (fill after scrape)

| Live file | Seed dest | Rows | Status |
|-----------|-----------|------|--------|
| _(none yet)_ | — | — | waiting on parent scrape |

## Still needed from live admin (owner)

| Export | Admin path | Priority | 2026-09-16 |
|--------|------------|----------|------------|
| Users / roles | `/admin/users` | P0 | Missing |
| Businesses / brands | `/admin/businesses` | P0 | Missing |
| Shopify shops + apps | `/admin/shopify`, `/admin/shopify/apps` | P0 | Missing |
| Full inventory by warehouse | `/admin/inventory` (each filter) | P0 | Missing (only ALP sample) |
| Transfers history | `/admin/inventory/transfers` | P0 | Missing |
| Ledgers refresh | `/admin/inventory/ledgers` | P0 | Stale vault only |
| Warehouses refresh | `/admin/warehouses` | P0 | Stale vault only |
| Retail stores | `/admin/retail-stores` | P1 | Missing |
| Rep assignments | `/admin/rep-assignments` | P1 | Missing |
| Orders sample | `/admin/orders` | P1 | Missing |
| Merchandising refresh | `/admin/merchandising` | P1 | Stale vault Q2/Q3 |
| Commissions / settlements / payouts | `/admin/commissions`, `/admin/settlements`, `/admin/payouts` | P2 | Missing |
| Dashboard KPI | `/admin/dashboard` | P2 | Missing |

## Weekly refresh SOP

1. Log into live `app.direct2retailers.com` as admin (Clerk)  
2. Prefer UI Export; or run vault `live-admin-scrape.mjs` in Terminal.app  
3. Drop JSON files in `D2R-COMPANY/ops/exports/$(date +%F)/live/`  
4. Run `node d2r-app/scripts/ingest-live-exports.mjs`  
   (legacy: `node d2r-app/scripts/import-exports.mjs D2R-COMPANY/ops/exports/$(date +%F)`)  
5. Restart twin / redeploy staging  

## Sign-off

- [x] Baseline vault datasets copied into twin seed (2026-09-16)
- [x] Dated `ops/exports/2026-09-16/` folder + CAPTURE-REPORT written
- [x] Clerk email + password stored in vault secrets (600) — not in git
- [x] Offline Playwright scrape script staged in vault
- [x] Live ingest script ready (`d2r-app/scripts/ingest-live-exports.mjs`)
- [ ] Live authenticated scrape of P0 modules into `live/`
- [ ] `ingest-live-exports.mjs` run with non-zero row counts
- [ ] Owner completed users + Shopify + full inventory export pass
- [ ] Weekly export calendar assigned

See also: [CAPTURE-REPORT-2026-09-16.md](./CAPTURE-REPORT-2026-09-16.md)

## Live scrape update (2026-09-16T19:46Z)
Authenticated parent-browser scrape completed for warehouses, users, ledger, merch Q3, inventory sample, brand levels, transfers p1, businesses, orders p1, stores/shopify (29), shopify health (9/29), assignments sample, pulse signals. See CAPTURE-REPORT-2026-09-16.md and `2026-09-16/live/`.
