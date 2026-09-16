# Merchandising domain map

**Live app:** https://app.direct2retailers.com  
**Field app (embed):** JOEY × Circle K survey (`joey-surveys` / repo root CRA app)  
**Mapped:** 2026-09-16  
**Machine map:** [`interactions.json`](./interactions.json)  
**Primary capture:** [`merchandising-joey_circle_k-2026-Q3-live.json`](../../exports/2026-09-16/live/merchandising-joey_circle_k-2026-Q3-live.json)  
**Seed:** `d2r-app/data/seed/merchandising-joey_circle_k-2026-Q3.json`

## Architecture

Merchandising spans two surfaces in production:

| Surface | Role | Routes |
|---------|------|--------|
| **D2R admin shell** | Program/period rollup, rep KPIs, store assignment grid, pay workflow | `/admin/merchandising`, `/admin/merchandising/stores` |
| **D2R rep shell** | Clerk-gated iframe into field app | `/merchandising` |
| **JOEY field app** | 7-phase visit survey, photos, GPS, admin review portal | Standalone at merch host; embedded via iframe |

Visit detail (survey answers, photos, compliance flags) lives in the **field app + Supabase**, not in the D2R admin rollup table. The admin rollup aggregates **assigned / completed / within-window / unpaid** counts per rep.

```
Admin nav
└── Merchandising                    /admin/merchandising
    └── Stores                       /admin/merchandising/stores

Rep nav
└── Merchandising                    /merchandising  → iframe → JOEY app
```

---

## Programs and periods

| Key | Label | Notes |
|-----|-------|-------|
| `joey_circle_k` | JOEY × Circle K | Only program captured; query param `key=joey_circle_k` |

**Period combobox (live, confirmed from Q3 scrape):**

| Period | In capture |
|--------|------------|
| `2026-Q3` | Yes — default at scrape time |
| `2026-Q2` | Yes — vault + seed |
| `2026-Q1` | Listed in UI options |
| `2025-Q4` | Listed in UI options |
| `2025-Q3` | Listed in UI options |

**URL pattern:** `/admin/merchandising?key=joey_circle_k&period=2026-Q3`

**Cycle key in field app:** `currentCycleKey()` → e.g. `2026-Q3` (quarterly).

---

## Route: `/admin/merchandising`

**Purpose:** Rep-level program rollup — visit completion and pay readiness for the selected program + period.

**Coverage:** `captured` (41 reps, live scrape 2026-09-16)

### Filters / comboboxes

| Control | Type | Options / behavior |
|---------|------|-------------------|
| Program | combobox | `joey_circle_k` (inferred: may list future programs) |
| Period | combobox | `2026-Q3`, `2026-Q2`, `2026-Q1`, `2025-Q4`, `2025-Q3` |

Changing program or period reloads the rep table (query-string driven).

### Table: rep rollup

| Header (live UI) | JSON field | Sample Q3 totals |
|------------------|------------|------------------|
| Rep | `rep` | 41 reps |
| Assigned | `assigned` | 2,427 store assignments |
| Completed | `completed` | 98 visits |
| Within window | `withinWindow` | 0 (bonus window not active at capture) |
| Complete % | `completePct` | per-rep string, e.g. `21%` |
| Unpaid visits | `unpaidVisits` | 99 |

**Top reps by completion (Q3 live):** Vern Tunnell (33), Denisa Keiper (23), Joseph Lardie (14).

**Row interaction (inferred):** Rep name or row click → `/admin/merchandising/stores?…&rep=<name>`.

### Buttons

| Button | Action |
|--------|--------|
| Export | Download rep rollup (CSV inferred) |
| Pay visits | Mark/pay completed visits for selected scope (finance workflow; not captured in detail) |

### Links out

| Target | Notes |
|--------|-------|
| `/admin/merchandising/stores` | Store-level drill-down (nav + inferred from rep row) |
| `/merchandising` | Field app entry (admin may open rep view) |
| `/admin/payouts` | Pay visits likely ties to payout/settlement (inferred) |

### Twin (`d2r-app`)

- Page: `d2r-app/src/app/admin/merchandising/page.tsx`
- Shows Q3 seed table; **no program/period switcher**, **no Export/Pay visits**, caps display at 40 rows
- Stub note links to `NEXT_PUBLIC_MERCH_APP_URL`

---

## Route: `/admin/merchandising/stores`

**Purpose:** Store-level merchandising grid for the selected program, period, and optional rep filter.

**Coverage:** `mapped-ui-only` (route in `URLS.txt`; no live row dump)

### Filters / comboboxes (inferred)

| Control | Type | Notes |
|---------|------|-------|
| Program | combobox | Same as rollup |
| Period | combobox | Same five quarters |
| Rep | combobox | All reps or single rep from rollup drill-down |
| Status | combobox | Completed / pending / within window (inferred) |
| Search | text | Store #, city (inferred from CRM patterns) |

### Table: stores (inferred headers)

| Header | Notes |
|--------|-------|
| Store | Circle K site # + name |
| Rep | Primary assigned rep |
| Status | To do / done / within window |
| Completed | Visit submitted? |
| Last visit | Date of last submission |
| Within window | Bonus-window flag |
| Unpaid | Pay queue flag |

### Buttons (inferred)

| Button | Action |
|--------|--------|
| Export | Store-level CSV |
| Assign | Reassign store to rep (ties to `/admin/rep-assignments`) |

### Links out (inferred)

| Target | Notes |
|--------|-------|
| `/admin/merchandising` | Back to rep rollup |
| `/admin/retail-stores` | Door master |
| `/admin/rep-assignments` | Assignment source |
| Field app visit detail | Deep link to submission (via merch app, not D2R native) |

### Twin

- **Missing** — no `d2r-app/src/app/admin/merchandising/stores/page.tsx`

---

## Route: `/merchandising` (rep)

**Purpose:** Rep-facing entry to field merchandising. In live D2R, Clerk auth then **iframe** into the JOEY survey app (same pattern as twin).

**Coverage:** `stub-in-twin` (iframe shell); field UI mapped from `joey-surveys` source + audit walkthrough

### Live D2R shell

- Signed-out → Clerk login with `redirect_url=/merchandising`
- Authenticated → embed of external merch URL (not scraped this pass)

### Twin (`d2r-app/src/app/merchandising/page.tsx`)

- `AppShell` + full-viewport iframe
- `src={NEXT_PUBLIC_MERCH_APP_URL}` (default `http://localhost:3000`)
- Permissions: `geolocation; camera; microphone`

### Embedded field app — rep route view

Mapped from repo root `src/App.jsx` (`RouteView`) and audit screenshots.

**Header**

| Element | Content |
|---------|---------|
| Title | Circle K Route |
| Subtitle | `{rep name} · {cycleKey} · {dataSource}` |
| Sync chip | Online/offline; pending queue count |
| Dashboard | Admin/manager only → review portal |
| Sign out | Logout |

**Progress hero**

| Metric | Description |
|--------|-------------|
| Ring % | Stores checked / assigned |
| Stores checked | `{done} of {total}` |
| To go | Remaining count |

**Filters**

| Control | Options |
|---------|---------|
| Search | Store #, city, address |
| Tabs | All · To do · Done (with counts) |

**Store list (cards, not table)**

| Field | Example |
|-------|---------|
| Badge | GO / ✓ |
| Name | Circle K #2700228 |
| Address | 560 N 2nd Avenue, Ajo, AZ |
| Meta | POG 16 · Grand Canyon Division |
| Status chip | TO DO / DONE |

**Card click** → 7-phase visit flow (`CheckView`):

1. Check in  
2. Find it  
3. Check and fill  
4. Fix it  
5. POS it  
6. Educate and price  
7. Photo it  

GPS capture, geofence banner, camera photos, submit (one visit per store per quarter).

### Embedded field app — admin review (inside merch app)

Not a D2R route, but operational counterpart to admin rollup. Entered via **Dashboard** button in field app (`ReviewPortal`).

| Area | Controls |
|------|----------|
| KPI dash | Visits completed, JOEY in set %, POS placement, follow-ups |
| Toolbar | Search, division, status, follow-ups only, sort, Export CSV |
| Visit list | Date, CK #, address, division, rep, phase strip, flags |
| Actions | Refresh, Route (back to rep view), Audit log, Assign store |
| Detail drawer | Survey answers + photo gallery |

---

## Data dependencies

| File | Used by | Rows |
|------|---------|------|
| `merchandising-joey_circle_k-2026-Q3-live.json` | Admin rollup | 41 reps |
| `merchandising-joey_circle_k-2026-Q2.json` | Period switch (vault) | 41 reps |
| `public/data/stores.json` | Field app | 2,427 Circle K doors |
| Supabase `visits` + `visit-photos` | Field app production | Not in vault export |

---

## Coverage summary

| Route | Live UI | Live rows | Twin page | Fidelity |
|-------|---------|-----------|-------------|----------|
| `/admin/merchandising` | Yes | Captured Q3 | Yes (partial) | High for table; medium for controls |
| `/admin/merchandising/stores` | Yes (route known) | Not captured | No | Low — inferred |
| `/merchandising` | Yes (iframe) | N/A | Yes (iframe) | Medium — field app from source |

**Browser this pass:** Live app requires Clerk; navigation redirected to login. Mapping uses live Q3 JSON + field app source + prior authenticated CDP scrape (2026-09-16 parent session).

See [`IMPROVEMENTS.md`](./IMPROVEMENTS.md) for scrape and twin gaps.
