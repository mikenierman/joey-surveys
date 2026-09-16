# Inventory domain — live system improvement ideas

Flaws and friction observed in the **live** Direct2Retailers inventory module. These are product/ops issues in production, not gaps in the failsafe twin.

---

## 2026-09-16 mapping pass

### Data quality & reporting

1. **425 unpriced SKUs excluded from ledger value** — Ledger performance shows ~$892k–$906k “value held” but explicitly excludes 425 unpriced items. Finance and ops cannot trust headline value until pricing coverage is complete or unpriced rows are surfaced in a dedicated queue.

2. **High “quiet stock” ratio** — 47–48 of 53 reps had no sale and no arrival in 8+ days at capture time. The metric is useful but there is no obvious bulk action (nudge rep, auto-transfer, markdown) from that signal.

3. **Zero-on-hand SKUs still listed** — ALP @ Adam Scott sample: many of 27 SKUs show 0 on hand / 0 available. Levels table does not default-hide dead SKUs, adding noise when reviewing active consignment.

4. **Rep ledger rows with em-dash value** — Live ledger includes reps with units held but `valueHeld: "—"` (e.g. Ethan Adels, Sefa Kirici), same root cause as unpriced inventory — inconsistent rollups.

### Shopify sync & inventory integrity

5. **Manual “Brand levels” refresh exists because webhooks fail** — Refresh page copy admits nightly refresh is a “backstop for missed inventory webhooks.” Operational debt: teams must know to run Refresh all after incidents.

6. **Brands with 0 levels registered** — K Bar, Mini Melt, Newtrition, Rebel show Services > 0 but Levels = 0. Either misconfigured Shopify linkage or stale brand registry; no in-app alert.

7. **Shopify shop health (related)** — 9/29 shops healthy at scrape time (`shopify-health-live.json`). Inventory levels for unhealthy shops may be stale; no cross-link from inventory views to shop health.

### Transfers workflow

8. **Admin list links to rep-facing detail URLs** — Transfer ID clicks go to `/inventory/transfers/:uuid` (rep route), not an admin detail page. Admins may lose admin chrome/context or hit permission/layout differences.

9. **Incomplete action coverage on page 1** — READY_TO_SHIP and TRANSFERRED rows show empty Actions; IN_PROGRESS gets Receive, NEW gets Approve. Status progression rules are implicit — easy to strand transfers.

10. **~400+ transfers, 21 pages, no bulk approve** — High pending volume (many NEW + Pending approval on 9/15/2026 alone). Pagination-only navigation; no bulk approve/reject visible in capture.

11. **Transfer ID inconsistency** — Mix of short hex IDs (`9903431f`) and human labels (`#T0055`) in the same column complicates search and support tickets.

### Warehouses & master data

12. **Missing phone numbers** — Multiple warehouses show phone `-` (e.g. D2R - Brent King). Directory incomplete for field ops / delivery coordination.

13. **No obvious warehouse ↔ business linkage in UI** — Businesses and warehouses are separate admin surfaces; rep legal entity vs ship-to warehouse relationship is manual mental model.

14. **Full inventory requires manual filter iteration** — No “export all warehouses” on Levels page; obtaining full SKU matrix is store×warehouse combinatorial (~1000+ filter combos). Error-prone for audits.

### Businesses & receipts

15. **Businesses Actions column empty in scrape** — 51 rows with no visible row actions (edit, verify, documents). May be icon-only, but hurts discoverability.

16. **Receipts isolated from inventory cluster** — Receipts live under payments/deposits nav, not inventory sub-nav. Reps/admins reconciling consignment vs cash may not find the path.

17. **Receipts route uncaptured** — Cannot assess whether receipt upload ties to transfer receive or settlement; integration point unknown without live review.

### Audit & performance surfaces

18. **Audit route with no surfaced sample data** — `/admin/inventory/audit` exists in production bundles but no export pass captured rows. Suggests either low usage, heavy pagination, or permission gating — undermines trust for compliance questions.

19. **Performance vs Ledgers duplication unclear** — Two nav entries (`Ledgers`, `Performance`) plus rep-facing `/inventory/performance`. Without distinct captured UIs, users may not know which to use for SKU-level vs rep-level questions.

### UX / navigation

20. **Inventory cluster is long (8 links)** — Levels, Ledgers, Performance, Transfers, Brand levels, Audit, Warehouses, Businesses in one horizontal cluster. Mobile / narrow view likely wraps or truncates.

21. **Signed-out routes redirect silently** — All unsigned admin inventory URLs redirect to Clerk login with no public documentation of module structure (expected for security, but blocks passive auditing).

---

## Prioritized for owner review

| Priority | Issue | Suggested direction |
|----------|-------|---------------------|
| P0 | Unpriced items excluded from value held | Pricing backfill job + “unpriced queue” report |
| P0 | Webhook miss → manual refresh backstop | Alert on refresh age; Slack when brand stale >24h |
| P1 | Admin transfer links to rep routes | Admin detail route or embedded drawer |
| P1 | Full inventory export | API or CSV “all warehouses × brands” |
| P2 | Quiet 8+ days with no action | Workflow: suggest transfer or markdown |
| P2 | Performance vs Ledgers IA | Merge or rename with clear subtitles |
