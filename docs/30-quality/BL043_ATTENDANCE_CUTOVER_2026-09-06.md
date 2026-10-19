# BL-043e.5 — Attendance Pages and Shared Plan Cutover

- Date: 2026-09-06
- Scope: bounded attendance catalog and removal of the frontend workspace's
  full training-plan array. No schema/migration/dependency or permission change.
- Authority: approved BL-043 continuation; ADR-0007/0014/0019/0022/0023 boundaries.
- Verdict: Pass for attendance/shared-plan cutover; other BL-043 resources remain open.

## Delivery

`GET /training-plans/catalog/attendance/page` reuses the catalog query parser,
current legacy group authorization, server-derived tenant scope, exact optional
season and optional half-open period filters. Dates/nulls/ID cursors and 25 default
/ 100 maximum limits are unchanged. The attendance projection returns minimal
plan fields and scalar `presentCount`, with no attendance/player/board/drill arrays
or phase aggregation. PRESENT aggregation is limited to returned plan IDs and
the same authorized filter. Full plan/duration/PRESENT totals ignore the cursor;
`summary.playerCount` counts all current PLAYER group memberships, not a page.
PLAYER principals get only their own PRESENT records and membership count.
Other client-supplied projection/player/tenant fields remain invalid.

The frontend uses independent 25-record pages, scope keys, late-response rejection,
loading/failure/retry, empty scope versus empty continuation, and previous-page
recovery. Undated plans retain their attendance detail links. Counts come from
the server, never the shared member or plan arrays. Cards label attendance records
separately from current players: historical attendees need not match today's
roster, so no historical completion percentage is inferred.

All four consumers (training catalog, dashboard, week, attendance) now own their
bounded reads. `WorkspaceProvider` no longer imports/calls `listTrainingPlans`,
stores `plans`, or filters an entire plan collection by season. The legacy REST
list endpoint remains compatible for external/older clients; no data is removed.
Workspace metadata/drill/member refresh still works. Detail reads and existing
write endpoints remain unchanged. Navigation remounts fresh summary reads;
successful drill changes still refresh workspace resources before returning.

## Verification

- Frontend: 16 files / 65 unit tests passed. Five new attendance cases cover full
  counts/scalar rows, pagination, loading/error/retry, stale scope/all seasons,
  missing workspace and empty continuation. Getter traps reject shared plans or
  members. Workspace race tests now use its remaining drill resource and assert
  the old full plan API is unused. Detail → add drill → actual paged catalog
  verifies updated duration/phase totals without the deleted shared array.
- Backend: 43 suites / 508 tests passed; four new cases cover minimal page aggregation/full roster,
  PLAYER self-only counts, empty continuation and denied/invalid scopes.
- Disposable API E2E: 5 suites / 37 tests passed. The new attendance case checks
  150 selected / 152 all-season plans, two-player full counts, coach versus PLAYER
  visibility, current group/club/season denial and mass-assignment rejection.
  An authorized ABSENT write changes page and full totals; restoring PRESENT
  verifies compatibility with the existing atomic write endpoint.
- Root quality passed both typechecks/lint/format/builds, Sites 4/4, CDSK, links
  and whitespace. Final documentation checks cover 85 Markdown files with zero
  broken local links.
- The extended browser flow passed attendance 25+6 pagination for 31 plans,
  full two-player totals, 1440/1024/390 px controls/overflow, detail mark →
  attendance refreshed count → dashboard refreshed count, and existing daily
  pages/catalog/draft detail behavior. Its network assertion observed zero
  GET /training-plans requests throughout login and these navigation/write flows.
- Local read-only preview: one plan, two current players, zero recorded PRESENT
  entries and the existing demo detail link. The existing app/backend remain on
  ports 3001/4000, with Yoklama open. No real attendance was marked.
- Disposable migration status current, schema diff empty. Retained business
  fingerprint before/after matched 24 tables / 25 rows, excluding session/audit
  lifecycle records; no retained reset, seed, migration or business write.
- Complete Chromium suite: all 11 tests passed (2.6 minutes), including existing
  scope/session/dirty-navigation and cross-tenant board workflows. After verifying
  zero active connections, the disposable DB was removed and absence confirmed.
  Only regenerable synthetic fixtures were removed; no commit or push was made.

Browser uses disposable `ngcs_bl043_attendance_e2e`, isolated ports 3500/4500,
synthetic credentials, destructive-test/persistent-session opt-ins and
PLAYER_PAGE/CATALOG/HISTORY/TRAINING_PAGE fixtures. Artifacts remain in ignored
`output/playwright/ngcs-coach-flow`.

## Remaining boundary and next step

This removes the complete training-list fetch, not every unbounded workspace
resource. Drills, matches and members/detail attendance still have their existing
read paths. Next BL-043 slice: bounded exercise-library reads and full counters,
followed by remaining match/member consumers and pilot query budgets. Do not
replace shared arrays with first pages before their remaining consumers migrate.
Pilot owner/SLO and rollout inputs stay TBD. BL-044/045 and M4 remain open.

Rollback restores the prior workspace full plan array together with its old
attendance consumer; never revert only one side. The additive attendance endpoint
can remain. No data rollback is needed; preserve earlier cumulative worktree edits.
