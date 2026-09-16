# Owner needs — what the twin team cannot finish alone

**Audience:** Mike / D2R leadership / CTO handoff contact  
**Date:** 2026-09-16  
**Branch:** `sandbox/integration`  
**Companion:** [`../runbooks/OWNER-INFRA-SETUP.md`](../runbooks/OWNER-INFRA-SETUP.md) · [`GAP-AUDIT-2026-09-16.md`](./GAP-AUDIT-2026-09-16.md)

Agents can scaffold UI, ingest exports, and harden local code. They **cannot** create company-owned accounts, rotate live credentials, re-auth Shopify shops, or pull full production dumps without owner access. Items below are blocked until the named owner delivers the artifact.

---

## Owner checklist (blocked without you)

| # | Who | Artifact needed | Why blocked |
|---|-----|-----------------|-------------|
| 1 | **Mike + backup admin** (company billing) | GitHub org **Direct2Retailers** (or legal entity) with **two MFA owners**; private repo **`d2r-app`** rooted at this twin; invite helper as collaborator **not** sole owner | Twin lives only in local/worktrees. No company-controlled remote → no reviewable CI, no Vercel import, no cutover from CTO personal GitHub. |
| 2 | **Mike + backup admin** | Vercel **team** under company billing; project connected to `d2r-app`; deploy **`sandbox/integration`** (then production branch later) to a staging URL | Without a company Vercel project there is no shareable staging host for client audit; DNS cutover cannot point at a D2R-owned deploy. |
| 3 | **Mike / leadership** | Clerk **company** application: staging + production publishable/secret keys → vault `secrets/` and Vercel env (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) | Twin auth is **DEV_AUTH** only. Cannot ship real login, map Clerk emails 1:1 to reps, or disable demo auth on a public host. |
| 4 | **Mike + Shopify Partner owner** (or ability to transfer/recreate custom app) | Partner org / custom app **ownership**; re-auth / reinstall for **20 unhealthy shops** (live **9/29 healthy** as of 2026-09-16) | Inventory levels, order fulfillment truth, and twin read-sync cannot outrun a broken live fleet. Single-env staging token ≠ 29-shop production model. |
| 5 | **Mike + Partner owner** | `SHOPIFY_WEBHOOK_SECRET` (company app) + **staging webhook URL** (`https://<company-staging-host>/api/webhooks/shopify`) registered in Partner/app admin | HMAC verification and event ingest need the real secret and a reachable company host. Agents have routes + verify scripts; runtime ops stay stubbed without these. |
| 6 | **Mike / admin ops** (live `app.direct2retailers.com`) | **Full data exports** into `D2R-COMPANY/ops/exports/<date>/`: (a) **multi-warehouse inventory matrix** (all brands × ~60 warehouses, not 27-SKU ALP×Adam Scott sample); (b) **paginated dumps** — orders (~1034 pages), transfers (~21 pages), rep-assignments (~227 pages / 11,314 primary); (c) **commissions** when the live review UI finishes loading (2026-09-16 capture was empty “Loading orders…”) | Offline twin seeds are page-1 / scaffold. Cutover reconcile and serious ops audit are impossible from samples. Agents can ingest files once dropped; they cannot force full UI/API export without admin session + UI that loads. |
| 7 | **Mike / merch owner** | Decision + one of: (A) production **merch field app host URL** (`NEXT_PUBLIC_MERCH_APP_URL`) **and** CSP / `frame-ancestors` (or `X-Frame-Options`) allowing the twin origin to embed; **or** (B) written approval to **port the visit engine in-app** under `/merchandising/*` | Visit GPS/photos/7-phase survey remains root CRA + optional iframe. Blank iframe or dual Clerk/merch login blocks Day-30 merch-ready failsafe. |
| 8 | **Mike + DNS/Squarespace admin** | Written decision: who controls `direct2retailers.com`; staging hostname (e.g. `app-staging.…` CNAME → Vercel); cutover plan for `app.` | Cannot publish staging URLs, Clerk production domain, or cutover runbook without DNS ownership clarity. |
| 9 | **Mike** | **Rotate password** for the temp admin scrape account; update vault only (`D2R-SECURE-BACKUP/.../secrets/d2r-app-clerk.env`, mode 600); never commit | Credential used for Playwright export lives in vault. Rotation after scrape reduces exposure; stale shared password is a continuity + security risk. |
| 10 | **Mike / leadership ← CTO handoff** | Still-needed **CTO vault** items into `D2R-SECURE-BACKUP/.../docs/cto-build-trail/` (ops mirror: `ops/cto-build-trail/`): build emails/notes, commission & payout **rule definitions**, multi-shop Shopify token model / install notes, webhook + cron secrets runbook, Postgres/storage connection notes if any, MFA recovery for GitHub/Vercel/Shopify/Clerk still under CTO | `cto-build-trail/` ops mirror is empty of source emails. Finance scaffolds and Shopify multi-shop cutover guess without those artifacts. |

### Also required (Week 0 infra — same owners)

| Who | Artifact | Why |
|-----|----------|-----|
| Mike + backup | Company **Postgres** (Neon/Supabase) + photo storage under company billing; connection strings vault-only | File `store.ts` is interim; cutover DB must not be personal CTO. |
| Mike | Fill [`../runbooks/SHOPIFY-SHOPS.md`](../runbooks/SHOPIFY-SHOPS.md) (29 shops: domain, brand, app name, Partner owner, sync uses) | Staging tokens and cutover reinstall need an authoritative shop list. |
| Mike | Name **cutover decision owner** + 48h rep/brand comms plan | Cutover week needs a single accountable owner. |

**Do not put secrets in git.** Vault paths only; confirm mode `600`/`700`.

---

## What agents are fixing in parallel (no owner wait)

Owners should see the split: code/parity work continues while the table above is open.

| Workstream | Owner (agent lane) | What ships without Mike |
|------------|--------------------|-------------------------|
| **Next.js security bump** | Traffic Controller / shell | Bump `next` off deprecated **15.5.7** → advisory-safe **≥15.5.9**; re-run smoke / `tsc` / build before any public staging |
| **Rep nav / shell** | Shell + rep-facing lanes | Thicker rep nav vs live; missing `/stores` / transfer preview shells; admin/rep layout chrome |
| **CRM pages** | CRM / assignments lane | Users, rep-assignments, retail-stores, businesses depth beyond PendingLane where seeds exist |
| **Cash-ops stubs** | Payouts + CRM | `/admin/payments`, `/deposits`, `/receipts`, accounts/contacts/locations — navigable stubs / scaffolds until live finance exports exist |
| Inventory / orders / Shopify / merch / pulse / reports | Domain lanes on `sandbox/*` → merge to `sandbox/integration` | Tables, seeds from existing captures, webhook HMAC scaffolding, admin merch Q3 rollup, Shopify health mirror of 9/29 |

**Still blocked even after agent merges:** company staging URL, real Clerk, full inventory/orders/assignments/commissions truth, Shopify re-auth + webhook secret/URL, merch embed or in-app port approval, DNS, password rotation, CTO vault trail.

---

## How owners unblock (shortest path)

1. Complete rows **1–3** (GitHub + Vercel + Clerk) → agents can point `sandbox/integration` at company staging and turn off DEV_AUTH there.  
2. Complete **4–5** (Shopify ownership + webhook secret/URL) → read-sync + HMAC become real on staging.  
3. Complete **6** (full exports) → agents re-run `import-exports.mjs` and deepen seeds.  
4. Complete **7–8** (merch host/CSP or port approval + DNS) → Day-30 merch path and shareable hostname.  
5. Complete **9–10** (password rotate + CTO vault drop) → scrape hygiene + finance/Shopify cutover docs.

When a row is done, check it here and mirror the matching box in [`OWNER-INFRA-SETUP.md`](../runbooks/OWNER-INFRA-SETUP.md) / vault `BACKUP-MANIFEST.md`.
