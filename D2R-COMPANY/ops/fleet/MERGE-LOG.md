# Merge log — `sandbox/integration`

Local-only integration tip. **Do not push** until Traffic Controller opens a reviewed PR.

---

## Wave 1 — 2026-09-16

| Field | Value |
|-------|-------|
| Integration tip | `3499bc3` |
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

No conflicts on shell source (`nav.ts`, layout, middleware, `ui.tsx`).

### Not merged (deferred)

Inventory / merch / orders / shopify / pulse / payouts / CRM / reports / rep-facing map-pack — left on their sandbox tips.

### QC — `node scripts/qc-twin-smoke.mjs` (integration tip)

**FAIL** (exit 1). Expected: wave 1 only brings shell + smoke harness; domain pages/seeds live on later sandboxes.

| Category | Present | Missing |
|----------|---------|---------|
| Seeds (21) | 0 | all 21 under `data/seed/` |
| Pages (23) | 0 | all 23 required `page.tsx` routes |
| Shared libs | `src/lib/nav.ts` | `src/lib/data.ts` |

Live export dir under `D2R-COMPANY/ops/exports/2026-09-16/live` not present in this worktree (optional for smoke).

### QC — `npx tsc --noEmit` (integration tip)

**FAIL** (exit 2) when borrowing `package.json` / `node_modules` from the dirty shared checkout (integration tip has no app scaffold):

- `src/app/admin/layout.tsx` → cannot find `@/lib/auth`
- `src/components/ui.tsx` → cannot find `@/lib/auth`

Shell alone does not ship `auth` or the rest of the Next app; full `tsc` waits on wave 2+ / base app skeleton.

### Shared dirty checkout (reference only — not this tip)

Smoke still **FAIL**: missing transfers / warehouses / orders / payouts / commissions / settlements / reports pages (domain sandboxes not on shared tree). Confirms wave-1-only tip is the correct merge target.

### Wave 2 recommendation

Per `MERGE-ORDER.md` / `BRANCH-MATRIX.md`:

1. **`sandbox/data/seed-shape-normalize`** (planned) — land `src/lib/data.ts` live-shaped getters; hard gate for table UIs.
2. **`sandbox/data/ingest-live-2026-09-16`** (planned) — seeds from `exports/.../live/` (clears 21 seed misses).
3. Then **Wave 3 merch** (`sandbox/merch/admin-q3-table` `af91c3a`, `sandbox/merch/rep-facing-shell` `28b1aa6`) before inventory — independent once seeds exist.
4. **Wave 4 inventory** cluster after data (`00b0784`, `2813564`, `cc76792`, `bd00d64`).
5. Optional shell follow-up: `sandbox/shell/dev-auth-login` (wave 1.2) if local audit login still blocked — can parallel data but prefer before heavy UI QC.

Do **not** merge domain UI before data loaders; pulse (`9aeb28f`) explicitly depends on shell + `@/lib/data`.
