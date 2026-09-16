# Pulse / Dashboard domain — twin status

**Domain:** Admin ops overview + Pulse health KPIs  
**Twin app:** `d2r-app/`  
**Mapped:** 2026-09-16  
**Site map refs:** [`SITE-MAP.md`](../../../SITE-MAP.md) · [`SITE-MAP-INTERACTIONS.json`](../../../SITE-MAP-INTERACTIONS.json)

---

## Scope

| Live route | Twin route | Status | Notes |
|------------|------------|--------|-------|
| `/admin/dashboard` | `/admin/dashboard` | **seeded** | Ledger + pulse sample + platform snapshot KPIs |
| `/admin/pulse` | `/admin/pulse` | **seeded** | Hub with ledger context + full signal dict |
| `/admin/pulse/signals` | `/admin/pulse/signals` | **seeded** | Adam Scott capture; KPI grid + detail table |
| `/admin/pulse/goals` | — | **stub (mapped)** | Subnav placeholder only |
| `/admin/pulse/health` | — | **stub (mapped)** | Subnav placeholder only |
| `/admin/pulse/scores` | — | **stub (mapped)** | Subnav placeholder only |
| `/test/dashboard` | — | **missing** | Internal test route; not in twin |

---

## Seeds & captures

| Seed file | Source export | Used on |
|-----------|---------------|---------|
| `data/seed/pulse-signals.json` | `exports/2026-09-16/live/pulse-signals-AdamScott-live.json` | Dashboard (sample row), Pulse hub, Signals |
| `data/seed/ledger-performance.json` | `ledger-performance-live.json` / vault | Dashboard, Pulse hub |
| `data/seed/warehouses.json` | `warehouses-live.json` | Dashboard platform snapshot |
| `data/seed/users.json` | `users-live.json` | Dashboard user count |
| `data/seed/shopify-health.json` | `shopify-health-live.json` | Dashboard Shopify healthy/total |
| `data/seed/orders.json` | `orders-page1-live.json` | Dashboard orders sample + page hint |

**Shape fix (this pass):** Live pulse capture stores KPIs as a **dict** under `signals` (`reorderRate`, `score`, `revenue`, …), not a list of alert rows. Twin loaders now expect `{ meta, signals: { … } }`. Legacy list shape is ignored.

---

## Pages & code touched

| File | Change |
|------|--------|
| `src/lib/data.ts` | `getPulseSignalsCapture`, `getPulseSignalKpis`, `getDashboardKpis`, label/format helpers |
| `src/components/pulse-kpi-grid.tsx` | Reusable KPI stat grid |
| `src/components/pulse-subnav.tsx` | Pulse tab strip (overview + signals live; goals/health/scores dashed stubs) |
| `src/app/admin/dashboard/page.tsx` | Three KPI bands: ledger, pulse sample, platform snapshot; pulse quick link |
| `src/app/admin/pulse/page.tsx` | Hub with ledger context + signal dict table |
| `src/app/admin/pulse/signals/page.tsx` | **New** — dedicated signals mirror |

---

## Live parity (Adam Scott sample)

Captured signal values (Jun 19 – Sep 16):

| Signal | Value |
|--------|-------|
| Reorder rate | 97% |
| Reorder miss rate | 90% |
| New doors | 2 |
| Orders | 78 |
| Pulse score | 74 |
| Active stores | 65 |
| On-hand share | 58% |
| Revenue | $22,408 |
| On-hand fee | 7% |
| Drop-ship fee | 5% |

Twin renders all ten fields on `/admin/pulse` and `/admin/pulse/signals`. Dashboard shows score, revenue, orders, active stores, reorder rate as headline pulse sample.

---

## UI fidelity

| Control | Live | Twin |
|---------|------|------|
| Rep combobox | Yes (Adam Scott sample) | Not wired — single-rep seed only |
| Date range combobox | Yes | Not wired — range shown in subtitle |
| Refresh button | Mapped | Not implemented |
| Goals / health / scores tabs | Mapped routes | Dashed stub labels in subnav |
| Activity feed table | Inferred on dashboard | Not built |

---

## Remaining gaps

1. **Multi-rep pulse** — only Adam Scott captured; rep switcher needs more live dumps or API.
2. **Pulse sub-routes** — `/admin/pulse/goals`, `/health`, `/scores` need captures before twin pages.
3. **Dashboard activity table** — inferred in site map; no export yet.
4. **Real-time refresh** — dashboard Refresh button not connected (offline seed is static).
5. **Cross-rep pulse rollup** — dashboard could aggregate when multi-rep seeds exist.

---

## Verify locally

```bash
cd d2r-app
npm run dev
# Login (DEV_AUTH) → /admin/dashboard, /admin/pulse, /admin/pulse/signals
```

Re-ingest pulse capture:

```bash
node d2r-app/scripts/ingest-live-exports.mjs
# maps *pulse* → data/seed/pulse-signals.json
```

---

## Coverage summary

| Bucket | Count |
|--------|-------|
| Seeded twin pages | 3 |
| Mapped stubs (subnav only) | 3 |
| Missing | 1 (`/test/dashboard`) |

**Domain readiness:** suitable for offline audit of dashboard KPI bands and single-rep pulse signals; not yet parity for pulse sub-modules or rep/date filters.
