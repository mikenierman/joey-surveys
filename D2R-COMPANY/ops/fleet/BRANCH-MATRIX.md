# Sandbox branch matrix — single-issue isolation

**Policy:** `sandbox/<area>/<single-issue>` · one issue per branch · one concern per commit · no push to `main` · no force push.

**Rollback (prefer in this order):**
1. Before merge: delete the branch (`git branch -D …` / close PR).
2. After merge to integration: `git revert <merge-or-commit-sha>` (creates a new commit; safe).
3. Never `reset --hard` shared remotes.

Integration target (until cutover): prefer merging sandboxes into `main` only via reviewed PR after QC gates, or into a temporary `integration/twin-parity` if Traffic Controller opens one. **Do not push directly to `main`.**

---

## Active / planned sandboxes

| Branch | Single issue | Lane | Allowed paths (summary) | Rollback | Merge after |
|--------|--------------|------|-------------------------|----------|-------------|
| `sandbox/traffic-controller` | Fleet docs + QC smoke harness | 0 Traffic | `ops/fleet/**`, backlog, `qc-twin-smoke.mjs` | `git revert` or delete branch | — (docs anytime) |
| `sandbox/shell/nav-and-admin-layout` | Align ADMIN_NAV/REP_NAV + admin layout with SITE-MAP | 1 Shell | nav, layouts, ui, auth shell | delete branch / revert | — (wave 1) |
| `sandbox/shell/dev-auth-login` | Offline DEV_AUTH login parity for audit | 1 Shell | login, api/auth, auth.ts | delete / revert | shell/nav |
| `sandbox/data/seed-shape-normalize` | Fix seed loaders to live shapes (items vs rows, users, pulse, transfers) | 2 Data | `data.ts`, `store.ts`, seeds | revert (high impact — first) | shell |
| `sandbox/data/ingest-live-2026-09-16` | Re-ingest live captures into seeds without UI drift | 2 Data | scripts + seed JSON only | delete / revert | seed-shape |
| `sandbox/merchandising/admin-table-headers` | Admin merch table = live Q3 headers + seed | 3 Merch | admin/merchandising, merch components, merch seeds | delete / revert | data loaders |
| `sandbox/merchandising/period-switcher` | Period combobox parity (Q2–Q5) | 3 Merch | merch-period-switcher, merchandising lib/pages | delete / revert | admin-table-headers |
| `sandbox/merchandising/rep-field-page` | Rep `/merchandising` seed-backed | 3 Merch | app/merchandising | delete / revert | period-switcher |
| `sandbox/inventory/levels-table` | `/admin/inventory` live headers from seed | 4 Inv | admin/inventory/page, inventory-sample | delete / revert | data loaders |
| `sandbox/inventory/ledgers-table` | Ledgers/performance from ledger-performance seed | 4 Inv | ledgers + performance pages | delete / revert | levels-table |
| `sandbox/inventory/transfers-table` | Transfers live headers + API list shape | 4 Inv | transfers pages + api/transfers | delete / revert | ledgers |
| `sandbox/inventory/warehouses-table` | Warehouses columns Address/ZIP/Created | 4 Inv | warehouses page + seed | delete / revert | transfers |
| `sandbox/inventory/brand-levels-refresh` | `/admin/inventory/refresh` from brand-levels seed | 4 Inv | refresh page | delete / revert | warehouses |
| `sandbox/inventory/audit-stub` | Audit route stub matching mapped UI | 4 Inv | audit page | delete / revert | brand-levels |
| `sandbox/orders/admin-po-table` | Admin orders PO columns = live | 5 Orders | admin/orders, orders-table, orders seed | delete / revert | inventory wave start OK in parallel after data |
| `sandbox/orders/drafts-and-detail` | Drafts list + `/orders/[id]` seed detail | 5 Orders | drafts, [id], create-order-form | delete / revert | admin-po-table |
| `sandbox/orders/rep-orders-parity` | Rep `/orders` mirrors admin columns | 5 Orders | app/orders | delete / revert | drafts-and-detail |
| `sandbox/shopify/health-table` | Shopify health 9/29 table from seed | 6 Shopify | admin/shopify, shopify seeds | delete / revert | orders (or parallel after data) |
| `sandbox/shopify/brand-stores-registry` | `/admin/stores` from stores seed | 6 Shopify | admin/stores | delete / revert | health-table |
| `sandbox/shopify/sync-status-stub` | Sync/status API stubs offline-safe | 6 Shopify | api/shopify, shopify.ts | delete / revert | brand-stores |
| `sandbox/pulse/signals-kpis` | `/admin/pulse/signals` live KPI shape | 7 Pulse | pulse pages, pulse components, seed | delete / revert | shopify optional |
| `sandbox/pulse/dashboard-hub` | Dashboard cards from available seeds | 7 Pulse | admin/dashboard | delete / revert | signals-kpis |
| `sandbox/payouts/tables-seed` | Payouts/rules/commissions/settlements seed tables | 8 Payouts | payouts/commissions/settlements pages + seeds | delete / revert | pulse |
| `sandbox/crm/users-table` | Users Name/Email/Role live headers | 9 CRM | users page, add-user-form, users seed | delete / revert | payouts |
| `sandbox/crm/rep-assignments-page1` | Assignments page-1 columns from seed | 9 CRM | rep-assignments, assignments seed | delete / revert | users-table |
| `sandbox/crm/retail-stores-stub` | Retail stores / businesses listing | 9 CRM | retail-stores, businesses (coord inventory if shared) | delete / revert | rep-assignments |
| `sandbox/reports/hub-and-runners` | Reports hub + four runners seed-backed stubs | 10 Reports | admin/reports/** | delete / revert | crm |

---

## Rollback command cheatsheet

```bash
# Unmerged sandbox — discard local work
git checkout main
git branch -D sandbox/<area>/<single-issue>

# Merged via merge commit
git revert -m 1 <merge-commit-sha>

# Merged as single squash commit
git revert <squash-commit-sha>

# List files touched by a sandbox (conflict audit)
git log main..sandbox/<area>/<single-issue> --name-only --pretty=format:
```

---

## Parallelism rules

- **Safe parallel:** different lanes with disjoint path globs (e.g. merchandising + reports).
- **Serialize:** any two branches both touching `data.ts`, `nav.ts`, or the same `page.tsx`.
- **Data first:** UI table PRs that depend on live-shaped seeds must wait for `sandbox/data/seed-shape-normalize` (or rebase onto it).

See [`MERGE-ORDER.md`](./MERGE-ORDER.md) for wave dependencies.
