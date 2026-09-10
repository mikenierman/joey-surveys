# Joey x Circle K Survey App

Production-ready survey app for D2R field reps conducting JOEY nicotine pouch merchandising visits at Circle K stores.

## Features

- **Rep Login** — Email/password authentication with role-based access
- **Route View** — See assigned stores with completion progress
- **7-Phase Survey** — Guided checkout, stock, fix, educate, photos
- **Admin Dashboard** — Track submissions and completion metrics
- **Supabase Integration** — Real-time data storage and sync
- **Mobile-First Design** — Optimized for field reps on phones

## Setup

1. Clone the repo
2. `npm install`
3. Create `.env.local` with:
   ```
   REACT_APP_SUPABASE_URL=https://wmuzmrtspdljpbjytrios.supabase.co
   REACT_APP_SUPABASE_KEY=sb_publishable_i6L5PJvaoo94Bu9zEDXlTA_PATi6YVP
   ```
4. `npm start`

## Stores data

Stores load from `public/data/stores.json` at runtime. To upsert into Supabase, apply `supabase/schema.sql` then run `npm run import:stores` (requires env credentials; network/DNS to Supabase must be available).

## Demo Accounts

- Rep: `mikenierman@gmail.com / demo`
- Admin: `mike@direct2retailers.com / demo`
