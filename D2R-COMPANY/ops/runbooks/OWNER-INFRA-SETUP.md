# Owner infrastructure setup — Direct2Retailers failsafe

**Purpose:** Company-owned accounts so D2R can deploy without the CTO.  
**Owner action required:** Create each account with MFA. Helper may assist but must not be sole owner.

## Checklist (Week 0)

### 1. GitHub org
- [ ] Create org **Direct2Retailers** (or legal entity name)
- [ ] Add **two** owner accounts (primary + backup), both MFA
- [ ] Create private repos:
  - [ ] `d2r-app` (Next.js twin — local scaffold in this workspace)
  - [ ] `joey-surveys` (mirror or transfer from `mikenierman/joey-surveys`)
- [ ] Invite helper as **collaborator**, not sole owner
- [ ] Disable "require CTO approval" for pushes if present

### 2. Vercel
- [ ] Create **team** under company billing (not personal Hobby as only home)
- [ ] Connect GitHub org; import `d2r-app` + `joey-surveys`
- [ ] Staging project: `d2r-app-staging` → temporary URL
- [ ] MFA on owner Vercel login
- [ ] Document which account owns production domain `app.direct2retailers.com` today (CTO) vs staging

### 3. Clerk
- [ ] New Clerk application under company account (do not reuse CTO instance long-term)
- [ ] Staging instance keys → `d2r-app` env (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
- [ ] Plan production domain / `clerk.direct2retailers.com` at cutover
- [ ] Until Clerk keys exist, twin runs in **DEV_AUTH** mode (see `d2r-app` README)

### 4. Database + storage
- [ ] Create Postgres (Supabase or Neon) under company account
- [ ] Create storage bucket for visit photos / files
- [ ] Save connection strings only in vault `secrets/` (mode 700) — never in git
- [ ] Run twin migrations (`d2r-app/prisma` or SQL under `d2r-app/db`)

### 5. Shopify
- [ ] Confirm Partner org / custom app ownership (transfer or recreate)
- [ ] List shops D2R syncs (fill `ops/runbooks/SHOPIFY-SHOPS.md`)
- [ ] Staging: read-only Admin API token first
- [ ] Webhooks pointed at staging only after P0 inventory ready

### 6. Domain / Squarespace
- [ ] Confirm who controls DNS for `direct2retailers.com`
- [ ] Confirm Squarespace admin for `www`
- [ ] Pre-create CNAME plan for `app-staging` and cutover for `app`

### 7. Observability (optional Week 0)
- [ ] Company Sentry project
- [ ] Company Mixpanel project

## Local twin (already scaffolded)

| Path | Role |
|------|------|
| `d2r-app/` | Next.js failsafe twin (this workspace) |
| `D2R-COMPANY/ops/runbooks/` | Runbooks + cutover |
| `D2R-SECURE-BACKUP/` | Vault (gitignored) |

## Sign-off

| Role | Name | Date |
|------|------|------|
| Owner | | |
| Backup admin | | |

When all boxes above are checked, mark continuity vault `BACKUP-MANIFEST.md` owner checklist items for GitHub/Vercel/Clerk.
