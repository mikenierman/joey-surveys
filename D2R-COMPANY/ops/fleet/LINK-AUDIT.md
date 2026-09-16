# Twin link audit — `sandbox/qa/link-crawl-build`

Offline twin navigability for sidebar, cluster subnavs, and domain map routes.

**Status legend**
- `ok` — `page.tsx` already present
- `stub` — middleware `PendingLane` (live title via `PENDING_LANE_TITLES`)
- `missing→fixed` — restored/added on this branch
- `missing` — unresolved

| Link | Status | Notes |
|------|--------|-------|
| `/admin/accounts` | stub | PENDING_ADMIN_PATHS → PendingLane |
| `/admin/businesses` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/commissions` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/commissions/review` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/contacts` | stub | PENDING_ADMIN_PATHS → PendingLane |
| `/admin/dashboard` | ok | seed table or prior sandbox page |
| `/admin/deposits` | stub | PENDING_ADMIN_PATHS → PendingLane |
| `/admin/diagnostics/order-timeline` | stub | PENDING_ADMIN_PATHS → PendingLane |
| `/admin/emails` | stub | PENDING_ADMIN_PATHS → PendingLane |
| `/admin/files` | stub | PENDING_ADMIN_PATHS → PendingLane |
| `/admin/inventory` | ok | seed table or prior sandbox page |
| `/admin/inventory/audit` | ok | seed table or prior sandbox page |
| `/admin/inventory/ledgers` | ok | seed table or prior sandbox page |
| `/admin/inventory/performance` | ok | seed table or prior sandbox page |
| `/admin/inventory/refresh` | ok | seed table or prior sandbox page |
| `/admin/inventory/transfers` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/inventory/transfers/terms` | stub | PENDING_ADMIN_PATHS → PendingLane |
| `/admin/locations` | stub | PENDING_ADMIN_PATHS → PendingLane |
| `/admin/locations/import` | stub | PENDING_ADMIN_PATHS → PendingLane |
| `/admin/merchandising` | ok | seed table or prior sandbox page |
| `/admin/merchandising/stores` | stub | PENDING_ADMIN_PATHS → PendingLane |
| `/admin/orders` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/orders/drafts` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/payments` | stub | PENDING_ADMIN_PATHS → PendingLane |
| `/admin/payouts` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/payouts/rules` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/payouts/rules/example` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/pulse` | ok | seed table or prior sandbox page |
| `/admin/pulse/goals` | ok | seed table or prior sandbox page |
| `/admin/pulse/health` | ok | seed table or prior sandbox page |
| `/admin/pulse/scores` | ok | seed table or prior sandbox page |
| `/admin/pulse/signals` | ok | seed table or prior sandbox page |
| `/admin/receipts` | stub | PENDING_ADMIN_PATHS → PendingLane |
| `/admin/rep-assignments` | ok | seed table or prior sandbox page |
| `/admin/rep-assignments/relationships` | stub | PENDING_ADMIN_PATHS → PendingLane |
| `/admin/reports` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/reports/brand-sales` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/reports/commissions` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/reports/inventory-reports` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/reports/rep-sales` | missing→fixed | page added/restored on link-crawl branch |
| `/admin/retail-stores` | ok | seed table or prior sandbox page |
| `/admin/sales-status` | stub | PENDING_ADMIN_PATHS → PendingLane |
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
- Payments/deposits/receipts/accounts/contacts/locations remain **stub** (PendingLane) until CRM/finance lanes seed tables.

## Verification

- `npx tsc --noEmit` — pass
- `node scripts/qc-twin-smoke.mjs` — pass

