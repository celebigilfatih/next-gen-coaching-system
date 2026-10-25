# Main restart and browser smoke — 2026-10-25

User requested restarting current main and checking the library, ready-exercise
attachment and tactical board in the browser. Verified commit:
bd424a6825f950f96dbad6c92d7e418074772e7a, matching remote main.

## Runtime

Normal backend build passed. Only the identified canonical application processes
were stopped; the frontend parent exited with its child. New compiled API4000 and
development UI3132 were launched from main, with loopback listeners and existing
ignored persistent-session/tactical settings. Both HTTP roots returned200.
The existing PostgreSQL container and ngcs_local_session_dev were preserved;
no migration, reset, seed or import ran. Full reload after restart and subsequent
new tabs restored the existing SystemAdmin session without another login.

Ignored launch/read-only verification receipts are output/main-browser-smoke-
restart-20261025.json and output/main-browser-smoke-verified-20261025.json.

## Browser results

Actual in-app browser,1280×720:

- Library initially shows120 ready exercises. A Takım plus Taktik filters show16;
  searching Kompakt Blok narrows to two exact-age-supported variants. Instructions,
  age/duration/player/area facts and the lazy seven-object Saha preview open.
- Detail Antrenmana ekle opens the paginated existing-plan picker. Yeni antrenman
  creates the clearly identified QA plan below, retains the selected exercise,
  selects the new plan and requires a separate explicit Plana ekle.
- The first tactical exercise saves as one phase/32 minutes. A full reload keeps
  its saved content v1 and duration. Its seven-object plan board opens explicitly.
- The plan's own ready picker reports48 exact-SENIOR catalog entries, excludes the
  already attached exercise, filters Soğuma to eight, and previews the selected
  second exercise. Explicit attachment adds18 minutes in COOL_DOWN, preserving
  the first TACTICAL phase. Full reload/new tab show two phases/50 minutes and
  exclude both attached exercises from choices. No double submission was used.
- A fresh empty tactical draft exposes all nine shared-art equipment controls.
  Each inserts its matching object. Property fields position them separately;
  ball dragging, undo and rotation work. Full→half pitch change retains nine
  objects; one undo returns full and redo returns half. Fit and inspector toggle
  work. A clearly named CLUB QA tactic saves and fully reloads as half800×600
  with all nine types, no dirty history and Kaydedildi status.
- Captured warn/error logs in the tested tactic and final plan tabs are empty.

Native datetime-local automation initially populated only the native display;
keyboard increment/decrement committed the value through the normal input path.
The enabled create button and saved26 October19:00 plan confirm the final value.
No application source change or synthetic browser event injection was used.

## Retained QA records and database evidence

Only clearly named QA records were created through the normal UI:

- Training cmvo8ixzn00052ytchl8n46ph, **QA — Main kontrolü 25.10.2026**,
  A Takım/Kerem Tunalı,26 October2026 at19:00 local. TACTICAL starter-senior-18
  (32min) and COOL_DOWN starter-senior-24 (18min) each retain contentSnapshot with
  ageGroup SENIOR, sourceVersionId and seven-element boardSnapshot. Read-only
  transaction confirms totalDuration50 and linked DayPlan.duration50.
- Tactic cmvo8mkpo000l2ytchrorpagy, **QA — Main taktik kontrolü 25.10.2026**,
  CLUB scope, half800×600, nine persisted elements: player, goalkeeper, ball,
  cone, goal, wall, flag, ladder and marker.
- Published starter versions remain120. Existing real plans and source content
  were not edited. QA records remain available for user inspection; no deletion.

The independently running [frozen-board acceptance](MAIN_READY_PLAN_ACCEPTANCE_2026-10-25.md)
and its files/processes were preserved. Its isolated source mutations are a
separate acceptance; this smoke does not mutate retained source exercises.

## Scope and checks

This is a desktop smoke, not a repeat of the complete responsive/accessibility,
eleven-template, animation or conflict matrix. A supplementary download-event
probe timed out in browser control before returning an export file; PNG/SVG
download completion is therefore **not verified in this run**. Core save/reload
and drawing flows above are confirmed; there is no observed application error.

Subsequent [exported-file acceptance](TACTICAL_EXPORT_ACCEPTANCE_2026-10-25.md)
verifies actual PNG/SVG downloads and visual/geometry consistency, including
byte-identical selection/zoom repeats. In-app PNG remains a host-specific
limitation; Chrome PNG succeeds. The earlier timeout above is historical.

No runtime/test/dependency/schema change or new ADR. Prior root17/17 covers the
unchanged merged runtime; it was not needlessly repeated for restart/evidence.
Normal build, HTTP readiness, real browser flows, read-only DB assertions and
documentation links/CDSK/whitespace checks form this task's verification.
The later user request authorizes publishing reviewed evidence to main.
[Publication review](POST_MERGE_QA_PUBLICATION_2026-10-25.md) records the completed
scope and preserves the separate ongoing PNG implementation.

## Screenshots

- [Library field preview](../../apps/frontend/qa/main-smoke-2026-10-25/library-preview.png).
- [Saved training after reload, two phases/50 minutes](../../apps/frontend/qa/main-smoke-2026-10-25/training-saved.png).
- [Attached training board](../../apps/frontend/qa/main-smoke-2026-10-25/training-board.png).
- [Saved nine-object half-pitch tactic](../../apps/frontend/qa/main-smoke-2026-10-25/tactics-saved.png).
