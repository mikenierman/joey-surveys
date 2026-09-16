# Integration ready — wave 3 complete

Local tip: **`sandbox/integration`** (see `git rev-parse sandbox/integration`).  
Worktree used for merges: `/private/tmp/d2r-merch-integration`.  
**Do not push** until Traffic Controller opens a reviewed PR.

Smoke **PASS** · `tsc --noEmit` **PASS** · map-pack **merged**.

---

## Checkout (main repo)

Main checkout at `/Users/chrisprysok/d2r-merch` often sits on another sandbox with **uncommitted** ops/export noise. Do **not** force-checkout if that would discard work.

```bash
# Same git dir as the integration worktree — branch tip is already local:
git -C /Users/chrisprysok/d2r-merch rev-parse sandbox/integration

# Safe switch only when the working tree is clean (or stash first):
cd /Users/chrisprysok/d2r-merch
git status -sb
git checkout sandbox/integration

# Or keep dirty tree and use the clean worktree:
cd /private/tmp/d2r-merch-integration   # already on sandbox/integration
```

---

## Run the twin

```bash
cd d2r-app
npm install          # first time / after lockfile change
npm run dev          # http://localhost:3000 (DEV_AUTH offline login)
```

Copy `.env.example` → `.env.local` if needed (placeholders only; no secrets in git).

---

## Smoke + typecheck

```bash
cd d2r-app
node scripts/qc-twin-smoke.mjs
# or: npm run qc:twin-smoke
npx tsc --noEmit
```

Expect: 21/21 seeds, 23/23 required pages, exit 0.

---

## Rollback one sandbox

After merge, prefer revert of the **sandbox tip** (or the merge commit with `-m 1`):

```bash
# Example — undo a single merged sandbox tip on integration:
git revert <sandbox-tip-sha> --no-edit

# Or revert the merge commit that brought it in:
git revert -m 1 <merge-commit-sha> --no-edit
```

Tip SHAs and rollback notes: [`BRANCH-MATRIX.md`](./BRANCH-MATRIX.md) · narrative: [`MERGE-LOG.md`](./MERGE-LOG.md).

Unmerged sandbox (not on integration): `git branch -D sandbox/<area>/<single-issue>`.

---

## 16 intentional PendingLane stubs (rebuild later)

From `d2r-app/src/lib/nav.ts` → `PENDING_ADMIN_PATHS` / `PENDING_LANE_TITLES` (middleware → admin `PendingLane`):

| Path | Title |
|------|-------|
| `/admin/accounts` | Accounts |
| `/admin/contacts` | Contacts |
| `/admin/locations` | Locations |
| `/admin/locations/import` | Import locations |
| `/admin/sales-status` | Sales status |
| `/admin/rep-assignments/relationships` | Relationships |
| `/admin/merchandising/stores` | Merchandising stores |
| `/admin/inventory/transfers/terms` | Transfer terms |
| `/admin/shopify/apps` | Shopify apps |
| `/admin/shopify/test` | Shopify test |
| `/admin/payments` | Payments |
| `/admin/deposits` | Deposits |
| `/admin/receipts` | Receipts |
| `/admin/emails` | Emails |
| `/admin/files` | Files |
| `/admin/diagnostics/order-timeline` | Order timeline |

Audit: [`LINK-AUDIT.md`](./LINK-AUDIT.md).

---

## Webhooks / install logs

| What | Path |
|------|------|
| Webhook endpoint | `POST /api/webhooks/shopify` → `d2r-app/src/app/api/webhooks/shopify/route.ts` |
| Docs | `d2r-app/docs/SHOPIFY-WEBHOOKS.md` |
| Runtime ops stream (gitignored) | `d2r-app/data/runtime/ops-events.jsonl` |
| Runtime install logs (gitignored) | `d2r-app/data/runtime/install-logs.json` |
| Runtime automation runs (gitignored) | `d2r-app/data/runtime/automation-runs.json` |
| Seed samples (committed) | `d2r-app/data/seed/shopify-install-logs.json` |
| Admin UI | `/admin/shopify` (install + automation sections) |

Helpers: `d2r-app/src/lib/ops-logs.ts`, `d2r-app/src/lib/webhooks.ts`.
