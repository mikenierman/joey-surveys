# Inventory domain — live admin route map

**Live app:** https://app.direct2retailers.com  
**Mapped:** 2026-09-16  
**Domain scope:** inventory cluster admin routes (10 paths)  
**Machine interactions:** [`interactions.json`](./interactions.json)  
**Live system flaws:** [`IMPROVEMENTS.md`](./IMPROVEMENTS.md)

## Sources used

| Source | Path | Notes |
|--------|------|-------|
| Route discovery | `exports/2026-09-16/from-vault-baseline-2026-09-13/routes/URLS.txt` | Static Next.js bundle crawl |
| Signed-out HTML | `exports/.../routes/admin_inventory-signedout.html`, `admin_inventory_ledgers-signedout.html` | Redirect to `/login?redirect_url=…`; no authenticated UI |
| Live JSON | `exports/2026-09-16/live/*.json` | 6 of 10 routes have row/header captures |
| Vault baseline | `exports/2026-09-16/from-vault-baseline-2026-09-13/{inventory,ledger}/` | 2026-09-13 CDP / export pass |
| Ledger UI text | `exports/.../ledger/ledger-expanded-raw-2026-09-13.txt` | Expanded ledgers UI (summary cards, chart, rep expand) |
| Twin reference | `d2r-app/src/lib/inventory-nav.ts`, existing twin pages | Sub-nav cluster only; not live truth |
| Browser MCP | cursor-ide-browser (this pass) | **No session** — tab list empty |

## Coverage legend

| Status | Meaning |
|--------|---------|
| `captured` | Live table headers and/or rows scraped into exports |
| `captured-partial` | Live scrape exists but incomplete (sample filter, page 1 only, etc.) |
| `mapped-ui-only` | Route confirmed; controls inferred from bundles, vault text, or sibling pages |
| `blocked` | Needs authenticated browser; not reachable unsigned |

## Inventory cluster sub-nav (live)

Observed cluster links (from twin `INVENTORY_CLUSTER_NAV` + URLS.txt; live sub-nav not re-scraped this pass):

```
Levels → Ledgers → Performance → Transfers → Brand levels → Audit → Warehouses → Businesses
```

`/admin/receipts` is **outside** this cluster (finance nav: payments · deposits · receipts) but included here as an inventory-adjacent ops route per cutover scope.

---

## Route table

| Path | Title (live) | Purpose | Coverage | Live export | Twin page |
|------|--------------|---------|----------|-------------|-----------|
| `/admin/inventory` | Inventory | Consignment on-hand by brand store + rep warehouse | **captured-partial** | `inventory-ALP-AdamScott-live.json` (27 SKUs, ALP @ D2R - Adam Scott) | Yes — subset columns |
| `/admin/inventory/audit` | Inventory audit (inferred) | Level change / discrepancy audit trail | **mapped-ui-only** | — | No |
| `/admin/inventory/ledgers` | Ledger performance | Rep-level value held, sell-through, quiet stock | **captured** | `ledger-performance-live.json` (50 reps) | Yes — no chart/expand |
| `/admin/inventory/performance` | Inventory performance (inferred) | Performance analytics sibling to ledgers | **mapped-ui-only** | — (shares ledger product model) | No |
| `/admin/inventory/refresh` | Brand levels | Shopify level refresh status + on-demand pull | **captured** | `brand-levels-live.json` (17 brands, 2905 levels) | No |
| `/admin/inventory/transfers` | Transfers | Admin transfer queue; approve / receive | **captured-partial** | `transfers-page1-live.json` (page 1 of ~21) | Yes — different UX |
| `/admin/inventory/transfers/terms` | Transfer terms (inferred) | Legal/terms copy for transfer workflow | **mapped-ui-only** | — | No |
| `/admin/warehouses` | Warehouses Admin | Rep + central warehouse directory | **captured** | `warehouses-live.json` (60 rows) | Yes — missing Address/ZIP/Created |
| `/admin/businesses` | Businesses | Legal entities linked to sales reps | **captured** | `businesses-live.json` (51 rows) | No |
| `/admin/receipts` | Receipts (inferred) | Receipt archive / upload | **mapped-ui-only** | — | No |

---

## Per-route detail

### `/admin/inventory` — Levels

**Coverage:** `captured-partial`

**Purpose:** View Shopify inventory levels for a selected brand store at a selected rep warehouse.

**Filters / comboboxes:**
- Brand store (e.g. `ALP`, `Lucy (New!)`, … — 17+ brands in system)
- Warehouse (60 rep warehouses; sample: `D2R - Adam Scott`)
- Search (inferred)

**Actions:** Export, Refresh levels (link to refresh flow or inline), Search

**Table headers (confirmed live + vault TSV):**

| Product | Variant | SKU | On hand | Available | Committed | Incoming | Reserved | Damaged | Level GID |

**Sample capture:** 27 rows, total on-hand 211 units (2026-09-16 live scrape).

**Links out:** ledgers, performance, transfers, refresh, audit, warehouses

**Gap:** Full matrix requires iterating all store × warehouse filter combinations (~17 × 60).

---

### `/admin/inventory/audit` — Audit

**Coverage:** `mapped-ui-only`

**Purpose:** Audit trail for inventory level changes (webhook misses, manual adjustments).

**Inferred table headers:** When, SKU, Product (inferred), Warehouse, Delta, Source/Actor, Notes

**Actions:** Filter, Export

**Inferred filters:** Brand, warehouse, date range, SKU search

**Signed-out HTML:** Redirect only (`admin_inventory-signedout.html` pattern).

**Gap:** No live row capture; route exists in URLS.txt only.

---

### `/admin/inventory/ledgers` — Ledger performance

**Coverage:** `captured`

**Purpose:** “What every rep holds and how fast it is moving, counting every way stock arrives.”

**Summary cards (live + vault):**

| Card | Example value | Subtext |
|------|---------------|---------|
| Value held | $892,447 (live) / $906,000 (vault) | 425 unpriced items excluded |
| Units held | 97,149 / 97,792 | On hand across every brand |
| Sell-through | 20% | Sold against everything ever received |
| Quiet 8+ days | 47 of 53 / 48 of 53 | No sale and no arrival in over a week |

**Chart (vault expanded raw):** “Units sold and received across all reps” — last 8 weeks + 2 projected; series: Units sold, Units received.

**Filters / comboboxes:**
- Brand: `All brands` (default)
- Sort: `Most value held` (default)
- Filter button (additional filters TBD)

**Rep summary table headers:**

| Rep | Value held | Units held | Sell-through | Sold last 7d | Last sale |

(Vault expanded view also labels columns: Rep, Held, Sold, Sell-through, Last 8 weeks, Last sale.)

**Expandable rep detail (vault `ledger-expanded-raw`, product rows):**

| Product | On hand | Received | Adjusted | Sold | Corrected | Sell-through | Age | Value |

**Showing:** “Showing 50 of 50” (full rep set at capture time).

**Links out:** `/admin/inventory`, `/admin/inventory/performance`

---

### `/admin/inventory/performance` — Performance

**Coverage:** `mapped-ui-only`

**Purpose:** Sibling analytics view to ledgers; likely product- or trend-focused (route distinct in bundles).

**Inferred UI:** Similar summary + brand/rep filters; may reuse ledger product dataset (`ledger-by-rep-brand-product-2026-09-13.tsv`, 2103 SKU rows).

**Rep-facing counterpart:** `/inventory/performance` (URLS.txt)

**Gap:** No separate live admin scrape; structure inferred from ledgers + vault product export.

---

### `/admin/inventory/refresh` — Brand levels

**Coverage:** `captured`

**Purpose:** Re-read on-hand and available for every Shopify inventory level. Nightly job + on-demand per brand.

**Page copy (live scrape):**
> Re-read on hand and available for every level from Shopify. A backstop for missed inventory webhooks. Runs nightly; refresh a single brand or all of them on demand.

**Summary:** 17 brand(s), 2905 inventory level(s).

**Actions:** Refresh all (top), Refresh (per brand row)

**Table headers:**

| Brand | Services | Levels | Refresh |

**Brand rows (structured vault summary):** ALP (32 services, 834 levels), Bangers (17/88), … X Mood Drinks (26/181). Some brands show 0 levels (K Bar, Mini Melt, Newtrition, Rebel).

**Note:** `Last refresh` column not present in structured capture (always null in live JSON).

**Links out:** `/admin/inventory`, `/admin/shopify`

---

### `/admin/inventory/transfers` — Transfers

**Coverage:** `captured-partial`

**Purpose:** Admin view of inventory transfers between central and rep warehouses; approval workflow.

**Pagination:** Page 1 of ~21 (~20 rows/page → ~400+ transfers)

**Table headers (confirmed live):**

| Transfer ID | Store | Warehouse | Status | Items | Approved | Created | Actions |

**Status values (page 1 sample):** `NEW`, `IN_PROGRESS`, `READY_TO_SHIP`, `TRANSFERRED`

**Row actions:** `Approve` (NEW), `Receive` (IN_PROGRESS), empty for terminal states

**Inferred filters:** Status, store, warehouse

**Actions (toolbar):** Create transfer (→ `/inventory/transfers/create`), Export, Reject (inferred)

**Detail links:** Row ID links to **rep-facing** `/inventory/transfers/:uuid` (not admin path). Receive links to `/inventory/transfers/:uuid/receive`.

**Links out:** `/admin/inventory/transfers/terms`, create flow

---

### `/admin/inventory/transfers/terms` — Transfer terms

**Coverage:** `mapped-ui-only`

**Purpose:** Editable terms/conditions shown during transfer create/approve (inferred).

**Inferred form:** Rich text / textarea `body`; Save, Cancel

**Gap:** No live HTML or JSON capture.

---

### `/admin/warehouses` — Warehouses

**Coverage:** `captured`

**Purpose:** “Manage all warehouses” — rep warehouse registry tied to inventory levels.

**Actions:** + Add Warehouse, Export

**Inferred filters:** Status, state

**Table headers (live + vault):**

| Warehouse | Address | City | State | ZIP | Phone | Status | Created | Rep |

**Capture:** 60 warehouses, all Active in sample.

**Links out:** `/admin/inventory` (filter by warehouse), `/admin/users`

---

### `/admin/businesses` — Businesses

**Coverage:** `captured`

**Purpose:** Legal/business entities associated with sales reps (1099 / contracting context).

**Actions:** Add business, Export

**Inferred filter:** Sales rep combobox

**Table headers (confirmed live):**

| Sales Rep | Business Name | Address | Created | Actions |

**Detail routes:** `/admin/businesses/:uuid` (51 UUIDs in `_links`)

**Note:** Actions column empty in live scrape (may be icon menu).

**Links out:** `/admin/accounts`, `/admin/contacts` (CRM cluster)

---

### `/admin/receipts` — Receipts

**Coverage:** `mapped-ui-only`

**Purpose:** Receipt archive for payments/deposits workflow (finance ops).

**Inferred actions:** Upload, Export

**Inferred table:** Date, Rep, Amount, Type, Status (headers not confirmed)

**Nav context:** Sibling to `/admin/payments`, `/admin/deposits` — not in inventory cluster sub-nav.

**Gap:** Route in URLS.txt only; no live scrape.

---

## Related rep-facing routes (reference only)

Not in scope for twin admin pages but linked from admin transfers:

| Path | Notes |
|------|-------|
| `/inventory` | Rep on-hand view |
| `/inventory/ledgers` | Rep ledger slice |
| `/inventory/performance` | Rep performance |
| `/inventory/transfers` | Rep transfer list |
| `/inventory/transfers/create` | Create transfer |
| `/inventory/transfers/preview` | Preview before submit |
| `/inventory/transfers/:id` | Transfer detail (admin table links here) |
| `/inventory/transfers/:id/receive` | Receive workflow |

---

## Data dependency index

| Export file | Routes fed |
|-------------|------------|
| `live/inventory-ALP-AdamScott-live.json` | `/admin/inventory` |
| `live/ledger-performance-live.json` | `/admin/inventory/ledgers` |
| `live/brand-levels-live.json` | `/admin/inventory/refresh` |
| `live/transfers-page1-live.json` | `/admin/inventory/transfers` |
| `live/warehouses-live.json` | `/admin/warehouses` |
| `live/businesses-live.json` | `/admin/businesses` |
| `from-vault-baseline/.../ledger-expanded-raw-2026-09-13.txt` | Ledgers expand UI |
| `from-vault-baseline/.../ledger-by-rep-brand-product-2026-09-13.tsv` | Ledgers/performance product rows |
| `from-vault-baseline/.../inventory/inventory-admin-ALP-AdamScott-2026-09-13.tsv` | Inventory columns (vault) |

---

## Next capture pass (authenticated browser)

1. `/admin/inventory/audit` — full table + filter options  
2. `/admin/inventory/performance` — confirm delta vs ledgers  
3. `/admin/inventory/transfers/terms` — form fields  
4. `/admin/receipts` — headers + sample rows  
5. `/admin/inventory` — iterate brand × warehouse filters or API dump  
6. `/admin/inventory/transfers` — paginate all ~21 pages  
7. Sub-nav link labels and active-state styling (visual parity)
