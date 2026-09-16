# D2R live site map — failsafe twin inventory

**Live app:** https://app.direct2retailers.com  
**Mapped:** 2026-09-16 (static + live JSON; browser interaction scrape blocked this pass)  
**Traffic Controller:** [`site-map/TRAFFIC-CONTROLLER.md`](./site-map/TRAFFIC-CONTROLLER.md) (domain agents write under `site-map/domains/`)  
**Machine map:** [`SITE-MAP-INTERACTIONS.json`](./SITE-MAP-INTERACTIONS.json) · schema [`site-map/schemas/ROUTE-INTERACTION.schema.md`](./site-map/schemas/ROUTE-INTERACTION.schema.md)  
**Plan / backlog:** [`OFFLINE-TWIN-PLAN.md`](./OFFLINE-TWIN-PLAN.md) · [`IMPROVEMENTS-BACKLOG.md`](./IMPROVEMENTS-BACKLOG.md)  
**Route discovery source:** `exports/2026-09-16/from-vault-baseline-2026-09-13/routes/URLS.txt` (67 URLs)  
**Live data:** `exports/2026-09-16/live/` (14 JSON files)

Coverage legend:

| Status | Meaning |
|--------|---------|
| `captured` | Live rows/headers scraped into exports (+ usually seeded) |
| `mapped-ui-only` | Route known; controls inferred; no live row dump |
| `stub-in-twin` | Twin page exists; data may be demo/partial |
| `missing` | Needed for parity but not yet in twin or captures |

Interaction fidelity this pass: **inferred** (from live table headers, URLs, twin code). Authenticated CDP pass still required for full button/combobox inventory.

---

## Nav tree (admin)

Inferred from live modules + twin `ADMIN_NAV` (twin nav is a subset; live exposes more CRM/finance links).

```
Admin
├── Dashboard                         /admin/dashboard
├── Inventory
│   ├── Levels                        /admin/inventory
│   ├── Audit                         /admin/inventory/audit
│   ├── Ledgers                       /admin/inventory/ledgers
│   ├── Performance                   /admin/inventory/performance
│   ├── Refresh / brand levels        /admin/inventory/refresh
│   └── Transfers                     /admin/inventory/transfers
│       └── Terms                     /admin/inventory/transfers/terms
├── Warehouses                        /admin/warehouses
├── Merchandising                     /admin/merchandising
│   └── Stores                        /admin/merchandising/stores
├── Shopify                           /admin/shopify
│   ├── Apps                          /admin/shopify/apps
│   └── Test                          /admin/shopify/test
├── Brand stores                      /admin/stores
├── Orders                            /admin/orders
│   └── Drafts                        /admin/orders/drafts
├── Reports                           /admin/reports
│   ├── Brand sales                   /admin/reports/brand-sales
│   ├── Rep sales                     /admin/reports/rep-sales
│   ├── Inventory reports             /admin/reports/inventory-reports
│   └── Commissions                   /admin/reports/commissions
├── Commissions                       /admin/commissions
│   └── Review                        /admin/commissions/review
├── Settlements                       /admin/settlements
│   └── Batch preview                 /admin/settlements/batch/preview
├── Payouts                           /admin/payouts
│   ├── Rules                         /admin/payouts/rules
│   └── Rules example                 /admin/payouts/rules/example
├── Payments / deposits / receipts    /admin/payments · /admin/deposits · /admin/receipts
├── Pulse                             /admin/pulse
│   ├── Goals                         /admin/pulse/goals
│   ├── Health                        /admin/pulse/health
│   ├── Scores                        /admin/pulse/scores
│   └── Signals                       /admin/pulse/signals
├── CRM
│   ├── Accounts                      /admin/accounts
│   ├── Businesses                    /admin/businesses
│   ├── Contacts                      /admin/contacts
│   ├── Locations                     /admin/locations (+ /import)
│   ├── Retail stores                 /admin/retail-stores
│   ├── Rep assignments               /admin/rep-assignments (+ /relationships)
│   └── Sales status                  /admin/sales-status
├── Users                             /admin/users
├── Emails / files                    /admin/emails · /admin/files
└── Diagnostics                       /admin/diagnostics/order-timeline
```

## Nav tree (rep-facing)

```
Rep
├── Inventory                         /inventory
│   ├── Ledgers                       /inventory/ledgers
│   ├── Performance                   /inventory/performance
│   └── Transfers                     /inventory/transfers
│       ├── Create                    /inventory/transfers/create
│       └── Preview                   /inventory/transfers/preview
├── Merchandising                     /merchandising
├── Orders                            /orders · /orders/drafts
├── Stores / retail                   /stores · /retail-stores
└── Location sales status             /locations/sales-status
```

Auth: `/` · `/login` · `/signup`  
Misc: `/test/dashboard`

---

## Route inventory

### Auth / entry

| Path | Purpose | Key UI | Data deps | Coverage |
|------|---------|--------|-----------|----------|
| `/` | Entry / redirect | — | — | mapped-ui-only |
| `/login` | Clerk sign-in | email/password, Continue | Clerk | stub-in-twin (DEV_AUTH) |
| `/signup` | Signup (invite-gated?) | Sign up form | Clerk | mapped-ui-only |

### Inventory / warehouses

| Path | Purpose | Tables / filters | Buttons / dropdowns | Links out | Data deps | Coverage |
|------|---------|------------------|---------------------|-----------|-----------|----------|
| `/admin/inventory` | Consignment levels | Product, Variant, SKU, On hand, Available, Committed, Incoming, Reserved, Damaged | Brand/store + warehouse comboboxes; Export; Refresh | ledgers, transfers, refresh, audit, performance | `inventory-ALP-AdamScott-live.json` (sample) | captured |
| `/admin/inventory/audit` | Level audit trail | When, SKU, Warehouse, Delta, Actor (inferred) | Filter, Export | inventory | — | mapped-ui-only |
| `/admin/inventory/ledgers` | Rep value held / sell-through | Rep, Value, Units, Sell-through, Sold 7d, Last sale | Brand, period | performance, inventory | `ledger-performance-live.json` | captured |
| `/admin/inventory/performance` | Performance sibling | similar to ledgers | Brand, rep | ledgers | ledger (shared) | mapped-ui-only |
| `/admin/inventory/refresh` | Brand level refresh status | Brand, Levels, Last refresh | Refresh all / per brand | shopify, inventory | `brand-levels-live.json` | captured |
| `/admin/inventory/transfers` | Transfer queue | Transfer ID, Store, Warehouse, Status, Items, Approved, Created, Actions | Status/store filters; Create; Approve | terms | `transfers-page1-live.json` (~21 pages) | captured |
| `/admin/inventory/transfers/terms` | Transfer terms | — | Save | transfers | — | mapped-ui-only |
| `/admin/warehouses` | Warehouse directory | Warehouse, Address, City, State, ZIP, Phone, Status, Rep | Status/state; Add | inventory, users | `warehouses-live.json` (60) | captured |

### Merchandising

| Path | Purpose | Tables / filters | Buttons / dropdowns | Links out | Data deps | Coverage |
|------|---------|------------------|---------------------|-----------|-----------|----------|
| `/admin/merchandising` | Program rollup | Rep, Assigned, Completed, Within window, Complete %, Unpaid | Program + period (Q3…Q5 options seen) | merch stores, field `/merchandising` | Q3 Joey/Circle K live | captured |
| `/admin/merchandising/stores` | Store-level merch | Store, Rep, Status (inferred) | Program, period, rep | merchandising | — | mapped-ui-only |

### Shopify / brand stores

| Path | Purpose | Tables / filters | Buttons / dropdowns | Links out | Data deps | Coverage |
|------|---------|------------------|---------------------|-----------|-----------|----------|
| `/admin/shopify` | Install/scopes health | Store, Domain, Scopes, Status, Install | Status filter; Install; Sync | apps, test, stores | `shopify-health-live.json` (9/29 healthy) | captured |
| `/admin/shopify/apps` | App management | — | Install / rotate | shopify | — | mapped-ui-only |
| `/admin/shopify/test` | Connectivity test | — | Run test; shop select | shopify | — | mapped-ui-only |
| `/admin/stores` | Brand Shopify registry | Name, Shop Domain, Created | Open detail | `/admin/stores/:id`, shopify | `stores-live.json` (29) | captured |

### Orders / reports

| Path | Purpose | Tables / filters | Buttons / dropdowns | Links out | Data deps | Coverage |
|------|---------|------------------|---------------------|-----------|-----------|----------|
| `/admin/orders` | PO list | PO Number, Store, Account, Customer, Location, Fulfillment, ETA, Total, Sales Rep, Created | Fulfillment, store, rep, date; Create; Export | drafts; `/orders/:uuid` | `orders-page1-live.json` (~1034 pages) | captured |
| `/admin/orders/drafts` | Draft POs | Draft, Store, Rep (inferred) | Submit, delete | orders | — | mapped-ui-only |
| `/admin/reports` | Report hub | — | — | brand/rep/inventory/commissions | — | stub-in-twin |
| `/admin/reports/*` | Report runners | metric tables (inferred) | Period, brand/rep; Export | reports hub | — | stub-in-twin |

### Finance

| Path | Purpose | Coverage |
|------|---------|----------|
| `/admin/commissions` · `/review` | Commission runs / approval | stub-in-twin / mapped-ui-only |
| `/admin/settlements` · `/batch/preview` | Settlement batches | stub-in-twin / mapped-ui-only |
| `/admin/payouts` · `/rules` · `/rules/example` | Payout runs + rules | stub-in-twin / mapped-ui-only |
| `/admin/payments` · `/deposits` · `/receipts` | Cash ops | mapped-ui-only |

### Pulse

| Path | Purpose | Coverage |
|------|---------|----------|
| `/admin/pulse` | Hub | stub-in-twin |
| `/admin/pulse/signals` | KPI signals (reorder, doors, fees, revenue) — Adam Scott sample | captured |
| `/admin/pulse/goals` · `/health` · `/scores` | Goals / health / scores | mapped-ui-only |

### CRM / users

| Path | Purpose | Tables / filters | Data deps | Coverage |
|------|---------|------------------|-----------|----------|
| `/admin/businesses` | Legal entities | Sales Rep, Business Name, Address, Created, Actions | `businesses-live.json` (51) | captured |
| `/admin/accounts` | Accounts | inferred | — | mapped-ui-only |
| `/admin/contacts` | Contacts | inferred | — | mapped-ui-only |
| `/admin/locations` · `/import` | Location master + CSV import | inferred | — | mapped-ui-only |
| `/admin/retail-stores` | Door list (≠ Shopify stores) | inferred | overlaps assignments | mapped-ui-only |
| `/admin/rep-assignments` | Primary/covering/delegate | Rep, Store, City, State, Account, Role, From, To | page-1 of ~227; **11,314** primary | captured |
| `/admin/rep-assignments/relationships` | Covering/delegate graph | inferred | — | mapped-ui-only |
| `/admin/sales-status` | Location sales status | inferred | — | mapped-ui-only |
| `/admin/users` | Users/roles | Name, Email, Last Seen, Role, Created | `users-live.json` (189) | captured |

### Other admin

| Path | Purpose | Coverage |
|------|---------|----------|
| `/admin` | → dashboard | mapped-ui-only |
| `/admin/emails` · `/admin/files` | Email log / files | mapped-ui-only |
| `/admin/diagnostics/order-timeline` | Order event debug | mapped-ui-only |

### Rep-facing

| Path | Purpose | Coverage |
|------|---------|----------|
| `/inventory` · `/ledgers` · `/performance` · `/transfers` (+ create/preview) | Rep inventory ops | stub-in-twin (partial) |
| `/merchandising` | Field visits (often iframe) | stub-in-twin |
| `/orders` · `/drafts` | Rep orders | mapped-ui-only / thin twin |
| `/stores` · `/retail-stores` · `/locations/sales-status` | Rep CRM views | mapped-ui-only |
| `/test/dashboard` | Internal test | mapped-ui-only |

---

## Coverage snapshot (67 discovered routes)

| Bucket | Approx count | Notes |
|--------|--------------|-------|
| `captured` | 13 | Live JSON exists for route |
| `stub-in-twin` | ~15+ | Twin `page.tsx` before this pass; growing |
| `mapped-ui-only` | ~39 | Known route, inferred controls |
| `missing` | track in twin plan | CRM/finance subpages + full pagination dumps |

**Data depth gaps (even when `captured`):** orders (~1034 pages), transfers (~21), assignments (~227 / 11k+ rows), inventory (one brand×warehouse), pulse (one rep).

---

## Twin alignment notes

- Twin `d2r-app/src/lib/nav.ts` historically omitted CRM (`businesses`, `stores`, `rep-assignments`, `accounts`, …) even when live exposes them — expand nav as pages land.
- Several twin loaders expected wrong seed shapes (`inventory` `rows` vs `items`; users `Name` vs `name`; pulse signals dict vs list; transfers live headers vs demo shape). Fix when wiring pages.
- Signed-out HTML under `routes/*-signedout.html` is Clerk shell only — **not** useful for control inventory.

## Next scrape priorities (when browser auth works)

1. CDP extract per admin route: `a[href]`, `button`, `[role=combobox]`, `select`, table headers.  
2. Paginated dump: orders, transfers, assignments.  
3. Inventory filter matrix (all brands × warehouses) or API equivalent.  
4. Accounts / contacts / locations / retail-stores empty-state vs populated headers.  
5. Unlock browser when session done.
