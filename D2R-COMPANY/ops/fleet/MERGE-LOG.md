# Merge log — `sandbox/integration`

Local-only integration tip. **Do not push** until Traffic Controller opens a reviewed PR.

---

## Wave 1 — 2026-09-16

| Field | Value |
|-------|-------|
| Integration tip (end of wave 1) | `e45bc08` (log) / prior merge `3499bc3` |
| Base | `main` @ `f08a83c` |
| Worktree | `/private/tmp/d2r-merch-integration` (local) |

### Merged

| Branch | Tip | Result |
|--------|-----|--------|
| `sandbox/shell/nav-and-admin-layout` | `7368dbc` | Clean merge → `885b239` (ort). Nav, admin layout, `ui.tsx`, middleware pending-lane, `inventory-nav.ts`, `SHELL-NAV-OWNERS.md`. |
| `sandbox/traffic-controller` | `89b722f` | Merged → `3499bc3`. Docs/scripts only (`AGENT-FLEET`, `BRANCH-MATRIX`, `MERGE-ORDER`, `QC-GATES`, `qc-twin-smoke.mjs`). |

### Conflicts

| Path | Resolution |
|------|------------|
| `D2R-COMPANY/ops/IMPROVEMENTS-BACKLOG.md` (add/add) | Kept **both**: shell Nav/shell section (HEAD) + traffic-controller domain/fleet rollup (`89b722f`). |

### QC (wave 1)

Smoke **FAIL** (0/21 seeds, 0/23 pages, missing `data.ts`). `tsc` **FAIL** (`@/lib/auth` missing). Expected for shell-only tip.

---

## Wave 2–4 — 2026-09-16 (data → merch → inventory)

| Field | Value |
|-------|-------|
| Integration tip | `2b76e3a` |
| Worktree | `/private/tmp/d2r-merch-integration` |

### Merged

| Branch | Tip | Result |
|--------|-----|--------|
| `sandbox/data/foundation` | `24617d9` | Fast-forward → `24617d9`. `data.ts` / `auth.ts` / `store.ts` + shopify/webhooks lib deps, DEV_AUTH login + Clerk login component, 21 seed JSON, Next `package.json`/`tsconfig` scaffolding, `.env.example` (placeholders only). |
| `sandbox/merch/admin-q3-table` | `af91c3a` | Merge → `a226a4f`. Admin Q3 rollup + period switcher; live columns. Backlog add/add kept integration + appended admin Q3 deferred. |
| `sandbox/merch/rep-facing-shell` | `28b1aa6` | Merge → `8cfa730`. Rep `/merchandising` list/status shell. Backlog kept ours. |
| `sandbox/inventory/admin-levels-table` | `00b0784` | Merge → `230cf19`. Levels table live columns; backlog append levels deferred. |
| `sandbox/inventory/warehouses-businesses` | `2813564` | Merge → `4e7cf64`. Warehouses + businesses admin pages. |
| `sandbox/inventory/ledgers-brand-levels` | `cc76792` | Merge → `b7946d8`. Ledgers + brand-levels refresh. **Also carried** early Shopify health/stores pages + `api/webhooks/shopify` + sync stubs (overlap with shopify wave — resolve carefully when merging stores-and-health / webhooks). |
| `sandbox/inventory/transfers-admin` | `bd00d64` | Merge → `2b76e3a`. Admin + rep transfers pages. |

### Conflicts

All conflicts were `IMPROVEMENTS-BACKLOG.md` add/add. Resolution pattern: keep integration HEAD, append unique `##` sections from incoming.

No source conflicts on merch/inventory page files (disjoint adds). Prefer live column parity already encoded in sandbox tips.

### Registered — not merged yet (historical at end of wave 2–4)

| Branch | Tip | When to merge |
|--------|-----|---------------|
| `sandbox/shopify/stores-and-health` | `65619d7` | ~~Shopify wave first~~ → **done in wave 3** (already ancestor). |
| `sandbox/shopify/webhooks-automation-logs` | `a0da9c7` | ~~after stores-and-health~~ → **merged in wave 3** (`5dd189a`). |

See Wave 3 section below for outcomes.

### Still deferred (at end of wave 2–4 — later cleared in wave 3)

Orders, pulse, payouts, CRM, reports, link-crawl QA were still on sandbox tips after wave 2–4. **Cleared in Wave 3** (except optional `sandbox/rep-facing/map-pack`).

### QC — `node scripts/qc-twin-smoke.mjs` (tip `2b76e3a`)

**FAIL** (exit 1) — seeds + libs green; remaining page gaps are later waves:

| Category | Present | Missing |
|----------|---------|---------|
| Seeds (21) | **21** | 0 |
| Shared libs | `nav.ts`, **`data.ts`** | — |
| Pages (23) | 10 | 13: `page.tsx`, `admin/dashboard`, `admin/orders`, `admin/pulse`, `admin/pulse/signals`, `admin/payouts`, `admin/commissions`, `admin/settlements`, `admin/users`, `admin/rep-assignments`, `admin/reports`, `inventory`, `orders` |

Cleared vs wave 1: all seeds, login, merch (admin+rep), inventory cluster, warehouses, shopify/stores (via ledgers tip).

### QC — `npx tsc --noEmit` (tip `2b76e3a`, `node_modules` symlinked from shared checkout)

**PASS** (exit 0). Auth/data foundation unblocks shell + merged domain pages.

### Wave 3 / next recommendation (superseded — see Wave 3 below)

---

## Wave 3 — 2026-09-16 (orders → shopify → pulse/CRM/payouts → link-crawl QA)

| Field | Value |
|-------|-------|
| Integration tip | `b3ee8de` (QC log; link-crawl merge `fb3495c`) |
| Worktree | `/private/tmp/d2r-merch-integration` |
| Base (start of wave 3) | `eb39d09` |

### Merged

| Branch | Tip | Result |
|--------|-----|--------|
| `sandbox/orders/admin-list-sample` | `a3dfd19` | Merge → `cd73d5f`. Admin orders list + drafts + live headers via `getOrdersSnapshot()`. Backlog add/add: **kept ours** (already contained Orders section). |
| `sandbox/shopify/stores-and-health` | `65619d7` | **Already ancestor** of tip (via ledgers preland) — `git merge` → Already up to date. Health table + stores retained. |
| `sandbox/shopify/webhooks-automation-logs` | `a0da9c7` | Merge → `5dd189a`. HMAC webhooks, ops/install logs, automation stubs, CLI scripts. Conflicts: `.env.example` (union placeholders + `CRON_SECRET`); backlog (kept inventory sections + webhooks append-log row). **No secrets committed.** |
| `sandbox/pulse/dashboard-signals` | `9aeb28f` | Merge → `8c8c189`. Admin dashboard + pulse cluster. Backlog: kept ours, appended Pulse section. |
| `sandbox/crm/users-and-assignments` | `9e37b1b` | Merge → `c389414`. Users + rep-assignments pages. Backlog: kept ours (CRM section already present). |
| `sandbox/payouts/reports-shell` | `edaf36d` | Merge → `89c746c`. Payouts/commissions/settlements/reports shells. Backlog: kept ours + appended unique payouts tip sections. |
| `sandbox/qa/link-crawl-build` | `65b3ad4` | Registered in `BRANCH-MATRIX.md` (`e7a6099`), then merge → `fb3495c`. Cut from older `3499bc3`. **Prefer** `LINK-AUDIT.md` + `PENDING_LANE_TITLES` / PendingLane; **kept ours** on wave2/3 domain page conflicts (businesses, commissions, payouts, settlements, stores, inventory/transfers). Union `.gitignore` + `package.json` automation scripts. |

### Conflicts (link-crawl)

| Path | Resolution |
|------|------------|
| Domain `page.tsx` add/add (8 files) | **Kept ours** (newer wave 2/3 parity). |
| `d2r-app/.gitignore` | Union Next defaults + runtime ignore paths. |
| `d2r-app/package.json` | Union scripts (webhook verify + automation runners). |

### Registered earlier this wave

| Branch | Tip | Note |
|--------|-----|------|
| `sandbox/qa/link-crawl-build` | `65b3ad4` | Now **merged**. Not pushed. |

### Still deferred

| Branch | Tip | Notes |
|--------|-----|-------|
| `sandbox/rep-facing/map-pack` | `4c845fa` | Rep-facing map pack (optional peripheral). |
| Finance/CRM PendingLane stubs | — | accounts/contacts/locations/payments/deposits/receipts/etc. stay PendingLane until owning lanes ship tables. |

### QC — `node scripts/qc-twin-smoke.mjs` (tip `fb3495c`)

**PASS** (exit 0) — 21/21 seeds, 23/23 pages.

### QC — `npx tsc --noEmit` (tip `fb3495c`)

**PASS** (exit 0).

### Remaining gaps (non-smoke)

- PendingLane stubs still intentional for unmapped admin finance/CRM chrome (`LINK-AUDIT.md`).
- Rep-facing map-pack not merged.
- Live export dir optional for smoke (absent locally).
- No push; no secrets.

---

## Wave 1 historical notes

(See prior tip `e45bc08` commit for wave-1 QC narrative.)
