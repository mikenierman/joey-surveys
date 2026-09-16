# Rep-facing domain — twin status

**Updated:** 2026-09-16  
**Twin app:** `d2r-app/`  
**Live app:** https://app.direct2retailers.com  
**Map:** [`MAP.md`](./MAP.md) · [`interactions.json`](./interactions.json)

## Summary

Rep-facing is a **shell / overlap domain**: most twin pages and seeds were built by inventory, merchandising, and orders lanes. This status file is the dedicated coverage matrix for non-admin routes.

| Band | Routes | Twin readiness |
|------|--------|----------------|
| Present in twin | `/`, `/login`, `/inventory`, `/inventory/transfers`, `/merchandising`, `/orders`, `/orders/drafts`, `/orders/:uuid` | **partial / stub** (see sibling packs) |
| Mapped, no twin page | `/signup`, `/inventory/ledgers`, `/inventory/performance`, `/inventory/transfers/create`, `/inventory/transfers/preview`, `/retail-stores`, `/stores`, `/locations/sales-status`, `/test/dashboard`, `/admin` | **missing** |
| Pack completeness | MAP · ROUTES · interactions · IMPROVEMENTS · TWIN-STATUS | **complete** |

**Domain pack:** green (docs). **Twin fidelity for full live rep tree:** yellow (missing stores/CRM routes + transfer write path).

---

## Route matrix

| Route | Live coverage | Twin page | Seed / data | Status |
|-------|---------------|-----------|-------------|--------|
| `/` | inferred | `src/app/page.tsx` | session roles | **redirect OK** |
| `/login` | inferred | `src/app/login/page.tsx` | DEV_AUTH | **stub** (not Clerk) |
| `/signup` | inferred | — | — | **missing** |
| `/inventory` | inferred (admin sample reused) | `src/app/inventory/page.tsx` | `inventory-sample.json` | **partial** |
| `/inventory/ledgers` | mapped-ui-only | — | admin ledger seed unused | **missing** |
| `/inventory/performance` | mapped-ui-only | — | — | **missing** |
| `/inventory/transfers` | via admin live page-1 | `src/app/inventory/transfers/page.tsx` | `transfers.json` | **partial (RO)** |
| `/inventory/transfers/create` | mapped-ui-only | — | — | **missing** |
| `/inventory/transfers/preview` | mapped-ui-only | — | — | **missing** |
| `/merchandising` | iframe + Q3 rollup related | `src/app/merchandising/page.tsx` | merch Q3/Q2 seeds | **strong offline** |
| `/orders` | mapped (admin headers) | `src/app/orders/page.tsx` | `orders.json` | **stub** |
| `/orders/drafts` | mapped-ui-only | `src/app/orders/drafts/page.tsx` | — | **stub** |
| `/orders/:uuid` | inferred links | `src/app/orders/[id]/page.tsx` | page-1 `_links` | **stub** |
| `/retail-stores` | mapped-ui-only | — | — | **missing** |
| `/stores` | mapped-ui-only | — | — | **missing** |
| `/locations/sales-status` | mapped-ui-only | — | — | **missing** |
| `/test/dashboard` | mapped-ui-only | — | — | **out of scope** |
| `/admin` | redirect | — | → `/admin/dashboard` | **N/A** |

---

## Sibling twin status (source of truth for depth)

| Domain | Doc | What rep-facing reuses |
|--------|-----|------------------------|
| Inventory | [`../inventory/TWIN-STATUS.md`](../inventory/TWIN-STATUS.md) | Levels sample, transfers page-1, warehouse cluster |
| Merchandising | [`../merchandising/TWIN-STATUS.md`](../merchandising/TWIN-STATUS.md) | Period switcher, rep row match, optional iframe |
| Orders | [`../orders/TWIN-STATUS.md`](../orders/TWIN-STATUS.md) | Page-1 headers, drafts stubs, detail stub |
| CRM | [`../crm-assignments/TWIN-STATUS.md`](../crm-assignments/TWIN-STATUS.md) | Admin retail-stores derived stub — no rep mirror yet |

---

## Twin nav vs live

| Item | Live | Twin (`src/lib/nav.ts`) |
|------|------|-------------------------|
| Inventory | Levels + Ledgers + Performance + Transfers | My inventory · Transfers only |
| Merchandising | Yes | Yes |
| Orders | Orders · Drafts | Orders only (drafts via in-page link) |
| Stores / retail / sales-status | Yes | **not linked** |

---

## Verification checklist

- [ ] `/` as rep → `/merchandising`
- [ ] `/inventory` shows ALP sample columns
- [ ] `/inventory/transfers` shows page-1 transfer table (read-only)
- [ ] `/merchandising` as Adam Scott → matched rollup row; period switch Q2/Q3
- [ ] `/orders` filters rows when `Sales Rep` matches session name
- [ ] `/orders/drafts` + `/orders/:uuid` render without crash
- [ ] Missing routes (`/retail-stores`, `/inventory/ledgers`, …) documented until pages land

## Refresh SOP

1. Prefer **rep-role** live captures when session available (not only admin).
2. Ingest via `node d2r-app/scripts/ingest-live-exports.mjs`.
3. Update sibling TWIN-STATUS first, then refresh this matrix.
4. No secrets in domain docs or seeds.
