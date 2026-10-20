# Legacy exercise preview and attachment — 2026-10-20

The user reported a blank “Egzersiz önizlemesi” dialog containing only the
missing-professional-content message when selecting an exercise in a training.

## Cause and correction

The plan picker passed only the exercise ID to the shared preview. For an
unversioned CLUB exercise, the published-content API correctly returns no
professional version, but the dialog had no catalog title, duration or summary
to display. The picker now retains and passes the selected scalar catalog item,
uses its resolved age and restores focus to the preview trigger on close.
The dialog shows the saved title, age, duration and summary/equipment, explaining
that missing detailed instructions do not prevent adding the saved exercise.
It does not invent application steps, age rules or a pitch diagram.

A separate compatibility defect was reproduced in the
[main PR review](PR_MAIN_FINAL_REVIEW_2026-10-20.md): the professional-library
backfill creates PUBLISHED legacy versions with nullable boardDocument, while
the attachment resolver unconditionally validated the missing board. The resolver
now permits a NULL board only for LEGACY / LEGACY_UNVERIFIED provenance, retaining
the frozen version, exact-age content and duration. Existing diagrams and all
professional sources still require strict board validation. Publication, stale
version, exact-age, actor, tenant and duplicate guards remain.

This restores the accepted ADR-0032/0039 compatibility boundary. No new ADR,
schema, migration, dependency or retained-data operation is required.

## Verification

- Affected backend: 45 tests across plan-content, add and service suites; the
  final 16-case content suite passes after completing its replacement mock.
  New cases cover nullable migrated boards through add and replace, frozen
  totals/previous-phase preservation, age/version denial, valid legacy diagrams
  and rejection of malformed legacy or missing professional boards.
- Affected frontend: 29 tests across ready planning, picker and library pass.
  The unversioned CLUB regression verifies real catalog facts, resolved age,
  no invented board, no automatic write, close/focus/selection and explicit add.
- Dedicated loopback PostgreSQL `ngcs_ready_drills_test`: all 10 HTTP scenarios
  pass. The new migration-shaped fixture has JSON-null legacy jsonData, the
  migration's LEGACY source, a PUBLISHED version, an exact U14 variant and SQL-null
  boardDocument. POST add and PUT replacement succeed, freeze content, preserve
  previous phases and update plan/day durations; U13 attachment is rejected.
  This is a backfill-shaped fixture, not a fresh migration rehearsal.
- Full repository quality: all 17 stages pass, exit 0; backend 927/frontend 542,
  Sites 4/tooling 8, types, lint, formatting, builds, 192-file Markdown links,
  CDSK (36 required documents / 47 ADRs) and whitespace. After the HTTP fixture
  adjustment, affected backend source/test lint and formatting pass again.
- Actual authenticated UI3132/API4000: opened the existing training's picker,
  selected “Duran top görevleri ve ikinci top yerleşimi” and verified its title,
  A Takım, 10 minutes and equipment in the preview. Closing returns keyboard
  focus and retains selection with Plana ekle enabled. Existing plan remains
  20 minutes / four phases; no retained add/save was submitted.
- Normal backend build also passes. Restarted only API4000 with the existing
  loopback database and ignored session/tactical settings; no client regeneration
  or migration. Startup succeeds and an actual full UI reload retains login and
  the same 20-minute/four-phase plan. UI3132 remains running.

Evidence: [desktop preview](../../apps/frontend/qa/drill-legacy-preview-2026-10-20/desktop.png).
Ignored logs: `output/drill-legacy-fix-quality-20261020.log` and
`output/drill-legacy-fix-http-20261020.log`; runtime startup is recorded in
`output/drill-legacy-api-20261020.log`.

Changed runtime files: [plan-drill-content.ts](../../apps/backend/src/training-plans/plan-drill-content.ts),
[plan-drill-picker.tsx](../../apps/frontend/src/components/plan-drill-picker.tsx)
and [drill-preview.tsx](../../apps/frontend/src/components/drill-preview.tsx).
Their focused regression tests, ready-drill HTTP suite, this report, changelog
and Project Boot accompany the fix.

## Limits and handoff

Unversioned club exercises still lack independently reviewed professional
application/age details; this correction displays available facts honestly.
The historical PR review applies to its recorded SHA. These local fixes are
not committed/pushed and do not change the GitHub draft/readiness verdict.
Pending attendance, tactical pitch and training heading edits are preserved.
