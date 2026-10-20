# BL-043f.2 — Dashboard Drill Total Cutover

- Date: 2026-09-07
- Scope: independent dashboard exercise total using the existing catalog API.
- Authority: approved BL-043 continuation and existing ADR-0007/0012/0014/0022/0023
  compatibility boundaries. No backend/API/schema/migration/dependency change.
- Verdict: Pass for this dashboard slice; BL-043 remains in progress.

## Delivery

Dashboard no longer reads `workspace.drills` or computes `drills.length`.
`getDrillOverview(groupId)` calls the existing `/drills/catalog/page` with limit=1,
no category and no cursor. The card renders the full response `total`, not the
one returned item's count. The one minimal card is unused; no board JSON is
transferred by this read. This deliberately reuses the existing authorized
catalog instead of adding a count endpoint or a new backend projection contract.

Current group access, principal drill visibility and server-derived group age
remain exactly as in the library. This is the coach workspace's accessible
exercise counter, not a change to the separate legacy club dashboard endpoint.
Exercises have no season ownership/filter; changing selected season remounts and
refreshes the same group total, rather than inventing a season-specific count.

Club/club-season/team/group/season keys remount the read and discard late results.
Pending/failed reads show an unavailable dash rather than a false zero. A named
loading state and a separate error/retry action allow drill recovery without
reloading training summaries or workspace resources. Successful empty responses
show zero. Navigating back after a saved exercise requests a fresh total.
Existing shadcn stat cards and visual tokens are preserved; each stat now has an
accessible label for unambiguous checks.

The provider's full drill list still serves tactics and training-detail choices;
it is intentionally neither removed nor replaced with a partial page. Therefore
this slice does not claim that the whole workspace downloads fewer records yet.
Member/match sources and the other dashboard counters remain unchanged.

## Verification

- Root quality passed backend/frontend typecheck, lint, format, unit, builds,
  Sites 4/4, CDSK, links and whitespace.
- Backend unit suite remains 44 suites / 532 tests. Disposable PostgreSQL 16
  API suite remains 5 suites / 38 tests; role/tenant/cursor/projection checks pass.
- Frontend suite is 17 files / 73 tests. Dashboard has eight tests, three new
  drill cases: full 35 count from a one-item response, independent loading/error/
  retry, and stale team response rejection plus all-season refresh. A throwing
  workspace getter rejects shared drill reads. Existing missing/loading/failed
  workspace and genuine-empty cases now also cover exercise reads.
- All 11 Chromium tests passed in 2.6 minutes. Network evidence checks the
  limit=1 response has one minimal item, no jsonData and full total 35; the UI
  shows 35 across season switches and 1440/1024/390 px without overflow.
  Existing create-board flow returns to dashboard and verifies total 36 after
  saving a club drill, then completes plan snapshot/match board/cross-tenant
  checks. Existing session and dirty-navigation tests remain green.
  All five catalog/history/training/drill fixture flags, persistent-session
  opt-in, synthetic credentials, isolated ports 3500/4500 and disposable
  `ngcs_bl043_drill_overview_e2e` were used.
- Migration deploy passed all six existing migrations on the disposable target;
  status current and schema diff empty. Retained business fingerprint matches
  before/after: 24 tables / 25 rows, excluding session/audit lifecycle records.
  Zero active connections were verified before removing the disposable DB;
  absence was confirmed. Only regenerable synthetic fixtures were removed.
- Local read-only preview shows 1 plan, 2 players, 5 exercises and 0 attendance;
  the 75-minute/four-phase demo link remains. Existing dev servers stay on
  3001/4000 with dashboard open. A stale development-module screen after rebuild
  recovered on reload; no retained reset, seed, migration or business write.
- Final CDSK and Markdown checks pass: 87 documents, zero broken local links;
  `git diff --check` passes. Cumulative worktree changes preserved; no commit/push.

No retained database seed/reset/migration or business write is authorized by this
slice. Browser artifacts stay in ignored `output/playwright/ngcs-coach-flow`.

## Remaining work and rollback

Next BL-043f.3: bounded tactics catalog filtered by the board-kind marker on the
server, not filtering one library page on the client. Then migrate training-detail
drill options while preserving selection and source/plan scope checks. Only once
these consumers migrate can shared drill state/full GET be removed. Match/member
reads, pilot query budgets and owner/SLO TBD, BL-044/045 and M4 remain open.

Rollback restores the previous dashboard exercise counter and removes its
independent read. The unchanged shared array still exists. No database rollback
is needed; preserve all earlier cumulative worktree changes. No commit/push.
