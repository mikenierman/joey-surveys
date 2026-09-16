# Domain: `reports`

## Agents
- **Mapper:** write `MAP.md` + update `ROUTES.json` (interaction-complete).
- **Twin-builder:** implement/update `d2r-app` pages for owned paths; note changes in `TWIN-NOTES.md`.

## Owned paths (5)
- `/admin/reports`
- `/admin/reports/brand-sales`
- `/admin/reports/rep-sales`
- `/admin/reports/inventory-reports`
- `/admin/reports/commissions`

## Deliverables (required before Traffic Controller merge)
1. `ROUTES.json` — every owned path with schema-complete interaction record
2. `MAP.md` — human summary: purpose, tables, filters, gaps
3. `interactions.json` — machine-readable controls / tables / data deps
4. `IMPROVEMENTS.md` — live-system improvement ideas
5. `TWIN-STATUS.md` — twin pages + seed columns + gaps
6. `TWIN-NOTES.md` — short pointer (prefer TWIN-STATUS)

**Status 2026-09-16:** map pack **complete** → reconcile **green (pack)**. Twin runners are seed proxies; live scrape still missing.

## Coverage rubric
Use only: `captured` | `mapped-ui-only` | `stub-in-twin` | `missing`

See `../../schemas/ROUTE-INTERACTION.schema.md` and `../../TRAFFIC-CONTROLLER.md`.
