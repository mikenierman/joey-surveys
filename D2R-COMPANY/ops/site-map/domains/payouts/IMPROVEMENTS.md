# Payouts domain — improvements backlog

Prioritized gaps between live app (inferred), twin scaffold, and cutover-ready parity.  
**Date:** 2026-09-16 · **Domain routes:** 7 · **Twin pages:** 3 · **Live captures:** 0

---

## P0 — Blockers for money-flow parity

### 1. Authenticated UI scrape (all 7 routes)

**Problem:** Every control inventory in this domain is inferred. Signed-out HTML captures are Clerk shells only.

**Action:** When admin browser session is available, CDP-extract per route:

- Table headers (confirm twin columns, especially settlements `Adjustments`)
- Combobox option lists (period, brand, status, method)
- Row-level actions (Review, Adjust, Run payouts, Reconcile)
- Empty states vs populated layouts

**Acceptance:** Replace `interactionFidelity: inferred` with `live-scrape` for ≥1 route; update `interactions.json`.

---

### 2. Live data export — commissions / settlements / payouts

**Problem:** CAPTURE-REPORT marks entire finance bucket as **missing**. Twin runs on 3–8 demo rows.

**Action:** Weekly export pass (see `runbooks/WEEKLY-EXPORT-SOP.md`):

- Filter commissions for one closed period (e.g. 2026-Q3)
- Settlement batches for same window
- Payout runs + rule list snapshot

**Acceptance:** JSON/TSV under `exports/YYYY-MM-DD/live/` imported via `scripts/import-exports.mjs` into `data/seed/`.

---

### 3. Commission rules source (CTO trail)

**Problem:** Twin `StubNote` on commissions references "CTO trail + live export" but `cto-build-trail/` ops mirror is empty. Payout seed uses rule slugs with no definitions.

**Action:** Recover commission/payout rule emails into vault; document rule schema in seed or `payout-rules.json`.

**Acceptance:** `getPayoutRules()` loader + rules referenced by slug in payout rows resolve to real config.

---

## P1 — Twin page gaps (routes without UI)

| Route | Suggested twin MVP | Depends on |
|-------|-------------------|------------|
| `/admin/commissions/review` | Filtered table of `pending_review` rows + Approve/Reject/Adjust modal (local state) | Commission seed + adjustment audit field |
| `/admin/payouts/rules` | CRUD table for rule slugs already in payout seed | `payout-rules.json` |
| `/admin/payments` | Read-only payment ledger + Record payment form (append to seed store) | Settlement link IDs |
| `/admin/deposits` | Deposit list + Reconcile drawer matching payments | Payment seed |

**Nav:** Add sub-nav tabs under Commissions / Payouts / Cash ops, or secondary links on existing pages — live likely uses sidebar sub-routes not reflected in twin flat nav.

---

## P1 — Twin interactivity on existing pages

Current twin pages (`commissions`, `settlements`, `payouts`) are **read-only tables**. Minimum interactive parity:

| Page | Add | Notes |
|------|-----|-------|
| `/admin/commissions` | Period/brand/status filters (client-side) | Match inferred comboboxes |
| `/admin/commissions` | Export CSV button | Reuse pattern from merchandising admin |
| `/admin/commissions` | Link column → `/admin/commissions/review?period=` | Split list vs review |
| `/admin/settlements` | Status badge colors (preview / closed) | Visual parity |
| `/admin/settlements` | Create batch → stub preview page or modal | Unblocks payout flow demo |
| `/admin/payouts` | Run payouts (demo: flip scheduled → paid) | Shows workflow without ACH |
| `/admin/payouts` | Rule column links to `/admin/payouts/rules` | Connects slug to config |

---

## P2 — Data model & reconciliation

### Commission line detail

Review route likely shows basis (units, revenue, rate). Extend seed:

```json
{
  "id": "com-1",
  "lines": [
    { "sku": "JOEY-001", "units": 40, "rate": 0.05, "amount": 200.0 }
  ],
  "variance": 0,
  "adjustments": []
}
```

### Settlement ↔ payment link

Add optional `settlementId` on payment rows and `paymentIds[]` on settlement rows for reconcile UI.

### Payout hold workflow

Seed row `Hold - Unknown` / `on_hold` implies:

- Hold until rep banking profile complete (`/admin/users` extension)
- Manual release action on payout row
- Rule `manual-review` trigger conditions

---

## P2 — Cross-domain wiring

| From | To | Why |
|------|-----|-----|
| `/admin/orders` | commissions | PO totals as commission basis |
| `/admin/inventory/ledgers` | commissions | Sell-through attribution |
| `/admin/reports/commissions` | `/admin/commissions` | Analytics vs operational queue |
| `/admin/merchandising` | settlements | Merch completion / unpaid flags may affect adjustments |
| `/admin/users` | payouts | ACH destination, tax ID, hold status |

---

## P3 — UX / ops polish

1. **Domain dashboard strip** — KPI cards on commissions page: pending review count, open settlement preview, scheduled payout total, unreconciled deposits.
2. **Audit trail** — Who approved/adjusted/rejected and when (required for finance cutover sign-off).
3. **Period picker consistency** — Align `2026-Q3` (commissions) vs `2026-09-01/2026-09-15` (settlements) display format.
4. **Export bundle** — Single "Finance period export" ZIP: commissions + settlements + payouts + payments for accountant.
5. **Rep privacy** — Confirm no payout amounts leak to rep routes (already correct in merch survey; add test).

---

## Suggested build order

```
1. Live scrape + export          → ground truth
2. Import seeds                  → real row shapes
3. /admin/payouts/rules          → explain slugs in payout seed
4. /admin/commissions/review     → approval workflow
5. Filters + Export on list pages→ daily ops usability
6. /admin/payments + /deposits   → cash reconciliation loop
7. Settlement batch preview      → close the commissions→payouts chain
```

---

## Out of scope (this domain map)

- `/admin/receipts` — receipt archive (pairs with payments)
- `/admin/settlements/batch/preview` — settlement commit step
- `/admin/payouts/rules/example` — docs/example page
- `/admin/reports/commissions` — analytics (Reports domain)

Track in respective domain maps when those folders exist.
