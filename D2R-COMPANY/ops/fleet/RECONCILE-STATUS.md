# Twin rebuild reconcile status

**Date:** 2026-09-16 (TC follow-up)  
**Role:** Traffic Controller  
**Twin app:** `d2r-app/`  
**Working tree:** Mixed shared-checkout + isolated sandboxes. **Shell is MERGE WAVE 1** (`sandbox/shell/nav-and-admin-layout` @ `7368dbc`) — merge before domain lanes.

**Did not push.** No secrets.

---

## qc-twin-smoke (this pass)

```bash
cd d2r-app && node scripts/qc-twin-smoke.mjs
```

| Result | Detail |
|--------|--------|
| **FAIL** (exit 1) | Expected mid-flight — current checkout lacks several domain pages |
| Seeds checked | 21 |
| Pages checked | 23 |
| Live export dir | present |

**Missing pages reported:**

- `src/app/admin/inventory/transfers/page.tsx`
- `src/app/admin/warehouses/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/payouts/page.tsx`
- `src/app/admin/commissions/page.tsx`
- `src/app/admin/settlements/page.tsx`
- `src/app/admin/reports/page.tsx`

Those artifacts live on isolated tips (`bd00d64`, `2813564`, `a3dfd19`, `edaf36d`, …) or shared-tree copies — not all present on every branch checkout.

---

## Domain pack / twin readiness

| Domain | Pack | Twin | TC disposition |
|--------|------|------|----------------|
| inventory | green | green/yellow (sample depth) | **ready-for-qc-review** |
| merchandising | green | green | **ready-for-qc-review** |
| orders | green | yellow (page-1) | **ready-for-qc-review** |
| shopify-brands | green | green | **ready-for-qc-review** |
| crm-assignments | green | yellow (assignments page-1) | **ready-for-qc-review** |
| pulse-dashboard | green | yellow (sub-routes stub) | **qc-pass** (caveats) |
| payouts | green | yellow (scaffold / no live finance) | **qc-pass-conditional** |
| reports | **green** (TWIN-STATUS filled this pass) | yellow (proxies) | **ready-for-qc-review** |
| rep-facing | **green** | **yellow** (missing ledgers/stores/create) | **ready-for-qc-review** |

---

## QC — pulse-dashboard

**Verdict: PASS** (with documented gaps)

| Gate | Result |
|------|--------|
| Map pack | MAP + interactions + ROUTES + TWIN-STATUS present |
| KPI shape | Seed + live = dict; `getPulseSignalKpis` rejects list shape — QC-005 cleared |
| Twin pages | `/admin/dashboard`, `/admin/pulse`, `/admin/pulse/signals` (+ goals/health/scores stubs) |
| Headers / KPIs | Adam Scott 10-signal dict mirrored |
| Live capture | `pulse-signals-AdamScott-live.json` |
| Gaps (non-blocking for pack accept) | Rep/date comboboxes unwired; goals/health/scores stub-only; no activity feed |

**Sandbox:** `sandbox/pulse/dashboard-signals` @ `9aeb28f` — merge after shell+data; conflict vs shared-tree pulse.

---

## QC — payouts

**Verdict: PASS-CONDITIONAL** (scaffold accepted; live finance blocked)

| Gate | Result |
|------|--------|
| Map pack | Complete |
| Twin pages | On `sandbox/payouts/reports-shell` @ `edaf36d` (commissions/settlements/payouts/rules/reports) |
| Live capture | **None** — scaffold seeds only |
| Missing | `/admin/payments`, `/admin/deposits`, `/admin/receipts` |
| Smoke | Pages often missing mid-flight until `edaf36d` merged |

Accept map + offline shells for QC; do **not** claim live finance parity.

---

## Open cross-cutting (unchanged)

| ID | Sev | Issue |
|----|-----|-------|
| QC-PAGINATION | high | Orders / transfers / assignments page-1 only |
| QC-BROWSER | high | Auth CDP parent-only — do not invent credentials |
| QC-SCHEMA-DUAL | low | Prefer `ROUTES.json` for merge |

---

## Isolation note

Parallel agents also wrote the **shared** checkout. Isolated tips above are the preferred rollback units. Prefer sandbox tip vs shared-tree duplicate for the same page — never merge both.
