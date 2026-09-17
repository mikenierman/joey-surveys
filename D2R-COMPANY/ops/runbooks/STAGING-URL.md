# Staging URL — failsafe twin (`d2r-app`)

**Goal:** Put the company failsafe twin on a durable URL so Mike/client can work without Cloudflare quick tunnels.  
**Do not touch:** `app.direct2retailers.com`, apex `@`, or `www`.

## Recommendation

| Item | Choice | Why |
|------|--------|-----|
| **Hostname** | `app-staging.direct2retailers.com` | Matches `OWNER-INFRA-SETUP.md` CNAME plan (`app-staging` now, `app` only at cutover) |
| **Hosting** | **New Vercel project** `d2r-app-staging`, Root Directory **`d2r-app`** | Durable previews, env UI, HTTPS; better for client work than tunnels |
| **Auth (Week 0)** | **DEV_AUTH** (leave Clerk keys unset) | Demo login `mike@direct2retailers.com` works today; Clerk when company keys exist |
| **Branch** | `sandbox/integration` | Twin integration branch |

**Avoid:** Reconfiguring Mike’s existing Vercel project `joey-surveys` (CRA, repo root). That project must stay Root = empty / CRA.

**Alternates (OK if GoDaddy already reserved):** `staging.…`, `twin.…`, `failsafe.…` — prefer `app-staging` for cutover naming consistency.

**Not recommended for client work:** Cloudflare quick tunnels (URL rotates, DNS flaky). Named Cloudflare Tunnel is a fallback only if Vercel is blocked.

---

## Ordered checklist

### 1) GoDaddy DNS (Chris + client — do not change live `app`)

Confirm GoDaddy is the **DNS host** for `direct2retailers.com` (nameservers point at GoDaddy). Ops docs also mention Squarespace for `www` — if NS are at Squarespace, add the record there instead.

In GoDaddy → **DNS** → **Add**:

| Field | Value |
|-------|--------|
| **Type** | `CNAME` |
| **Name / Host** | `app-staging` |
| **Value / Points to** | `cname.vercel-dns.com` *(or the exact target Vercel shows after you add the domain)* |
| **TTL** | `600` (or 1 hour) |

**Do not edit:**

- `app` → live product (`app.direct2retailers.com`)
- `@` / apex A/AAAA/ANAME for marketing
- `www` (Squarespace / marketing)

Propagation: often minutes; allow up to ~1 hour.

### 2) Vercel — new project (not `joey-surveys`)

1. Log into the **company** Vercel team when available (today a scaffold exists under Chris’s account: **`d2r-app-staging`** — migrate ownership later).
2. **Add New Project** → import GitHub repo that contains `d2r-app/` (today still `mikenierman/joey-surveys` until org transfer).
3. Settings that matter:
   - **Root Directory:** `d2r-app` *(critical)*
   - **Framework Preset:** Next.js
   - **Production Branch:** `sandbox/integration` (or use Preview for that branch and keep Production elsewhere)
   - **Build Command / Output:** leave Next defaults (`vercel.json` already sets `"framework": "nextjs"`)
4. **Do not** change Root Directory on project `joey-surveys`.

**GitHub connection:** CLI create may fail with “add a Login Connection to your GitHub account” until Chris connects GitHub under Vercel → Account → Login Connections. Until then, deploy with CLI from `d2r-app/` or connect Git in the dashboard.

### 3) Env vars (Project → Settings → Environment Variables)

For first Mike login (**DEV_AUTH**), **omit** Clerk keys:

| Var | Staging value | Notes |
|-----|---------------|--------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | *(leave unset)* | If **both** Clerk vars are set, middleware switches off DEV_AUTH |
| `CLERK_SECRET_KEY` | *(leave unset)* | Same |
| `NEXT_PUBLIC_MERCH_APP_URL` | optional | Merch iframe host; local default `http://localhost:3000`. Blank iframe = frame-ancestors / XFO on merch host |
| `SHOPIFY_*` / `CRON_SECRET` | optional | Not required for UI twin demo |

When company Clerk is ready: set both keys + add `app-staging.direct2retailers.com` in Clerk allowed origins / domains.

### 4) First deploy

- **With Git connected:** push (or redeploy) `sandbox/integration` with Root `d2r-app` → open `https://d2r-app-staging.vercel.app` (name may vary).
- **Without Git:** from `d2r-app/`: `npx vercel --prod --scope <team>` (uses local `.vercel` link; does not touch `joey-surveys`).
- Include the **X-Forwarded-Host** auth redirect fix before relying on custom domain / proxy login.

### 5) Custom domain on Vercel

1. Project → **Domains** → Add `app-staging.direct2retailers.com`
2. Confirm CNAME matches what Vercel displays
3. Wait until status = Valid

### 6) Mike login smoke test

1. Open `https://app-staging.direct2retailers.com/login` (or `*.vercel.app/login`)
2. Sign in: `mike@direct2retailers.com` (DEV_AUTH)
3. Expect redirect to `/admin/dashboard` **on the same host** (not `localhost`)
4. Cookie should be `Secure` on HTTPS

---

## What was done in-repo vs what Chris must click

### Done (helper)

- Confirmed preferred name **`app-staging`** from `OWNER-INFRA-SETUP.md`
- Staging project **`d2r-app-staging`** live; production alias includes **`d2r.liprz.com`** when DNS Valid
- Auth proxy fix + Merchandising dashboard tab on `sandbox/integration`
- Root `vercel.json` + `public/_headers` frame-ancestors for JOEY host
- **`vercel git connect` attempted** — blocked until Chris adds a **GitHub Login Connection** on Vercel ([docs](https://vercel.com/docs/accounts/create-an-account#login-methods-and-connections)). Until then: `cd d2r-app && npx vercel --prod`

### Chris / client must click

1. Confirm which registrar/DNS host actually serves `direct2retailers.com` (GoDaddy vs Squarespace NS)
2. Add **CNAME** `app-staging` → Vercel target (and keep `d2r` on liprz.com if using temp URL)
3. In Vercel: complete **GitHub Login Connection**, then `vercel git connect` (Root Directory **`d2r-app`**, branch `sandbox/integration`)
4. Add domain `app-staging.direct2retailers.com` in the **staging** project only
5. Mike smoke: login → Dashboard → **Merchandising** tab
6. Later: move project to company Vercel team / Direct2Retailers GitHub org

---

## Blockers

| Blocker | Impact |
|---------|--------|
| Unknown DNS host (GoDaddy login vs Squarespace NS) | CNAME may need to be added in the real DNS panel |
| GitHub not connected on Chris Vercel account | Git auto-deploys blocked; CLI/local deploy still OK |
| Auth fix uncommitted on `sandbox/integration` | Custom-domain / proxy login can bounce to wrong host until committed + deployed |
| No company Clerk yet | Fine for staging — stay on DEV_AUTH; do not half-set one Clerk key |
| Live `app` DNS owned by CTO path today | Never edit `app` until cutover runbook |
| Next security / seed polish | Separate from URL standup; fix before calling staging “production-ready” |

---

## Fallback: Cloudflare named tunnel

Only if Vercel is delayed: create a **named** tunnel → stable hostname → CNAME to `<tunnel-id>.cfargotunnel.com`. Keep local Next on a fixed port. Still prefer Vercel for client collaboration.
