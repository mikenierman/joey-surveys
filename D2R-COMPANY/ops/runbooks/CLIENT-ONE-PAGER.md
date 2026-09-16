# D2R Failsafe Twin — Client outline & timeline

**Audience:** D2R owners / leadership  
**Date:** September 16, 2026  
**Status:** Twin scaffold live locally; company GitHub/Vercel/Clerk still owner Week‑0 actions

---

## What we are doing

The live operations app (`app.direct2retailers.com`) is only deployable by the current CTO (GitHub + Vercel). Leadership has **admin access** and a **continuity vault** of exports, but not the source code.

We are building a **company-owned twin** that mirrors today’s product—starting with merchandising (already built), then inventory/consignment/Shopify, then sales analytics—so when the relationship ends, D2R switches to systems it fully controls **without missing a beat**.

## What the twin does

1. Connect Shopify merchants (products, inventory levels, sales signals)  
2. Manage D2R consignment (warehouses, on-hand, transfers)  
3. Rep & admin ledgers / performance  
4. Merchandising programs (JOEY × Circle K visits inside the larger site)  
5. Analytics & money flows (orders → commissions/settlements)  
6. Secure company control (GitHub, hosting, auth, DB, Shopify apps + MFA)

## Timeline (from kickoff = Day 0)

| Window | Milestone | You will see |
|--------|-----------|--------------|
| **Week 1** | Company accounts + staging + ledger/inventory import | Staging URL with *your* numbers |
| **Day 30** | **Merch-ready failsafe** | Visits + admin review if live app is cut off |
| **Day 45** | Inventory + warehouses + ledgers | Consignment visibility; transfers in test |
| **Day 60** | **Ops-ready (P0)** | Daily inventory ops on twin + Shopify read-sync |
| **Day 75** | Orders + core sales reports | Sales visibility without live app |
| **Day 90** | **Near-parity freeze** | Cutover rehearsal complete |
| **Cutover week** (TBD) | DNS + Shopify + auth switch | One production URL; 72h hypercare |

**Standby:** From Day 30, weekly export refresh keeps the twin cutover-ready before full polish.

## What we need from you

1. DNS / Squarespace / domain ownership + MFA recovery  
2. Shopify Partner ownership or ability to install a new custom app  
3. Keep live admin login; weekly exports (checklist provided)  
4. Recover CTO build emails/notes into the vault drop zone  
5. Company billing for GitHub / Vercel / Clerk  
6. Name a cutover decision owner + 48h rep/brand comms plan  

## Success

- Deploy without the CTO  
- Reps complete merch visits and inventory transfers on the twin  
- Shopify continues after credential cutover  
- Ledger totals reconcile to last live export within agreed tolerance  
- `www` marketing stays up  

## Local demo (today)

```bash
cd d2r-app && npm run dev -- --port 3001
# optional: npm start in joey-surveys for merch iframe on :3000
```

Sign in: `mike@direct2retailers.com`
