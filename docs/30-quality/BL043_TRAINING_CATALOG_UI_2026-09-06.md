# BL-043e.2 — Training Catalog UI

- Date: 2026-09-06
- Scope: `/app/trainings` consumes the existing training catalog page API.
- Authority: next-step approval within BL-043 and the accepted MVP/compatibility
  boundaries. No API, schema, migration, dependency or permission change.
- Verdict: Pass for the catalog UI slice; shared-consumer cutover remains open.

## Delivery

The training route no longer derives its catalog by sorting `workspace.plans`.
Its typed client requests 25-record pages with exact legacy group/season IDs and
the existing date/null/ID cursor. Cards use scalar `phaseCount`, not nested drill
arrays. Previous/next controls show current page length and the full server total.
A separate full-scope summary displays scheduled/undated plans, duration and
marked PRESENT attendance; page length is never used as their source.

The catalog reuses the existing stale-response-aware paging hook. A key containing
club/club-season/team/group/legacy-season resets pagination on scope changes.
All-seasons omits the legacy season filter. No legacy group means no catalog
request, and plan creation is disabled while scope is missing/loading/failed.
Loading, failure with retry, empty scope and empty continuation are distinct;
previous-page navigation remains available after a failed continuation. A scope
change cannot be overwritten by a late old response.

Plan creation keeps its existing POST → shared reload → detail navigation flow.
Failures are now shown in the dialog and can be retried, without unhandled
rejection or claiming that a failed save succeeded. Successful shared reload
keeps the other consumers' summaries synchronized.

## Explicit remaining boundary

`WorkspaceProvider` still loads complete plans for dashboard, week and attendance.
This slice does **not** remove that full request or claim complete workspace
performance optimization. It adds a separate catalog read while the other
consumers are migrated. Pagination changes only route-local state; it does not
replace shared plans with a first page. Existing match, drill and member reads,
detail APIs and all security decisions remain unchanged.

Next: move dashboard to full counters/recent-plan projection, week to explicit
period/day reads and attendance to paged summaries with full player totals. Only
then remove the shared full plan read. Other business lists, pilot query plans,
owner/SLO (TBD), BL-044/045 and M4 remain open.

## Verification

- Frontend: 13 files / 50 unit tests passed, including six new catalog cases for
  full counters/phase projection, page replacement, error/retry, stale scope,
  all-seasons/empty continuation, native/loading scope and create failure/success.
  The workspace mock deliberately throws if the catalog reads its shared plans.
  Existing workspace/training-detail synchronization regressions remain green.
- Backend: 43 suites / 492 unit tests and 5 suites / 35 API E2E passed.
- Root quality passed both typechecks, lint, format, builds, Sites 4/4, CDSK,
  Markdown links and `git diff --check`.
- A dedicated `E2E_TRAINING_PAGE_FIXTURE` adds 30 dated plans, one undated draft
  and one outside-season plan only in an explicitly disposable database.
  Expected current-season total 31 / 1,810 minutes, all-seasons 32 / 1,820 minutes.
  It does not seed or reset the retained local workspace.
- Chromium: all 11 tests passed, including catalog 25+6 pages, unchanged full
  duration, 31→32→31 season switching with page reset, undated detail navigation,
  dashboard/attendance retaining 31 plans, and 1440/1024/390 px overflow checks.
  Existing create→detail→drill/snapshot flow, cross-tenant rejection, persistent
  session, other catalogs and dirty-board navigation also passed.
- Initial browser run had two test-harness failures: attendance titles were
  queried as links instead of headings; an existing workspace test consumed the
  first login response (429) although its login helper correctly retried. The
  test now waits for the successful response with a timeout covering Retry-After.
  Application login throttling/session behavior is unchanged. Final full rerun
  passed; final frontend lint/format passed after these test-only corrections.
- Test target was disposable `ngcs_bl043_training_ui_e2e` on PostgreSQL 16;
  six existing migrations were current and schema diff empty. Retained business
  fingerprints before/after matched 24 tables / 25 rows, excluding session/audit
  lifecycle records. No retained reset, seed, migration or business mutation.
  After confirming zero active connections, the disposable database was removed
  and absence verified. Its synthetic records are regenerable from the fixtures.
- Local browser: a normal reload resolved the development build/HMR stale-module
  error. Existing session restored, catalog showed the retained one-plan total,
  75 minutes and four phases. No records were changed; `/app/trainings` is left
  open on port 3001, backend remains on 4000.

The full browser run used the existing runner with disposable DB/destructive
opt-in, supplied synthetic credentials, ports 3500/4500, persistent-session opt-in
and PLAYER_PAGE/CATALOG/HISTORY/TRAINING_PAGE fixture flags all enabled. Test
artifacts use the existing ignored `output/playwright/ngcs-coach-flow` directory.

## Rollback

Revert this route and its typed page helper to the previous full-array catalog.
The backend additive page API can remain. No data rollback is needed. The other
consumers are unchanged; page/summary isolation tests should accompany any later
removal of their shared full read.
