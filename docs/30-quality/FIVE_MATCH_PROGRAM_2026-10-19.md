# Five-match senior program — 2026-10-19

Explicit user request implemented as ADR-0047 / REQ-033 / CR-034 / BL-068.

## Changed files and compatibility

`apps/backend/src/planning/weekly-template.ts`: BALANCED_WEEK_V6 raises the SENIOR
ceiling to five and gives an explicit six-or-more manual-planning message.
The existing consecutive actual kickoff-hour engine still supplies training,
combined briefings and recovery, including neighboring weeks. No new physiological
prescription or measured load. Normal zero-to-four fixtures and academy profiles
remain. No new API/model/migration/service/scheduler or re-enrollment.

`weekly-template.spec.ts` and `test/week-planning.e2e-spec.ts` expand regressions.
Complete fingerprints preserve manual content/time/exclusion/deletion decisions,
history/completion/attendance and existing scope/overlap guards. Conflicts/faults
roll back date/program/checkpoints together; concurrent/same-date replay stays
safe. Existing applied checkpoints remain valid; V6 invalidates old unapplied
previews. All sessions remain editable original CLUB examples, not global release.

## Automated verification

- Backend62 suites /918 tests pass; focused template/ownership48 pass.
- All21 five-match weekday combinations, plus existing35 four-match combinations,
  have no generated overlap, correct match briefing counts and positive physical
  phase totals. Explicit five-match cases cover24/24/24/72-hour gaps and early/late
  kickoff gaps of94 hours; adjacent-week preparation/recovery is included.
- Dedicated loopback `ngcs_week_planning_test`:21 HTTP cases pass. Two/three/four/
  five fixtures cover write-free ten-team preview, actual apply, preview time pins,
  edited phases/agendas/deletion tombstones, interval changes and cross-Monday.
  The five-match case changes kickoff hours before moving the fixture across
  Monday, retaining all manual records. Concurrent five-match saves reconcile
  once; manual conflict, six-match/same-day, role/season rejection and injected
  late-checkpoint failure leave no partial date/program writes. Six-match refusal
  asserts the actual ceiling message. Fault-injection diagnostics are expected.
- Backend typecheck, full ESLint, Prettier, normal Nest and isolated TypeScript
  builds pass. Existing actual frontend controls verify the new backend; no
  frontend source changed. CDSK profile, Markdown links and diff checks pass.

## Fresh backup and actual UI rehearsal

Private `%LOCALAPPDATA%/NGCS/backups/before-five-match-20261019.dump` restores into
loopback5433 `ngcs_five_match_restore_test`. Isolated API4014/UI3500 use this copy.
Via the real date dialog move sample Rizespor18→22Oct16, Konyaspor11→23Oct18,
Trabzonspor4→20Oct16 and Kasımpaşa27Sep→19Oct16, keeping sample Beşiktaş25Oct16.
The five fixtures have24/48/26/46-hour gaps.

Fifth-match save succeeds:2 events updated, zero added, one obsolete untouched
example retired;65 edited/deleted/past records protected. Actual week read shows
all five fixtures, Wednesday/Saturday recovery30 and combined briefings15. The
manual Tuesday121min session remains on its new matchday rather than being silently
replaced. Independent exact comparison preserves both edited121/103min plans,
phases/exercises/day links, academy records and32 other complete fixtures.
The copy still has36 fixtures. Valid ignored screenshots are
`output/playwright/five-match/result-desktop.jpg`, `week-desktop.jpg` and
`week-recovery.jpg`; these show the isolated copy, not retained fixture changes.

## Retained runtime and documents

All44 retained-table snapshots are identical before restart. Normal dist build
serves V6 on API4000 with DB URL supplied in process env; frontend3132 and ignored
auth/tactical flags remain. Existing persistent-session reload restores, and real
Beşiktaş remains25 October16:00. Final comparison allows only normal RefreshSession
rotation and SESSION_REFRESHED audit additions; business rows and prior audits
remain identical. All36 retained fixture dates and41 enrollments stay. QA tab/
listeners stop after proof; private backup and restored copy remain.

The library-detail handoff contained historical warnings about a missing four-match
report and duplicate ADR-0045. Independent pre-change checks now find178 Markdown
files with no broken links and46 unique ADRs with no CDSK errors. Existing accepted
CDSK decision is ADR-0046; four-match remains ADR-0045. Record that resolution
without silently renumbering decisions. This new increment uses ADR-0047; final
CDSK/link checks pass. The full aggregate root gate is not claimed by this slice.

Use the existing match-date dialog or fresh-week preview/apply. Six-or-more
fixtures, same-day or sub24-hour intervals remain manual. Never remove audit/slot
markers to regenerate a populated week. No retained fixture generation, migration,
reset, production deployment, commit or push.
