# D2R Failsafe — workspace pointer

**Intent:** Merch is a **D2R function/module** (embed or future `/merchandising` routes), not a separate conflicting product. Keep the field app at repo root; twin shells + admin live in `d2r-app/`.

| Asset | Path |
|-------|------|
| Twin app (Next.js) | [`d2r-app/`](d2r-app/) |
| Merch field app (embed target) | this repo root (`joey-surveys`) |
| Owner infra checklist | [`D2R-COMPANY/ops/runbooks/OWNER-INFRA-SETUP.md`](D2R-COMPANY/ops/runbooks/OWNER-INFRA-SETUP.md) |
| Client one-pager | [`D2R-COMPANY/ops/runbooks/CLIENT-ONE-PAGER.md`](D2R-COMPANY/ops/runbooks/CLIENT-ONE-PAGER.md) |
| Cutover runbook | [`D2R-COMPANY/ops/runbooks/CUTOVER-RUNBOOK.md`](D2R-COMPANY/ops/runbooks/CUTOVER-RUNBOOK.md) |
| Export status | [`D2R-COMPANY/ops/exports/EXPORT-PASS-STATUS.md`](D2R-COMPANY/ops/exports/EXPORT-PASS-STATUS.md) |
| Integration tip | [`D2R-COMPANY/ops/fleet/INTEGRATION-READY.md`](D2R-COMPANY/ops/fleet/INTEGRATION-READY.md) |
| CTO trail drop zone | `D2R-SECURE-BACKUP/2026-09-13/docs/cto-build-trail/` (gitignored vault) |

```bash
cd d2r-app && npm run dev -- --port 3001
# optional embed host:
npm start   # repo root, default http://localhost:3000
```
