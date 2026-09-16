# Orders domain — live UI map

**Domain:** Brand-routed purchase orders (POs), drafts, and order detail  
**Live app:** https://app.direct2retailers.com  
**Mapped:** 2026-09-16  
**Machine map:** [`interactions.json`](./interactions.json)  
**Primary capture:** `D2R-COMPANY/ops/exports/2026-09-16/live/orders-page1-live.json`  
**Twin (partial):** `d2r-app/src/app/admin/orders/page.tsx` — scaffold only; wrong columns

Coverage legend: `captured` | `mapped-ui-only` | `stub-in-twin` | `missing`

Interaction fidelity: **live-capture** for `/admin/orders` table headers + row sample; **inferred** for filters, export, drafts, rep routes (no authenticated browser pass this cycle; signed-out HTML is Clerk shell only).

---

## Domain scope

| Route | Role | Purpose | Coverage |
|-------|------|---------|----------|
| `/admin/orders` | Admin | All POs across brands/reps; primary ops list | `captured` |
| `/admin/orders/drafts` | Admin | Unsubmitted / in-progress POs before brand routing | `mapped-ui-only` |
| `/orders` | Rep | Rep-scoped order list (same PO model, filtered to self) | `mapped-ui-only` |
| `/orders/drafts` | Rep | Rep draft POs before submit | `mapped-ui-only` |
| `/orders/:uuid` | Shared | Order detail (line items, fulfillment, timeline) | `mapped-ui-only` (links only) |

Related (out of domain but linked): `/admin/diagnostics/order-timeline`, `/admin/reports/*` (orders metrics), Shopify webhooks for fulfillment sync.

---

## Nav placement

**Admin**

```
Orders
├── Orders          /admin/orders
└── Drafts          /admin/orders/drafts
```

**Rep**

```
Orders
├── Orders          /orders
└── Drafts          /orders/drafts
```

Twin `ADMIN_NAV` includes `/admin/orders` only; drafts and rep routes are missing from twin nav.

---

## `/admin/orders` — PO list (captured)

### Purpose

Central registry of brand-routed purchase orders. Each row is a PO (`D2R-xxxxx`) tied to a brand **Store**, CRM **Account** / **Customer**, ship-to **Location**, **Fulfillment** state, and owning **Sales Rep**. Default sort appears newest-first (`Created` desc on page 1).

### Table columns (live)

| # | Header | Sample (page 1) | Notes |
|---|--------|-----------------|-------|
| 1 | PO Number | `D2R-21939` | Links to `/orders/{uuid}` |
| 2 | Store | `Lucy (New!)`, `FÜM`, `ALP`, … | Brand store name (29 stores in registry) |
| 3 | Account | `Arena Plaza`, `Smoke on the water`, … | Retail account / door name |
| 4 | Customer | `Gilbert Arenas`, … | Contact at account |
| 5 | Location | Full street address | Ship-to / door address |
| 6 | Fulfillment | `Fulfilled` · `Unfulfilled` | Shopify fulfillment sync state |
| 7 | ETA | `-` | Placeholder when no ETA; all page-1 rows show `-` |
| 8 | Total | `$77.00`, `$1,687.23`, … | USD, comma-formatted |
| 9 | Sales Rep | `Shay Schnoor`, … | Assigned rep |
| 10 | Created | `9/16/2026` | US short date |

**Row link pattern:** PO Number → `/orders/{uuid}` (e.g. `/orders/d0e37f34-47a0-4230-86c7-3bbb6349e160`). Same detail path for admin and rep.

### Filters & search (inferred)

| Control | Type | Purpose |
|---------|------|---------|
| **Store** | Combobox | Filter by brand store (~29 options from `/admin/stores`) |
| **Fulfillment** | Combobox | `Fulfilled` / `Unfulfilled` (and likely “All”) |
| **User** | Combobox | Filter by sales rep / user (~189 users in directory) |
| **Search** | Text | Free-text across PO, account, customer, location, etc. |
| **Date range** | Combobox / picker | Created-date window (inferred from sibling admin lists) |

Page-1 sample without filters: 5 stores, 11 reps, 15 fulfilled / 5 unfulfilled.

### Pagination

| Field | Value |
|-------|-------|
| Rows per page | 20 |
| Approx pages | **1034** (`pagesHint`: `1 2 3 More pages 1034`) |
| Est. total rows | ~20,680 |
| Capture depth | Page 1 only |

Pagination UI: numbered pages + “More pages” jump (standard admin table pattern).

### Actions

| Button | Behavior (inferred) |
|--------|---------------------|
| **Create order** | Opens create flow (brand + account + lines) |
| **Export** | CSV/Excel of filtered result set |
| **Filter** | Apply / reset filter bar (may be implicit on combobox change) |

### Links out

- `/admin/orders/drafts` — draft queue
- `/orders/{uuid}` — order detail
- Nav: Reports, Shopify (fulfillment source), CRM accounts/locations

### Data dependencies

- `orders-page1-live.json` — headers + 20 rows
- Cross-refs: `stores-live.json` (store filter), `users-live.json` (user/rep filter), Shopify for fulfillment state

---

## `/admin/orders/drafts` — admin drafts (mapped-ui-only)

### Purpose

Queue of POs started but not submitted to brand routing / Shopify. Admins can review, submit, or delete drafts across all reps.

### Table (inferred)

| Header | Notes |
|--------|-------|
| Draft ID / PO draft ref | Internal id or temp PO label |
| Store | Brand store |
| Account | Optional at draft stage |
| Sales Rep | Owner |
| Total | If lines entered |
| Updated | Last edit timestamp |
| Actions | Submit · Delete |

### Filters (inferred)

- **User** (rep) combobox
- **Store** combobox
- **Search** (draft id, account)

### Actions

- **Submit** — promote draft to live PO
- **Delete draft**
- Link back to **Orders** list

No live row capture exists for this route.

---

## `/orders` — rep order list (mapped-ui-only)

### Purpose

Same PO list UX as admin but **scoped to the signed-in rep** (and possibly delegate/covering assignments). Reps create orders from the field; admins see all rows.

### Expected parity with admin list

- Same **10 columns** as `/admin/orders` (PO Number through Created)
- Same row links to `/orders/{uuid}`
- **Create order** primary action
- Subset of filters: **Store**, **Fulfillment**, **Search** (no cross-rep **User** filter)

### Pagination

Likely same 20/page pattern; total pages rep-scoped (much smaller than 1034). Not captured.

### Links

- `/orders/drafts`
- `/orders/{uuid}`

Twin: **no rep orders page** (`d2r-app` missing `/orders` route).

---

## `/orders/drafts` — rep drafts (mapped-ui-only)

### Purpose

Rep-owned drafts before submit. Mirror of admin drafts with rep-only scope.

### Table (inferred)

Draft, Store, Account (optional), Updated, Total (optional), Actions (Submit · Delete).

### Actions

- **Submit draft** → moves to `/orders` list
- **Create order** / continue editing

No live capture.

---

## `/orders/:uuid` — order detail (mapped-ui-only)

Observed only via `_links` on admin scrape. Expected sections (inferred from domain + diagnostics route):

- PO header (number, store, status, fulfillment, totals)
- Line items (SKU, qty, price)
- Customer / location / account
- Fulfillment events / Shopify sync
- Link from `/admin/diagnostics/order-timeline` for event debug

Not in scope for list-mapper capture; twin has no detail page.

---

## Twin gap summary

| Live | Twin status |
|------|-------------|
| 10-column PO table | 7-column scaffold (`Order`, `Brand`, `Status`, …) |
| Live seed shape (`orders[]` + display headers) | Loader uses simplified `OrderRow` |
| `/admin/orders/drafts` | Missing |
| `/orders`, `/orders/drafts` | Missing |
| Filters (store, fulfillment, user, search) | Missing |
| Pagination (~1034 pages) | Missing |
| Export | Missing |
| PO → detail links | Missing |

See sibling twin-builder output: `TWIN-STATUS.md` (when present).

---

## Capture gaps / next scrape

1. Authenticated CDP pass: confirm filter control labels (`User` vs `Sales Rep`), date range widget, Export format.
2. Paginated sample: pages 1, 100, 1034 + filtered subsets (one store, unfulfilled only).
3. `/admin/orders/drafts` and `/orders/drafts`: headers + empty vs populated states.
4. `/orders/{uuid}` detail layout and actions.
5. Rep `/orders` column parity check vs admin.
