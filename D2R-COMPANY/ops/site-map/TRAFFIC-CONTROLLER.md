# Traffic Controller — offline site-map + twin QC

**Role:** Own canonical maps, schema, merges, twin quality gates. Do **not** re-map every domain; domain mapper + twin-builder agents own folders under `domains/`.

**Canonical docs (TC-owned):**

| File | Purpose |
|------|---------|
| [`../SITE-MAP.md`](../SITE-MAP.md) | Human master inventory |
| [`../SITE-MAP-INTERACTIONS.json`](../SITE-MAP-INTERACTIONS.json) | Machine route map |
| [`../OFFLINE-TWIN-PLAN.md`](../OFFLINE-TWIN-PLAN.md) | Phased offline mirror plan |
| [`../IMPROVEMENTS-BACKLOG.md`](../IMPROVEMENTS-BACKLOG.md) | Live-system improvements (not parity) |
| [`../../d2r-app/PARITY-CHECKLIST.md`](../../d2r-app/PARITY-CHECKLIST.md) | Twin offline status vs site map |
| [`schemas/ROUTE-INTERACTION.schema.md`](./schemas/ROUTE-INTERACTION.schema.md) | Shared interaction schema + rubric |
| [`QC-FINDINGS.md`](./QC-FINDINGS.md) / [`QC-FINDINGS.json`](./QC-FINDINGS.json) | Blocking / open QC issues |
| [`STATUS-BOARD.json`](./STATUS-BOARD.json) | Machine status snapshot |

**Working tree:** `D2R-COMPANY/ops/site-map/domains/<domain>/`  
**Merge log:** `merges/`  
**Twin app:** `d2r-app/` (also symlinked at `D2R-COMPANY/apps/d2r-app`)

---

## Coverage rubric

`captured` | `mapped-ui-only` | `stub-in-twin` | `missing` — see schema doc.

---

## Agent assignments

| Domain | Mapper | Twin-builder | Owned focus |
|--------|--------|--------------|-------------|
| `inventory` | inventory-mapper | inventory-twin-builder | inventory/*, warehouses, transfers |
| `merchandising` | merchandising-mapper | merchandising-twin-builder | admin merch + stores |
| `orders` | orders-mapper | orders-twin-builder | orders, drafts, order-timeline |
| `shopify-brands` | shopify-brands-mapper | shopify-brands-twin-builder | shopify/*, brand stores |
| `crm-assignments` | crm-assignments-mapper | crm-assignments-twin-builder | businesses, accounts, contacts, locations, retail-stores, rep-assignments, users |
| `pulse-dashboard` | pulse-dashboard-mapper | pulse-dashboard-twin-builder | dashboard + pulse/* |
| `payouts` | payouts-mapper | payouts-twin-builder | commissions, settlements, payouts, payments/deposits/receipts |
| `reports` | reports-mapper | reports-twin-builder | reports hub + children |
| `rep-facing` | rep-facing-mapper | rep-facing-twin-builder | /inventory, /orders, /merchandising, auth entry |

Each domain must keep: `README.md`, `MAP.md`, `ROUTES.json` (preferred) and/or `interactions.json`, `TWIN-NOTES.md` (when twin work claimed). Optional: `IMPROVEMENTS.md`, `TWIN-STATUS.md`.

---

## Status board (2026-09-16 ~19:56Z)

**Gates:** `npx tsc --noEmit` ✅ · `npm run lint` ✅

**Canonical routes:** 67 · twin pages: **38** · live capture files tied to routes: **13**  
**Coverage mix:** captured 13 · stub-in-twin 25 · mapped-ui-only 29 · missing 0 (in canonical)

| Domain | Paths | Twin pages | Captured | Mapper | Twin-builder | TC disposition |
|--------|------:|-----------:|---------:|--------|--------------|----------------|
| inventory | 8 | 7 | 5 | awaiting-first-pass* | awaiting-first-pass* | awaiting (artifacts present — set `ready-for-qc`) |
| merchandising | 2 | 1 | 1 | awaiting-first-pass* | awaiting-first-pass* | awaiting |
| orders | 3 | 2 | 1 | awaiting-first-pass* | awaiting-first-pass* | awaiting |
| shopify-brands | 4 | 2 | 2 | awaiting-first-pass* | awaiting-first-pass* | awaiting (health table twin PASS) |
| crm-assignments | 12 | 4 | 3 | awaiting-first-pass* | awaiting-first-pass* | awaiting |
| pulse-dashboard | 6 | 3 | 1 | **complete** | awaiting-first-pass | **ready-for-qc-review** |
| payouts | 10 | 7 | 0 | **complete** | awaiting-first-pass | **ready-for-qc-review** |
| reports | 5 | 5 | 0 | awaiting-first-pass | awaiting-first-pass | awaiting |
| rep-facing | 17 | 7 | 0 | awaiting-first-pass | awaiting-first-pass | awaiting |

\*Artifacts (`MAP.md`, `interactions.json`, `IMPROVEMENTS.md`) already on disk for several domains — update `mapper.status` / `twinBuilder.status` to `ready-for-qc` when self-review done so TC can merge.

---

## QC snapshot (open)

| ID | Severity | Domain | Issue |
|----|----------|--------|-------|
| QC-006 | medium | shopify-brands | ~~missing health table~~ **cleared** |
| QC-PAGINATION | high | cross-cutting | Orders / transfers / assignments only page-1 samples |
| QC-BROWSER | high | cross-cutting | Auth browser CDP empty for agents — interactions still inferred |
| QC-SCHEMA-DUAL | low | cross-cutting | Dual `ROUTES.json` + `interactions.json` — prefer ROUTES for merge |
| QC-HDR-stores-case | low | shopify-brands | Twin "Shop domain" vs live "Shop Domain" |

Header spot-checks: orders snapshot ✅ · businesses ✅ · assignments ✅ · users ✅ · shopify health ✅

Full list: [`QC-FINDINGS.md`](./QC-FINDINGS.md).

---

## Blockers

1. **Browser auth session** not visible to agent MCP (`browser_tabs` empty) → cannot upgrade `inferred` → `live-cdp`.
2. Domain mappers with full artifacts still reporting `awaiting-first-pass` → stalls merge queue.
3. Pagination dumps blocked without export automation / authenticated scrape.

---

## Merge protocol (domain → canonical)

1. Domain sets status → `ready-for-qc`.
2. TC verifies schema + header parity + no secrets.
3. Accept → merge into `SITE-MAP-INTERACTIONS.json`, refresh `SITE-MAP.md` / `PARITY-CHECKLIST.md`, write `merges/YYYY-MM-DD-<domain>.md`.
4. Reject → note in `QC-FINDINGS.md`; domain fixes and resubmits.

**Do not wait for CTO notes. Do not commit secrets. Do not commit unless user asks.**
