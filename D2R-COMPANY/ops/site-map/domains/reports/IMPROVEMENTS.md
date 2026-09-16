# Reports domain — live system improvement ideas

Flaws and friction for the **live** Direct2Retailers reports module (and twin-visible gaps that imply live debt). Not twin parity tickets.

---

## 2026-09-16 mapping pass

### Capture / observability

1. **No authenticated report exports in weekly dump** — Hub + four runners exist in URLS.txt, but `exports/2026-09-16/live/` has zero report-runner JSON. Ops cannot regress report columns week-to-week without a dedicated scrape.

2. **Signed-out shell only** — `admin_reports-signedout.html` is a Clerk redirect; passive auditing cannot see report IA or filters.

### Product / IA

3. **Reports vs operational cluster overlap** — Inventory reports sit next to `/admin/inventory` and ledgers; commissions report sits next to `/admin/commissions`. Users may not know which surface is “export analytics” vs “operate daily.”

4. **Inferred Run + Export without job UX** — Site map assumes Run/Export; without live scrape it is unclear whether reports are sync tables, async jobs, or CSV downloads. Large inventory/sales windows likely need async export (same lesson as orders at 1k+ pages).

5. **Period semantics unclear** — Quarter vs calendar vs merch period (Q2–Q5) may diverge across brand-sales, rep-sales, commissions, and merchandising. Cross-report period mismatch breaks executive rollups.

### Data trust

6. **Revenue vs consignment confusion** — Twin (and possibly live) brand/rep sales may mix order revenue with inventory value-held. Without labeled metric definitions, finance and ops will disagree on headlines.

7. **Commissions report vs commission runs** — Two paths (`/admin/reports/commissions` vs `/admin/commissions`) without a captured column delta invites double entry or missed approvals.

8. **Inventory report sample depth** — Full store×warehouse matrix is combinatorial (same flaw as inventory Levels). A “report” that cannot export all warehouses is an incomplete audit tool.

### UX

9. **Hub discoverability** — If hub is only a link list with no last-run timestamps or schedule, admins cannot tell whether overnight jobs succeeded.

10. **Filter controls may be label-only offline** — Twin shows All/All placeholders; if live mirrors that until Run, empty first paint will look broken.

---

## Prioritized for owner review

| Priority | Issue | Suggested direction |
|----------|-------|---------------------|
| P0 | No live report captures in export SOP | Add `/admin/reports/*` to weekly authenticated scrape |
| P0 | Metric definitions (revenue vs held vs commission) | Document glossary on hub; label columns explicitly |
| P1 | Async export for large windows | Job + download link; row caps |
| P1 | Period model alignment across reports + merch | Single period picker vocabulary |
| P2 | Clarify commissions report vs runs | Cross-link + distinct titles/subtitles |
| P2 | Inventory reports full-warehouse export | Server-side dump, not filter iteration |
