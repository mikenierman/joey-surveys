# Pulse / Dashboard domain — live UI map

**Domain:** Company ops overview (`/admin/dashboard`) and rep health analytics (`/admin/pulse/*`)  
**Live app:** https://app.direct2retailers.com  
**Mapped:** 2026-09-16  
**Machine map:** [`interactions.json`](./interactions.json)  
**Primary capture:** `D2R-COMPANY/ops/exports/2026-09-16/live/pulse-signals-AdamScott-live.json`  
**Secondary KPI source:** `ledger-performance-live.json` (company + per-rep rollups; dashboard overlap inferred)  
**Twin (partial):** `d2r-app/src/app/admin/dashboard/page.tsx`, `d2r-app/src/app/admin/pulse/page.tsx` — scaffold only; no sub-routes

Coverage legend: `captured` | `mapped-ui-only` | `stub-in-twin` | `missing`

Interaction fidelity: **live-capture** for `/admin/pulse/signals` KPI dict (Adam Scott, Jun 19 – Sep 16); **inferred** for dashboard, pulse hub, goals, health, scores (no authenticated CDP pass; signed-out HTML is Clerk shell only).

---

## Domain scope

| Route | Role | Purpose | Coverage |
|-------|------|---------|----------|
| `/admin/dashboard` | Admin | Company-wide ops KPIs, activity feed, quick links | `mapped-ui-only` |
| `/admin/pulse` | Admin | Pulse hub — rep-scoped health navigation | `mapped-ui-only` |
| `/admin/pulse/signals` | Admin | Rep KPI signal cards (reorder, doors, fees, revenue, score) | `captured` |
| `/admin/pulse/scores` | Admin | Composite rep scores (ranking / export) | `mapped-ui-only` |
| `/admin/pulse/health` | Admin | Aggregate health indicators | `mapped-ui-only` |
| `/admin/pulse/goals` | Admin | Goal targets vs attainment | `mapped-ui-only` |

Related (out of domain but linked): `/admin/inventory/ledgers` (inventory KPIs), `/admin/reports/*`, `/admin/rep-assignments` (rep universe ~189 users), `/test/dashboard` (internal test surface).

---

## Nav placement

**Admin**

```
Dashboard                         /admin/dashboard
Pulse
├── (hub)                         /admin/pulse
├── Goals                         /admin/pulse/goals
├── Health                        /admin/pulse/health
├── Scores                        /admin/pulse/scores
└── Signals                       /admin/pulse/signals
```

Twin `ADMIN_NAV` includes Dashboard + Pulse (single page only). Pulse sub-routes are **not** in twin nav.

Post-login redirect (live + twin): `/admin/dashboard`.

---

## `/admin/dashboard` — company ops overview (mapped-ui-only)

### Purpose

Landing page after admin login. Surfaces company-wide inventory/consignment KPIs, recent activity, and deep links into high-traffic modules. Distinct from Pulse (rep-centric health) but shares ledger-derived metrics.

### KPI cards (inferred + ledger cross-ref)

| Metric | Sample source | Notes |
|--------|---------------|-------|
| Value held | `$892,447` | From ledger performance summary (2026-09-16 capture) |
| Units held | `97,149` | Ledger summary |
| Sell-through | `20%` | Ledger summary (company rollup) |
| Quiet stock (8+ days) | `47 of 53` | “No sale and no arrival in over a week” — likely dashboard or ledger widget |
| Warehouses | `60` | Warehouse directory count |

Additional KPIs may appear (orders today, merch completion, Shopify health) — not captured on this pass.

### Filters & controls (inferred)

| Control | Type | Purpose |
|---------|------|---------|
| **Date range** | Combobox / picker | Preset ranges (7d, 30d, QTD, custom) for KPI window |
| **Refresh** | Button | Re-fetch dashboard aggregates |

### Tables / feeds (inferred)

| Widget | Headers (hint) | Notes |
|--------|----------------|-------|
| Activity / audit feed | Event, Actor, When | Recent admin actions (orders, transfers, user changes) |

### Links out (inferred + twin)

- `/admin/inventory`, `/admin/inventory/ledgers`
- `/admin/orders`, `/admin/merchandising`
- `/admin/shopify`, `/admin/pulse`
- `/admin/reports`

### Data dependencies

- No dedicated `dashboard-kpis` live capture (listed missing in export pass).
- Cross-refs: `ledger-performance-live.json`, `warehouses-live.json`, optionally orders/merch summaries.

---

## `/admin/pulse` — pulse hub (mapped-ui-only)

### Purpose

Entry point for rep health analytics. Hosts global filters (rep, date range) shared by child routes and sub-navigation to Goals, Health, Scores, Signals.

### Sub-navigation (inferred)

| Tab / link | Target |
|------------|--------|
| Goals | `/admin/pulse/goals` |
| Health | `/admin/pulse/health` |
| Scores | `/admin/pulse/scores` |
| Signals | `/admin/pulse/signals` |

### Filters & controls (inferred)

| Control | Type | Purpose |
|---------|------|---------|
| **Rep** | Combobox | Select rep (~189 users); default may be “All reps” or last viewed |
| **Date range** | Combobox / picker | Analysis window; signals capture used **Jun 19 – Sep 16** |
| **Refresh** | Button | Recompute pulse metrics for selection |

Hub may render summary tiles or redirect to Signals as default — exact layout not captured.

---

## `/admin/pulse/signals` — rep KPI signals (captured)

### Purpose

Rep-scoped KPI dashboard: reorder behavior, door growth, order volume, composite score, store coverage, revenue mix, and fee percentages. Primary live evidence for Pulse domain.

### Capture metadata

| Field | Value |
|-------|-------|
| URL | `https://app.direct2retailers.com/admin/pulse/signals` |
| Rep | Adam Scott |
| Range | Jun 19 – Sep 16 |
| Captured | 2026-09-16T19:46:17Z |

### Signal metrics (live — flat KPI dict, not alert rows)

| Key | Label (inferred) | Adam Scott sample | Format |
|-----|------------------|-------------------|--------|
| `reorderRate` | Reorder rate | `97%` | Percentage |
| `reorderMissRate` | Reorder miss rate | `90%` | Percentage |
| `newDoors` | New doors | `2` | Integer |
| `orders` | Orders | `78` | Integer (period count) |
| `score` | Pulse score | `74` | 0–100 composite |
| `activeStores` | Active stores | `65` | Integer |
| `onHandShare` | On-hand share | `58%` | Percentage of revenue/volume mix |
| `revenue` | Revenue | `22408` | USD (display likely `$22,408`) |
| `onHandFeePct` | On-hand fee % | `7%` | Percentage |
| `dropShipFeePct` | Drop-ship fee % | `5%` | Percentage |

**Presentation (inferred):** stat cards or metric grid — capture is scalar dict, not paginated table or alert list.

**Ledger cross-check (Adam Scott, same capture day):** sell-through `35%`, value held `$13,568`, `157 in 7d` sold — independent from pulse score `74`; different formulas/periods.

### Filters & controls

| Control | Type | Notes |
|---------|------|-------|
| **Rep** | Combobox | Adam Scott in sample; full rep list from users |
| **Date range** | Combobox / picker | Jun 19 – Sep 16 in capture |

No Export button observed in capture (may exist on Scores sibling).

### Links out

- `/admin/pulse` (hub)
- `/admin/pulse/scores` (score drill-down / ranking)

### Data dependencies

- `pulse-signals-AdamScott-live.json` → seeded as `d2r-app/data/seed/pulse-signals.json`
- Rep directory: `users-live.json`
- Supporting: orders, rep-assignments, ledger (for reconciliation)

---

## `/admin/pulse/scores` — composite scores (mapped-ui-only)

### Purpose

Rep ranking by composite Pulse score; likely supports period comparison and export for ops reviews.

### Table / grid (inferred)

| Header | Notes |
|--------|-------|
| Rep | Name |
| Score | Composite 0–100 (signals page shows single-rep `score: 74`) |
| Period | Selected window |
| Rank / trend | Optional delta vs prior period |

### Filters & controls (inferred)

| Control | Type | Purpose |
|---------|------|---------|
| **Rep** | Combobox | Filter or highlight one rep |
| **Period** | Combobox | QTD, rolling 90d, custom |
| **Export** | Button | CSV of scores for all reps |

### Links

- `/admin/pulse`, `/admin/pulse/signals`

No live row capture.

---

## `/admin/pulse/health` — aggregate health (mapped-ui-only)

### Purpose

Roll-up health indicators (likely traffic-light or RAG status) across reps or territories — complement to numeric Signals.

### Widgets (inferred)

- Summary tiles: healthy / at-risk / critical rep counts
- Per-rep health badges or small multiples
- Possible linkage to quiet stock, reorder miss, merch completion

### Filters (inferred)

| Control | Type |
|---------|------|
| **Rep** | Combobox (single rep or all) |

No tables captured; may reuse card layout from Signals.

---

## `/admin/pulse/goals` — targets vs attainment (mapped-ui-only)

### Purpose

Set and track rep/company goals (revenue, doors, reorder rate, etc.) against actuals from Signals.

### Table (inferred)

| Header | Notes |
|--------|-------|
| Goal | Metric name |
| Target | Configured target |
| Actual | From pulse/ledger |
| Attainment % | Progress |
| Period | Goal window |

### Filters & controls (inferred)

| Control | Type | Purpose |
|---------|------|---------|
| **Rep** | Combobox | Scope goals |
| **Period** | Combobox | Quarter / rolling |
| **Edit goals** | Button | Admin goal configuration |

No live capture.

---

## Twin gap summary

| Live | Twin status |
|------|-------------|
| Dashboard ledger KPIs | Partial — 4 stat cards from ledger; no activity feed, date range |
| Pulse hub + 4 sub-routes | Single `/admin/pulse` page only; sub-routes **missing** |
| Signals KPI dict (10 metrics) | Twin expects `signals[]` alert rows (`severity`, `title`, `detail`) — **schema mismatch** |
| Rep + date filters | Missing on twin pulse |
| Scores / Health / Goals | Missing entirely |
| Dashboard quick links | Partial (inventory, ledgers, merch, shopify) |

See sibling twin-builder output: `TWIN-STATUS.md` (when present).

---

## Capture gaps / next scrape

1. Authenticated CDP pass on `/admin/dashboard`: confirm KPI set, activity table headers, date range presets.
2. Pulse hub: confirm default tab, sub-nav pattern (tabs vs sidebar).
3. `/admin/pulse/signals`: capture 2–3 additional reps + empty/error states; confirm card labels match keys.
4. `/admin/pulse/scores`: table headers, export format, full rep list scores.
5. `/admin/pulse/health` and `/goals`: populated vs empty UI, edit-goal modal fields.
6. Reconcile `reorderRate` vs `reorderMissRate` definitions (both high in Adam Scott sample — document tooltips).
