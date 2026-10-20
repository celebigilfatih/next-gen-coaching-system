# Fixture-aware program updates — 2026-10-19

## Approval and implementation

Explicit user request: when a match date/time changes, automatically update A Takım
training/meetings while preserving manual changes. ADR-0042 Accepted / CR-030 /
REQ-029 / BL-064. This supersedes ADR-0040's initial manual-review limitation for
enrolled SENIOR programs. It is a synchronous existing-match-save extension;
no new model, migration, external service or background scheduler.

Changing timestamp rechecks the current ACTIVE principal and match/team scope
inside the shared season lock and Serializable transaction. Recompute enrolled
old/new calendar weeks plus adjacent preparation/recovery. Timestamp-only changes
retain IDs/phases; semantic changes rebuild only untouched generated phases.
Obsolete untouched generated events may retire; original exercise rows remain.
All calendar, match and checkpoint changes commit or roll back together.
Same-date/analysis-only saves do not repeat rescheduling. Academy is unchanged.

New SENIOR program applications capture immutable PLANNING_AUTOMATION_V1 audit
checkpoints with server-owned keys/specifications, linked IDs and complete
day/plan/phase/exercise fingerprints. Highest per-week revision is authoritative.
Changed content/time/duration/coach/board protects the entire event; missing rows
and explicit exclusions become durable protected keys. Past, completed, attendance-
bearing and multiply linked sessions are protected. Manual standalone entries are
never adopted. Conflict, outside-season date or unsupported congested template
rejects the whole save. No silent partial scheduling or user-data overwrite.

Match detail adds an authorized existing-design date dialog with explicit Turkey
time, duplicate-submit guard, preserved error/input, stale-unmount protection and
automatic/protected result counts. Only date is submitted; analysis and lazy board
state remain independent. Mobile date field and primary/footer actions are at least44px; footer stacks
to fit narrow screens. PLAYER never sees the schedule writer.

## Safe retained adoption

Fresh private backup before activation:
`%LOCALAPPDATA%/NGCS/backups/before-fixture-sync-20261019.dump`.
Successfully restored to separate `ngcs_fixture_sync_restore_test` on PostgreSQL16.
No migration deployed or Prisma generation needed; retained14-migration schema.

Guarded `apps/backend/scripts/enroll-spor-manage-automation.js` defaults to dry-run,
requires an existing active SYSTEM_ADMIN, exact local target and explicit process/
CLI opt-in. It recognizes only the known original fixed weekly request and stable
season rollout requests; validates original36 fixture identities/dates/opponents
and source ordering before reconstructing expected events. Exact day/plan/phase/
exercise fields and untouched timestamps grant ownership; all other rows protect.
It does not use arbitrary current values as proof that a record is automatic.

Restored dry-run:41 weeks,631 adoptable events,2 protected edited events; zero
writes. Enrollment appended41 checkpoints and left all24415 original rows across44
tables identical, including the121-minute six-phase plan and the other edited
record. Replay adds nothing. Retained dry-run matched; retained enrollment/replay
matched and preserved every original row. Result24456 rows; all business rows and
all36 retained sample fixture timestamps remain identical to backup.
Fully enrolled replay also succeeds without writes after legitimate rescheduling.

## Validation

- Full backend62 suites/896 tests pass; final affected27 pass. Both builds,
  backend/frontend typecheck, backend full/scoped frontend lint and format pass.
- Dedicated PostgreSQL HTTP13/13 pass, including timestamp-only two-event updates
  with unchanged phase IDs, same-date no repeat, phase/meeting edits and deletion
  tombstones, cross-Monday + adjacent-week regeneration, correct persisted week
  mapping/four-phase sums, original exercise preservation and no academy writes.
  Manual overlap/congestion/out-of-season/player/foreign denial and late checkpoint
  failure leave match/program/audits unchanged. Concurrent identical requests
  reschedule once. Planning clock is fixed in HTTP tests for historical protection.
- The first new tombstone test expected a19:00 save despite its activation colliding
  with a protected13:00 meeting. The409 was correct; test now verifies that rejection
  and a subsequent safe17:00 save. Initial unused-variable warnings were removed;
  final lint is clean. Intentional fault tests emit fixed contained diagnostics.
- Enrollment guard test1/1 passes; full restored/retained enrollment and replay
  verify preservation. No private row content/hashes/credentials are logged.
- Full frontend60 files/495 tests pass. Initial affected26/26 and final dialog/
  match-read12/12 pass after the mobile footer adjustment. Final production build
  and Sites4/4 pass. Root Windows npm/CDSK tooling remains BL-061; no root pass claim.
- Actual authenticated isolated UI changed sample25 October kickoff16:00→18:00:
  two generated events moved; UI reported17 edited/deleted/past events protected.
  Independent DB comparison confirmed the2 original edited events, other35 fixtures
  and all academy plans remain identical. Actual desktop1440/tablet1024/mobile390
  dialog/read checks use a disposable restored target, never retained fixture edits.
  Temporary3136 origin was rejected by existing CORS; QA moved to already allowed
  localhost3500 with separate API4014, without changing CORS. Frontend builds caused
  normal development reload/login recovery. Screenshots are ignored artifacts under
  `output/playwright/fixture-sync/`.

## Runtime and limitations

Canonical API4000 rebuilt/restarted with existing local environment/flags preserved;
frontend3132 uses the new control. New and enrolled SENIOR programs react to date
updates. Unknown legacy programs show not-enrolled rather than assuming ownership.
Only zero/one-match templates are supported; two-match weeks require manual review.
Manually protected records remain protected on later saves, including deletions.
Retain immutable checkpoints/request/slot markers; no public reset/unpin operation
is introduced. Production/commit/push are outside this task.

Continuation after a local runtime stop reopened the installed Docker Desktop and
the original ngcs-postgres volume; 2060 plans and41 automation checkpoints remain.
API4000 health and frontend3132 were restored without data reset. Existing local
persistent-session configuration from the separate authorized work is preserved.
The interrupted Vite route import recovered after reload with the existing login.
Actual retained Beşiktaş detail and date dialog were verified at original16:00;
cancel performed no save. Final screenshot: ignored
`output/playwright/fixture-sync/retained-date-dialog.jpg`. Match detail left open.

[ADR-0042](../50-decisions/ADR-0042-fixture-aware-program-updates.md),
[runbook](../40-operations/RUNBOOK.md).
