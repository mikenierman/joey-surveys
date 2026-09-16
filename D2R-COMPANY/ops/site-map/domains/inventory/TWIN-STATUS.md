# Inventory domain — twin status

Updated: 2026-09-16  
Twin app: `d2r-app/`  
Site map reference: `D2R-COMPANY/ops/SITE-MAP.md` (read-only)

## Pages touched this pass

| Route | Twin page | Seed / capture | Table columns (live parity) | Filters |
|-------|-----------|----------------|----------------------------|---------|
| `/admin/inventory` | `src/app/admin/inventory/page.tsx` | `inventory-sample.json` (27 SKUs, ALP / Adam Scott) | Product, Variant, SKU, On hand, Available, Committed, Incoming, Reserved, Damaged | Brand/store, warehouse, SKU search |
| `/admin/inventory/ledgers` | `src/app/admin/inventory/ledgers/page.tsx` | `ledger-performance.json` | Rep, Value held, Units, Sold all time, Sell-through, Sold 7d, Last sale | Brand |
| `/admin/inventory/performance` | `src/app/admin/inventory/performance/page.tsx` **new** | `ledger-by-rep-brand.json` | Rep, Brand, Status, Value held, Units, Sold all time, Sell-through, Sold 7d, Last sale | Rep, brand |
| `/admin/inventory/transfers` | `src/app/admin/inventory/transfers/page.tsx` | `transfers.json` (page 1, ~21 pages live) | Transfer ID, Store, Warehouse, Status, Items, Approved, Created, Actions | Status, store (client-side) |
| `/admin/inventory/refresh` | `src/app/admin/inventory/refresh/page.tsx` **new** | `brand-levels.json` | Brand, Services, Levels, Last refresh | — |
| `/admin/inventory/audit` | `src/app/admin/inventory/audit/page.tsx` **new** | — (mapped UI only) | When, SKU, Warehouse, Delta, Actor | Placeholder |
| `/admin/warehouses` | `src/app/admin/warehouses/page.tsx` | `warehouses.json` (60) | Warehouse, Rep, Address, City, State, ZIP, Phone, Status, Created | Status, state, search |
| `/admin/businesses` | `src/app/admin/businesses/page.tsx` **new** | `businesses.json` (51) | Sales Rep, Business Name, Address, Created, Actions | Sales rep, search |
| `/inventory` | `src/app/inventory/page.tsx` | `inventory-sample.json` | Product, Variant, SKU, On hand, Available, Committed | — (rep sample) |
| `/inventory/transfers` | `src/app/inventory/transfers/page.tsx` | `transfers.json` | Transfer ID, Store, Warehouse, Status, Items, Approved, Created | — |

## Shared infrastructure

| Artifact | Purpose |
|----------|---------|
| `src/lib/data.ts` | Normalized loaders: `getInventorySample`, `getTransfers`, `getBrandLevels`, `getLedgerBrandRows`, `getBusinesses`, … |
| `src/lib/inventory-nav.ts` | Cluster sub-nav links across inventory CRM pages |
| `src/components/ui.tsx` | `FilterBar`, `FilterField`, `ClusterNav`, `DataTable` |
| `src/lib/nav.ts` | Added `/admin/businesses` to admin top nav |

## Remaining gaps

| Gap | Live route | Notes |
|-----|------------|-------|
| Multi-warehouse inventory dumps | `/admin/inventory` | Only ALP / Adam Scott sample seeded; other store×warehouse combos show empty table with filter UI |
| Export / Refresh buttons | `/admin/inventory` | UI-only; refresh status on `/admin/inventory/refresh` |
| Transfer pagination | `/admin/inventory/transfers` | ~21 pages live; twin has page-1 seed only |
| Approve / Receive / detail routes | `/inventory/transfers/:id` | Actions column read-only; no detail/receive pages |
| Transfer terms | `/admin/inventory/transfers/terms` | Mapped UI only |
| Audit trail data | `/admin/inventory/audit` | No export captured; empty table + stub |
| Brand refresh actions | `/admin/inventory/refresh` | Refresh all / per-brand disabled in twin |
| Ledger product detail expand | `/admin/inventory/ledgers` | `detailLines` in seed not rendered |
| Business detail | `/admin/businesses/:id` | Links in seed; no twin detail page |
| Warehouse create | `/admin/warehouses` | Add warehouse not implemented |
| Period filter on ledgers | `/admin/inventory/ledgers` | Live has period control; not in capture |
| Full transfer write path | POST transfers | Creates legacy shape rows; Shopify inventory adjust blocked |

## Seed refresh

Re-ingest live captures weekly:

```bash
node d2r-app/scripts/ingest-live-exports.mjs D2R-COMPANY/ops/exports/2026-09-16/live/
```

Priority seeds for inventory cluster: `inventory-sample.json`, `warehouses.json`, `ledger-performance.json`, `ledger-by-rep-brand.json`, `brand-levels.json`, `transfers.json`, `businesses.json`.
