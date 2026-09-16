# Domain: `pulse-dashboard`

## Agents
- **Mapper:** write `MAP.md` + update `ROUTES.json` (interaction-complete).
- **Twin-builder:** implement/update `d2r-app` pages for owned paths; note changes in `TWIN-NOTES.md`.

## Owned paths (6)
- `/admin/dashboard`
- `/admin/pulse`
- `/admin/pulse/goals`
- `/admin/pulse/health`
- `/admin/pulse/scores`
- `/admin/pulse/signals`

## Deliverables (required before Traffic Controller merge)
1. `ROUTES.json` — every owned path with schema-complete interaction record
2. `MAP.md` — human summary: purpose, tables, filters, gaps
3. `TWIN-NOTES.md` — twin pages added/updated + seed columns matched

## Coverage rubric
Use only: `captured` | `mapped-ui-only` | `stub-in-twin` | `missing`

See `../../schemas/ROUTE-INTERACTION.schema.md` and `../../TRAFFIC-CONTROLLER.md`.
