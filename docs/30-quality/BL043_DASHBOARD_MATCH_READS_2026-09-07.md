# BL-043g.3 — Dashboard Match Reads

- Date: 2026-09-07
- Scope: independent bounded Sezon maçları summary in Genel Bakış.
- Authority: approved BL-043 continuation; existing ADR-0007/0014 boundaries.
- No backend/API/schema/migration/dependency or permission-policy change.
- Verdict: Pass for this dashboard slice; BL-043 remains in progress.

## Delivery

Genel Bakış calls the existing match catalog with limit=3 and no cursor. It
preserves chronological season ordering (date ASC, ID ASC), including past
matches; this is not a silently changed future-only/upcoming-match policy.
Only the three minimal records and full total are read. The UI shows displayed
count/full total, preserves links and amber/shadcn styling, and uses hasBoard
instead of downloading a board document for each badge.

The existing scope-keyed dashboard child resets match data on club/team/season
changes and rejects late responses. Missing concrete-season context does not
broaden to all seasons or hide unrelated summary cards. Loading and match
failure are distinct from genuine empty/zero results. The match retry refreshes
only this request, not training/drill summaries or the entire workspace.

The shared matches getter is no longer consumed by this route. Hafta and match
detail still use legacyContext/provider matches, so the complete shared list
is preserved. This step alone does not eliminate shared workspace JSON traffic.
Catalog totals and rows remain live independent reads; no immutable snapshot
or production capacity guarantee is implied.

## Verification

- Four new dashboard regressions plus eight existing tests passed: chronological
  minimal card/marker/link parity, 3/31 totals, loading/error/independent retry,
  team/season races and missing concrete-season scope. Throwing shared matches,
  drills and plans getters prevent accidental full-array consumption. Existing
  workspace-gating and zero-summary cases also check match behavior.
- Root quality passed: 571 backend tests, 93 frontend tests (20 files), Sites
  4/4, typecheck, lint, format, builds, CDSK/links and git whitespace.
- API E2E passed: 5 suites / 39 tests, 7.98 seconds, on disposable PostgreSQL 16.
- Extended Chromium flow checks a limit=3/no-cursor response with three scalar
  matches out of 31, no board/analysis/video JSON, original earliest match,
  equal-date ordering, both board badges, selected/all-season scope and detail
  navigation. It captures dashboard-matches-{width}.png at 1440/1024/390 px in
  ignored output/playwright/ngcs-coach-flow/results.
- All 11 Chromium tests passed in 2.7 minutes, including plan snapshot, match
  board, cross-tenant, session and dirty navigation flows. All three viewport
  screenshots were visually inspected; overflow checks passed.
- Local read-only preview shows one retained match as 1/1 with the existing
  1 plan / 2 players / 5 exercises / 0 attendance summary intact. Local servers
  remain on 3001/4000, with Genel Bakış open; no retained business write occurred.
- Six existing migrations deployed to disposable PostgreSQL 16 database
  ngcs_bl043_dashboard_matches_e2e; status current and schema diff empty.
  Retained fingerprint matched 24 tables / 25 rows (session/audit excluded).
  After zero active connections were checked, only this synthetic test database
  was dropped and its absence verified. No retained reset/seed/migration.
- Final CDSK/link checks passed: 92 Markdown documents and zero broken local
  links; git diff --check passed. Cumulative worktree preserved, no commit/push.

## Next and limitations

Next: BL-043g.4 independent Hafta match reads, then independently authorized
match detail, before removing shared matches. Member reads, pilot volume/owner/
SLO and BL-044/045/M4 remain open; unknown policy/production inputs stay TBD.
