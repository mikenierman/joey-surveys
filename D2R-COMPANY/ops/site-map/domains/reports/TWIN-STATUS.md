# Reports domain — twin status

**Updated:** 2026-09-16  
**Twin app:** `d2r-app/`  
**Live app:** https://app.direct2retailers.com  
**Map:** [`MAP.md`](./MAP.md) · [`interactions.json`](./interactions.json)

## Summary

| Band | Status |
|------|--------|
| **Map pack** | **green** — MAP · ROUTES · interactions · IMPROVEMENTS · TWIN-STATUS |
| **Twin fidelity** | **yellow** — hub + four runners are seed-proxied stubs; **no live report-runner capture** |

Sibling: commissions report overlaps finance lane (`../payouts/`); prefer payouts seed for `/admin/reports/commissions` until a dedicated report export lands.

---

## Route matrix

| Live route | Twin page | Seed / proxy | Status |
|------------|-----------|--------------|--------|
| `/admin/reports` | `src/app/admin/reports/page.tsx` | link list | **stub** |
| `/admin/reports/rep-sales` | `src/app/admin/reports/rep-sales/page.tsx` | `ledger-performance.json` | **proxy stub** |
| `/admin/reports/brand-sales` | `src/app/admin/reports/brand-sales/page.tsx` | ledger brand rollup | **proxy stub** |
| `/admin/reports/inventory-reports` | `src/app/admin/reports/inventory-reports/page.tsx` | `inventory-sample.json` | **proxy stub** |
| `/admin/reports/commissions` | `src/app/admin/reports/commissions/page.tsx` | `commissions.json` | **proxy stub** (payouts lane) |

**Sandbox tip for pages:** often on `sandbox/payouts/reports-shell` (`edaf36d`) — conflict risk vs shared-tree / missing pages on mid-flight checkouts.

---

## Live capture gap

- `exports/2026-09-16/live/` has **zero** report-runner JSON.
- Signed-out HTML is Clerk shell only.
- Twin headers are **proxies**, not live-parity claims.

---

## Remaining gaps

1. Authenticated scrape of hub chrome + each runner (headers, Run/Export, period semantics).
2. Dedicated report seeds (stop proxying ledger/inventory/commissions operational tables).
3. Async export UX if live reports are job-based.
4. Smoke mid-flight may list `/admin/reports` missing when checkout lacks payouts/reports shell.

---

## Pack readiness

**ready-for-qc-review** (docs). Twin remains yellow until live report captures exist.
