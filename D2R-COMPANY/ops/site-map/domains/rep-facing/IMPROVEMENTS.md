# Rep-facing domain — improvements

Gaps between live D2R **rep shell**, sibling domain twins, and this pack. Ordered by cutover risk for field reps.

Cross-links: [`../inventory/IMPROVEMENTS.md`](../inventory/IMPROVEMENTS.md) · [`../merchandising/IMPROVEMENTS.md`](../merchandising/IMPROVEMENTS.md) · [`../orders/IMPROVEMENTS.md`](../orders/IMPROVEMENTS.md) · [`../crm-assignments/IMPROVEMENTS.md`](../crm-assignments/IMPROVEMENTS.md)

---

## P0 — Authenticated rep capture

| Target | Status | Action |
|--------|--------|--------|
| `/inventory` (live) | No rep-scoped dump | CDP after Clerk: headers, brand combobox, Transfer / Request stock, first 50 rows for known rep |
| `/inventory/transfers` + create/preview | List inferred from admin; create/preview unscraped | Capture form fields + preview confirm step |
| `/orders` · `/orders/drafts` | Headers from admin only | Confirm rep filters, create flow, draft columns |
| `/merchandising` iframe `src` | Not captured | Note live iframe URL + frame-ancestors after login |
| `/retail-stores` · `/stores` · `/locations/sales-status` | Route-only | Page-1 tables + Update flow on sales-status |

**Scrape pattern (parent agent with auth):**

1. Login as field rep (not admin).
2. Walk rep nav tree from [`SITE-MAP.md`](../../SITE-MAP.md).
3. CDP extract: `button`, `[role=combobox]`, `table thead th`, first 50 `tbody tr`.
4. Write under `exports/YYYY-MM-DD/live/rep-*.json`.

---

## P0 — Twin shell gaps (rep-owned missing pages)

| Gap | Live route | Twin today | Fix |
|-----|------------|------------|-----|
| Ledgers | `/inventory/ledgers` | Missing | Thin page reusing `ledger-performance` filtered to session rep |
| Performance | `/inventory/performance` | Missing | Reuse admin performance seed, self-scoped |
| Transfer create/preview | `/inventory/transfers/create` · `/preview` | Missing | Form stubs → write path later |
| Transfer detail | `/inventory/transfers/:uuid` | Missing | Admin Transfer ID already deep-links here live |
| Retail / stores / sales-status | three routes | Missing | Door list from assignments seed; sales-status stub |
| Signup | `/signup` | Missing | Optional; invite-gated — low cutover priority |
| Rep nav completeness | Full live tree | Subset in `nav.ts` | Add Ledgers, Performance, Drafts, Stores when pages exist |

---

## P1 — Parity on existing twin pages

| Route | Gap | Notes |
|-------|-----|-------|
| `/inventory` | Fewer columns than admin Levels; no brand filter | Align with inventory pack P0 when multi-warehouse seeds land |
| `/inventory/transfers` | Read-only; no Create/Approve/Receive | Keep RO until create form mapped |
| `/orders` | Create + status filter stub; page-1 only | Blocked on drafts capture + pagination |
| `/orders/drafts` | Empty inferred headers | Needs live draft dump |
| `/orders/:uuid` | No line items / timeline | Shared with orders pack |
| `/merchandising` | Dual auth if iframe + Clerk | Production `MERCH_APP_URL` + frame headers |

---

## P1 — Ownership / UX clarity

1. **Admin→rep deep links** — Transfer IDs open `/inventory/transfers/:uuid`. Document as intentional; twin must not 404.
2. **`/stores` vs `/admin/stores`** — Rep CRM doors vs Shopify brand registry. Label clearly in UI and maps to avoid ops confusion.
3. **`/retail-stores` vs assignments** — Likely same door universe as `/admin/rep-assignments`; confirm single source of truth before dual seeds.
4. **Role redirect at `/`** — Twin sends reps to `/merchandising`; confirm live default home matches ops expectation.

---

## P2 — Site map hygiene

- Merge this `interactions.json` into root [`SITE-MAP-INTERACTIONS.json`](../../SITE-MAP-INTERACTIONS.json) when TC accepts.
- Update [`STATUS-BOARD.json`](../../STATUS-BOARD.json) mapper → complete after QC.
- Prefer [`TWIN-STATUS.md`](./TWIN-STATUS.md) over stale [`TWIN-NOTES.md`](./TWIN-NOTES.md) for readiness.
- Weekly export SOP: add **rep-scoped** inventory + orders page-1 (not only admin).

---

## Suggested twin build order

1. Expand `REP_NAV` to match live tree (links can 404→stub pages).
2. `/inventory/ledgers` + `/inventory/performance` thin mirrors.
3. `/inventory/transfers/:uuid` detail stub (unblock admin deep-link).
4. `/retail-stores` from assignments-derived doors.
5. Authenticated rep scrapes → mark routes `captured`.
6. Transfer create/preview + order create write paths.
