# Merchandising domain — twin status

**Updated:** 2026-09-17  
**Program:** `joey_circle_k` (JOEY Circle K field merchandising)  
**Live reference:** `https://app.direct2retailers.com/admin/merchandising`  
**Staging twin:** `https://d2r-app-staging.vercel.app` · Dashboard tab `/admin/dashboard?tab=merchandising` embeds `https://joey-surveys.vercel.app`

## Routes

| Route | Role | Twin status | Notes |
|-------|------|-------------|-------|
| `/admin/dashboard?tab=merchandising` | admin | **Field app iframe** | Full JOEY visit engine embed |
| `/admin/merchandising` | admin, manager, client | **Offline 1:1 (rollup)** | Full rep table + period switcher + field embed |
| `/admin/merchandising/stores` | admin | **Shell + empty grid** | Filters URL-stable; no store-level seed; field embed below |
| `/merchandising` | rep | **Offline rollup + iframe** | Matched rep row + route list + field app iframe |

## Live columns matched

| Live column | Seed field | Twin label |
|-------------|------------|------------|
| Rep | `rep` | Rep |
| Assigned | `assigned` | Assigned |
| Completed | `completed` | Completed |
| Within window | `withinWindow` | Within window |
| Complete % | `completePct` | Complete % |
| Unpaid visits | `unpaidVisits` | Unpaid visits |

## Seed data

| File | Period | Reps | Source |
|------|--------|------|--------|
| `d2r-app/data/seed/merchandising-joey_circle_k-2026-Q3.json` | 2026-Q3 | 41 | live-scrape 2026-09-16 |
| `d2r-app/data/seed/merchandising-joey_circle_k-2026-Q2.json` | 2026-Q2 | 41 | vault-baseline 2026-09-13 |

## Parity gaps (known)

| Gap | Severity | Mitigation |
|-----|----------|------------|
| Store-level dump | P0 | Authenticated scrape of `/admin/merchandising/stores` |
| Visit-level Done export | P0 | Export or stay on iframe |
| Dual auth / CSP | P1 | `vercel.json` + `public/_headers` frame-ancestors on merch host |
| In-app visit routes | P2 | Parked while iframe works for Mike |

## Verification

- [x] Dashboard Merchandising tab embeds joey-surveys
- [x] `/admin/merchandising` rollup Q3
- [ ] Store grid rows after dump lands
- [ ] Multi-period beyond Q2/Q3
