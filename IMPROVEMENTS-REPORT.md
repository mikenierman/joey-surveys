# JOEY Merch — 10 Improvements Report

**Date:** 2026-09-16  
**Status:** Implemented + tested · **not committed** (awaiting your OK)  
**Test run:** `CI=true npm test -- --watchAll=false` → **11 suites, 73 tests, all passed**

---

## Summary

All 10 client-roadmap MVPs are wired into the JOEY × Circle K visit app (`src/`), with unit coverage for new libs and existing GPS/visit/photo/metrics suites still green.

| # | Improvement | MVP shipped |
|---|-------------|-------------|
| 1 | Offline-first queue + sync status | `pending_sync` local queue, `flushPendingVisits` on `online`, route Sync chip |
| 2 | Geofence harden + camera-only | Soft geofence + required mismatch note; `geofenceGate`; `capture=environment` |
| 3 | Compliance + issues | Score from flags; admin issue queue with open/in_progress/closed |
| 4 | Photo quality Phase A | Laplacian blur + framing heuristics; retake hint on slot |
| 5 | Dispatch / territories | Division summary, local store→rep assign, route sort helper |
| 6 | Multi-program scaffold | `programConfig` + `/data/programs/joey-circlek.json` |
| 7 | Survey-config scaffold | Phases on program JSON; portal “Survey config” strip |
| 8 | POG / sell-sheet media | `/media/joey/` placeholders; visit ref sheet loads images |
| 9 | Auth roles + audit | Existing role map + `joey_audit_events_v1` log (login/logout/submit/status) |
| 10 | PWA + dwell + push hook | `manifest.json` + `sw.js` (+ push handler); live on-site timer; `dwell_seconds` on submit |

---

## What to verify manually (quick)

1. **Offline:** DevTools → Offline → submit visit → see Sync N on route → go Online → queue flushes (needs Supabase for real flush; local queue still fills without it).
2. **Geofence note:** Force mismatch (or mock) → submit blocked until short note.
3. **Photos:** Capture → blurry/dark hint if heuristics fail → Retake still works.
4. **Admin:** Issues panel + Assign store + Audit log button.
5. **Media:** Visit → View POG / sell sheet → SVG placeholders render.
6. **PWA:** Production build registers SW; push is stub (no push server).

---

## New / touched files (high level)

**Libs:** `photoQuality.js`, `compliance.js`, `audit.js`, `programConfig.js`, `mediaLibrary.js`, `dispatch.js` (+ tests)  
**Core:** `data.js`, `gps.js`, `visitLogic.js`, `App.jsx`, `ReviewPortal.jsx`, `VisitDetail.jsx`, `index.js`  
**Assets:** `public/manifest.json`, `public/sw.js`, `public/data/programs/joey-circlek.json`, `public/media/joey/**`

---

## Explicit non-goals (scaffolds only)

- No enterprise IdP / RLS overhaul (#9 is local audit + demo roles).
- No remote survey builder UI (#7 reads config; phases still implemented in `visitLogic`).
- No real push notification backend (#10 SW `push` listener only).
- Photo quality is client heuristics only (no cloud AI).

---

## Commit

**Not committed.** Say the word and we can commit (exclude secrets / backup trees as needed).
