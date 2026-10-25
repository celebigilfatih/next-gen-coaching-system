# Three-match senior program — 2026-10-19

Explicit user request implemented under ADR-0044 / REQ-031 / CR-032 / BL-066.

## Change and compatibility

Runtime change is limited to `apps/backend/src/planning/weekly-template.ts`:
BALANCED_WEEK_V4 raises the SENIOR calendar-week ceiling from two to three and
gives a clear four-or-more fallback message. The existing nearest previous/next
elapsed-hour engine already composes arbitrary consecutive intervals; reuse its
ADR-0043 example recovery, activation, combined briefing and rest presets for
each pair. No new physiological prescription or measured performance is inferred.

Tests change in `weekly-template.spec.ts` and `test/week-planning.e2e-spec.ts`.
No frontend/schema/migration/new service/endpoint or enrollment change. Existing
manual content/time pins, preview exclusions, deletion tombstones, past/completed/
attendance protection and conflict/transaction/replay boundaries remain. Old
applied checkpoints are not re-baselined; V4 invalidates unapplied old previews.

## Automated verification

- Full backend62 suites /908 tests pass; focused template/ownership38 pass.
- Triple fixtures cover72/72,48/96,24/120-hour asymmetric/boundary intervals,
  adjacent-week fixtures, recovery after the last match, positive four-phase
  sums and no generated time overlaps. Ordinary two-match cases and academy
  age/school-hour tests continue to pass.
- Dedicated loopback `ngcs_week_planning_test`:17 HTTP cases pass. Both two and
  three fixtures exercise write-free ten-team preview, actual apply, manual
  preview-time protection, edited phases/agendas and deletion tombstones, interval
  changes and cross-Monday reconciliation. Three-match concurrent identical saves
  reconcile once; manual collisions, same-day/four-match contexts, scope/season
  rejection and late-checkpoint failure leave no partial program writes.
- Typecheck, full backend ESLint, Prettier and normal Nest build pass. Separate
  isolated TypeScript runtime build also passes. No frontend source changed;
  actual existing date dialog and weekly view verify the runtime behavior.
- Fault-injection diagnostics WEEK_PLANNING_FAILED / SEASON_MATCH_UPDATE_FAILED
  during rollback cases are intentional; all final tests pass.

## Backup, restored copy and actual browser

Fresh private `%LOCALAPPDATA%/NGCS/backups/before-three-match-20261019.dump` restored
successfully into `ngcs_three_match_restore_test` on loopback5433. API4014/UI3500
serve only this copy. Through the real match-date dialog move sample Rizespor
18→22 October16:00, then sample Konyaspor11→23 October18:00, preserving the sample
Beşiktaş25 October16:00 fixture. This produces26/46-hour consecutive intervals.

The third-match save succeeds:5 events updated, zero added, one obsolete untouched
example retired;49 edited/deleted/past records protected. Week view contains all
three matches in chronological order, Friday20min matchday activation, Saturday
30min recovery and15min combined reflection/next-match briefing, Sunday20min
matchday activation. User-edited Tuesday121min session remains visible.

Independent exact hash/object comparison confirms both manually edited121/103min
plans, their phases/exercises/day links, academy plans/day links and34 other
complete fixtures remain identical.36 fixtures still exist. Ignored screenshots:
`output/playwright/three-match/result-desktop.jpg` and `week-recovery.jpg`.
These are isolated-copy proof, not a retained fixture-date change.

## Retained runtime and handoff

Before restart, retained snapshot is identical across44 tables. No retained
business rollout/re-enrollment is required; all41 enrolled weeks remain valid.
Normal dist build serves V4 on API4000 with DB URL supplied in process env;
frontend3132 and ignored persistent-session/tactical flags remain. Actual existing
persistent session reload restores, and retained Beşiktaş remains25 October16:00.
Final preservation allows only normal refresh-session rotation and corresponding
SESSION_REFRESHED audit additions; all business rows and previous audits remain.
QA services/tab are stopped after proof; private backup/restored copy remain.

Use match detail → Tarih ve saati düzenle for enrolled date updates; use weekly
preview/apply for new empty programs. Four-or-more matches, same-day or sub24-hour
intervals still require manual scheduling. Never remove audit/slot markers to
force regeneration. No commit/push/production deployment/reset. Root CDSK validator
availability remains tracked separately in BL-061; no full root-gate pass claimed.
