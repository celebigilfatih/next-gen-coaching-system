# Team-ready plan exercise picker — 2026-10-20

The user explicitly requested that plan attachment choices include only authored
ready exercises appropriate to the plan's team, excluding seasonal records.

## Implementation

PlanDrillPicker always calls the existing paginated reader with the fixed
`collection=ngcs-starter-v1` and `ageScope=TEAM`. The backend resolves age from
the authorized plan groupId metadata. It does not trust a possibly different
active workspace age. Existing exact-ID/GLOBAL/PUBLISHED filters intersect with
that exact age before count, cursor and limit. TEAM is accepted only with the
collection and without an explicit ageGroup; invalid/array modes are rejected.
The library's all-age default and other catalog clients are unchanged.

Phase, search, advanced filters, paging, retry and reset keep these boundaries.
Unsupported ages show an empty ready list and an honest explanation. Removed
the obsolete suggestion that club exercises might appear as a fallback. Pinned
selection, attached-ID exclusion, explicit add, source version, write errors,
preview and return focus remain. The picker key also includes age context.

This implements the user's approved display boundary, without a new ADR, schema,
migration, dependency, flag or change to existing saved plan/drill writes.

## Verification

- Backend catalog40 tests pass, including TEAM metadata resolution and malformed
  or ambiguous mode rejection.
- Affected frontend34 pass across picker, ready-planning, training synchronization
  and library. New cases cover fixed bounds through filter/reset and empty U13;
  the preview test now uses a published ready exercise and confirms server-resolved
  row age even when the workspace age differs, focus/selection and explicit add.
- Dedicated loopback `ngcs_ready_drills_test`: all11 HTTP scenarios pass with a
  15-second per-case budget. The collection case additionally verifies TEAM U14
  total72, WARM_UP12 and TEAM U13 zero, preserving the library's all-age120 and
  exact published-ID guarantees. The draft catalog assertion is scoped to the
  starter collection so previous non-starter NGCS test fixtures cannot affect it.
- Normal backend build succeeds; local API4000 restarts with the existing DB and
  ignored settings. All17 root quality gates pass: backend937/frontend553 tests,
  Sites4/tooling8, type/lint/format/build checks,199-file local links, CDSK36
  required documents/47 ADRs and whitespace. Final targeted backend lint/format
  also pass after the HTTP fixture assertion adjustment.
- Actual UI3132, existing A Takım training: pages25+23 yield48 unique IDs, every
  ID is in the starter package. TACTICAL gives16; clearing the phase returns48.
  A selected ready exercise displays its full summary and opens exact A Takım
  instructions. Closing preview retains the selected ID. No add/save submitted.
- Read-only verification preserves all48 collection snapshots and the previous41
  business-table fingerprints. The original seasonal training remains20min/four
  phases; no calendar, attendance, source or plan data changed.

Evidence: [picker](../../apps/frontend/qa/plan-picker-ready-only-2026-10-20/picker.png).
Ignored logs: `output/plan-picker-ready-only-quality-20261020.log` and
`output/plan-picker-ready-only-http-20261020.log`.

## Handoff

Changed runtime: plan-drill-picker, catalog ageScope DTO/service and frontend API
filter type; focused picker/planning/training/catalog/HTTP tests and the related
product/API/test guidance, AGENTS, README, changelog and Boot accompany the change.
Prior tactical/attendance work is preserved. The saved seasonal plans remain
editable through their existing flows; the ready chooser is now separate from
those stored records. No commit, push or production activation was performed.
