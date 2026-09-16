# Orders domain — twin status

**Domain:** Orders / PO routing  
**Twin app:** `d2r-app/`  
**Last updated:** 2026-09-16  
**Site map refs:** `D2R-COMPANY/ops/SITE-MAP.md`, `SITE-MAP-INTERACTIONS.json`

## Summary

| Route | Live coverage | Twin page | Seed / data | Status |
|-------|---------------|-----------|-------------|--------|
| `/admin/orders` | captured | yes | `data/seed/orders.json` | **mirrored** (page 1, live headers) |
| `/admin/orders/drafts` | mapped-ui-only | yes (stub) | inferred headers only | **stub** |
| `/orders` | mapped-ui-only | yes (stub) | filtered page-1 sample | **stub** |
| `/orders/drafts` | mapped-ui-only | yes (stub) | inferred headers only | **stub** |
| `/orders/:uuid` | inferred (links in scrape) | yes (stub) | lookup in page-1 seed | **stub** |

## Live capture

- **Source export:** `D2R-COMPANY/ops/exports/2026-09-16/live/orders-page1-live.json`
- **Ingested seed:** `d2r-app/data/seed/orders.json`
- **Captured at:** 2026-09-16 (page 1 of ~1034, 20 rows)
- **Table headers (live):** PO Number, Store, Account, Customer, Location, Fulfillment, ETA, Total, Sales Rep, Created
- **Detail links:** PO numbers link to `/orders/:uuid` (UUID from `_links[].h`)

## Twin implementation

### `/admin/orders` — mirrored

- `d2r-app/src/app/admin/orders/page.tsx`
- Reads `getOrdersSnapshot()` — uses seed `headers` array verbatim
- `OrdersTable` renders live column set; PO Number links to detail stub
- Filter chips, export, pagination: **stubbed** (visual placeholders only)
- Create order form writes new rows in live shape via `POST /api/orders`

### `/admin/orders/drafts` — stub

- `d2r-app/src/app/admin/orders/drafts/page.tsx`
- Inferred columns: Draft, Store, Rep, Updated
- Submit / delete / rep filter: disabled stubs
- Optional future seed: `data/seed/orders-drafts-admin.json` (empty today)

### `/orders` — rep stub

- `d2r-app/src/app/orders/page.tsx`
- Rep nav entry added
- Filters page-1 seed by logged-in rep name when `Sales Rep` is set
- Create order: disabled stub

### `/orders/drafts` — rep stub

- `d2r-app/src/app/orders/drafts/page.tsx`
- Same inferred draft columns as admin drafts
- Optional future seed: `data/seed/orders-drafts-rep.json` (empty today)

### `/orders/:uuid` — detail stub

- `d2r-app/src/app/orders/[id]/page.tsx`
- Resolves row from page-1 seed via `_links`
- Line items, timeline, fulfillment actions: **not implemented**

## API

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `GET /api/orders` | Return full orders seed | done |
| `POST /api/orders` | Append row in live header shape | done (admin/manager) |

## Gaps / next steps

1. **Pagination** — ingest multi-page export (~1034 pages) or API-backed cursor
2. **Drafts capture** — scrape `/admin/orders/drafts` and `/orders/drafts` when session available
3. **Order detail** — line items, status timeline, brand routing (`/admin/diagnostics/order-timeline` ref)
4. **Filters** — wire fulfillment, store, rep, date comboboxes from live interactions map
5. **Export** — CSV download parity with live Export button
6. **Rep create flow** — enable rep-side create → draft → submit

## Parity checklist pointer

Update `d2r-app/PARITY-CHECKLIST.md` row for Orders when drafts/detail move beyond stub.
