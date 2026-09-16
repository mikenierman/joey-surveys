# Shell / nav lane — OWNERS

**Lane:** 1 · Shell / nav  
**Branch:** `sandbox/shell/nav-and-admin-layout`  
**Owns:** Admin sidebar groups, `ADMIN_NAV_GROUPS` / `PENDING_ADMIN_PATHS`, `AppShell` sidebar chrome, pending-lane middleware rewrite, inventory cluster strip labels.

**Does not own:** Domain page bodies (inventory tables, orders, pulse KPIs, CRM lists, Shopify health rows). Those lanes replace pending placeholders when they ship.

**Pending-lane mechanism:** Missing live routes listed in `PENDING_ADMIN_PATHS` rewrite via `middleware.ts` → admin layout renders `PendingLane` (“offline twin — pending lane”) so every sidebar link resolves without 404.
