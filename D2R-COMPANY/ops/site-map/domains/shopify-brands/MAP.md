# Shopify / Brands domain map

**Domain:** Platform integrations — brand Shopify stores, app install health, connectivity tests  
**Live app:** https://app.direct2retailers.com  
**Mapped:** 2026-09-16  
**Machine map:** [`interactions.json`](./interactions.json)  
**Twin:** `d2r-app/src/app/admin/shopify/page.tsx` (partial; no `/admin/stores` yet)

Coverage legend: `captured` | `mapped-ui-only` | `stub-in-twin` | `missing`

---

## Platform nav (live)

Live admin sidebar groups these routes under a **Platform** section (inferred from module layout + scrape copy; not mirrored in twin `ADMIN_NAV`).

| Nav label | Route | Twin |
|-----------|-------|------|
| Shopify | `/admin/shopify` | stub-in-twin |
| ↳ Apps | `/admin/shopify/apps` | missing |
| ↳ Test | `/admin/shopify/test` | missing |
| Brand stores | `/admin/stores` | missing |

Twin gap: `d2r-app/src/lib/nav.ts` lists only `{ href: '/admin/shopify', label: 'Shopify' }` — no Platform grouping, no Brand stores link.

---

## Health snapshot (2026-09-16 live capture)

Source: `exports/2026-09-16/live/shopify-health-live.json`

| Metric | Value |
|--------|-------|
| Total shops | **29** |
| Healthy (32/32 scopes) | **9** (31%) |
| Need attention | **20** (69%) |
| Required scopes | 32 |

### By status

| Status | Count | Meaning |
|--------|-------|---------|
| Healthy | 9 | Full 32/32 OAuth scopes granted |
| Missing scopes | 16 | App installed but incomplete scope grant |
| Not installed | 1 | No app install (0/32) |
| Unreachable | 3 | Domain/token unreachable (0/32) |

### Missing scopes by grant level

| Scopes granted | Shops | Brands |
|----------------|-------|--------|
| 27 / 32 | 6 | Bangers, Fireball, Mock Pouch, My Instant IV, Newtrition, Rebel |
| 29 / 32 | 3 | High-Not, Rocket Fuel, TRĒ House |
| 30 / 32 | 5 | Happie, McBee Farms, Mr Vapor, Riize, Sesh |
| 31 / 32 | 2 | Glassy, Mini Melt |

### Not installed / unreachable (0/32)

| Brand | Domain | Status |
|-------|--------|--------|
| AirGlobal | airglobal-2.myshopify.com | Not installed |
| Holy! Water | 199a5e-11.myshopify.com | Unreachable |
| Lucy | lucy-wholesale.myshopify.com | Unreachable |
| Ongo Energy Spray | ongo-energy-spray.myshopify.com | Unreachable |

Note: **Lucy (New!)** (`ca6rad-1m.myshopify.com`) is a separate healthy store — legacy Lucy wholesale remains unreachable.

---

## Route inventory

### `/admin/shopify` — Shopify Apps (health dashboard)

| Field | Detail |
|-------|--------|
| **Coverage** | `captured` |
| **Purpose** | Per-store OAuth scope health; install/reconnect/sync entry |
| **Page title (live)** | "Shopify Apps" |
| **Summary line** | "Live API scope health across every connected store. **9 of 29 healthy · 20 need attention.**" |
| **Table** | Store · Domain · Scopes · Status · Install |
| **Filters** | Status combobox (inferred: All / Healthy / Missing scopes / Not installed / Unreachable) |
| **Actions** | Install, Reconnect, Test, Sync (inferred from SITE-MAP + typical flow) |
| **Links out** | `/admin/shopify/apps`, `/admin/shopify/test`, `/admin/stores` |
| **Data deps** | `shopify-health-live.json`, `shopify-shops-live.json` |
| **Twin** | `stub-in-twin` — twin shows single-shop env sync + webhooks, not 29-row health table |

### `/admin/shopify/apps` — Partner app management

| Field | Detail |
|-------|--------|
| **Coverage** | `mapped-ui-only` |
| **Purpose** | Install/rotate D2R custom app credentials across Partner dashboard |
| **UI (inferred)** | Install app, Rotate credentials |
| **Links** | Back to `/admin/shopify` |
| **Data deps** | None captured |
| **Twin** | `missing` |

### `/admin/shopify/test` — Connectivity test harness

| Field | Detail |
|-------|--------|
| **Coverage** | `mapped-ui-only` |
| **Purpose** | Run Admin API probe for a selected shop |
| **UI (inferred)** | Shop selector combobox (29 stores); Run test button |
| **Links** | Back to `/admin/shopify` |
| **Data deps** | None captured |
| **Twin** | `missing` |

### `/admin/stores` — Brand store registry

| Field | Detail |
|-------|--------|
| **Coverage** | `captured` |
| **Purpose** | Canonical list of brand Shopify stores (name + myshopify domain) |
| **Table** | Name · Shop Domain · Created |
| **Actions** | Add store, Open (row → `/admin/stores/:id`) |
| **Links out** | `/admin/shopify`, store detail UUID routes |
| **Data deps** | `stores-live.json` (29 rows) |
| **Twin** | `missing` — seed exists (`stores.json`) but no page |

---

## Full shop registry (29)

Merged from `stores-live.json` + `shopify-health-live.json`. Store IDs enable detail routes.

| Brand | Shop domain | Created | Health | Scopes |
|-------|-------------|---------|--------|--------|
| ALP | karpatt.myshopify.com | 5/21/2026 | Healthy | 32/32 |
| AirGlobal | airglobal-2.myshopify.com | 12/3/2025 | Not installed | 0/32 |
| Bangers | pzjt8f-sy.myshopify.com | 11/8/2025 | Missing scopes | 27/32 |
| Beach Bark | the-beach-bark-brittle-company.myshopify.com | 8/4/2026 | Healthy | 32/32 |
| Dialed Gum | 0488ab.myshopify.com | 2/5/2026 | Healthy | 32/32 |
| Dime Bags | dwexfr-if.myshopify.com | 3/25/2026 | Healthy | 32/32 |
| Fireball | 0dbqxn-qg.myshopify.com | 6/25/2025 | Missing scopes | 27/32 |
| FÜM | f-m-united-kingdom.myshopify.com | 5/23/2025 | Healthy | 32/32 |
| Glassy | itn90x-0s.myshopify.com | 6/11/2026 | Missing scopes | 31/32 |
| Happie | urc7sq-08.myshopify.com | 2/26/2026 | Missing scopes | 30/32 |
| High-Not | 68d4d2.myshopify.com | 2/5/2026 | Missing scopes | 29/32 |
| Holy! Water | 199a5e-11.myshopify.com | 5/13/2025 | Unreachable | 0/32 |
| Joey | sasur5-ib.myshopify.com | 5/17/2026 | Healthy | 32/32 |
| K Bar | jenx6w-mu.myshopify.com | 6/11/2026 | Healthy | 32/32 |
| Lucy | lucy-wholesale.myshopify.com | 4/13/2025 | Unreachable | 0/32 |
| Lucy (New!) | ca6rad-1m.myshopify.com | 6/30/2026 | Healthy | 32/32 |
| McBee Farms | a71bd9.myshopify.com | 3/19/2026 | Missing scopes | 30/32 |
| Mini Melt | wh0y5t-y6.myshopify.com | 5/21/2026 | Missing scopes | 31/32 |
| Mock Pouch | mockpouch.myshopify.com | 4/30/2025 | Missing scopes | 27/32 |
| Mr Vapor | 5bhnn1-dt.myshopify.com | 4/2/2026 | Missing scopes | 30/32 |
| My Instant IV | my-instant-iv.myshopify.com | 5/16/2025 | Missing scopes | 27/32 |
| Newtrition | d6511f-4.myshopify.com | 8/28/2025 | Missing scopes | 27/32 |
| Ongo Energy Spray | ongo-energy-spray.myshopify.com | 8/28/2025 | Unreachable | 0/32 |
| Rebel | rebelsuppsfl.myshopify.com | 6/30/2025 | Missing scopes | 27/32 |
| Riize | riize-dev.myshopify.com | 10/1/2025 | Missing scopes | 30/32 |
| Rocket Fuel | rocketfuelshop.myshopify.com | 10/1/2025 | Missing scopes | 29/32 |
| Sesh | seshb2bus.myshopify.com | 4/20/2026 | Missing scopes | 30/32 |
| TRĒ House | d2r-tre-house.myshopify.com | 2/17/2026 | Missing scopes | 29/32 |
| X Mood Drinks | xmooddrinks.myshopify.com | 6/22/2026 | Healthy | 32/32 |

Healthy shops (9): ALP, Beach Bark, Dialed Gum, Dime Bags, FÜM, Joey, K Bar, Lucy (New!), X Mood Drinks.

---

## Cross-domain links

| From | To | Why |
|------|-----|-----|
| `/admin/shopify` | `/admin/inventory/refresh` | Brand level refresh depends on Shopify inventory API |
| `/admin/shopify` | `/admin/orders` | PO routing uses store → Shopify fulfillment |
| `/admin/stores/:id` | Partner dashboard | Per-store app install (external) |
| Twin `/api/webhooks/shopify` | All healthy shops | Webhook HMAC + event persist (twin read-only) |
| Twin `/api/shopify/sync` | Single `SHOPIFY_SHOP` env | Read sync — not multi-shop like live |

---

## Seeds & exports

| File | Role |
|------|------|
| `exports/.../live/shopify-health-live.json` | 29-row health table + summary |
| `exports/.../live/stores-live.json` | 29-row brand registry + UUID hrefs |
| `exports/.../live/shopify-shops-live.json` | Merged shop list + missingScopesHint |
| `d2r-app/data/seed/shopify-health.json` | Twin seed (from live) |
| `d2r-app/data/seed/stores.json` | Twin seed (from live) |
| `d2r-app/data/seed/shopify-shops.json` | Twin seed (from live) |

---

## Interaction fidelity notes

- **Captured:** table headers + all 29 rows for `/admin/shopify` and `/admin/stores`.
- **Inferred:** Platform nav section label, status filter options, Install/Reconnect/Test/Sync buttons, apps/test page controls (no live HTML scrape).
- **Not captured:** which specific scopes are missing (only count 27–31 of 32), Install column actions (empty in scrape), `/admin/stores/:id` detail layout.
- **Next scrape:** CDP extract on apps + test pages; click Install on a missing-scopes row to capture OAuth redirect flow.
