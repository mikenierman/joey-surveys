# Cutover runbook — live app → company failsafe twin

**Owner:** ________________  
**Backup:** ________________  
**Staging URL:** ________________  
**Production target:** `app.direct2retailers.com`

## Preconditions (all must be yes)

- [ ] Company GitHub org **Direct2Retailers** owns `d2r-app` + `joey-surveys`
- [ ] Company Vercel deploys twin green on staging
- [ ] Company Clerk production instance ready (or approved DEV→Clerk migration)
- [ ] Company Postgres + storage with latest weekly export import
- [ ] Shopify custom app installed on all shops; read sync verified; write path tested in staging
- [ ] DNS controls confirmed (who can flip `app` CNAME)
- [ ] Rep/brand communication draft ready
- [ ] Final ledger/inventory export reconciled vs twin (tolerance: ______ %)

## T‑7 days

1. Freeze non-critical live feature work  
2. Full export pack → import into twin staging  
3. Game day: admin login, create transfer, submit merch visit, pull ledger + report  
4. Confirm Squarespace/`www` unaffected  

## T‑1 day

1. Announce maintenance window to reps/brands  
2. Snapshot vault + DB backup of twin  
3. Verify Clerk redirect URLs for production domain  

## Cutover day (sequence)

1. **Freeze writes** on live CTO app (announce; disable if possible)  
2. **Final export** from live admin (inventory, ledgers, transfers, users, orders)  
3. **Import** into twin production DB / seed  
4. **Shopify:** retarget webhooks to company twin; confirm inventory levels  
5. **DNS:** point `app.direct2retailers.com` → company Vercel  
6. **Clerk:** production domain / session  
7. **Smoke:** login admin + rep; transfer; merch visit; report  
8. **Monitor 72h** (errors, Shopify sync, support Slack)  

## Rollback

1. Repoint DNS `app` to CTO Vercel deployment  
2. Restore Shopify webhooks to prior endpoints  
3. Notify users; capture incident notes in `ops/runbooks/incidents/`  

## Hypercare (72h)

| Check | Cadence | Owner |
|-------|---------|-------|
| Shopify sync errors | every 4h | |
| Transfer completions | daily | |
| Merch submit success | daily | |
| Ledger totals vs last export | day 1 and day 3 | |

## Sign-off

| Step | Name | Time |
|------|------|------|
| Freeze confirmed | | |
| DNS flipped | | |
| Smoke passed | | |
| Hypercare closed | | |
