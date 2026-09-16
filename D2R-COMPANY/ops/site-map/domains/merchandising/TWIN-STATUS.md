# Merchandising domain — twin status

**Updated:** 2026-09-16  
**Program:** `joey_circle_k` (JOEY Circle K field merchandising)  
**Live reference:** `https://app.direct2retailers.com/admin/merchandising`

## Routes

| Route | Role | Twin status | Notes |
|-------|------|-------------|-------|
| `/admin/merchandising` | admin, manager, client | **Offline 1:1 (rollup)** | Full rep table + period switcher from vault seed |
| `/merchandising` | rep | **Offline 1:1 (rep rollup)** | Matched rep row + optional live iframe when `NEXT_PUBLIC_MERCH_APP_URL` set |

## Live columns matched

| Live column | Seed field | Twin label |
|-------------|------------|------------|
| Rep | `rep` | Rep |
| Assigned | `assigned` | Assigned |
| Completed | `completed` | Completed |
| Within window | `withinWindow` | Within window |
| Complete % | `completePct` | Complete % |
| Unpaid visits | `unpaidVisits` | Unpaid visits |

Admin page also shows summary stat cards (rep count, totals, aggregate complete %).

## Seed data

| File | Period | Reps | Source |
|------|--------|------|--------|
| `d2r-app/data/seed/merchandising-joey_circle_k-2026-Q3.json` | 2026-Q3 | 41 | live-scrape 2026-09-16 |
| `d2r-app/data/seed/merchandising-joey_circle_k-2026-Q2.json` | 2026-Q2 | 41 | vault-baseline 2026-09-13 |

Vault exports (canonical copies):

- `D2R-COMPANY/ops/exports/2026-09-16/from-vault-baseline-2026-09-13/merchandising/`
- `D2R-COMPANY/ops/exports/2026-09-16/live/merchandising-joey_circle_k-2026-Q3-live.json`

## Period switcher

Switcher mirrors live period list from Q3 export:

`2026-Q3` · `2026-Q2` · `2026-Q1` · `2025-Q4` · `2025-Q3`

- **Selectable (vault present):** 2026-Q3, 2026-Q2  
- **Shown disabled:** 2026-Q1, 2025-Q4, 2025-Q3 — no seed files yet

Query param: `?period=2026-Q2` on both admin and rep routes.

## Implementation

| Piece | Path |
|-------|------|
| Data layer | `d2r-app/src/lib/merchandising.ts` |
| Period switcher | `d2r-app/src/components/merch-period-switcher.tsx` |
| Shared table | `d2r-app/src/components/merch-rep-table.tsx` |
| Admin page | `d2r-app/src/app/admin/merchandising/page.tsx` |
| Rep page | `d2r-app/src/app/merchandising/page.tsx` |

Rep matching: session `name` → vault `users.json` email lookup → fuzzy name match against merch `rep` field.

## Parity gaps (known)

| Gap | Severity | Mitigation |
|-----|----------|------------|
| Visit-level detail (GPS, photos, surveys) | P0 for field workflow | Separate merch app; iframe at `/merchandising` when online |
| Q1 / 2025 periods | P2 | Disabled in switcher until exports ingested |
| Q2 completion counts all zero in vault | Data | Note in Q2 meta; live may differ — re-export when needed |
| Rep demo user (`rep@…` / "Field Rep") | P2 | No row match unless email maps via `users.json` |
| Program picker (multi-program) | P2 | Single program `joey_circle_k` hardcoded in seed filenames |

## Verification checklist

- [ ] `/admin/merchandising` — 41 rows, live column headers, default 2026-Q3
- [ ] `/admin/merchandising?period=2026-Q2` — switches to Q2 vault data
- [ ] Disabled periods (2026-Q1, 2025-Q4, 2025-Q3) render but are not clickable
- [ ] `/merchandising` as Adam Scott email — shows single rep row + stat cards
- [ ] `/merchandising` without `NEXT_PUBLIC_MERCH_APP_URL` — no iframe, still usable offline
- [ ] Daniel Kelly Q3 spot check: assigned 197, completed 3, complete 2%, unpaid 3

## Refresh SOP

1. Capture live admin merchandising table (Q3 + any new periods).
2. Drop JSON into `D2R-COMPANY/ops/exports/YYYY-MM-DD/live/`.
3. Run `node d2r-app/scripts/ingest-live-exports.mjs` or copy to `d2r-app/data/seed/`.
4. Update this file’s seed table and verification rows.
