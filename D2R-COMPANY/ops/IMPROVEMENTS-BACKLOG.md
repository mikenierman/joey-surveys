# Improvements backlog — live Direct2Retailers

Product / UX upgrades for the **live** D2R app. Offline twin work stays parity-only; capture ideas here for later.

## Nav / shell (from `sandbox/shell/nav-and-admin-layout`)

1. **Collapse long sidebar into progressive disclosure** — Live admin exposes Inventory, Customers, Locations, Payouts, Reports, and Platform as dense flat lists. Default-expand only the active section; collapse others so reps/managers can scan 12 groups without scrolling past unused finance/CRM links.

2. **Surface unhealthy Shopify count on Platform** — Health is 9/29 healthy in the 2026-09-16 capture. A sidebar badge on Platform → Shopify (e.g. “20 need attention”) would route ops to reconnect before inventory refresh, instead of discovering failures inside the Shopify table.

3. **Unify Brands vs Platform → Brand stores** — Live nav lists Brand stores under both Brands and Platform. One canonical entry (Platform) with a deep link from Brands, or a single Brands hub that embeds health, would stop operators opening the wrong “stores” list (Shopify registry vs retail doors).
