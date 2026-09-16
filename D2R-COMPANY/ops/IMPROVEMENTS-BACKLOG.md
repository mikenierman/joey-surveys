# Improvements backlog (not twin parity)

Product upgrades for the **live** Direct2Retailers system. Twin agents rebuild parity only; park upgrades here.

---

## Nav / shell (`sandbox/shell/nav-and-admin-layout` — 2026-09-16)

1. **Collapse long sidebar into progressive disclosure** — Live admin exposes Inventory, Customers, Locations, Payouts, Reports, and Platform as dense flat lists. Default-expand only the active section; collapse others so ops can scan ~12 groups without scrolling past unused finance/CRM links.

2. **Surface unhealthy Shopify count on Platform** — Health was 9/29 healthy in the 2026-09-16 capture. A sidebar badge on Platform → Shopify (e.g. “20 need attention”) would route reconnect work before inventory refresh, instead of discovering failures only inside the Shopify table.

3. **Unify Brands vs Platform → Brand stores** — Live nav lists Brand stores under both Brands and Platform. One canonical entry (Platform) with a deep link from Brands—or a Brands hub that embeds health—would stop operators opening the wrong “stores” list (Shopify registry vs retail doors).
