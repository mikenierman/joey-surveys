# Payouts domain — twin status

**Domain:** Finance / money flows (commissions → settlements → payouts)  
**Live app:** https://app.direct2retailers.com  
**Twin root:** `d2r-app/`  
**Updated:** 2026-09-16  
**Coverage:** `stub-in-twin` → **expanded scaffold** (no live finance export yet)

---

## Routes

| Live route | Twin page | Status | Notes |
|------------|-----------|--------|-------|
| `/admin/commissions` | `src/app/admin/commissions/page.tsx` | **expanded** | 14 seed rows, KPI cards, filter hints, cross-links |
| `/admin/commissions/review` | `src/app/admin/commissions/review/page.tsx` | **stub added** | Pending-review queue from seed; actions offline |
| `/admin/settlements` | `src/app/admin/settlements/page.tsx` | **expanded** | 8 brand batches, preview/closed/open statuses |
| `/admin/settlements/batch/preview` | `src/app/admin/settlements/batch/preview/page.tsx` | **stub added** | Preview-only rows; Commit/Cancel offline |
| `/admin/payouts` | `src/app/admin/payouts/page.tsx` | **expanded** | 11 payout runs, ACH/check/wire methods |
| `/admin/payouts/rules` | `src/app/admin/payouts/rules/page.tsx` | **stub added** | `payout-rules.json` (4 rules) |
| `/admin/payouts/rules/example` | `src/app/admin/payouts/rules/example/page.tsx` | **stub added** | Inline docs until CTO trail import |
| `/admin/reports/commissions` | `src/app/admin/reports/commissions/page.tsx` | **expanded** | Brand rollup from commission seed |
| `/admin/payments` | — | **missing** | Cash ops — mapped-ui-only in site map |
| `/admin/deposits` | — | **missing** | mapped-ui-only |
| `/admin/receipts` | — | **missing** | mapped-ui-only |

Nav: main finance links already in `src/lib/nav.ts` (Commissions, Settlements, Payouts).

---

## Seed files

| File | Rows | Source | Cross-links |
|------|------|--------|-------------|
| `data/seed/commissions.json` | 14 | twin-scaffold | Reps from ledger/orders; brands from stores |
| `data/seed/settlements.json` | 8 | twin-scaffold | ALP, JOEY, FÜM, Bangers batches |
| `data/seed/payouts.json` | 11 | twin-scaffold | `commissionIds` → commission rows |
| `data/seed/payout-rules.json` | 4 | twin-scaffold (new) | Referenced by payout `rule` column |

Loaders: `getCommissions`, `getSettlements`, `getPayouts`, `getPayoutRules` (+ `*Meta` helpers) in `src/lib/data.ts`.

Rep names used in seed (vault-aligned): Adam Scott, Morgan Williams, Neal Batson, Michael Nierman, Shay Schnoor, Denisa Keiper, Nick Guerrieri, Bobby Patel, Hold - Unknown.

---

## Live capture gap

No live JSON export exists for finance routes (`EXPORT-PASS-STATUS.md`: commissions/settlements/payouts = scaffold only). Signed-out HTML captures are Clerk shells only.

**Blocked on:** authenticated scrape or admin API dump of commission rules, settlement engine output, and ACH run history.

---

## Remaining gaps

1. **Live data** — replace all four seed files when weekly export includes `*commission*`, `*settlement*`, `*payout*` captures.
2. **Interactive filters** — period/brand/status/method comboboxes are label-only; no client-side filter wiring.
3. **Actions** — Calculate, Export, Approve, Run payouts, Create batch, Commit — all offline placeholders.
4. **Commission rules engine** — rates in seed are display-only; no calculation from orders/ledger.
5. **Payments / deposits / receipts** — routes discovered (`SITE-MAP-INTERACTIONS.json`) but no twin pages.
6. **Pagination** — unknown until live table row counts captured.
7. **Detail routes** — no `/admin/commissions/:id` or settlement detail pages inferred yet.
8. **Postgres** — file store via `readSeedStore`; swap path documented in `src/lib/store.ts`.

---

## Verification

```bash
cd d2r-app && npm run build
```

Spot-check (DEV_AUTH): `/admin/commissions`, `/admin/commissions/review`, `/admin/settlements`, `/admin/settlements/batch/preview`, `/admin/payouts`, `/admin/payouts/rules`, `/admin/reports/commissions`.

---

## Related ops docs

- [`SITE-MAP.md`](../../../SITE-MAP.md) — finance nav tree
- [`SITE-MAP-INTERACTIONS.json`](../../../SITE-MAP-INTERACTIONS.json) — inferred buttons/comboboxes
- [`EXPORT-PASS-STATUS.md`](../../exports/EXPORT-PASS-STATUS.md) — capture pass matrix
