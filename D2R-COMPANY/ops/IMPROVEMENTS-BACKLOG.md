# Improvements backlog (not twin parity)

Product upgrades for the **live** Direct2Retailers system. Twin agents rebuild parity only; park upgrades here.

---

## Orders (`sandbox/orders/admin-list-sample` — 2026-09-16)

Parity delivered in twin: admin list from `orders.json` with live headers + offline sample banner (page 1 of ~1034); drafts route stub.

### P0 — Scale & operability

- **Pagination at ~1034 pages is unusable** — keyset/cursor pagination, jump-to-page, default tighter date window; show total count + active filters.
- **Export impractical for full history** — async server-side export job; document max row limits.
- **Search + filters need indexed paths** — composite indexes; debounce; “refine filters” when result set is huge.

### P1 — Data clarity

- **ETA column always `-` on capture** — hide when empty or wire from fulfillment/shipping.
- **Store / Account / Customer / Location overload** — collapse Account+Customer; location tooltip; column chooser.
- **Fulfillment binary only** — align with Shopify statuses (partial, on_hold, cancelled); badge colors.

### P2 — Workflow

- **Drafts without nav counts** — badge; stale-draft alerts; bulk submit.
- **No order preview drawer** — row expand / side panel for lines + fulfillment.
- **Create-order entry unclear** — wizard, duplicate-from-PO, inventory validate before submit.

### P3 — Integration

- **Shopify health vs Unfulfilled confusion** — inline warning when brand store unhealthy.
- **Order timeline buried in diagnostics** — embed on order detail.
- **No link to commissions/settlements** — financial impact section on detail.

### P4 — Rep experience

- **Hide redundant Sales Rep column for self-scoped rep list.**
- **Mobile card list** for field create / browse.

---

## 2026-09-16 · inventory · `sandbox/inventory/warehouses-businesses`

Parity shipped: offline `/admin/warehouses` (60 rows) + `/admin/businesses` (51 rows) with live column shapes from seed JSON.

Deferred / live product improvements:

| Item | Notes |
|------|-------|
| Missing warehouse phones | 28/60 show `-` in capture — incomplete for field ops |
| Warehouse ↔ business linkage | Separate admin surfaces; no UI join for legal entity vs ship-to |
| Businesses Actions empty | All 51 rows empty in scrape; detail UUIDs exist but undiscoverable |
| Full inventory export | Still need CSV/API all warehouses × brands (related to levels) |

---

## CRM / Assignments (`sandbox/crm/users-and-assignments` — 2026-09-16)

Parity delivered in twin: `/admin/users` from `users.json` (189 rows + add-demo form) and `/admin/rep-assignments` page-1 sample with Active/Primary/Covering/Delegate counts banner (**11,314** active).

### P0 — Assignment scale & export

- **11,314 primary assignments across ~227 pages** — twin shows page-1 sample only; full paginated dump or export API required before cutover.
- **Export filtered set** — prefer server-side export (rep/store/account/city/state/role) over paging through 227 screens.
- **Indexed server-side search** — assign/reassign workflows need URL-synced filters + stable sort.

### P1 — Role hygiene & bulk ops

- **151/189 users with empty Role** — require role on invite; block assignment creation for unroled users.
- **Bulk edit guardrails** — diff preview + audit log before territory mass-change.
- **Relationships graph** — `/admin/rep-assignments/relationships` still mapped-ui-only.

### P2 — Entity coverage

- **Retail-stores capture missing** — doors currently derived from assignment sample until dedicated export lands.
