# Rep-facing domain map

**Live app:** https://app.direct2retailers.com  
**Twin app:** `d2r-app/`  
**Mapped:** 2026-09-16  
**Machine map:** [`interactions.json`](./interactions.json)  
**Route discovery:** [`URLS.txt`](../../exports/2026-09-16/from-vault-baseline-2026-09-13/routes/URLS.txt) (non-admin counterparts)  
**Canonical nav:** [`SITE-MAP.md`](../../SITE-MAP.md) § Nav tree (rep-facing)

## Scope

Rep-facing owns **non-admin shell routes** used by field sales reps after Clerk login. Admin counterparts and deep data fidelity live in sibling domain packs — this pack is the **rep surface index**, ownership boundary, and twin coverage matrix.

| Concern | Owner pack | Rep routes here |
|---------|------------|-----------------|
| Consignment levels, ledgers, transfers | [`../inventory/`](../inventory/) | `/inventory`, `/inventory/ledgers`, `/inventory/performance`, `/inventory/transfers` (+ create/preview) |
| Field visits / JOEY embed | [`../merchandising/`](../merchandising/) | `/merchandising` |
| PO list, drafts, detail | [`../orders/`](../orders/) | `/orders`, `/orders/drafts` (+ `/orders/:uuid` shared) |
| Doors / assignments (admin CRM) | [`../crm-assignments/`](../crm-assignments/) | `/retail-stores`, `/stores`, `/locations/sales-status` (rep mirrors; thin) |
| Auth / entry | this pack | `/`, `/login`, `/signup` |
| Admin root redirect | this pack (thin) | `/admin` → `/admin/dashboard` |
| Dev-only | this pack | `/test/dashboard` |

**Overlap rule:** Detail tables, live captures, and seed schemas stay in the sibling pack. Rep-facing documents the **rep URL**, shell chrome, and twin page status; deep improvements link out.

```
Rep nav (live + twin)
├── Inventory                         /inventory
│   ├── Ledgers                       /inventory/ledgers          ← twin missing
│   ├── Performance                   /inventory/performance     ← twin missing
│   └── Transfers                     /inventory/transfers
│       ├── Create                    /inventory/transfers/create  ← twin missing
│       └── Preview                   /inventory/transfers/preview ← twin missing
├── Merchandising                     /merchandising
├── Orders                            /orders · /orders/drafts
├── Stores / retail                   /stores · /retail-stores     ← twin missing
└── Location sales status             /locations/sales-status      ← twin missing
```

Twin rep nav today (`d2r-app/src/lib/nav.ts`): My inventory · Transfers · Orders · Merchandising (subset of live tree).

---

## Auth / entry

| Route | Purpose | Live | Twin | Coverage |
|-------|---------|------|------|----------|
| `/` | Role redirect | Clerk → app home | `src/app/page.tsx` — admin→dashboard, client→merch admin, else→`/merchandising` | stub-in-twin |
| `/login` | Auth | Clerk hosted | `src/app/login/page.tsx` (+ DEV_AUTH) | stub-in-twin |
| `/signup` | Invite-gated signup | Clerk | **missing** | mapped-ui-only |
| `/admin` | Admin root | Redirect dashboard | redirect / no dedicated page | mapped-ui-only |
| `/test/dashboard` | Internal test | Bundle route | **missing** | mapped-ui-only |

Signed-out HTML captures under `exports/.../routes/*-signedout.html` all redirect to `/login?redirect_url=…`. No authenticated rep HTML dump this pass (Clerk blocker).

---

## Inventory cluster (rep)

Cross-link: [`../inventory/MAP.md`](../inventory/MAP.md) · [`../inventory/TWIN-STATUS.md`](../inventory/TWIN-STATUS.md)

| Route | Purpose | Live capture | Twin page | Coverage |
|-------|---------|--------------|-----------|----------|
| `/inventory` | On-hand consignment for rep warehouse | Admin sample `inventory-ALP-AdamScott-live.json` reused | `src/app/inventory/page.tsx` | stub-in-twin |
| `/inventory/ledgers` | Rep value / sell-through | Admin ledger live only | **missing** | mapped-ui-only |
| `/inventory/performance` | Sell-through sibling | Admin performance seed | **missing** | mapped-ui-only |
| `/inventory/transfers` | Transfer list (admin scrape links detail here) | `transfers-page1-live.json` | `src/app/inventory/transfers/page.tsx` | stub-in-twin |
| `/inventory/transfers/create` | Create transfer form | Route in URLS.txt | **missing** | mapped-ui-only |
| `/inventory/transfers/preview` | Confirm before submit | Route in URLS.txt | **missing** | mapped-ui-only |

### `/inventory` — twin columns

Product · Variant · SKU · On hand · Available · Committed (subset of admin Levels). Seed: `inventory-sample.json` (ALP / Adam Scott). Brand filter / Transfer / Request stock: live-inferred; not wired in twin.

### `/inventory/transfers` — twin columns

Transfer ID · Store · Warehouse · Status · Items · Approved · Created. Read-only; Create / Approve / Receive stay admin-side in twin. Live admin Transfer ID often deep-links to `/inventory/transfers/:uuid` (rep detail path) — **no twin detail page**.

---

## Merchandising (rep)

Cross-link: [`../merchandising/MAP.md`](../merchandising/MAP.md) · [`../merchandising/TWIN-STATUS.md`](../merchandising/TWIN-STATUS.md)

| Route | Purpose | Live | Twin | Coverage |
|-------|---------|------|------|----------|
| `/merchandising` | Field entry | Clerk then iframe → JOEY app | Offline rollup + optional iframe (`NEXT_PUBLIC_MERCH_APP_URL`) | stub-in-twin (strong offline) |

Twin shows period switcher + matched rep row from JOEY Circle K seeds (Q3/Q2). Visit GPS/photos/survey stay in field app. See merchandising pack for 7-phase flow.

---

## Orders (rep)

Cross-link: [`../orders/MAP.md`](../orders/) · [`../orders/TWIN-STATUS.md`](../orders/TWIN-STATUS.md)

| Route | Purpose | Live capture | Twin | Coverage |
|-------|---------|--------------|------|----------|
| `/orders` | Rep PO list | Admin page-1 headers reused | `src/app/orders/page.tsx` (filter by Sales Rep) | stub-in-twin |
| `/orders/drafts` | Draft POs | mapped-ui-only | `src/app/orders/drafts/page.tsx` | stub-in-twin |
| `/orders/:uuid` | Order detail | Links in admin scrape | `src/app/orders/[id]/page.tsx` | stub-in-twin |

Live headers (from admin capture, applied to twin): PO Number · Store · Account · Customer · Location · Fulfillment · ETA · Total · Sales Rep · Created. Create order / status filter: stub disabled. Drafts: inferred columns only (no live draft dump).

---

## Stores / locations (rep)

Cross-link: [`../crm-assignments/`](../crm-assignments/) (admin retail-stores / assignments)

| Route | Purpose | Live | Twin | Coverage |
|-------|---------|------|------|----------|
| `/retail-stores` | Rep door list | Route in URLS.txt; admin twin is derived stub | **missing** | mapped-ui-only |
| `/stores` | Rep store list (≠ Shopify brand stores) | Route in URLS.txt | **missing** | mapped-ui-only |
| `/locations/sales-status` | Location sales status | Route in URLS.txt; admin `/admin/sales-status` sibling | **missing** | mapped-ui-only |

No authenticated row dumps for these three. Inferred: search, status combobox, Update on sales-status. Do not confuse `/stores` (rep CRM) with `/admin/stores` (Shopify brand registry — shopify-brands pack).

---

## Data dependencies (shared seeds)

| Seed / export | Used by rep twin routes |
|---------------|-------------------------|
| `inventory-sample.json` | `/inventory` |
| `transfers.json` | `/inventory/transfers` |
| `merchandising-joey_circle_k-2026-Q3.json` (+ Q2) | `/merchandising` |
| `orders.json` (from `orders-page1-live.json`) | `/orders`, `/orders/:uuid` |
| `users.json` | Rep name match for merch + orders filter |

---

## Coverage summary

| Route | Live UI known | Live rows | Twin page | Fidelity |
|-------|---------------|-----------|-----------|----------|
| `/` · `/login` | Yes | N/A | Yes | Medium (DEV_AUTH vs Clerk) |
| `/signup` · `/admin` · `/test/dashboard` | Bundle | N/A | No | Low |
| `/inventory` | Yes | Sample via admin | Yes | Medium |
| `/inventory/ledgers` · `/performance` | Route | No | No | Low |
| `/inventory/transfers` | Yes (via admin) | Page 1 | Yes (RO) | Medium |
| `/inventory/transfers/create` · `/preview` | Route | No | No | Low |
| `/merchandising` | Yes (iframe) | Rollup seed | Yes | High offline / medium field |
| `/orders` · `/drafts` · `/:uuid` | Partial | Page-1 sample | Yes (stubs) | Low–medium |
| `/retail-stores` · `/stores` · `/locations/sales-status` | Route | No | No | Low |

**Browser this pass:** Clerk-gated; mapping from URLS.txt, signed-out redirects, sibling domain captures, and twin source. See [`IMPROVEMENTS.md`](./IMPROVEMENTS.md).
