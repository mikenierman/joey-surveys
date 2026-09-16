# Merchandising domain — improvements

Prioritized gaps between live D2R, field app, and failsafe twin. Ordered by cutover risk.

---

## P0 — Twin parity (admin rollup)

| Gap | Live | Twin today | Fix |
|-----|------|------------|-----|
| Period switcher | 5 quarters in combobox | Hard-coded Q3 only | Client or URL-driven period select; load Q2 seed |
| Program switcher | `key=joey_circle_k` | Fixed subtitle | Combobox when second program exists |
| Column labels | Title case with spaces | camelCase keys in table | Map headers to live labels |
| Export | Button present | Missing | CSV from seed JSON |
| Pay visits | Button present | Missing | Stub or link to `/admin/payouts` |
| Row cap | All 41 reps | `.slice(0, 40)` | Show full table or paginate |
| Stores sub-route | `/admin/merchandising/stores` | No page | Add store grid page (even seed-empty) |

---

## P0 — Field embed reliability

| Gap | Risk | Fix |
|-----|------|-----|
| iframe blank in production | Reps blocked | Set `NEXT_PUBLIC_MERCH_APP_URL` to company Vercel host; allow `frame-ancestors` for twin origin |
| Dual auth (Clerk + merch login) | Friction | SSO pass-through or shared session cookie (design) |
| Offline queue visibility | Lost visits | Surface pending sync count in twin shell header, not only inside iframe |

---

## P1 — Live capture gaps

| Target | Status | Action |
|--------|--------|--------|
| `/admin/merchandising/stores` | Route only | Authenticated CDP: table headers, filters, page-1 rows for Adam Scott Q3 |
| Store-level export | Unknown schema | Capture Export CSV from stores page |
| Pay visits flow | Button not traced | Record modal/steps + API call in Network tab |
| Rep row click | Inferred | Confirm navigation params (`rep`, `key`, `period`) |
| `/merchandising` live iframe URL | Not captured | Note `src` of iframe after Clerk login |
| Q2 live refresh | Vault only (all zeros) | Re-scrape Q2 for comparison if period switching matters |

**Scrape command pattern (parent agent with auth):**

1. Navigate `/admin/merchandising?key=joey_circle_k&period=2026-Q3`
2. CDP extract: `button`, `[role=combobox]`, `table thead th`, first 50 `tbody tr`
3. Repeat for `/admin/merchandising/stores` and `/admin/merchandising/stores?rep=Adam+Scott&…`
4. Write to `exports/2026-09-16/live/merchandising-stores-page1-live.json`

---

## P1 — Data model alignment

| Issue | Detail |
|-------|--------|
| Rollup vs visit detail split | Admin table counts assignments; visit rows live in Supabase. Twin cannot show drill-down without visit export or API. |
| Assignment scale | 2,427 assigned in Q3 rollup vs 11,314 primary assignments globally — confirm merchandising assignment source (program-specific subset). |
| `withinWindow` all zero | Bonus window may be date-gated; document window rules when scraping Pay visits. |
| Vault Q3 vs live Q3 | Live scrape shows progress (98 completed); vault baseline had all zeros — seed should prefer `*-live.json`. |

---

## P2 — Field app (joey-surveys) enhancements

| Item | Notes |
|------|-------|
| Client portal | `joey@joeypouches.com` read-only — not a D2R route; document under separate client domain map if needed |
| Admin review in iframe | Richer than D2R admin rollup; consider linking D2R stores page → merch app visit detail by `store_number` + `cycle_key` |
| Geocode stores | `npm run geocode:stores` for `LOCATION_MISMATCH` accuracy |
| Multi-program | `programConfig.js` scaffold exists; D2R admin program combobox will need second program seed |

---

## P2 — Site map hygiene

- Merge this domain's `interactions.json` routes into root [`SITE-MAP-INTERACTIONS.json`](../../SITE-MAP-INTERACTIONS.json) when domains are consolidated.
- Add merchandising to weekly export SOP: rollup + stores page-1 per active period.
- Mark `/admin/merchandising/stores` coverage `captured` only after row dump lands.

---

## Suggested twin build order

1. Period switcher + full rep table on `/admin/merchandising`
2. `/admin/merchandising/stores` scaffold with rep/period filters (empty state OK)
3. Export CSV on admin rollup
4. iframe production URL + frame headers
5. Authenticated stores-page scrape → seed store-level JSON
