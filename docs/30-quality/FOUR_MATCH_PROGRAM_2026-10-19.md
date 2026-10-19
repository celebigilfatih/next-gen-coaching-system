# Four-match senior program — 2026-10-19

Explicit user request implemented as ADR-0045 / REQ-032 / CR-033 / BL-067.

## Changed files and behavior

`apps/backend/src/planning/weekly-template.ts` changes only template version,
SENIOR ceiling and fallback text: BALANCED_WEEK_V5 accepts four fixtures, with
five-or-more remaining manual. Existing nearest previous/next actual-hour rules
compose all consecutive gaps, including neighboring weeks. Recovery, short
training, combined briefings and rest retain the accepted example presets.
Normal zero/one/two/three-match behavior and academy age/school profiles remain.

`weekly-template.spec.ts` and `test/week-planning.e2e-spec.ts` expand regressions.
No frontend/model/migration/API/scheduler or enrollment change. Existing full-event
manual content/time/exclusion/deletion, history/completion/attendance protection,
permission checks, overlap rejection and atomic replay/rollback remain. No clinical
prescription, measured load or global expert publication is introduced. Applied
checkpoints stay valid; unapplied older preview tokens require a new preview.

## Automated verification

- Backend62 suites /913 tests pass; focused template/ownership43 pass.
- All35 four-match weekday combinations have no generated overlap, four match
  briefings and positive physical phases with exact duration sums. Explicit
  cases cover48/48/48,24/24/96,24/72/48-hour gaps and adjacent-week recovery/preparation.
- Dedicated loopback `ngcs_week_planning_test`:19 HTTP cases pass. Two/three/four
  fixtures exercise write-free ten-team preview, actual apply, preview time pins,
  edited phases/agendas/deletion tombstones, interval changes and cross-Monday.
  Four-match concurrent saves reconcile once; manual collisions, same-day/five-
  match contexts, role/season denial and late-checkpoint failure leave no partial
  date/program changes. Intentional fault diagnostics are expected.
- Typecheck, full backend ESLint, Prettier, normal Nest and isolated TypeScript
  runtime builds pass. Existing actual UI controls exercise the new backend;
  frontend source is unchanged. Documentation links/diff checks pass.

## Fresh backup and actual UI proof

Private `%LOCALAPPDATA%/NGCS/backups/before-four-match-20261019.dump` restores
successfully into loopback5433 `ngcs_four_match_restore_test`. Isolated API4014/
UI3500 serve this copy. Through the real date dialog move existing sample Rizespor
18→22 October16:00, Konyaspor11→23 October18:00 and Trabzonspor4→20 October16:00,
leaving sample Beşiktaş25 October16:00. Four fixtures have48/26/46-hour intervals.

Fourth-match save succeeds:5 events updated,2 created,2 obsolete untouched
examples retired;65 edited/deleted/past records protected. Week view shows all four
matches, Wednesday and Saturday recovery30min plus combined briefings15min.
The manually extended Tuesday121min physical plan remains even on the new matchday;
the system never silently replaces a coach's decision with a template session.

Independent exact comparison confirms both manually edited121/103min plans,
their phases/exercises/day links, academy plans/day links and33 other complete
fixtures unchanged.36 fixtures still exist. Valid ignored screenshots under
`output/playwright/four-match/`: `result-desktop.jpg`, `week-desktop.jpg`.
They show the isolated copy, not retained fixture changes. QA uses legacy in-memory
auth for isolation; dev reload can end that temporary session. Canonical persistent
session reload is verified independently below.

## Retained runtime and handoff

Before restart, all44 retained-table snapshots remain identical. No retained
business rollout/re-enrollment is needed; all41 known checkpoints remain valid.
Normal dist build serves V5 on API4000 with DB URL supplied in process env;
frontend3132 and ignored auth/tactical flags remain. Actual retained persistent
reload restores and Beşiktaş remains25 October16:00. Final comparison permits only
normal RefreshSession rotation and SESSION_REFRESHED audit additions; all business
rows and previous audits remain identical. QA listeners/tab are stopped after proof;
private backup and restored copy remain. No actual retained fixture date changed.

Use existing match-date dialog for enrolled date updates and weekly preview/apply
for new empty programs. Five-or-more fixtures, same-day or sub24-hour intervals
still need manual scheduling; never erase audit/slot markers to force regeneration.
No migration/reset/commit/push/production rollout. External CDSK validator availability
remains BL-061; this increment does not claim a full root-gate pass.
