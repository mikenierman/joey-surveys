# Domain: `rep-facing`

## Agents
- **Mapper:** write `MAP.md` + update `ROUTES.json` (interaction-complete).
- **Twin-builder:** implement/update `d2r-app` pages for owned paths; note changes in `TWIN-NOTES.md`.

## Owned paths (17)
- `/`
- `/login`
- `/signup`
- `/inventory`
- `/inventory/ledgers`
- `/inventory/performance`
- `/inventory/transfers`
- `/inventory/transfers/create`
- `/inventory/transfers/preview`
- `/merchandising`
- `/orders`
- `/orders/drafts`
- `/retail-stores`
- `/stores`
- `/locations/sales-status`
- `/test/dashboard`
- `/admin`

## Deliverables (required before Traffic Controller merge)
1. `ROUTES.json` — every owned path with schema-complete interaction record
2. `MAP.md` — human summary: purpose, tables, filters, gaps + cross-links to inventory/merchandising/orders
3. `interactions.json` — machine interaction map for rep routes
4. `IMPROVEMENTS.md` — scrape + twin gaps
5. `TWIN-STATUS.md` — twin coverage vs live (prefer over TWIN-NOTES)
6. `TWIN-NOTES.md` — twin pages touched this pass (or pointer to sibling lanes)

## Coverage rubric
Use only: `captured` | `mapped-ui-only` | `stub-in-twin` | `missing`

See `../../schemas/ROUTE-INTERACTION.schema.md` and `../../TRAFFIC-CONTROLLER.md`.
