# Improvements backlog (not twin parity)

Product upgrades for the **live** Direct2Retailers system. Twin agents rebuild parity only; park upgrades here.

---

## Pulse / dashboard (`sandbox/pulse/dashboard-signals` — 2026-09-16)

Parity delivered in twin: `/admin/dashboard` (ledger + Adam Scott pulse sample), `/admin/pulse`, `/admin/pulse/signals` from `pulse-signals.json`. Goals / scores / health are consistent stub placeholders.

### P0 — Clarity & trust

1. **Reorder rate vs reorder miss rate** — Adam Scott shows 97% / 90% together; add tooltips + formula sanity check.
2. **Pulse score decomposition** — Score 74 with no weights; Scores page needs contributors linked to the same rep/period as Signals.
3. **Dashboard single source of truth** — No dedicated dashboard KPI capture; align Dashboard vs Ledgers vs Pulse with an as-of timestamp.

### P1 — Coverage & UX

4. **Multi-rep pulse batch export** — Unblocks Scores ranking, Health RAG counts, Goals attainment (~189 users).
5. **Shared URL filter bar** — Persist rep + period across Goals / Health / Scores / Signals.
6. **Signals CSV export** — QBR-ready KPI dump (Export inferred on Scores only today).
7. **Revenue + period labeling** — Format `$22,408` and show range subtitle on every period-scoped monetary card.
