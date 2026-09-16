# QC findings — Traffic Controller

**Updated:** 2026-09-16 ~20:05Z  
**Smoke:** `node scripts/qc-twin-smoke.mjs` → **FAIL** (mid-flight; 7 pages missing on current checkout)  
**Machine:** [`QC-FINDINGS.json`](./QC-FINDINGS.json)

## Open / watch

| ID | Sev | Domain | Issue | Status |
|----|-----|--------|-------|--------|
| QC-PAGINATION | high | cross-cutting | Orders (~1034p), transfers (~21p), assignments (~227p / 11k+) are page-1 only | open |
| QC-BROWSER | high | cross-cutting | Agent browser MCP tabs empty / parent-only auth CDP — do not invent credentials; interactions stay inferred | open |
| QC-SCHEMA-DUAL | low | cross-cutting | Domains emit both `ROUTES.json` and `interactions.json`; merge prefers `ROUTES.json` | open |
| QC-HDR-stores-case | low | shopify-brands | Twin may label "Shop domain" vs live "Shop Domain" | open |
| QC-SMOKE-MIDFLIGHT | medium | twin | Smoke FAIL until domain sandbox tips merged into checkout | open (expected) |

## Domain QC this pass

| Domain | Verdict | Refs |
|--------|---------|------|
| **pulse-dashboard** | **PASS** | `domains/pulse-dashboard/{MAP,interactions,TWIN-STATUS}.md`; `data.ts` `getPulseSignalKpis`; `admin/pulse/signals/page.tsx`; seed/live KPI dict keys match; goals/health/scores stub-only (documented) |
| **payouts** | **PASS-CONDITIONAL** | `domains/payouts/{MAP,TWIN-STATUS}.md`; pages on `sandbox/payouts/reports-shell` `edaf36d`; no live finance capture; payments/deposits/receipts missing |

## Cleared (do not re-open without evidence)

| ID | Notes |
|----|-------|
| QC-001 inventory rows/items | `getInventorySample` normalizes `items` |
| QC-002 users Name/email | `getUsers` / `normalizeUser` |
| QC-003 orders demo columns | `getOrdersSnapshot` + `OrdersTable` |
| QC-004 transfers shape | `normalizeTransfer` |
| QC-005 pulse KPI dict | `getPulseSignalKpis` / signals page |
| QC-006 shopify health table | `ShopifyHealthTable` |
| QC-MAPPER-STATUS | Domains with full packs flipped to `ready-for-qc-review` on STATUS-BOARD |

## Domain dispositions (STATUS-BOARD)

| Domain | Disposition |
|--------|-------------|
| inventory, merchandising, orders, shopify-brands, crm-assignments | ready-for-qc-review |
| reports, rep-facing | ready-for-qc-review (pack green; twin yellow) |
| pulse-dashboard | **qc-pass** |
| payouts | **qc-pass-conditional** |

## Reject criteria reminder

Incomplete maps, wrong coverage enum, twin headers ≠ live capture, secrets in domain files, unexplained tsc breakage → reject with note here.
