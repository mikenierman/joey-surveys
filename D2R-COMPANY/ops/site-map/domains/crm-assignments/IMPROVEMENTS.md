# CRM / Assignments — live system improvements

Ideas for **fundamental improvements to the production Direct2Retailers CRM/assignments module**, not twin implementation gaps. Optimize after offline parity is working.

Priority: **P0** critical ops risk · **P1** high friction · **P2** quality / maintainability

---

## P0 — Data integrity & scale

### 1. Assignment list at 11k+ rows needs first-class pagination UX

**Observed:** 11,314 primary assignments across ~227 pages (~50 rows/page). Only page-1 sample captured.

**Problem:** Admin workflows that depend on finding/editing a single door assignment (reassignments, territory cleanup, covering setup) become painful at this scale without fast server-side search, stable sort, and filter persistence.

**Improve:** Default to indexed server-side search (rep, store, account, city, state); URL-synced filters; optional “export filtered set” instead of paging through 227 screens.

---

### 2. Role hygiene — 151/189 users with empty Role

**Observed:** Live users capture shows Role empty on 151 of 189 accounts; only 15 marked `rep`, 17 `delegate`, 4 `admin`, 2 `brand_partner`.

**Problem:** Authorization, assignment eligibility, and reporting likely depend on role. Empty roles create silent failures (users exist but cannot act, or act with wrong defaults).

**Improve:** Require role on invite; dashboard widget for “users missing role”; block assignment creation for unroled users.

---

### 3. Clarify entity model: Account vs Store vs Location

**Observed:** Assignments show both **Store Name** and **Account** columns; names often match but sometimes diverge (e.g. store “Og puff Norfolk” → account “Og tobacco vape”). Separate admin routes exist for accounts, retail-stores, and locations.

**Problem:** Operators and integrations may write to the wrong entity; duplicate or orphaned records; unclear source of truth for “door count.”

**Improve:** Document canonical hierarchy (Account → Location → Store/Door); enforce foreign keys in UI; surface mismatches; consider merging redundant list pages or linking them inline.

---

## P1 — Admin workflow friction

### 4. Bulk assignment operations need guardrails

**Observed:** Checkbox column + “Bulk edit” button on assignments table.

**Problem:** Bulk territory changes without preview/undo can mis-route orders, merch programs, and inventory rep attribution across thousands of doors.

**Improve:** Bulk edit wizard with diff preview, effective-date defaulting, and audit log; limit bulk scope by filter (state/rep) with row count confirmation.

---

### 5. Covering / delegate model is split across two pages

**Observed:** Role filter on `/admin/rep-assignments` (27 covering · 464 delegate) plus separate `/admin/rep-assignments/relationships` graph page.

**Problem:** Operators must understand two UIs to configure backup coverage; relationship intent may be opaque.

**Improve:** Unified “coverage” panel on assignment row detail; visual graph with rep nodes; explain Primary vs Covering vs Delegate in-product.

---

### 6. CRM cluster lacks consistent export/import story

**Observed:** Accounts and locations expose Import; contacts and retail-stores do not (inferred). Assignments have Export only.

**Problem:** Bulk onboarding and disaster recovery depend on CSV round-trips; inconsistent patterns increase ops errors.

**Improve:** Standard import template per entity; validate-then-commit flow (like locations/import) everywhere; document cross-entity import order.

---

### 7. Invite vs role assignment flow

**Observed:** Users page has “Invite user”; many invited users remain with empty Role long after Created date.

**Improve:** Invite flow should capture role + territory intent; optional auto-create delegate relationship; reminder emails for pending invites.

---

## P2 — Quality, reporting, integration

### 8. Assignment effective dates (`From` / `To`) need validation

**Observed:** Sample rows show recent `From` dates and open `To` (—); bulk of 11k primaries active simultaneously.

**Improve:** Warn on overlapping primary assignments for same store; auto-close prior primary on new assign; scheduled transitions.

---

### 9. Rep-facing store list should mirror admin truth

**Related routes:** `/retail-stores`, `/locations/sales-status` (rep-facing).

**Problem:** If rep-visible door lists drift from assignment table, field reps visit wrong stores or miss assignments.

**Improve:** Single assignment API consumed by admin and rep views; cache with invalidation on assignment change.

---

### 10. Downstream modules should show assignment provenance

**Consumers:** Orders (Sales Rep), merchandising (rep × store), pulse (active stores), inventory/warehouses (rep).

**Improve:** When rep on an order disagrees with current primary assignment, flag “assignment changed since order created” for audit.

---

### 11. Geographic filters skew visibility

**Observed:** Page-1 assignment sample is 76% GA (38/50 rows) — likely sort/recency bias, not national mix.

**Improve:** Default sort options documented; “my rep’s territory” quick filter; state/rep filters should affect export, not just view.

---

## Deferred (needs capture confirmation)

These need authenticated CDP scrape of accounts, contacts, retail-stores, locations, and relationships pages before sizing:

- Row counts per CRM entity vs assignment count
- Detail routes (`/:id`) and inline row actions
- Whether retail-stores and locations are duplicate datasets or layered
- Full combobox option lists (status values, role filters on accounts)

---

## Twin note (for traffic controller, not a live improvement)

Twin `ADMIN_NAV` omits the entire CRM cluster except Users; live roles ≠ twin demo roles; users seed shape mismatch. Track in parity checklist — separate from live product improvements above.
