# Reports domain — live admin route map

**Live app:** https://app.direct2retailers.com  
**Mapped:** 2026-09-16  
**Domain scope:** reports hub + four runners (5 paths)  
**Machine interactions:** [`interactions.json`](./interactions.json)  
**Live system flaws:** [`IMPROVEMENTS.md`](./IMPROVEMENTS.md)  
**Twin status:** [`TWIN-STATUS.md`](./TWIN-STATUS.md)

## Sources used

| Source | Path | Notes |
|--------|------|-------|
| Canonical site map | `ops/SITE-MAP.md`, `ops/SITE-MAP-INTERACTIONS.json` | Nav tree + inferred Run/Export + filters |
| Route discovery | `exports/.../routes/URLS.txt` | All five `/admin/reports*` URLs present |
| Signed-out HTML | `exports/.../routes/admin_reports-signedout.html` | Clerk redirect only |
| Live JSON | `exports/2026-09-16/live/` | **No dedicated report-runner captures** |
| Twin pages | `d2r-app/src/app/admin/reports/**` | Seed-proxied stubs (ledger / inventory / commissions) |
| Browser MCP | cursor-ide-browser | No authenticated session this pass |

## Coverage legend

| Status | Meaning |
|--------|---------|
| `captured` | Live table headers and/or rows scraped into exports |
| `captured-partial` | Live scrape exists but incomplete |
| `mapped-ui-only` | Route confirmed; controls inferred from bundles / site map |
| `stub-in-twin` | Twin page exists with seed proxy; live UI not scraped |
| `blocked` | Needs authenticated browser |

## Reports nav (live)

```
Reports hub → Brand sales · Rep sales · Inventory reports · Commissions
```

Sibling finance (owned by payouts lane, linked from commissions report): `/admin/commissions`.

---

## Route table

| Path | Title | Purpose | Coverage | Live export | Twin page |
|------|-------|---------|----------|-------------|-----------|
| `/admin/reports` | Reports | Hub linking four runners | **mapped-ui-only** | — (signed-out shell only) | Yes — link list |
| `/admin/reports/rep-sales` | Rep sales | Sales / movement by rep | **stub-in-twin** | — | Yes — ledger-performance proxy |
| `/admin/reports/brand-sales` | Brand sales | Sales / held by brand | **stub-in-twin** | — | Yes — ledger brand rollup proxy |
| `/admin/reports/commissions` | Commissions | Commission analytics | **stub-in-twin** | — | Yes — `commissions.json` rollup |
| `/admin/reports/inventory-reports` | Inventory reports | Inventory analytics export | **stub-in-twin** | — | Yes — inventory-sample proxy |

---

## Per-route detail

### `/admin/reports` — Hub

**Coverage:** `mapped-ui-only`

**Purpose:** Entry point for sales, inventory, and commission report runners.

**Actions:** Navigation links only (no Run/Export on hub in twin).

**Links out:** brand-sales, rep-sales, inventory-reports, commissions.

**Gap:** Authenticated hub chrome / card layout not scraped.

---

### `/admin/reports/rep-sales` — Rep sales

**Coverage:** `stub-in-twin`

**Purpose:** Sales performance by sales rep for a selected period.

**Inferred live controls:** Rep combobox, Period combobox, Run, Export.

**Twin table (proxy — not live headers):**

| Rep | Sell-through | Sold 7d | Last sale | Value held |

**Data deps (twin):** `ledger-performance.json` via `getLedgerPerformance()`.

**Gap:** Live revenue/orders columns unknown until authenticated scrape.

---

### `/admin/reports/brand-sales` — Brand sales

**Coverage:** `stub-in-twin`

**Purpose:** Sales / consignment held rolled up by brand.

**Inferred live controls:** Brand, Period, Run, Export.

**Inferred live headers (site map):** Brand, Revenue, Orders, Units.

**Twin table (proxy):** Brand, Value held (rollup), Units held, Rep rows + summary cards (Value held, Sell-through, Units held).

**Data deps (twin):** `ledger-by-rep-brand.json` + ledger performance summary.

**Gap:** Shopify order revenue not wired; twin uses consignment ledger stand-in.

---

### `/admin/reports/commissions` — Commissions report

**Coverage:** `stub-in-twin`

**Purpose:** Commission analytics across periods/reps (report surface distinct from `/admin/commissions` run queue).

**Inferred live controls:** Period, Rep, Run, Export.

**Twin:** Brand rollup table (Brand, Lines, Total) + KPI cards; link to `/admin/commissions`.

**Data deps (twin):** `commissions.json` via `getCommissions()`.

**Gap:** No live finance/report capture; seed scaffold only (shared with payouts lane).

---

### `/admin/reports/inventory-reports` — Inventory reports

**Coverage:** `stub-in-twin`

**Purpose:** Inventory analytics / export runner (warehouse × brand).

**Inferred live controls:** Warehouse, Brand, Run, Export.

**Twin table (sample proxy):** SKU, On hand, Available, Committed.

**Links out:** `/admin/inventory/ledgers`.

**Data deps (twin):** `inventory-sample.json` (ALP / Adam Scott only).

**Gap:** Full warehouse matrix and live report column set unknown.

---

## Data dependency index

| Export / seed | Routes fed |
|---------------|------------|
| *(none live)* | All five — blocked on authenticated report scrape |
| `ledger-performance.json` | `/admin/reports/rep-sales`, brand-sales summary |
| `ledger-by-rep-brand.json` | `/admin/reports/brand-sales` |
| `commissions.json` | `/admin/reports/commissions` |
| `inventory-sample.json` | `/admin/reports/inventory-reports` |

---

## Next capture pass (authenticated browser)

1. Hub layout — cards vs link list, any global period control  
2. Each runner — confirmed headers, filter option lists, Run/Export behavior  
3. Whether runners hit APIs vs client-side tables  
4. Commissions report vs `/admin/commissions` column delta  
5. Inventory reports vs `/admin/inventory` / ledgers overlap
