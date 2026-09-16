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

### Registered — not merged yet

| Branch | Tip | When to merge |
|--------|-----|---------------|
| `sandbox/shopify/stores-and-health` | `65619d7` | Shopify wave **first** (may partially overlap files already landed via ledgers tip — expect content conflicts). |
| `sandbox/shopify/webhooks-automation-logs` | `a0da9c7` | Shopify wave **after** `stores-and-health`. HMAC → runtime ops/install logs; admin install+automation UI; POST automations; CLI; gitignored `data/runtime/*`. Parent lineage from stores-and-health. **Not pushed. Do not merge during data/merch/inventory.** |

See `BRANCH-MATRIX.md` / `MERGE-ORDER.md` wave 6.4.

### Still deferred (later waves)

Orders, pulse, payouts, CRM, reports, rep-facing map-pack, link-crawl QA — leave on sandbox tips. Full `stores-and-health` + `webhooks-automation-logs` wait for shopify wave even though ledgers pre-landed some shopify paths.

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

### Wave 3 / next recommendation

1. **Orders wave** (`sandbox/orders/admin-list-sample` `a3dfd19`) — clears admin/rep orders smoke misses; disjoint from shopify.
2. **Pulse + payouts + CRM + reports** — clear remaining smoke pages.
3. **Shopify wave (serialize):** merge `sandbox/shopify/stores-and-health` (`65619d7`) first (expect conflicts with ledgers-prelanded shopify paths), **then** `sandbox/shopify/webhooks-automation-logs` (`a0da9c7`). Do **not** merge webhooks before stores-and-health.
4. Optional: root `page.tsx` + `admin/dashboard` from pulse sandbox (`9aeb28f`).

---

## Wave 1 historical notes

(See prior tip `e45bc08` commit for wave-1 QC narrative.)
