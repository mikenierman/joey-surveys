# Improvements backlog — live Direct2Retailers

Product / UX upgrades for the **live** D2R app. Offline twin work stays parity-only; capture ideas here for later.

## Nav / shell (from `sandbox/shell/nav-and-admin-layout`)

1. **Collapse long sidebar into progressive disclosure** — Live admin exposes Inventory, Customers, Locations, Payouts, Reports, and Platform as dense flat lists. Default-expand only the active section; collapse others so reps/managers can scan 12 groups without scrolling past unused finance/CRM links.

2. **Surface unhealthy Shopify count on Platform** — Health is 9/29 healthy in the 2026-09-16 capture. A sidebar badge on Platform → Shopify (e.g. “20 need attention”) would route ops to reconnect before inventory refresh, instead of discovering failures inside the Shopify table.

3. **Unify Brands vs Platform → Brand stores** — Live nav lists Brand stores under both Brands and Platform. One canonical entry (Platform) with a deep link from Brands, or a single Brands hub that embeds health, would stop operators opening the wrong “stores” list (Shopify registry vs retail doors).

---

## Inventory transfers (`sandbox/inventory/transfers-admin` — 2026-09-16)

Parity delivered in twin: `/admin/inventory/transfers` (+ rep `/inventory/transfers` mirror) from `transfers.json` / live page1 — columns Transfer ID, Store, Warehouse, Status, Items, Approved, Created, Actions; offline sample banner (page 1 of ~21).

### P1 — Workflow & IA

- **Admin detail route for transfers** — Transfer ID links go to rep `/inventory/transfers/:uuid`, dropping admin chrome/context; open admin detail or drawer instead.
- **Bulk approve / reject on queue** — ~400+ transfers across 21 pages; many NEW + Pending on a single day; multi-select + audit trail.
- **Normalize Transfer ID display** — mix of short hex (`9903431f`) and human labels (`#T0055`); stable public ID + searchable UUID.

