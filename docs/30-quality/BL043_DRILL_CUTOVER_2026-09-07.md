# BL-043f.4 — Training Drill Picker and Workspace Cutover

- Date: 2026-09-07
- Authority: approved BL-043 continuation and existing ADR-0012/0014 contracts.
- Verdict: Pass for this slice; BL-043 remains in progress.
- No backend, schema, migration, dependency or permission-policy change.

## Delivery

Training detail reads the existing minimal drill catalog in 25-record pages,
using the authorized plan's group rather than assuming the shell's group.
It retains one selected scalar record across page changes, excludes already
attached IDs from options and discards stale results when context changes.
Loading, read retry, write errors, missing plan group and empty-page states are
explicit. Full catalog totals include attached records; they do not claim to
count attachable choices. Existing admin visibility is unchanged, so the server
still checks the selected source against the destination plan at write time.

The final shared-drill consumer is now separated. Workspace fetch/state no
longer loads the full GET /drills array. Library, dashboard, tactics and the
training picker each own bounded reads. Legacy API helpers/endpoints remain
compatible; this does not claim bounded match/member or nested detail reads.

Adding a drill now calls the existing POST /training-plans/:id/drills endpoint,
then reads the updated plan. The prior frontend replacement PUT recreated all
PlanDrill rows and could discard existing board snapshots. The single-add path
preserves existing rows/snapshots; the next phase order uses max existing order
plus one. Server duration synchronization and authorization remain unchanged.
If POST succeeds but the refresh GET fails, adding is hidden and an explicit
warning offers only a read retry, avoiding a duplicate POST for that case.
An ambiguous failed POST response is not an idempotency guarantee.

## Verification

- Root quality passed: 538 backend unit tests, 84 frontend tests, Sites 4/4,
  typecheck, lint, format and production builds, CDSK/links/whitespace checks.
- Five picker tests cover paging/off-page selection, attached-ID exclusion,
  loading/read retry, duplicate-click/write-error handling and context races.
- Training-detail integration covers successful addition and POST-success /
  GET-failure recovery with exactly one POST, then current duration/phase totals
  on the real training list. Provider races now test member isolation without
  depending on the removed full drill array.
- Disposable PostgreSQL API E2E: 5 suites / 38 tests passed in 7.5 seconds.
- Chromium: 11 tests passed in 2.6 minutes. The board flow verifies 25+11
  catalog paging, off-page selection, 1440/1024/390 px controls, one saved
  snapshot retaining its row ID and exact document after a second drill is
  added, subsequent match-board save and cross-tenant denial. The first flow
  rejects any full GET /drills or GET /training-plans browser request.
- Disposable database ngcs_bl043_drill_cutover_e2e used the existing six
  migrations and isolated ports 3500/4500. Migration status current and schema
  diff empty. After tests, zero active connections were verified, the exact
  synthetic database was dropped and absence confirmed. Regenerable test data
  only was removed; no retained database reset/seed/migration was performed.
- Retained business fingerprint matched 24 tables / 25 rows, excluding
  session/audit lifecycle data. Read-only local preview shows the existing
  75-minute four-phase demo plan, five catalog records and only the remaining
  Pas İstasyonu option. No drill was added to retained data. Dev servers remain
  on 3001/4000 with training detail open.
- Final CDSK/Markdown checks: 89 documents, zero broken local links;
  git diff --check passed. Cumulative worktree preserved; no commit/push.

Browser uses existing opt-in PLAYER_PAGE/CATALOG/HISTORY/TRAINING_PAGE/
DRILL_PAGE/TACTIC_PAGE fixtures, persistent sessions and explicit destructive
reset permission only for the disposable target. Artifacts are in ignored
output/playwright/ngcs-coach-flow.

## Remaining work

BL-043 match/member reads and measured pilot capacity/SLO remain open; owner
and volume targets are TBD. Pages and counts are live reads, not an immutable
snapshot. Large plan details and attached IDs are not paginated by this change.
BL-044/045 and M4 production decisions remain separate gates.
