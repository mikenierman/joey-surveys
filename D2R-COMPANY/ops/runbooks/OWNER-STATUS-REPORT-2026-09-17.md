# Owner report — D2R failsafe twin status & asks

**Date:** 2026-09-17  
**Audience:** Owner / Mike (Direct2Retailers)  
**Prepared by:** Build team (Chris / Cursor)  
**Twin tip:** `sandbox/integration`  
**Working URL today:** https://d2r-app-staging.vercel.app  
**Demo login:** `mike@direct2retailers.com` (no password — DEV_AUTH staging only)

---

## 1. Executive summary

We have a **company-controlled staging twin** of the admin/rep ops surface that Mike can use without Cloudflare tunnels. It is suitable for **navigation, demos, and offline audit of seeded tables**. It is **not** ready for cutover or financial reconciliation.

| Area | Status |
|------|--------|
| Staging host | Live on Vercel (`d2r-app-staging`) |
| Auth | DEV_AUTH demo login (Clerk not wired yet — by design) |
| Merchandising | Dashboard **Merchandising** tab embeds the JOEY field app |
| Route coverage | ~70% real pages · ~94% navigable including shells |
| Cutover | **Not ready** — data depth + company ownership still open |

**What we need from you:** a few decisions (URL preference, DNS, org ownership) and several **data exports** we cannot invent.

---

## 2. What is live for you to use now

1. Open **https://d2r-app-staging.vercel.app/login**
2. Sign in as **`mike@direct2retailers.com`**
3. Land on **Admin dashboard**
4. Use the **Merchandising** tab for the full JOEY field app (surveys / visits), or **Merchandising → Programs** for the admin rollup table

Optional temp hostname (if DNS is finished): `https://d2r.liprz.com` (same project).  
Permanent intended hostname (not cut over yet): `app-staging.direct2retailers.com`.

**Do not use** `joey-surveys.vercel.app` as the twin — that is the field app only.  
**Do not change** DNS for live `app.direct2retailers.com`, `@`, or `www`.

---

## 3. Work we can continue without you

These items do not need new credentials or dumps. We can execute them on the current staging twin:

1. Connect GitHub so `sandbox/integration` auto-deploys to `d2r-app-staging`
2. Verify / finish temp DNS for `d2r.liprz.com` (if you want that share link)
3. Harden merch iframe embedding (CSP `frame-ancestors` on the JOEY host for staging origins)
4. Improve merchandising **Stores** admin shell (filters / empty states)
5. Add honest “page 1 of N” banners on Orders, Transfers, and Assignments
6. Extend smoke tests to cover the Merchandising dashboard tab
7. Add missing lightweight shells (`/stores`, transfer preview) from the live site map
8. Improve Pulse stub chrome (goals / health / scores) without claiming live data
9. Refresh internal gap docs to match staging + merch tab reality
10. Unblock the JOEY CRA Vercel build (ESLint `useMemo` warning treating CI as error)
11. Clearly label report runners as ledger/commission **proxies** (not live finance truth)

---

## 4. Items that require owner input

Please reply with decisions or clicks on these:

| # | Ask | Why it matters |
|---|-----|----------------|
| 1 | **Preferred public URL** for Mike’s ongoing review: `d2r-app-staging.vercel.app`, `d2r.liprz.com`, or `app-staging.direct2retailers.com`? | Stops tunnel churn; one link for stakeholders |
| 2 | Confirm **where DNS for `direct2retailers.com` is managed** (GoDaddy vs Squarespace nameservers) | So we add `app-staging` CNAME in the right panel |
| 3 | Approve **CNAME** `app-staging` → Vercel (**do not** touch `app` / `@` / `www`) | Company-branded staging hostname |
| 4 | Plan **company GitHub org** + keep CRA `joey-surveys` separate from Next `d2r-app` | Ownership / failsafe requirement |
| 5 | Move Vercel project **`d2r-app-staging`** to the **company** Vercel team | Off personal account |
| 6 | When ready: **company Clerk keys** (staging can stay DEV_AUTH until then) | Real auth for cutover path |
| 7 | Timeline to **re-auth unhealthy Shopify shops** (live health still ~9/29) | Twin cannot invent healthy multi-shop sync |
| 8 | Confirm **company Shopify Partner app** + webhook secret for staging | Webhooks / sync on our host |
| 9 | Confirm **merch iframe host** for now: keep `https://joey-surveys.vercel.app`? | Dashboard Merchandising tab source |

---

## 5. What we cannot do without more information / exports

We will not fabricate production-scale data. The following stay blocked until you can provide the named artifact or access:

| Need from owner / ops | What stays blocked |
|----------------------|--------------------|
| Full **orders** dump or export API (beyond ~page 1) | Trustworthy order totals, search, export offline |
| Full **transfers** queue export | Transfer audit beyond sample |
| **Rep-assignments** dump or filtered API (~11k+ live rows) | Territory / assignment audit at scale |
| **Multi brand × warehouse** inventory matrix dump | Consignment audit across the fleet (today: one ALP × Adam Scott sample) |
| **Commissions** UI that returns rows, or DB/API export | Finance / money-path reconcile |
| Fresh **settlements / payouts** live JSON as source of truth | Replace finance scaffolds |
| **Visit-level merch** export (Done status / visit metadata) | Offline Done-tab without depending on the live iframe |
| Authenticated capture of **`/admin/merchandising/stores`** | Accurate stores grid columns/filters |
| **Multi-rep Pulse** batch export | Pulse beyond single-rep sample |
| Dedicated **brand/rep sales** report captures | Reports that are not ledger proxies |
| Decision on **Postgres / company DB** | Leaving file-based store for production |
| Leadership **cutover date / freeze window** | Scheduling cutover rehearsal |

---

## 6. Suggested reply (short)

You can answer in one note:

1. Preferred URL: _______________  
2. DNS host for direct2retailers.com: GoDaddy / Squarespace / other: _______________  
3. OK to add `app-staging` CNAME only? Y/N  
4. Merch iframe host OK as joey-surveys.vercel.app for now? Y/N  
5. Which exports can you provide this week? (orders / transfers / assignments / inventory matrix / commissions)  
6. Shopify re-auth: target week? _______________  

---

## 7. Bottom line

**Usable now:** staging twin + Merchandising tab for field app review.  
**Not ready:** cutover, finance truth, full inventory/assignment/order parity.  
**Your leverage:** URL/DNS/org decisions + the exports in §5. Everything in §3 we can keep shipping in parallel.

---

*Related internal notes: `D2R-COMPANY/ops/fleet/GAP-AUDIT-2026-09-16.md`, `D2R-COMPANY/ops/runbooks/STAGING-URL.md`, `D2R-COMPANY/ops/runbooks/OWNER-INFRA-SETUP.md`*
