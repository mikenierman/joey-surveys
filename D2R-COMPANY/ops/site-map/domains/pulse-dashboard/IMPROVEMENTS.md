# Pulse / Dashboard — improvements backlog (live system)

Flaws and optimization opportunities in the **production** Direct2Retailers dashboard and Pulse modules — not twin parity gaps. Address after offline mirror works.

---

## P0 — clarity & trust

### 1. Reorder rate vs reorder miss rate both high (97% / 90%)

Adam Scott sample shows **97% reorder rate** and **90% reorder miss rate** simultaneously. Without inline definitions, ops cannot tell whether metrics conflict, measure different denominators, or indicate a data bug.

**Improve:** Tooltip + docs for each KPI; sanity-check formula; flag mathematically inconsistent pairs in UI.

### 2. No dedicated dashboard KPI capture / single source of truth

Company dashboard KPIs overlap ledger performance but live has no isolated dashboard export. Teams may see different numbers on Dashboard vs Ledgers vs Pulse depending on refresh timing and filters.

**Improve:** One aggregated `/admin/dashboard` API with explicit as-of timestamp; link each card to drill-down with same filter context.

### 3. Pulse score opaque (74 with no breakdown)

Composite `score: 74` on Signals with no visible weighting (reorder, revenue, doors, fees). Scores page purpose unclear without capture.

**Improve:** Score decomposition UI (contributors + weights); link Signals → Scores with same rep/period locked.

---

## P1 — scale & coverage

### 4. Single-rep pulse capture (Adam Scott only)

Live scrape captured one rep × one date range. Cannot validate ranking on Scores, health rollups, or goal attainment at company scale (~189 users).

**Improve:** Batch export or admin “all reps” scores table; scheduled snapshot for audit.

### 5. Pulse split across five routes without captured hub UX

Goals, Health, Scores, Signals are separate URLs; hub navigation pattern unknown. Risk of duplicated filters and stale state when switching tabs.

**Improve:** Shared filter bar in layout (rep + period persisted in URL query); breadcrumb/tab component documented in one place.

### 6. Dashboard activity feed uncaptured

Inferred Event / Actor / When table may be critical for audit; no export path documented.

**Improve:** Export activity log; retention policy; link events to entity (order id, transfer id).

---

## P2 — analytics & ops

### 7. Revenue shown raw (22408) — formatting & period label

Capture stores integer dollars without currency formatting in JSON; UI must format. Period alignment with “Orders: 78” and date range Jun 19 – Sep 16 should be explicit on every monetary card.

**Improve:** Consistent `$22,408` display; subtitle “Jun 19 – Sep 16” on all period-scoped metrics.

### 8. On-hand share vs fee percentages — relationship unclear

`onHandShare: 58%`, `onHandFeePct: 7%`, `dropShipFeePct: 5%` — likely related to fulfillment mix and commission structure but not explained in UI.

**Improve:** Visual mix bar (on-hand vs drop-ship); tie to payout/settlement docs.

### 9. Dashboard quiet-stock metric buried in ledger domain

“47 of 53 quiet 8+ days” lives in ledger summary; may or may not surface on dashboard. Reps with high sell-through (Adam Scott 35%, 157 in 7d) still get pulse score 74 — cross-module narrative missing.

**Improve:** Dashboard “attention needed” strip pulling ledger quiet stock + pulse miss rate + merch unpaid visits.

### 10. No export on Signals (inferred on Scores only)

Field reps and finance may need CSV of signal cards for QBRs; only Scores inferred to have Export.

**Improve:** Export on Signals and Goals; include rep, period, all KPI columns.

---

## P3 — architecture

### 11. Pulse data shape ≠ alert/event model

Downstream tools (and twin) assumed `signals[]` event list; live is **scalar KPI dict**. Integrations and seeds will drift.

**Improve:** Versioned schema (`pulseSignals.v1`); separate “events/alerts” from “KPI snapshot” if both exist.

### 12. `/test/dashboard` orphan route

Listed in URLS.txt alongside production dashboard — risk of test data leaking into ops workflows if linked in nav.

**Improve:** Gate behind feature flag or non-prod only; remove from production URL discovery.

---

## Discovery while mapping (add as verified)

| ID | Finding | Status |
|----|---------|--------|
| PD-01 | Dashboard lacks live JSON capture | Open |
| PD-02 | Signals capture URL confirms route is `/admin/pulse/signals` not hub | Verified |
| PD-03 | Twin `getPulseSignals()` expects wrong seed shape | Twin gap — see TWIN-STATUS |
| PD-04 | Ledger Adam Scott sell-through 35% vs pulse score 74 — different models | Open |
