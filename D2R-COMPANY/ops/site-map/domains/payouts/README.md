# Domain: `payouts`

## Agents
- **Mapper:** write `MAP.md` + update `ROUTES.json` (interaction-complete).
- **Twin-builder:** implement/update `d2r-app` pages for owned paths; note changes in `TWIN-NOTES.md`.

## Owned paths (10)
- `/admin/commissions`
- `/admin/commissions/review`
- `/admin/settlements`
- `/admin/settlements/batch/preview`
- `/admin/payouts`
- `/admin/payouts/rules`
- `/admin/payouts/rules/example`
- `/admin/payments`
- `/admin/deposits`
- `/admin/receipts`

## Deliverables (required before Traffic Controller merge)
1. `ROUTES.json` — every owned path with schema-complete interaction record
2. `MAP.md` — human summary: purpose, tables, filters, gaps
3. `TWIN-NOTES.md` — twin pages added/updated + seed columns matched

## Coverage rubric
Use only: `captured` | `mapped-ui-only` | `stub-in-twin` | `missing`

See `../../schemas/ROUTE-INTERACTION.schema.md` and `../../TRAFFIC-CONTROLLER.md`.
