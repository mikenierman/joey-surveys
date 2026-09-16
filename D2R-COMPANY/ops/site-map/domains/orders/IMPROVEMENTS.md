# Orders domain — improvements (live system)

Fundamental improvements to the **production Direct2Retailers orders UX**, not twin parity gaps. Ordered by impact given ~20k POs and 1034 pagination pages.

---

## P0 — Scale & operability

### 1. Pagination at 1034 pages is unusable for admin work

~20,680 POs at 20/page forces linear page hopping. Admins cannot efficiently reach mid-history orders or audit date-bounded sets.

**Improve:** Cursor-based or keyset pagination; jump-to-page; default tighter date window (e.g. last 30 days); show total count + active filters in header.

### 2. Export appears filter-scoped but full history is impractical without server-side export

Inferred Export button likely dumps the filtered view. With 1034 pages, client-side export of “all orders” is impossible.

**Improve:** Async server-side export job (email/download link); document max row limits; progress indicator for large exports.

### 3. Search + four combobox filters need indexed backend paths

Store, fulfillment, user, and free-text search on 20k+ rows will degrade without composite indexes (store + created, rep + fulfillment, full-text on PO/account).

**Improve:** Confirm query plans; add search debounce; surface “refine filters” when result set > N.

---

## P1 — Data clarity

### 4. ETA column always `-` on captured page

All 20 page-1 rows show ETA `-`, suggesting ETA is rarely populated or not wired from fulfillment/shipping.

**Improve:** Hide column when empty; or populate from Shopify fulfillment / carrier tracking; tooltip explaining source.

### 5. “Store” vs “Account” vs “Customer” vs “Location” overload

Four CRM-ish columns plus rep create cognitive load; Account and Customer names often differ subtly (e.g. business vs contact).

**Improve:** Collapse Account + Customer into one cell with secondary line; location as tooltip; column chooser for power users.

### 6. Fulfillment binary only: Fulfilled / Unfulfilled

No partial, scheduled, or cancelled states visible in list capture.

**Improve:** Align with Shopify fulfillment statuses (partial, on_hold, cancelled); badge colors; filter includes partial.

---

## P2 — Workflow

### 7. Drafts split across admin and rep routes without visible counts

`/admin/orders/drafts` and `/orders/drafts` exist but no badge/count on nav (inferred).

**Improve:** Nav badge for draft count; stale-draft alerts (>7 days); bulk submit for admins.

### 8. Order detail only reachable via PO link — no quick preview

Row click goes to full `/orders/{uuid}` page; no drawer/side panel for common checks.

**Improve:** Row expand or preview drawer (lines + fulfillment); keyboard navigation on list.

### 9. Create order entry point unclear from list alone

Create order is a primary action but multi-step flow (brand, account, lines, warehouse) not documented in list UI.

**Improve:** Wizard with saved defaults per rep; duplicate-from-existing PO; validate inventory before submit.

---

## P3 — Integration & diagnostics

### 10. Fulfillment depends on Shopify health (9/29 stores healthy)

Orders show Unfulfilled while sibling Shopify module shows scope/install gaps — ops may misread as order bug.

**Improve:** Inline warning on order row when brand store unhealthy; link to `/admin/shopify`; block submit when store disconnected.

### 11. Order timeline buried in diagnostics

`/admin/diagnostics/order-timeline` is separate from order detail — support must know internal route.

**Improve:** Embed timeline tab on order detail; expose sanitized version for reps (status changes only).

### 12. No visible link from orders to commissions/settlements

Financial downstream (commissions, settlements, payouts) is disconnected in nav though orders drive revenue.

**Improve:** Order detail “Financial impact” section; deep link to rep commission line when settled.

---

## P4 — Rep experience

### 13. Rep list likely duplicates admin columns including “Sales Rep”

Rep `/orders` probably shows Sales Rep column even when scoped to self.

**Improve:** Hide redundant column for rep role; emphasize Account, Location, Fulfillment, Total.

### 14. Mobile field use

Reps create orders in field; wide 10-column table is poor on mobile.

**Improve:** Responsive card list for rep route; prioritize PO, account, total, fulfillment badge.

---

## Capture follow-ups (for mappers, not product)

- Confirm filter label is “User” vs “Sales Rep” in UI chrome.
- Confirm date range control exists and default window.
- Capture draft list populated vs empty states.
- Capture order detail sections and edit permissions by role.
