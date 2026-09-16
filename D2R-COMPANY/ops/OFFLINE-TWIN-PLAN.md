# Offline twin plan — 1:1 mirror without CTO notes

**Goal:** Failsafe offline copy of `app.direct2retailers.com` for audit/testing.  
**Owner:** Traffic Controller coordinates; domain twin-builders implement.  
**Canonical map:** [`SITE-MAP.md`](./SITE-MAP.md) · interactions · [`site-map/TRAFFIC-CONTROLLER.md`](./site-map/TRAFFIC-CONTROLLER.md)

Do **not** wait for CTO build notes. Prefer seed-driven tables matching live headers over visual polish.

---

## Priority sequence

1. **Merchandising** → 2. **Inventory** → 3. **Orders** → 4. **Payouts** → 5. **Pulse** → 6. **CRM / assignments**

Reports and remaining finance (payments/deposits/receipts) trail those.

---

## Phase 0 — Control plane (done / ongoing)

- [x] Route discovery (67 URLs)
- [x] Live scrape seeds (14 JSON, 2026-09-16)
- [x] Canonical SITE-MAP + SITE-MAP-INTERACTIONS
- [x] Domain folder scaffold + schema + Traffic Controller board
- [ ] Authenticated CDP interaction pass (blocked: empty browser tabs)
- [ ] Domain merges into canonical (pulse/payouts first in queue)

## Phase 1 — Merchandising (P0)

| Item | Status |
|------|--------|
| Admin rollup table (rep completion) | Twin exists (Q3 seed) |
| Period combobox (5 periods) | Partial — Q2/Q3 seeds; UI control incomplete |
| `/admin/merchandising/stores` | Mapped; twin thin/missing |
| Field `/merchandising` iframe | Twin exists |

**Exit:** Period selector works offline; stores subpage stub with live-shaped columns.

## Phase 2 — Inventory (P0)

| Item | Status |
|------|--------|
| Levels sample + warehouse/brand filters | Twin + cluster nav |
| Ledgers / performance | Twin |
| Refresh / brand levels | Twin |
| Transfers list (live headers) | Twin + normalize |
| Audit / terms | Twin stub / mapped |
| Warehouses (60) | Twin |
| Full brand×warehouse dump | **Gap** |

**Exit:** All inventory cluster routes stub-or-better; transfers/ledgers headers match live.

## Phase 3 — Orders (P1)

| Item | Status |
|------|--------|
| Admin orders table live headers | Twin (`getOrdersSnapshot`) |
| Drafts route | Twin stub |
| Detail `/orders/:id` | Missing |
| Pagination / export parity | **Gap** (1034 pages) |

**Exit:** Offline audit of page-1 + documented pagination limits; drafts empty-state matches map.

## Phase 4 — Payouts / commissions / settlements (P2)

| Item | Status |
|------|--------|
| List pages seed tables | Twin scaffolds |
| Rules / review / batch preview | Twin stubs present |
| Live finance captures | **Missing** — mapper inferred |

**Exit:** All payouts-domain routes stub-in-twin; demo seeds labeled; live export queued.

## Phase 5 — Pulse / dashboard (P2)

| Item | Status |
|------|--------|
| Dashboard KPIs from seeds | Twin |
| Pulse hub + signals KPIs | Twin |
| Goals / health / scores | Mapped; twin stub links |

**Exit:** Signals matches Adam Scott capture; other pulse routes stub pages.

## Phase 6 — CRM / assignments (P1)

| Item | Status |
|------|--------|
| Businesses (51) | Twin |
| Brand stores (29) | Twin |
| Rep assignments page-1 | Twin |
| Retail stores (derived) | Twin derived |
| Accounts / contacts / locations | Mapped; twin missing |
| Full 11k assignments dump | **Gap** |

**Exit:** CRM nav complete; assignments scale documented; accounts/contacts stubs.

## Phase 7 — Reports + rep-facing polish

- Report runners: filters + empty tables matching inferred headers.
- Rep inventory/orders/transfers create-preview flows offline.

## Phase 8 — Hardening

- Postgres swap path; Clerk prod keys; Shopify read sync only.
- Weekly export SOP automation for paginated modules.
- Pixel polish **after** parity tables work.

---

## Twin quality gates (TC)

```bash
cd d2r-app && npx tsc --noEmit && npm run lint
```

Reject twin PRs/pages that: break tsc, invent columns when live headers exist, or commit secrets.

## Data refresh

```bash
node d2r-app/scripts/import-exports.mjs D2R-COMPANY/ops/exports/2026-09-16
# or ingest-live-exports.mjs when available
```
