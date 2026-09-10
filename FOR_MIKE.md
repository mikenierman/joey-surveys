# Joey × Circle K Survey — Preview for Mike

**What this is:** Merchandising visit app for D2R field reps, with Admin review and a **JOEY client portal** so the brand sees each visit survey **alongside its photos** (no Dropbox dump).

**Try it**
```bash
npm install
npm start
```
- Rep: `mikenierman@gmail.com` / `demo` (small demo route)
- Admin: `mike@direct2retailers.com` / `demo` (full review + CSV)
- **Client (JOEY):** `joey@joeypouches.com` / `demo` (read-only portal: visits + photos + export)

---

## What we improved

| Before | Now |
|--------|-----|
| Weak login, partial survey | Password gate + full 7-phase visit (SOW / prototype) |
| No store file in app | 2,427 Circle Ks bundled (`public/data/stores.json`) |
| Broken search/filters; re-submit allowed | Search + filters work; one visit per store per quarter |
| Fake photo taps | In-app camera, compressed JPEGs |
| Thin admin | Review KPIs, drill-down, follow-up filter, store-matched CSV |
| Dropbox dump risk | Photos stored with the visit; client portal + export URLs |
| $35 bill rate risk | Never shown in rep UI or payloads |

Also polished for a smoother demo: faster store load if Supabase is down, visit opens without waiting on GPS, Stock/Fix only skip when JOEY is confirmed missing, closed/refused exception path, demo rep capped to a short route.

**GPS (live field):** captures lat/lng with a high-accuracy attempt + fallback; retries before submit if still missing; flags `GPS_UNAVAILABLE` when no fix, and `LOCATION_MISMATCH` only when the store has coordinates and the phone is >500m away. Run `npm run geocode:stores` once to bake Census lat/lng into `stores.json` (then re-import to Supabase).

**Not in this preview:** route offer/e-sign, pay tiers/settlement, full qualify queue, POG image assets from JOEY.

---

## Missing pieces — how to set them up

### A) Shared cloud data (Supabase) — D2R project

App works offline on the bundled store list. Connect the **D2R** Supabase project when you want visits + photos shared across devices and visible in the client portal.

1. Supabase → **D2R project** → **Settings → API** → copy **Project URL** + **anon public** key.  
2. **SQL Editor** → paste and run `supabase/schema.sql` (creates tables + **`visit-photos`** Storage bucket + policies).  
3. In this folder create `.env.local`:
   ```
   REACT_APP_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   REACT_APP_SUPABASE_KEY=your-anon-key
   ```
4. Load stores: `npm run import:stores`  
   (If insert fails, temporarily set `SUPABASE_SERVICE_KEY` to the **service_role** key for that one import — never commit it.)  
5. Restart `npm start`. For Vercel: add the same two `REACT_APP_*` vars → **Redeploy**.

### B) Photos (production path) — Supabase Storage

**How it works:** Reps capture photos in-app. On submit, JPEGs upload to Storage bucket `visit-photos`. The visit row stores **HTTPS URLs only** in `photo_urls` next to `survey_data`.

- **Admin** and **Client portal** open a visit → survey answers + photo gallery side by side.  
- **Export CSV** includes `photo_p1`…`photo_p9` URL columns.  
- **No Dropbox dump** — the client reviews in portal / export.

**Path convention:** `{cycle_key}/{store_number}/{photo_id}-{timestamp}.jpg`

If Supabase / Storage is unavailable, the app still saves the visit (may keep data URLs locally for offline demo).

### Suggested reply to JOEY

> Photos are stored with each visit in the survey database. Your portal login shows the visit survey and its photos together. Export includes photo links. We are not delivering a Dropbox dump.

---

## Feedback we need

1. Visit order / questions OK?  
2. Photo set OK?  
3. Client portal login email(s) to add beyond `joey@joeypouches.com`?  
4. OK to keep using D2R Supabase Storage for production photos?

— Chris
