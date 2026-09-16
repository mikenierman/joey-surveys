# Improvements backlog — live D2R (not twin parity)

Agents append product upgrades here. Twin sandbox branches stay **parity-only**.

**Prime focus (2026-09-16):** Shopify OAuth / scope reliability — **9/29 healthy · 20 need attention**.

---

## Shopify / brands — scope reliability (P0)

Source: `site-map/domains/shopify-brands/IMPROVEMENTS.md` · capture `shopify-health-live.json`

| # | Improvement | Why | Acceptance |
|---|-------------|-----|------------|
| 1 | **Scope health gate before inventory/order sync** | 16/29 shops at partial scopes (27–31/32); sync fails silently | No inventory refresh or order push against `Missing scopes`; ops sees actionable list |
| 2 | **Status-specific remediation CTAs** | Not installed / Unreachable / Missing scopes need different fixes | Status → CTA 1:1; no generic Install for unreachable |
| 3 | **Nightly multi-shop probe + alert** | Health only visible on `/admin/shopify` | Digest within 24h of Healthy→Missing or new Unreachable |
| 4 | **Name missing scopes, not just counts** | UI shows `27 / 32` without which scopes | Tooltip/expand lists missing scope names |
| 5 | **Re-auth campaign for 27/32 cluster** | Six brands stuck at exactly 27/32 after app bump | Bulk re-auth deep links; bucket trends to zero in a week |
| 6 | **Archive duplicate Lucy wholesale** | Legacy `lucy-wholesale` Unreachable vs healthy `Lucy (New!)` | One active Shopify domain per brand |

### Follow-ons (P1)

- Per-shop webhook registration audit (registered Y/N, last event, HMAC failures)
- Idempotent webhook DLQ + admin replay
- Owner Week 0: `SHOPIFY_*` env per shop — `ops/runbooks/SHOPIFY-SHOPS.md`

---

## Append log

| Date | Lane | Note |
|------|------|------|
| 2026-09-16 | sandbox/shopify/stores-and-health | Seeded backlog from Shopify domain IMPROVEMENTS; twin `/admin/shopify` + `/admin/stores` wired offline from seeds (no tokens) |

---

## Append · 2026-09-16 · `sandbox/merch/admin-q3-table`

Parity shipped offline: `/admin/merchandising` Q3 rollup (41 reps, live columns) + period switcher.

Deferred from this parity branch:

- **P1** Program combobox (`key=joey_circle_k`) when a second program exists
- **P1** Export button (CSV from seed)
- **P1** Pay visits button (stub or link to `/admin/payouts`)
- **P0** `/admin/merchandising/stores` store grid + rep drill-down (needs stores capture)
- **P2** Seed periods `2026-Q1` / `2025-Q4` / `2025-Q3` (disabled in switcher until exports exist)
- **P2** Re-scrape Q2 live (vault baseline is all zeros)
- **P0** Visit-level detail stays in field merch app / iframe — not admin rollup
