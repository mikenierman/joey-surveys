# Warehouses — capture note 2026-09-13

- URL: https://app.direct2retailers.com/admin/warehouses
- Page: **Warehouses Admin** — “Manage all warehouses”
- UI has **+ Add Warehouse**
- Full warehouse table dump was not re-exported after user skipped CDP capture; use Inventory Admin store/warehouse filters (e.g. Store=ALP / Warehouse=D2R - Adam Scott already captured) plus Ledger performance (50 reps, $906k value held) as consigned-inventory baseline.
- Owner follow-up: open Warehouses + Inventory “Brand levels” / each warehouse filter and Save-as / export into `app-data/inventory/warehouses-*.json` if a fuller SKU-by-warehouse dump is required.

Related captures already in vault:
- `app-data/inventory/inventory-admin-ALP-AdamScott-2026-09-13.{json,tsv}`
- `app-data/ledger/ledger-performance-all-brands-2026-09-13.{json,tsv}`
