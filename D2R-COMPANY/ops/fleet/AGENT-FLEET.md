# Agent fleet roster — D2R offline twin

**Role of this doc:** Traffic Controller ownership map. Agents rebuild **parity only** inside allowed paths. Improvements go to [`../IMPROVEMENTS-BACKLOG.md`](../IMPROVEMENTS-BACKLOG.md), not feature branches.

**Twin app:** `d2r-app/`  
**Site map (found 2026-09-16):** [`../SITE-MAP.md`](../SITE-MAP.md) · [`../SITE-MAP-INTERACTIONS.json`](../SITE-MAP-INTERACTIONS.json) · per-domain packs under `../site-map/domains/`  
**Live captures:** `../exports/2026-09-16/live/`  
**Seeds:** `d2r-app/data/seed/`

---

## Branch & path policy (all agents)

| Rule | Detail |
|------|--------|
| Branch pattern | `sandbox/<area>/<single-issue>` e.g. `sandbox/inventory/transfers-table` |
| One issue / branch | Single concern; one concern per commit |
| Allowed paths | Only globs listed for your lane (below). Cross-lane edits → reject PR |
| Shared files | `nav.ts`, `data.ts`, `layout.tsx`, `ui.tsx` → **shell** or **data-loaders** lane only; request Traffic Controller if you need a shared change |
| Remote | No push to `main`. No force push. Merge via PR into integration branch when Traffic Controller opens the gate |
| Parity vs improvements | Parity = match live headers/routes/seeds. Product upgrades = backlog only |

**Traffic Controller branch:** `sandbox/traffic-controller` (this fleet / QC / merge docs + smoke script only).

---

## Lane roster

| Lane | Agent role | Owns (site-map domains) | Branch prefix | Allowed path globs | Seed / live deps | Merge wave |
|------|------------|-------------------------|---------------|--------------------|------------------|------------|
| **0 · Traffic Controller** | Orchestration, QC, conflict prevention | `ops/fleet/*`, QC harness | `sandbox/traffic-controller` | `D2R-COMPANY/ops/fleet/**`, `D2R-COMPANY/ops/IMPROVEMENTS-BACKLOG.md`, `d2r-app/scripts/qc-twin-smoke.mjs`, `d2r-app/package.json` (script entry only) | — | Always first for docs |
| **1 · Shell / nav** | Admin + rep chrome | nav trees in SITE-MAP | `sandbox/shell/*` | `d2r-app/src/lib/nav.ts`, `d2r-app/src/lib/inventory-nav.ts`, `d2r-app/src/app/layout.tsx`, `d2r-app/src/app/admin/layout.tsx`, `d2r-app/src/components/ui.tsx`, `d2r-app/src/app/globals.css`, `d2r-app/src/middleware.ts`, `d2r-app/src/lib/auth.ts`, `d2r-app/src/app/login/**`, `d2r-app/src/app/api/auth/**`, `d2r-app/src/components/clerk-login.tsx`, `d2r-app/src/components/providers.tsx` | — | 1 |
| **2 · Data loaders** | Seed read shapes, ingest, types | all domains (data only) | `sandbox/data/*` | `d2r-app/src/lib/data.ts`, `d2r-app/src/lib/store.ts`, `d2r-app/data/seed/**`, `d2r-app/scripts/import-exports.mjs`, `d2r-app/scripts/ingest-live-exports.mjs` | all `*-live.json` → seeds | 2 |
| **3 · Merchandising** | Admin + field merch | `merchandising` | `sandbox/merchandising/*` | `d2r-app/src/app/admin/merchandising/**`, `d2r-app/src/app/merchandising/**`, `d2r-app/src/lib/merchandising.ts`, `d2r-app/src/components/merch-*.tsx`, `d2r-app/data/seed/merchandising-*.json` | `merchandising-joey_circle_k-2026-Q3-live.json` | 3 |
| **4 · Inventory** | Levels, ledgers, transfers, warehouses | `inventory` (+ warehouses/businesses pages) | `sandbox/inventory/*` | `d2r-app/src/app/admin/inventory/**`, `d2r-app/src/app/admin/warehouses/**`, `d2r-app/src/app/admin/businesses/**`, `d2r-app/src/app/inventory/**`, `d2r-app/src/app/api/transfers/**`, `d2r-app/data/seed/{inventory-sample,ledger-*,transfers,warehouses,brand-levels,businesses}.json` | inventory / ledger / transfers / warehouses / brand-levels / businesses live | 4 |
| **5 · Orders** | Admin + rep orders | `orders` | `sandbox/orders/*` | `d2r-app/src/app/admin/orders/**`, `d2r-app/src/app/orders/**`, `d2r-app/src/app/api/orders/**`, `d2r-app/src/components/orders-table.tsx`, `d2r-app/src/components/create-order-form.tsx`, `d2r-app/data/seed/orders.json` | `orders-page1-live.json` | 5 |
| **6 · Shopify / brands** | Health, stores, sync stubs | `shopify-brands` | `sandbox/shopify/*` | `d2r-app/src/app/admin/shopify/**`, `d2r-app/src/app/admin/stores/**`, `d2r-app/src/lib/shopify.ts`, `d2r-app/src/lib/webhooks.ts`, `d2r-app/src/app/api/shopify/**`, `d2r-app/src/app/api/webhooks/**`, `d2r-app/src/components/shopify-sync-button.tsx`, `d2r-app/data/seed/{shopify-*,stores}.json`, `d2r-app/scripts/verify-webhook-hmac.mjs` | shopify-health / shops / stores live | 6 |
| **7 · Pulse / dashboard** | Dashboard + pulse KPIs | `pulse-dashboard` | `sandbox/pulse/*` | `d2r-app/src/app/admin/dashboard/**`, `d2r-app/src/app/admin/pulse/**`, `d2r-app/src/components/pulse-*.tsx`, `d2r-app/data/seed/pulse-signals.json` | `pulse-signals-AdamScott-live.json` | 7 |
| **8 · Payouts / finance** | Payouts, commissions, settlements | `payouts` | `sandbox/payouts/*` | `d2r-app/src/app/admin/payouts/**`, `d2r-app/src/app/admin/commissions/**`, `d2r-app/src/app/admin/settlements/**`, `d2r-app/data/seed/{payouts,payout-rules,commissions,settlements}.json` | (captures thin — seed stubs OK) | 8 |
| **9 · CRM / assignments** | Users, assignments, retail doors | `crm-assignments` | `sandbox/crm/*` | `d2r-app/src/app/admin/users/**`, `d2r-app/src/app/admin/rep-assignments/**`, `d2r-app/src/app/admin/retail-stores/**`, `d2r-app/src/app/api/users/**`, `d2r-app/src/components/add-user-form.tsx`, `d2r-app/data/seed/{users,assignments,rep-assignments}.json` | users / assignments / businesses live | 9 |
| **10 · Reports** | Report hub + runners | `reports` | `sandbox/reports/*` | `d2r-app/src/app/admin/reports/**` | ledger / orders seeds (read-only) | 10 |
| **11 · Rep-facing shell** | Non-admin counterparts not owned above | `rep-facing` | `sandbox/rep/*` | `d2r-app/src/app/inventory/**` (if inventory lane done), `d2r-app/src/app/orders/**` (coord), `d2r-app/src/app/merchandising/**` (coord) — prefer domain lanes; use this only for leftover rep routes | domain seeds | After owning domain |

---

## Site-map → lane quick index

| Domain pack | Primary lane |
|-------------|--------------|
| `site-map/domains/merchandising` | 3 Merchandising |
| `site-map/domains/inventory` | 4 Inventory |
| `site-map/domains/orders` | 5 Orders |
| `site-map/domains/shopify-brands` | 6 Shopify |
| `site-map/domains/pulse-dashboard` | 7 Pulse |
| `site-map/domains/payouts` | 8 Payouts |
| `site-map/domains/crm-assignments` | 9 CRM |
| `site-map/domains/reports` | 10 Reports |
| `site-map/domains/rep-facing` | Domain lanes first; 11 for leftovers |

Domain agents may **read** any `D2R-COMPANY/ops/**` map/export; they may **write** only their domain’s `TWIN-NOTES.md` / `TWIN-STATUS.md` (optional) plus twin code under allowed globs.

---

## Conflict hotspots (serialize)

1. `d2r-app/src/lib/data.ts` — **data-loaders only**  
2. `d2r-app/src/lib/nav.ts` — **shell only**  
3. `d2r-app/src/components/ui.tsx` — **shell only**  
4. Seed JSON renames/shape — **data-loaders**; UI lanes consume after merge  
5. Shared API routes that touch multiple domains — Traffic Controller assigns temporary exclusive owner

---

## How an agent starts a sandbox

```bash
git fetch origin
git checkout main   # or current integration branch named by Traffic Controller
git pull
git checkout -b sandbox/<area>/<single-issue>
# edit ONLY allowed paths
# open PR → merge order in MERGE-ORDER.md; QC-GATES.md checklist required
```

See also: [`BRANCH-MATRIX.md`](./BRANCH-MATRIX.md) · [`QC-GATES.md`](./QC-GATES.md) · [`MERGE-ORDER.md`](./MERGE-ORDER.md)
