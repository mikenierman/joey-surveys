# Shopify / Brands — reliability improvements

Improvements to the **live D2R system** (not twin parity work). Prioritized for Shopify integration reliability given **9/29 healthy** and **16 missing-scope** stores as of 2026-09-16.

---

## P0 — Stop silent sync failures

### 1. Scope health gate before inventory/order sync

**Problem:** 55% of stores (16/29) have partial OAuth grants (27–31/32 scopes). Sync jobs likely fail partially with no operator alert.

**Improvement:** Hard-block Shopify API writes and inventory refresh for any store not at 32/32. Surface a dashboard banner: "Sync paused for {brand} — missing scopes." Link directly to reinstall OAuth URL.

**Acceptance:** No inventory level refresh or order push runs against a `Missing scopes` store; ops gets a single actionable list.

### 2. Distinguish Unreachable vs Not installed vs Missing scopes

**Problem:** All three failure modes show `0/32` or partial scopes but need different fixes (DNS/shop closed vs never installed vs stale token).

**Improvement:** Separate runbooks in UI:
- **Not installed** → "Send install link to brand admin"
- **Unreachable** → "Verify shop domain / plan status / app uninstalled"
- **Missing scopes** → "Re-authorize app (one-click reinstall)"

**Acceptance:** Status column maps 1:1 to remediation CTA; no generic "Install" for unreachable shops.

### 3. Multi-shop health monitoring with alerting

**Problem:** Health is visible only if an admin opens `/admin/shopify`. 20 stores need attention today.

**Improvement:** Nightly scope probe for all 29 stores; Slack/email digest when status degrades (Healthy → Missing scopes, or new Unreachable). Track `lastCheckedAt` per shop.

**Acceptance:** Ops notified within 24h of any scope regression without manual page visit.

---

## P0 — OAuth / app lifecycle

### 4. List the missing scope names, not just counts

**Problem:** UI shows "27 / 32" but not **which 5 scopes** are missing — brands cannot fix without Partner support.

**Improvement:** Expand row or tooltip with missing scope list (e.g. `read_inventory`, `write_orders`). Compare granted vs required set from app config.

**Acceptance:** Brand admin can self-serve reinstall knowing exactly what to approve.

### 5. Automated reinstall campaign for 27/32 cluster

**Problem:** Six stores stuck at exactly 27/32 — likely an app version bump added 5 scopes that were never re-approved.

**Improvement:** Bulk "Request re-auth" email to store owners with deep link to OAuth. Track campaign status on health page.

**Acceptance:** 27/32 bucket trends to zero within one business week of campaign.

### 6. Retire or merge duplicate brand stores

**Problem:** **Lucy** (lucy-wholesale, unreachable) and **Lucy (New!)** (ca6rad-1m, healthy) coexist — confuses routing, assignments, and health counts.

**Improvement:** Archive unreachable legacy store records; migrate open POs/inventory to canonical domain. Same review for any other superseded shops.

**Acceptance:** One active Shopify domain per brand in `/admin/stores`.

---

## P1 — Webhook & sync reliability

### 7. Per-shop webhook registration audit

**Problem:** Twin docs list required topics (`inventory_levels/update`, `orders/create`, etc.) but live has no captured per-shop webhook status.

**Improvement:** Health table columns: Webhooks registered (Y/N), Last event received, HMAC failures (24h). Auto-register missing topics on reinstall.

**Acceptance:** Every Healthy shop shows green webhook column; missing topics auto-heal on scope refresh.

### 8. Idempotent webhook processing with dead-letter queue

**Problem:** Duplicate or malformed webhooks can desync inventory if processing is best-effort.

**Improvement:** Persist `X-Shopify-Webhook-Id` (twin already does this pattern); add DLQ for failed handlers with retry + admin replay UI.

**Acceptance:** Zero lost inventory events after transient DB errors; ops can replay from DLQ.

### 9. Rate-limit aware multi-shop sync scheduler

**Problem:** 29 shops × products × inventory levels exceeds Shopify REST bucket limits if synced naïvely.

**Improvement:** Central job queue with per-shop token bucket, backoff on 429, priority tiers (Healthy + active PO volume first).

**Acceptance:** Full refresh completes without sustained 429 errors; degraded shops don't block healthy ones.

---

## P1 — Operational visibility

### 10. Connect health page to `/admin/inventory/refresh`

**Problem:** Brand level refresh (`/admin/inventory/refresh`) can run against unhealthy stores wasting API calls.

**Improvement:** Refresh UI shows scope status per brand; disable refresh button when not Healthy. Show last successful sync timestamp per store.

**Acceptance:** Refresh all skips non-Healthy stores with visible reason.

### 11. `/admin/shopify/test` results history

**Problem:** Test harness exists but no captured persistence — operators re-run ad hoc tests.

**Improvement:** Log each test run (shop, latency, scopes, sample API call result) for 30 days; trend line for regressions.

**Acceptance:** Test page shows last 5 runs per shop without re-testing.

### 12. Credential rotation without downtime

**Problem:** `/admin/shopify/apps` "Rotate credentials" (inferred) likely manual and risky during cutover.

**Improvement:** Blue/green token rotation: validate new token against `/shop.json` before swapping; keep old token 24h for webhook overlap.

**Acceptance:** Rotation completes with zero missed webhooks in canary window.

---

## P2 — Data model & UX

### 13. Store detail page (`/admin/stores/:id`) as single pane of glass

**Problem:** Registry table only shows Name / Domain / Created — health lives on a different page.

**Improvement:** Detail page merges registry + health + webhook status + last sync + linked warehouses/reps.

**Acceptance:** Operator resolves one store issue without tabbing between stores and shopify pages.

### 14. Platform nav consistency

**Problem:** Platform section groups Shopify + Brand stores in live nav but twin omits Brand stores — easy to miss registry when debugging health.

**Improvement:** Keep Platform section in nav with badge count of unhealthy stores (e.g. "Shopify · 20").

**Acceptance:** Unhealthy count visible from any admin page sidebar.

### 15. Staging shop isolation

**Problem:** `riize-dev.myshopify.com` is a dev shop in production registry (Missing scopes 30/32) — may pollute prod metrics.

**Improvement:** Tag stores `environment: production | staging`; exclude staging from health SLA and sync schedules unless explicitly enabled.

**Acceptance:** SLA reports cover production shops only; dev shops visually flagged.

---

## P2 — Cutover / twin alignment (feeds reliability)

### 16. Multi-shop token vault (not single env var)

**Problem:** Twin uses one `SHOPIFY_SHOP` + `SHOPIFY_ADMIN_TOKEN` — cannot mirror live multi-tenant model.

**Improvement:** Per-store encrypted token map keyed by store UUID; sync jobs select token by brand on orders/inventory routes.

**Acceptance:** Twin can read-sync any Healthy shop independently for audit.

### 17. Document required 32 scopes explicitly

**Problem:** Required scope set is implicit (denominator 32) — not checked into ops docs.

**Improvement:** Checked-in `SHOPIFY-REQUIRED-SCOPES.md` aligned with custom app config; diff tool flags app config drift.

**Acceptance:** App version bump triggers automatic "scopes changed" alert before brands hit Missing scopes.

---

## Quick wins (this week)

| Action | Stores affected | Effort |
|--------|-----------------|--------|
| Re-auth email to 27/32 bucket | Bangers, Fireball, Mock Pouch, My Instant IV, Newtrition, Rebel | Low |
| Archive Lucy wholesale unreachable record | Lucy legacy | Low |
| Install push for AirGlobal | AirGlobal | Low |
| Investigate Holy! Water / Ongo unreachable (shop closed?) | 2 shops | Medium |
| Show missing scope **names** in health table | All 16 missing-scope | Medium |

---

## Metrics to track

| Metric | Baseline (2026-09-16) | Target (30d) |
|--------|-------------------------|--------------|
| Healthy shops | 9/29 (31%) | ≥ 25/29 (86%) |
| Missing scopes | 16 | ≤ 2 |
| Unreachable | 3 | 0 (archived or fixed) |
| Not installed | 1 | 0 |
| Mean time to detect scope regression | Unknown (manual) | < 24h automated |

---

## Out of scope (parity, not improvement)

- Rebuilding twin `/admin/shopify` health table — twin-builder domain work
- Seeding `stores.json` — done; page wiring is parity
- Enabling Shopify write path in twin — blocked on ledger reconcile (see `SHOPIFY-WEBHOOKS.md`)
