# Weekly export SOP (live admin → twin)

While the CTO still hosts production, refresh the twin every week.

1. Sign into https://app.direct2retailers.com as admin  
2. Export / save for each P0 path (CSV or JSON):  
   - `/admin/warehouses`  
   - `/admin/inventory` (note store/warehouse filters)  
   - `/admin/inventory/ledgers`  
   - `/admin/inventory/transfers`  
   - `/admin/shopify`  
   - `/admin/users`  
   - `/admin/merchandising`  
3. Save into `D2R-COMPANY/ops/exports/YYYY-MM-DD/`  
4. Run: `node d2r-app/scripts/import-exports.mjs D2R-COMPANY/ops/exports/YYYY-MM-DD`  
5. Restart twin / redeploy staging  
6. Spot-check ledger value held vs live  

See also `EXPORT-PASS-STATUS.md` in `ops/exports/`.
