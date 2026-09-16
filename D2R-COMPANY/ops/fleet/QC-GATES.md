# QC gates — per-PR checklist (twin parity)

Traffic Controller rejects PRs that skip these gates. Agents run locally before requesting review.

**Smoke script (Traffic Controller / CI-local):**

```bash
cd d2r-app
node scripts/qc-twin-smoke.mjs
# or: npm run qc:twin-smoke
```

Exit code `0` = seeds + key route files present. Does **not** replace typecheck, lint, or header parity review.

---

## Gate A — Branch hygiene

- [ ] Branch name matches `sandbox/<area>/<single-issue>`
- [ ] PR title names the **single** issue (no “and also…”)
- [ ] Diff stays inside lane **allowed path globs** ([`AGENT-FLEET.md`](./AGENT-FLEET.md))
- [ ] No edits to another lane’s pages/components/API
- [ ] No `.env`, tokens, Clerk secrets, Shopify tokens, or live session cookies committed
- [ ] No force-push; not targeting direct write to `main` without PR

**Cross-lane check:**

```bash
git diff --name-only origin/main...HEAD
# every path must match the lane globs for this PR
```

---

## Gate B — Build health

From `d2r-app/`:

```bash
npx tsc --noEmit
npm run lint
```

- [ ] Typecheck clean (or only pre-existing errors outside your paths — note them)
- [ ] Lint clean for touched files
- [ ] `npm run build` optional for small seed-only PRs; **required** for page/layout/API changes

---

## Gate C — Twin smoke (Traffic Controller)

```bash
npm run qc:twin-smoke
```

- [ ] Script passes
- [ ] If you added a new parity route, update `REQUIRED_PAGES` in `scripts/qc-twin-smoke.mjs` on `sandbox/traffic-controller` (or ask Traffic Controller)

---

## Gate D — Route loads (manual / browser)

With `npm run dev` (port per local convention, often `3001`):

- [ ] Touched routes return 200 (no server crash)
- [ ] Login / DEV_AUTH still reaches admin shell
- [ ] No blank white screen / uncaught client exception in console for the changed page

Minimum routes by lane:

| Lane | Must load |
|------|-----------|
| Shell | `/login`, `/admin/dashboard` |
| Merch | `/admin/merchandising`, `/merchandising` |
| Inventory | `/admin/inventory`, `/admin/inventory/ledgers`, `/admin/inventory/transfers`, `/admin/warehouses` |
| Orders | `/admin/orders`, `/orders` |
| Shopify | `/admin/shopify`, `/admin/stores` |
| Pulse | `/admin/pulse`, `/admin/pulse/signals`, `/admin/dashboard` |
| Payouts | `/admin/payouts`, `/admin/commissions`, `/admin/settlements` |
| CRM | `/admin/users`, `/admin/rep-assignments` |
| Reports | `/admin/reports` (+ any runner touched) |

---

## Gate E — Seed ↔ live header parity

For any table UI change:

1. Open the matching live capture under `D2R-COMPANY/ops/exports/2026-09-16/live/`.
2. Confirm twin column headers match live (order + labels), or document intentional subset in PR body with Traffic Controller ACK.
3. Confirm seed file under `d2r-app/data/seed/` is the shape the page reads (`items` vs `rows`, camelCase vs Title Case — see `site-map/QC-FINDINGS.json`).

| Live capture | Seed | Typical page |
|--------------|------|--------------|
| `inventory-ALP-AdamScott-live.json` | `inventory-sample.json` | `/admin/inventory` |
| `ledger-performance-live.json` | `ledger-performance.json` | `/admin/inventory/ledgers` |
| `transfers-page1-live.json` | `transfers.json` | `/admin/inventory/transfers` |
| `warehouses-live.json` | `warehouses.json` | `/admin/warehouses` |
| `brand-levels-live.json` | `brand-levels.json` | `/admin/inventory/refresh` |
| `merchandising-joey_circle_k-2026-Q3-live.json` | `merchandising-joey_circle_k-2026-Q3.json` | `/admin/merchandising` |
| `orders-page1-live.json` | `orders.json` | `/admin/orders` |
| `shopify-health-live.json` | `shopify-health.json` | `/admin/shopify` |
| `stores-live.json` | `stores.json` | `/admin/stores` |
| `pulse-signals-AdamScott-live.json` | `pulse-signals.json` | `/admin/pulse/signals` |
| `users-live.json` | `users.json` | `/admin/users` |
| `assignments-page1-live.json` | `assignments.json` / `rep-assignments.json` | `/admin/rep-assignments` |
| `businesses-live.json` | `businesses.json` | `/admin/businesses` |

- [ ] Headers checked against live JSON (or SITE-MAP route table)
- [ ] No demo placeholder columns left when live seed exists (QC-001–QC-007 class bugs)

---

## Gate F — Parity vs improvements

- [ ] PR does **not** implement live-system product upgrades (alerting, bulk UX redesign, etc.)
- [ ] Any systemic flaw discovered → add a line to [`../IMPROVEMENTS-BACKLOG.md`](../IMPROVEMENTS-BACKLOG.md) (Traffic Controller or domain IMPROVEMENTS.md), do not ship in parity PR

---

## Gate G — Rollback readiness

- [ ] PR description includes rollback: `git revert <sha>` after merge, or delete branch if unmerged
- [ ] Single-issue scope means revert will not yank unrelated work

---

## Traffic Controller review stamp

PR body should include:

```
Lane: <n · name>
Allowed paths respected: yes
QC: A B C D E F G
Live capture compared: <filename or n/a>
Rollback: git revert <sha after merge>
```
