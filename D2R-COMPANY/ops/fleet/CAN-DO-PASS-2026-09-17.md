# Twin can-do pass — 2026-09-17

**Branch:** `sandbox/integration`  
**Working URL:** https://d2r-app-staging.vercel.app (also aliased https://d2r.liprz.com when DNS Valid)

## Closed since GAP-AUDIT-2026-09-16

| Item | Status |
|------|--------|
| Auth proxy / cookie behind tunnel | Done (`37b1726`) |
| Staging Vercel project `d2r-app-staging` | Live |
| Dashboard Merchandising tab + iframe | Done (`21b4942`+) |
| `PENDING_ADMIN_PATHS` | Empty (shells exist) |
| Next CVE bump | `next@15.5.25` |
| Sample depth banners (orders/transfers/assignments) | Done this pass |
| Report proxy banners | Done this pass |
| Pulse shared filter chrome | Done this pass |
| Merch stores empty-state + field embed | Done this pass |
| Smoke: merch tab snippets + new pages | Done this pass |
| CRA `ReviewPortal` useMemo ESLint | Fixed (remove unused `visits` dep) |
| Root `vercel.json` + `public/_headers` frame-ancestors | Present for joey-surveys host |

## Still owner-blocked

| Item | Blocker |
|------|---------|
| `vercel git connect` | Needs GitHub Login Connection on Chris Vercel account |
| Company org / Clerk / app-staging DNS | Owner decisions |
| Full data dumps | See OWNER-STATUS-REPORT-2026-09-17 §5 |

## Smoke

```bash
cd d2r-app && node scripts/qc-twin-smoke.mjs
```

## Merch embed

Default host: `https://joey-surveys.vercel.app` via `getMerchAppUrl()`. Dashboard tab: `/admin/dashboard?tab=merchandising`.
