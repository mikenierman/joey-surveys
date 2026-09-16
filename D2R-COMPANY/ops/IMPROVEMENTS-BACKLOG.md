# Improvements backlog — live Direct2Retailers system

**Not twin parity.** Product/ops/reliability upgrades for the system being copied.  
Domain agents append under `site-map/domains/<domain>/IMPROVEMENTS.md`; Traffic Controller folds top items here.

**Last fold:** 2026-09-16

---

## Top 5 (cross-cutting)

1. **Shopify scope health is critical path** — 9/29 healthy; 16 missing scopes; several unreachable. Gate inventory refresh/order sync on 32/32 scopes; banner + one-click re-auth; separate CTAs for Not installed vs Unreachable vs Missing scopes.
2. **Admin pagination at scale is unusable** — Orders ~1034 pages (~20k POs), assignments ~227 pages (11k+), transfers ~21 pages. Need keyset pagination, URL-synced filters, jump-to-page, async server export jobs.
3. **Assignment + user role data quality** — 11k+ primary assignments; 151/189 users with empty Role. Require role on invite; block assignment without role; server-side assignment search.
4. **Inventory value integrity** — Hundreds of unpriced SKUs excluded from ledger value; quiet-stock ratio very high (47–48/53 reps) with no bulk action; brand levels 0 for some registered brands.
5. **Webhook / refresh debt** — Inventory “Refresh” exists as backstop for missed Shopify webhooks; ops must know when to run it. Prefer durable webhook delivery + alert when nightly backstop fires.

---

## By theme

### Shopify / multi-brand

- Scope gate before sync; remediation CTAs per status (from shopify-brands IMPROVEMENTS).
- Multi-shop health alerting (not only when visiting `/admin/shopify`).
- Cross-link inventory views → shop health for stale brands.

### Inventory / transfers / warehouses

- Surface unpriced SKU queue; hide zero-on-hand by default (toggle).
- Bulk approve/reject transfers; admin detail routes (not only `/inventory/transfers/:id`).
- Normalize transfer IDs (hex vs `#T00xx`).
- Complete warehouse phone directory.

### Orders

- Default date window + total count in header.
- Async export; indexed search (store, fulfillment, rep, PO).
- Clearer fulfillment/ETA empty states (`-` vs blank).

### CRM / assignments

- Indexed assignment search; export filtered set.
- Role hygiene dashboard.
- Distinct retail-stores vs brand Shopify stores in nav/copy.

### Merchandising

- Period/program controls that don’t require full page reload.
- Unpaid visits → payouts handoff visibility.

### Pulse / finance

- Pulse goals/health/scores linked to actionable queues.
- Commission/settlement/payout rule transparency (live captures still missing).

---

## Intake

When mapping, add bullets to domain `IMPROVEMENTS.md`. TC copies P0/P1 into this file on merge. Never mix twin scaffold TODOs here.


## Payouts / reports (from `sandbox/payouts/reports-shell`)

1. **Authenticated finance scrape** — Commissions / settlements / payouts twin seeds are scaffold; weekly live JSON/TSV export required before cutover reconcile.
2. **Commission & payout rule source of truth** — CTO trail empty; rule slugs in seed are inferred until vault docs land.
3. **Cash-ops shells** — Live nav `/admin/payments`, `/admin/deposits`, `/admin/receipts` remain mapped-ui-only (out of this sandbox).
4. **Interactive money actions** — Approve/Reject/Adjust, Run payouts, Commit settlement are offline-labeled stubs only.
5. **Report runner exports** — Brand/rep sales still use ledger proxies; need dedicated brand-sales / rep-sales captures. Client-side period/brand/status filters still placeholder “All”.
