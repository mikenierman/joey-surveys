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

### Live reliability — webhooks + automation (append 2026-09-16)

Twin shipped HMAC verify + runtime ops/install logs + offline automation stubs (`sandbox/shopify/webhooks-automation-logs`). Still needed on **live**:

1. **Scope gate before refresh/sync** — Block inventory/order jobs when shop is under 32/32; surface missing scope *names* (not just counts).
2. **Webhook miss alerts** — Alert when expected `inventory_levels/update` / `orders/*` go silent beyond N hours; DLQ + replay UI.
3. **HMAC / secret rotation runbook** — Dual-secret verify window; alert on 401 spike.
4. **Multi-shop automation fan-out** — Nightly brand-levels + inventory sync per healthy shop (twin is single-env stub).
5. **Install audit → Slack/Pager** — Uninstall or Healthy→Missing scopes within 15m; digest for Unreachable cluster.
6. **CRON_SECRET + Vercel cron** — Wire production schedules to `/api/shopify/automations/*` with auth + retention on ops JSONL.

### Append log

| Date | Lane | Note |
|------|------|------|
| 2026-09-16 | sandbox/shopify/stores-and-health | Appended Shopify scope reliability as prime improvement; twin stores + health pages wired offline (no tokens) |
| 2026-09-16 | sandbox/shopify/webhooks-automation-logs | Twin: webhook HMAC + runtime ops/install logs + brand-levels/inventory/scope-health stubs; live reliability items above |
