# Sandbox branch matrix — single-issue isolation

**Policy:** `sandbox/<area>/<single-issue>` · one issue per branch · one concern per commit · no push to `main` · no force push.

**Rollback (prefer in this order):**
1. Before merge: delete the branch (`git branch -D …` / close PR).
2. After merge to integration: `git revert <merge-or-commit-sha>` (creates a new commit; safe).
3. Never `reset --hard` shared remotes.

Integration target (until cutover): prefer merging sandboxes into `main` only via reviewed PR after QC gates, or into a temporary `integration/twin-parity` if Traffic Controller opens one. **Do not push directly to `main`.**

**Merge order (critical path):** see [`MERGE-ORDER.md`](./MERGE-ORDER.md) —

```
Wave 1 shell → data → merch → inventory → orders → shopify → pulse → payouts → CRM → reports
```

**`sandbox/shell/nav-and-admin-layout` (`7368dbc`) is MERGE WAVE 1 — merge before domain lanes.**

**Naming drift:** agents used `sandbox/merch/*` (not `sandbox/merchandising/*`). Treat planned `sandbox/merchandising/*` rows as superseded by completed `sandbox/merch/*` tips.

---

## Completed sandboxes (local-only tips — not pushed)

| # | Branch | Tip SHA | Single issue | Merge wave | Conflict vs shared tree | Rollback (unmerged) |
|---|--------|---------|--------------|------------|-------------------------|---------------------|
| 1 | `sandbox/shell/nav-and-admin-layout` | `7368dbc` | Grouped ADMIN_NAV, pending-lane middleware (16 routes), AppShell | **1 · first** | High — nav/layout shared | `git branch -D sandbox/shell/nav-and-admin-layout` · or `git revert 7368dbc` |
| 2 | `sandbox/traffic-controller` | `89b722f` | Fleet docs + QC smoke (`257090a` base) | 0 · anytime | Low — docs/scripts | `git branch -D sandbox/traffic-controller` · or revert tip |
| 3 | `sandbox/inventory/admin-levels-table` | `00b0784` | `/admin/inventory` live headers + Adjust stub | 4 | High — inventory page | `git branch -D …` · `git revert 00b0784` |
| 4 | `sandbox/inventory/warehouses-businesses` | `2813564` | `/admin/warehouses` + `/admin/businesses` | 4 | High | `git revert 2813564` |
| 5 | `sandbox/inventory/ledgers-brand-levels` | `cc76792` | Ledgers + refresh/brand-levels (cleaned seed) | 4 | High | `git revert cc76792` |
| 6 | `sandbox/inventory/transfers-admin` | `bd00d64` | Transfers admin + rep mirror (feature `5a23801`) | 4 | High | `git revert bd00d64` (or `5a23801` for page-only) |
| 7 | `sandbox/merch/admin-q3-table` | `af91c3a` | Admin merch Q3 table + period switcher | 3 | High | `git revert af91c3a` |
| 8 | `sandbox/merch/rep-facing-shell` | `28b1aa6` | Offline `/merchandising` list/status shell | 3 | High | `git revert 28b1aa6` |
| 9 | `sandbox/orders/admin-list-sample` | `a3dfd19` | Admin orders live headers + page1/~1034 banner, drafts stub | 5 | High | `git revert a3dfd19` |
| 10 | `sandbox/shopify/stores-and-health` | `65619d7` | `/admin/stores` + `/admin/shopify` health 9/29 | 6 | High | `git revert 65619d7` |
| 11 | `sandbox/pulse/dashboard-signals` | `9aeb28f` | Dashboard + pulse signals/goals/scores/health stubs | 7 | High — also depends on `@/lib/data` / PulseKpiGrid (shell/data) | `git revert 9aeb28f` · **merge after shell+data** |
| 12 | `sandbox/payouts/reports-shell` | `edaf36d` | Commissions/payouts/settlements/reports offline shells | 8 | High | `git revert edaf36d` |
| 13 | `sandbox/crm/users-and-assignments` | `9e37b1b` | Users (189) + rep-assignments sample + 11314 banner | 9 | High | `git revert 9e37b1b` |
| 14 | `sandbox/rep-facing/map-pack` | `b5cd315` | Rep-facing + reports map packs + fleet registry/QC board | docs | Low — docs only | `git branch -D sandbox/rep-facing/map-pack` · `git revert b5cd315` |

### Drop / audit cheatsheet

```bash
git checkout main   # or any non-sandbox branch
git branch -D sandbox/<area>/<single-issue>

# Or keep branch, undo tip:
git checkout sandbox/<area>/<single-issue>
git revert <tip-sha> --no-edit

# Conflict audit before merge:
git show <tip-sha> --name-only
```

**QC rule:** Do not cherry-pick both a sandbox tip and the shared-tree copy of the same `page.tsx`. Prefer one lineage; document the loser in [`RECONCILE-STATUS.md`](./RECONCILE-STATUS.md).

Many tips also touch `D2R-COMPANY/ops/IMPROVEMENTS-BACKLOG.md` — expect docs-only merge conflicts.

---

## Planned / superseded names

| Planned name | Status |
|--------------|--------|
| `sandbox/merchandising/admin-table-headers` | **Superseded** by `sandbox/merch/admin-q3-table` (`af91c3a`) |
| `sandbox/merchandising/period-switcher` | **Folded** into `af91c3a` |
| `sandbox/merchandising/rep-field-page` | Prefer `sandbox/merch/rep-facing-shell` (`28b1aa6`) |
| `sandbox/inventory/levels-table` | Prefer `sandbox/inventory/admin-levels-table` (`00b0784`) |
| `sandbox/inventory/warehouses-table` | Prefer `sandbox/inventory/warehouses-businesses` (`2813564`) |
| `sandbox/inventory/ledgers-table` / `brand-levels-refresh` | Prefer `sandbox/inventory/ledgers-brand-levels` (`cc76792`) |
| `sandbox/inventory/transfers-table` | Prefer `sandbox/inventory/transfers-admin` (`bd00d64`) |
| `sandbox/orders/admin-po-table` | Prefer `sandbox/orders/admin-list-sample` (`a3dfd19`) |
| `sandbox/shopify/health-table` + `brand-stores-registry` | Prefer `sandbox/shopify/stores-and-health` (`65619d7`) |
| `sandbox/pulse/signals-kpis` + `dashboard-hub` | Prefer `sandbox/pulse/dashboard-signals` (`9aeb28f`) |
| `sandbox/payouts/tables-seed` | Prefer `sandbox/payouts/reports-shell` (`edaf36d`) |
| `sandbox/crm/users-table` + `rep-assignments-page1` | Prefer `sandbox/crm/users-and-assignments` (`9e37b1b`) |
| `sandbox/reports/hub-and-runners` | Pages often on `edaf36d`; map pack under `domains/reports/` |
| `sandbox/shell/dev-auth-login` | Still planned |
| `sandbox/data/seed-shape-normalize` | Still planned (wave 2) |
| `sandbox/data/ingest-live-2026-09-16` | Still planned (wave 2) |

---

## Parallelism rules

- **Safe parallel:** different lanes with disjoint path globs (e.g. merch + reports docs).
- **Serialize:** any two branches both touching `data.ts`, `nav.ts`, or the same `page.tsx`.
- **Shell first:** domain PRs must not rewrite `nav.ts` — open a shell follow-up.
- **Data first:** UI table PRs that depend on live-shaped seeds wait for wave 2 (or rebase onto shared loaders).

See [`MERGE-ORDER.md`](./MERGE-ORDER.md) for wave dependencies.
