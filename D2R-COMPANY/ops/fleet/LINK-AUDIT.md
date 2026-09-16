# Twin link audit — `sandbox/qa/link-crawl-build`

Offline twin navigability for sidebar, cluster subnavs, and domain map routes.

**Status legend**
- `ok` — `page.tsx` already present
- `stub` — middleware `PendingLane` (live title via `PENDING_LANE_TITLES`)
- `missing→fixed` — restored/added on this branch
- `missing` — unresolved

| Link | Status | Notes |
|------|--------|-------|
| `/admin/accounts` | ok | table shell — accounts derived from assignment sample |
| `/admin/businesses` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/commissions` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/commissions/review` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/contacts` | ok | table shell — honest empty (no contacts seed) |
| `/admin/dashboard` | ok | seed table or prior sandbox page |
| `/admin/deposits` | ok | offline scaffold table + banner |
| `/admin/diagnostics/order-timeline` | ok | minimal events stub table |
| `/admin/emails` | ok | minimal outbound log stub |
| `/admin/files` | ok | minimal file browser stub |
| `/admin/inventory` | ok | seed table or prior sandbox page |
| `/admin/inventory/audit` | ok | seed table or prior sandbox page |
| `/admin/inventory/ledgers` | ok | seed table or prior sandbox page |
| `/admin/inventory/performance` | ok | seed table or prior sandbox page |
| `/admin/inventory/refresh` | ok | seed table or prior sandbox page |
| `/admin/inventory/transfers` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/inventory/transfers/terms` | ok | terms versions + placeholder body |
| `/admin/locations` | ok | table shell — doors derived from assignment sample |
| `/admin/locations/import` | ok | import stub (Upload/Validate/Commit disabled) |
| `/admin/merchandising` | ok | seed table or prior sandbox page |
| `/admin/merchandising/stores` | ok | store grid shell — empty (no store-level capture) |
| `/admin/orders` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/orders/drafts` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/payments` | ok | offline scaffold table + banner |
| `/admin/payouts` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/payouts/rules` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/payouts/rules/example` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/pulse` | ok | seed table or prior sandbox page |
| `/admin/pulse/goals` | ok | seed table or prior sandbox page |
| `/admin/pulse/health` | ok | seed table or prior sandbox page |
| `/admin/pulse/scores` | ok | seed table or prior sandbox page |
| `/admin/pulse/signals` | ok | seed table or prior sandbox page |
| `/admin/receipts` | ok | offline scaffold table + banner |
| `/admin/rep-assignments` | ok | seed table or prior sandbox page |
| `/admin/rep-assignments/relationships` | ok | stub table — honest empty (schema not captured) |
| `/admin/reports` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/reports/brand-sales` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/reports/commissions` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/reports/inventory-reports` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/reports/rep-sales` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/retail-stores` | ok | seed table or prior sandbox page |
| `/admin/sales-status` | ok | table shell — honest empty (no status seed) |
| `/admin/settlements` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/settlements/batch/preview` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/shopify` | ok | seed table or prior sandbox page |
| `/admin/shopify/apps` | stub | PENDING_ADMIN_PATHS → PendingLane |
| `/admin/shopify/test` | stub | PENDING_ADMIN_PATHS → PendingLane |
| `/admin/stores` | ok | seed table or prior sandbox page |
| `/admin/users` | ok | seed table or prior sandbox page |
| `/admin/warehouses` | missing→fixed | page added/restored on link-crawl branch |
| `/inventory` | ok | seed table or prior sandbox page |
| `/inventory/ledgers` | missing→fixed | page added/restored on link-crawl branch |
| `/inventory/performance` | missing→fixed | page added/restored on link-crawl branch |
| `/inventory/transfers` | missing→fixed | page added/restored on link-crawl branch |
| `/inventory/transfers/create` | missing→fixed | page added/restored on link-crawl branch |
| `/merchandising` | ok | seed table or prior sandbox page |
| `/orders` | ok | seed table or prior sandbox page |

## Leftover gaps

- None for nav + primary domain map routes. UUID literals covered by `[id]` pages; pending admin paths use PendingLane.

## Peripheral / optional

- `/signup`, `/test/dashboard`, non-admin `/stores` — mapped in rep-facing pack but outside admin audit chrome.
- Payments/deposits/receipts remain **stub** (PendingLane) until finance lanes seed tables. CRM accounts/contacts/locations/sales-status/relationships + merch stores are table shells (seed-derived or honest empty).

## Verification

- `npx tsc --noEmit` — pass
- `node scripts/qc-twin-smoke.mjs` — pass

