# Improvements backlog — live Direct2Retailers

Product / UX upgrades for the **live** D2R app. Offline twin work stays parity-only; capture ideas here for later.

## Nav / shell (from `sandbox/shell/nav-and-admin-layout`)

1. **Collapse long sidebar into progressive disclosure** — Live admin exposes Inventory, Customers, Locations, Payouts, Reports, and Platform as dense flat lists. Default-expand only the active section; collapse others so reps/managers can scan 12 groups without scrolling past unused finance/CRM links.

2. **Surface unhealthy Shopify count on Platform** — Health is 9/29 healthy in the 2026-09-16 capture. A sidebar badge on Platform → Shopify (e.g. “20 need attention”) would route ops to reconnect before inventory refresh, instead of discovering failures inside the Shopify table.

3. **Unify Brands vs Platform → Brand stores** — Live nav lists Brand stores under both Brands and Platform. One canonical entry (Platform) with a deep link from Brands, or a single Brands hub that embeds health, would stop operators opening the wrong “stores” list (Shopify registry vs retail doors).

## Shopify / brands — scope reliability (P0) — **prime**

Source: `site-map/domains/shopify-brands/IMPROVEMENTS.md` · capture `shopify-health-live.json`  
Baseline: **9/29 healthy · 20 need attention** (2026-09-16).

1. **Scope health gate before inventory/order sync** — Hard-block writes/refresh for shops not at 32/32; banner with reinstall link.
2. **Status-specific remediation CTAs** — Not installed / Unreachable / Missing scopes each get a distinct action (no generic Install for unreachable).
3. **Nightly multi-shop probe + alert** — Digest within 24h of Healthy→Missing scopes or new Unreachable.
4. **Name missing scopes, not just counts** — Expand/tooltip lists exact missing OAuth scopes.
5. **Re-auth campaign for 27/32 cluster** — Six brands stuck after app bump; bulk re-auth deep links.
6. **Archive duplicate Lucy wholesale** — Unreachable `lucy-wholesale` vs healthy `Lucy (New!)`; one active domain per brand.

### Shopify follow-ons (P1)

- Per-shop webhook registration audit · webhook DLQ/replay · Owner Week 0 `SHOPIFY_*` env (`ops/runbooks/SHOPIFY-SHOPS.md`)

### Append log

| Date | Lane | Note |
|------|------|------|
| 2026-09-16 | sandbox/shopify/stores-and-health | Appended Shopify scope reliability as prime improvement; twin stores + health pages wired offline (no tokens) |

---

## Merchandising (`sandbox/merch/rep-facing-shell` — 2026-09-16)

Parity delivered in twin: rep `/merchandising` offline shell with period rollup + Circle K route list/status (search, All/To do/Done tabs, store cards). Survey engine stays in the field app / iframe.

### P0 — Field workflow

- **Visit-level Done status missing from vault** — export per-store visit completion (site_number + cycle_key + submitted_at) so offline Done tab matches live.
- **Dual auth (Clerk shell + merch login)** — SSO / shared session so iframe does not re-prompt.
- **iframe blank without `NEXT_PUBLIC_MERCH_APP_URL` + frame-ancestors** — production host + CSP allow twin origin.

### P1 — Route accuracy

- **Demo Field Rep mapping is twin-only** — map real Clerk emails 1:1; remove Adam Scott fallback in production.
- **Store list source outside twin seed** — copy/subset Circle K `stores.json` into `d2r-app/data/seed/` for portable offline builds.
- **Closing-store flag visibility** — surface closing doors in admin rollup and pay workflow.

### P2 — Product upgrades (live)

- **Offline queue count in D2R shell header** — pending sync chip outside iframe.
- **Deep link store card → visit** — pass site_number + period into field app URL.
- **Program picker** — support multi-program beyond `joey_circle_k`.

---

## Inventory ledger / brand levels (from `sandbox/inventory/ledgers-brand-levels`)

Parity shipped offline: `/admin/inventory/ledgers` + `/admin/inventory/refresh`. Deferred live upgrades:

1. **Unpriced SKU queue** — 425 items excluded from ledger value held; finance needs a priced-backfill queue, not a silent exclusion count.
2. **Quiet 8+ days actions** — 47 of 53 reps at capture; add bulk nudge / suggest-transfer / markdown from the quiet signal.
3. **Stale brand-levels alerts** — Manual refresh exists because webhooks miss; alert when brand refresh age >24h.
4. **Zero-level brand registry flags** — K Bar, Mini Melt, Newtrition, Rebel show services >0 with levels=0; link to Shopify health.
5. **Ledger chart + rep expand** — Ship 8-week sold/received chart and product-line expand after time-series capture.
6. **Clarify Ledgers vs Performance** — Merge or rename cluster entries so SKU vs rep questions have one obvious path.

