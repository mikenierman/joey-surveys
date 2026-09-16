# Improvements backlog (not twin parity)

Product upgrades for the **live** Direct2Retailers system. Twin agents rebuild parity only; park upgrades here.

---

## Nav / shell (`sandbox/shell/nav-and-admin-layout` — 2026-09-16)

1. **Collapse long sidebar into progressive disclosure** — Live admin exposes Inventory, Customers, Locations, Payouts, Reports, and Platform as dense flat lists. Default-expand only the active section; collapse others so ops can scan ~12 groups without scrolling past unused finance/CRM links.

2. **Surface unhealthy Shopify count on Platform** — Health was 9/29 healthy in the 2026-09-16 capture. A sidebar badge on Platform → Shopify (e.g. “20 need attention”) would route reconnect work before inventory refresh, instead of discovering failures only inside the Shopify table.

3. **Unify Brands vs Platform → Brand stores** — Live nav lists Brand stores under both Brands and Platform. One canonical entry (Platform) with a deep link from Brands—or a Brands hub that embeds health—would stop operators opening the wrong “stores” list (Shopify registry vs retail doors).

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

---

## Merchandising (`sandbox/merch/rep-facing-shell` — 2026-09-16)

Parity delivered in twin: rep `/merchandising` offline shell with period rollup + Circle K route list/status (search, All/To do/Done tabs, store cards). Survey engine stays in the field app / iframe.

### P0 — Field workflow

- **Visit-level Done status missing from vault** — export per-store visit completion (site_number + cycle_key + submitted_at) so offline Done tab matches live.
- **Dual auth (Clerk shell + merch login)** — SSO / shared session so iframe does not re-prompt.
- **iframe blank without `NEXT_PUBLIC_MERCH_APP_URL` + frame-ancestors** — production host + CSP allow twin origin.

### P1 — Route accuracy

- **Demo Field Rep mapping is twin-only** — map real Clerk emails 1:1; remove Adam Scott fallback in production.
- **Store list source outside twin seed** — copy/subset Circle K `stores.json` into `d2r-app/data/seed/` for portable offline builds.
- **Closing-store flag visibility** — surface closing doors in admin rollup and pay workflow.

### P2 — Product upgrades (live)

- **Offline queue count in D2R shell header** — pending sync chip outside iframe.
- **Deep link store card → visit** — pass site_number + period into field app URL.
- **Program picker** — support multi-program beyond `joey_circle_k`.


---

## Fleet / Traffic Controller rollup (2026-09-16)

Systemic issues from standing up the multi-agent sandbox fleet. **Do not implement in parity PRs** (`ops/fleet/QC-GATES.md` Gate F). Domain detail: `site-map/domains/*/IMPROVEMENTS.md`.

### Capture / observability

- **P0** Authenticated browser scrape still blocked → interaction maps remain inferred; CDP pass required (`SITE-MAP.md`).
- **P0** Pagination depth gaps: orders ~1034 pages, transfers ~21, assignments ~227 / 11k+ rows — page-1 captures are not cutover-complete.
- **P1** Inventory capture is one brand×warehouse sample; pulse is one-rep sample.
- **P2** Signed-out HTML under `routes/*-signedout.html` is Clerk shell only — not UI truth.

### Shopify reliability (live)

- **P0** 9/29 shops healthy; partial scopes cause silent sync failure — scope health gate before refresh/sync.
- **P0** Unreachable / Not installed / Missing scopes collapsed in UI; missing scope *names* not shown.
- **P1** Duplicate Lucy / Lucy (New!) brand stores; twin single-env Shopify token ≠ live multi-shop model (cutover blocker).

### Twin process (fleet)

- **P1** Parallel agents edit a **shared** checkout (not isolated sandboxes) — high rollback risk; enforce `sandbox/<area>/<single-issue>` + path globs (`ops/fleet/AGENT-FLEET.md`).
- **P1** Shared hotspots `data.ts` / `nav.ts` / `ui.tsx` must stay shell or data-loader owned.
- **P2** Consider `integration/twin-parity` if `main` stays mixed with unrelated trees.

### Pulse / finance gaps

- **P1** Pulse score opaque; finance routes had thin/zero live captures this pass — money path under-specified for cutover.
- **P2** Reports runners largely stub — merge last (`ops/fleet/MERGE-ORDER.md` wave 10).
