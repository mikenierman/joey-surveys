# Module parity checklist — failsafe twin

Aligned with [`D2R-COMPANY/ops/SITE-MAP.md`](../D2R-COMPANY/ops/SITE-MAP.md) and Traffic Controller board  
[`D2R-COMPANY/ops/site-map/TRAFFIC-CONTROLLER.md`](../D2R-COMPANY/ops/site-map/TRAFFIC-CONTROLLER.md).

**Offline twin status legend:** Done (usable offline) · Partial · Scaffold · Missing

| Priority | Module | Route | Offline twin | Site-map coverage |
|----------|--------|-------|--------------|-------------------|
| P0 | Auth (DEV/Clerk) | `/login` | Done | stub-in-twin |
| P0 | Dashboard | `/admin/dashboard` | Done | stub-in-twin / mapped |
| P0 | Inventory levels | `/admin/inventory` | Done (sample seed) | captured |
| P0 | Inventory audit | `/admin/inventory/audit` | Scaffold | mapped-ui-only |
| P0 | Ledgers | `/admin/inventory/ledgers` | Done | captured |
| P0 | Performance | `/admin/inventory/performance` | Partial | mapped-ui-only |
| P0 | Brand levels refresh | `/admin/inventory/refresh` | Done | captured |
| P0 | Transfers | `/admin/inventory/transfers` | Done (live headers) | captured |
| P0 | Transfer terms | `/admin/inventory/transfers/terms` | Scaffold (versions + placeholder body) | mapped-ui-only |
| P0 | Warehouses | `/admin/warehouses` | Done (60) | captured |
| P0 | Merchandising admin | `/admin/merchandising` | Done (Q3; period UI partial) | captured |
| P0 | Merch stores | `/admin/merchandising/stores` | Scaffold (empty grid; no store capture) | mapped-ui-only |
| P0 | Merch field embed | `/merchandising` | Done (iframe) | stub-in-twin |
| P0 | Shopify health + sync | `/admin/shopify` | Done (health table + sync) | captured |
| P0 | Shopify apps / test | `/admin/shopify/apps`, `/test` | Scaffold (no secrets; health-seed test) | mapped-ui-only |
| P0 | Brand stores | `/admin/stores` | Done (29) | captured |
| P0 | Users | `/admin/users` | Done (189 seed) | captured |
| P1 | Orders | `/admin/orders` | Done (page-1 live headers) | captured |
| P1 | Order drafts | `/admin/orders/drafts` | Scaffold | mapped-ui-only |
| P1 | Order timeline diag | `/admin/diagnostics/order-timeline` | Scaffold (sample events) | mapped-ui-only |
| P1 | Businesses | `/admin/businesses` | Done (51) | captured |
| P1 | Rep assignments | `/admin/rep-assignments` | Done (page-1 / 11k prod) | captured |
| P1 | Assignment relationships | `/admin/rep-assignments/relationships` | Scaffold (empty stub table) | mapped-ui-only |
| P1 | Retail stores | `/admin/retail-stores` | Partial (derived sample) | mapped-ui-only |
| P1 | Accounts / contacts / locations | `/admin/accounts` etc. | Scaffold (accounts/locations derived; contacts empty; import stub) | mapped-ui-only |
| P1 | Reports hub + children | `/admin/reports/*` | Scaffold | stub-in-twin |
| P2 | Commissions (+ review) | `/admin/commissions*` | Scaffold | stub / mapped |
| P2 | Settlements (+ batch preview) | `/admin/settlements*` | Scaffold | stub / mapped |
| P2 | Payouts (+ rules) | `/admin/payouts*` | Scaffold | stub / mapped |
| P2 | Payments / deposits / receipts | `/admin/payments` etc. | Scaffold (offline sample rows) | mapped-ui-only |
| P2 | Pulse hub + signals | `/admin/pulse`, `/signals` | Done (KPI capture) | captured / stub |
| P2 | Pulse goals / health / scores | `/admin/pulse/*` | Missing (nav stubs) | mapped-ui-only |
| P0 | Rep inventory / transfers | `/inventory*` | Partial | stub / mapped |
| P1 | Rep orders | `/orders*` | Partial | mapped-ui-only |

**Route coverage (67 discovered):** ~57% have twin `page.tsx` (38/67) · 13 with live capture files · remainder mapped-ui-only.

Owner-blocked: live Clerk keys, Vercel/GitHub cutover, Shopify write path, full paginated exports — see `GAPS-FILLED.md` and `IMPROVEMENTS-BACKLOG.md` (live-system only).
