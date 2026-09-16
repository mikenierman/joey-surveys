# Route interaction record schema (v1.0.0)

Canonical machine file: `D2R-COMPANY/ops/SITE-MAP-INTERACTIONS.json`  
Domain working copies: `site-map/domains/<domain>/ROUTES.json`

Traffic Controller merges domain `ROUTES.json` → canonical after QC accept.

## Coverage rubric (required `coverage` enum)

| Value | Meaning | Accept criteria |
|-------|---------|-----------------|
| `captured` | Live authenticated scrape produced row/header (or KPI) data for this path | `liveCapture` file exists under `ops/exports/.../live/` **or** seeded equivalent; table headers match live when tables present |
| `mapped-ui-only` | Route known; controls inventoried (live CDP **or** strong inference) but **no** row dump | `links`/`buttons`/`comboboxes`/`forms`/`tables` filled with best-known inventory; `interactionSource` set |
| `stub-in-twin` | Twin `page.tsx` exists; may be scaffold/demo | `twinPage: true`; note gaps in `notes` |
| `missing` | Needed for offline parity but not mapped and not in twin | Domain agent must pick up |

A route may be both data-`captured` and twin-thin — prefer `captured` when live data exists; put twin gaps in `notes` + `twinBuilderStatus`.

## Route record shape

```ts
type RouteInteraction = {
  path: string;                 // e.g. "/admin/orders"
  title: string;
  purpose: string;
  coverage: "captured" | "mapped-ui-only" | "stub-in-twin" | "missing";
  interactionSource: "live-cdp" | "live-capture" | "inferred" | "unassigned";
  liveCapture: string | null;   // filename under live/ or null
  twinPage: boolean;
  links: string[];              // hrefs leaving this page (absolute app paths preferred)
  buttons: string[];            // visible button labels / aria-labels
  comboboxes: Array<{
    name: string;
    options?: string[];
    optionsHint?: string;
  }>;
  forms: Array<{ name: string; fields: string[] }>;
  tables: Array<{
    name: string;
    headers?: string[];         // exact live headers when known
    headersHint?: string[];     // inferred only
  }>;
  notes: string;
  pagination: string | null;
  dataDeps: string[];           // seed / export filenames
  // Domain working copy extras (stripped or preserved on merge):
  domain?: string;
  mapperStatus?: "needed" | "seeded-from-canonical" | "in-progress" | "ready-for-qc" | "accepted" | "rejected";
  twinBuilderStatus?: "pending" | "exists-needs-qc" | "in-progress" | "ready-for-qc" | "accepted" | "rejected";
};
```

## Domain package (`domains/<domain>/`)

| File | Owner | Required |
|------|-------|----------|
| `README.md` | TC (seeded) | Yes — ownership |
| `ROUTES.json` | Mapper | Yes — schema-complete for every owned path |
| `MAP.md` | Mapper | Yes — human summary |
| `TWIN-NOTES.md` | Twin-builder | Yes when twin work claimed |

## QC reject rules (Traffic Controller)

Reject domain ready-for-qc if any:

1. Owned path missing from `ROUTES.json`
2. `coverage` not in enum
3. Twin page claims live parity but table `headers` ≠ live capture headers (when capture exists)
4. `interactionSource: inferred` with empty `buttons` **and** empty `tables` **and** empty `comboboxes` for a CRUD list page (incomplete map)
5. Secrets / passwords / tokens in any domain file
6. Twin introduces `tsc` errors without shared-primitive fix noted in `TWIN-NOTES.md`

## Merge procedure

1. Domain sets `mapperStatus` / `twinBuilderStatus` → `ready-for-qc`
2. TC reviews → `accepted` or `rejected` (+ note in `QC-FINDINGS.md`)
3. On accept: merge route fields into `SITE-MAP-INTERACTIONS.json`; refresh `SITE-MAP.md` rows; update `PARITY-CHECKLIST.md`
4. Log merge stamp under `site-map/merges/YYYY-MM-DD-<domain>.md`
