# Domain: `inventory`

## Agents
- **Mapper:** write `MAP.md` + update `ROUTES.json` (interaction-complete).
- **Twin-builder:** implement/update `d2r-app` pages for owned paths; note changes in `TWIN-NOTES.md`.

## Owned paths (8)
- `/admin/inventory`
- `/admin/inventory/audit`
- `/admin/inventory/ledgers`
- `/admin/inventory/performance`
- `/admin/inventory/refresh`
- `/admin/inventory/transfers`
- `/admin/inventory/transfers/terms`
- `/admin/warehouses`

## Deliverables (required before Traffic Controller merge)
1. `ROUTES.json` — every owned path with schema-complete interaction record
2. `MAP.md` — human summary: purpose, tables, filters, gaps
3. `TWIN-NOTES.md` — twin pages added/updated + seed columns matched

## Coverage rubric
Use only: `captured` | `mapped-ui-only` | `stub-in-twin` | `missing`

See `../../schemas/ROUTE-INTERACTION.schema.md` and `../../TRAFFIC-CONTROLLER.md`.
