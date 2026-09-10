# Joey × Circle K Survey — Preview for Mike

**What this is:** A standalone preview of the merchandising visit app. It does **not** overwrite your GitHub `main` or live Vercel site. Unzip, try it, send feedback.

**Try it**
```bash
npm install
npm start
```
- Rep: `mikenierman@gmail.com` / `demo` (small demo route, not all 2,427 stores)
- Admin: `mike@direct2retailers.com` / `demo` (full list + CSV export)

---

## What we improved

| Before | Now |
|--------|-----|
| Weak login, partial survey | Password gate + full 7-phase visit (SOW / prototype) |
| No store file in app | 2,427 Circle Ks bundled (`public/data/stores.json`) |
| Broken search/filters; re-submit allowed | Search + filters work; one visit per store per quarter |
| Fake photo taps | In-app camera, compressed JPEGs |
| Thin admin | Review KPIs, drill-down, follow-up filter, store-matched CSV |
| $35 bill rate risk | Never shown in rep UI or payloads |

Also polished for a smoother demo: faster store load if Supabase is down, visit opens without waiting on GPS, Stock/Fix only skip when JOEY is confirmed missing, closed/refused exception path, demo rep capped to a short route.

**Not in this preview:** route offer/e-sign, pay tiers/settlement, full qualify queue, POG image assets from JOEY.

---

## Missing pieces — how to set them up

### A) Shared cloud data (Supabase) — optional for first look

App works offline on the bundled store list. Connect Supabase when you want visits shared across devices.

1. Supabase → your project → **Settings → API** → copy **Project URL** + **anon public** key.  
2. **SQL Editor** → paste and run `supabase/schema.sql`.  
3. In this folder create `.env.local`:
   ```
   REACT_APP_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   REACT_APP_SUPABASE_KEY=your-anon-key
   ```
4. Load stores: `npm run import:stores`  
   (If insert fails, temporarily set `SUPABASE_SERVICE_KEY` to the **service_role** key for that one import — never commit it.)  
5. Restart `npm start`. For Vercel: add the same two `REACT_APP_*` vars → **Redeploy**.

### B) Off-site photo storage (Dropbox / S3 / etc.) — not wired yet

**Today:** photos are stored as compressed data URLs on the visit (fine for demos; not for full rollout).

**When you pick a home (Dropbox, Drive, S3, Supabase Storage):**
1. Tell us the provider + folder convention, e.g.  
   `JOEY-CircleK/{quarter}/{site_number}/{photo_type}-{timestamp}.jpg`
2. We’ll upload on submit and save **URLs only** on the visit (`photo_urls`).
3. Admin/CSV keep using those links.

Until then, no Dropbox/S3 setup is required to review the UI.

---

## Feedback we need

1. Visit order / questions OK?  
2. Photo set OK?  
3. Where should production photos live (Dropbox vs other)?  
4. OK to merge to production later, or keep as side preview?

— Chris
