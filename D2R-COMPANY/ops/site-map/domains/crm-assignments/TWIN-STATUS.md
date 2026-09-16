# CRM / Assignments domain — twin status

**Domain:** users, legal businesses, retail doors, rep–store assignments  
**Twin app:** `d2r-app/`  
**Updated:** 2026-09-16  
**Live app:** https://app.direct2retailers.com

---

## Summary

| Route | Live coverage | Twin page | Seed file | Row depth |
|-------|---------------|-----------|-----------|-----------|
| `/admin/users` | captured | **done** | `users.json` | 189 / 189 |
| `/admin/businesses` | captured | **done** | `businesses.json` | 51 / 51 |
| `/admin/rep-assignments` | captured (page 1) | **done** | `rep-assignments.json` | 50 / ~11,314 |
| `/admin/retail-stores` | missing | **derived stub** | _(none — derived from assignments)_ | 50 / unknown |

**Domain parity:** scaffold complete for P1 CRM routes in scope. Retail stores remain a derived stub until a dedicated live export lands.

---

## Twin pages

### `/admin/users`

| Item | Detail |
|------|--------|
| File | `d2r-app/src/app/admin/users/page.tsx` |
| Loader | `getUsers()` in `d2r-app/src/lib/data.ts` |
| Seed | `d2r-app/data/seed/users.json` |
| Live source | `D2R-COMPANY/ops/exports/2026-09-16/live/users-live.json` |
| Table headers | Name, Email, Last Seen, Role, Created |
| Interactions | Add demo user form → `POST /api/users` (admin only) |
| Gaps | Invite user, role filter, search, Export; Clerk replace DEV_AUTH |

**Shape fix:** loader normalizes live capture keys (`Name`, `Email`, …) and twin keys (`name`, `email`, …).

### `/admin/businesses`

| Item | Detail |
|------|--------|
| File | `d2r-app/src/app/admin/businesses/page.tsx` |
| Loader | `getBusinesses()` |
| Seed | `d2r-app/data/seed/businesses.json` |
| Live source | `D2R-COMPANY/ops/exports/2026-09-16/live/businesses-live.json` |
| Table headers | Sales Rep, Business Name, Address, Created |
| Interactions | Read-only table |
| Gaps | Add business, sales-rep filter, Export; detail route `/admin/businesses/:id` |

### `/admin/rep-assignments`

| Item | Detail |
|------|--------|
| File | `d2r-app/src/app/admin/rep-assignments/page.tsx` |
| Loader | `getRepAssignments()` |
| Seed | `d2r-app/data/seed/rep-assignments.json` |
| Live source | `D2R-COMPANY/ops/exports/2026-09-16/live/assignments-page1-live.json` |
| Table headers | Rep, Store Name, City, State, Account, Role, From, To |
| KPI strip | Active / Primary / Covering / Delegate counts from `meta` |
| Interactions | Read-only table |
| Gaps | Assign, bulk edit, role/rep/state filters, search, Export; paginated dump (~227 pages); `/admin/rep-assignments/relationships` |

**Prod scale (from meta):** 11,314 primary · 27 covering · 464 delegate · 227 pages.

### `/admin/retail-stores`

| Item | Detail |
|------|--------|
| File | `d2r-app/src/app/admin/retail-stores/page.tsx` |
| Loader | `getRetailStores()` — **derived** from assignment sample |
| Seed | _(none)_ — uses `rep-assignments.json` until `retail-stores.json` exists |
| Live source | **missing** — scrape `/admin/retail-stores` |
| Table headers | Store, Account, City, State, Rep (inferred) |
| Interactions | Read-only table |
| Gaps | Dedicated export; Add store, state/rep filters, search, Export |

**Note:** Retail doors ≠ Shopify brand stores (`/admin/stores` · `stores.json`). Do not conflate seed files.

---

## Data layer

| Function | Seed | Notes |
|----------|------|-------|
| `getUsers()` | `users.json` | Normalizes live + twin user shapes |
| `getSeedUsers()` | via `getUsers()` | Legacy `{ name, email, role }` for auth fallbacks |
| `getBusinesses()` | `businesses.json` | Maps `_links[0].h` when present |
| `getRepAssignments()` | `rep-assignments.json` | Preserves live headers in `meta` |
| `getRetailStores()` | derived | Dedupes assignments by store+city+state+account; prefers Primary rep |

Ingest mapping (`d2r-app/scripts/ingest-live-exports.mjs`):

| Live pattern | Seed dest |
|--------------|-----------|
| `*users*` | `users.json` |
| `*business*` | `businesses.json` |
| `*assign*` | `rep-assignments.json` |
| `*retail*store*` | `retail-stores.json` _(not yet captured)_ |

---

## Nav

Twin admin nav (`d2r-app/src/lib/nav.ts`) now includes:

- Businesses → `/admin/businesses`
- Retail stores → `/admin/retail-stores`
- Rep assignments → `/admin/rep-assignments`
- Users → `/admin/users`

Still **not** in twin nav (same CRM bucket, out of scope this pass):

- `/admin/accounts`
- `/admin/contacts`
- `/admin/locations` · `/import`
- `/admin/rep-assignments/relationships`
- `/admin/sales-status`

---

## Related routes (not built)

| Path | Live status | Twin |
|------|-------------|------|
| `/admin/accounts` | mapped-ui-only | missing |
| `/admin/contacts` | mapped-ui-only | missing |
| `/admin/locations` | mapped-ui-only | missing |
| `/admin/rep-assignments/relationships` | mapped-ui-only | missing |
| `/admin/sales-status` | mapped-ui-only | missing |
| `/retail-stores` (rep) | mapped-ui-only | missing |

See [`SITE-MAP.md`](../../../SITE-MAP.md) and [`SITE-MAP-INTERACTIONS.json`](../../../SITE-MAP-INTERACTIONS.json).

---

## Next scrape / build priorities

1. **Paginated assignments dump** — all ~227 pages into `assignments-*.json`, re-ingest to `rep-assignments.json`.
2. **Retail stores capture** — first authenticated scrape of `/admin/retail-stores` → `retail-stores-live.json` → seed.
3. **Users API shape** — optional: write new demo users in live key format to avoid mixed shapes in `users.json`.
4. **Filters + search** — client-side filters for rep/state/role on assignments and retail stores (no backend yet).
5. **Business detail** — stub `/admin/businesses/[id]` using `_links` UUIDs from seed.

---

## Verification

```bash
cd d2r-app && npm run dev
# Admin login (DEV_AUTH) → visit:
#   /admin/users
#   /admin/businesses
#   /admin/rep-assignments
#   /admin/retail-stores
```

Expected row counts with current seed: **189** users · **51** businesses · **50** assignments · **50** derived retail stores.
