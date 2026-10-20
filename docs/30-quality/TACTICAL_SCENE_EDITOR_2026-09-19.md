# Tactical scene editor — 2026-09-19

Scope: ADR-0036 / CR-026 / REQ-025 / BL-058c. Opt-in shared editor and client
adapters; no retained-data writes, flag enablement, migration or dependency.
Work began 2026-09-19; closing verification continued after local midnight on
2026-09-20. Artifact names retain the start date.

## Delivered

- Explicit V1 → single-scene V2 conversion, add/duplicate, move, confirmed
  removal, title/hold/transition settings. Last scene cannot be removed.
  Reordering/removal makes the final scene cut/0 with positive hold in the
  same undo transition. The UI explains this behavior.
- Whole-document history retains 50 undo transitions. Selecting scenes is a
  view preference, does not dirty/save, and clears element selection. Duplicates
  preserve tactical object identity but receive a new scene identity.
- Every V2 board/scene operation passes the existing strict validator, including
  aggregate duration, pitch, cross-scene type and element/byte limits. Rejected
  edits leave the previous document intact. Multi-scene pitch changes are disabled.
- `onSaveDocument` opts callers into the full V1/V2 callback. Existing routes
  still use their V1 callback and cannot receive a silently truncated V2 scene.
  Save/dirty/navigation operate on the whole document. Pending writes block
  mutations/double-submit; failure retains draft/history and a persistent alert.
- Typed GET/PUT client adapters for all three authorized document resources
  send the caller's exact opaque write token. A conflict never triggers a fresh
  token read, force overwrite or automatic retry. Resource/token lifecycle in
  real route containers remains BL-058e, not a claimed completed integration.
- JSON import validates file bytes before parsing and is one undo transition;
  V2 → V1 replacement is rejected. JSON output contains all scenes and is compact
  to remain within import byte limits. PNG/SVG identify the selected static scene
  in labels and filenames. Full cross-route export acceptance remains BL-058e.

## Verification

- Final `npm run quality` passed: 821 backend tests / 57 suites, 390 frontend
  tests / 50 files, 4 Sites tests; builds, typecheck, lint, format, CDSK,
  138 Markdown files with zero broken local links, and `git diff --check`.
- 36 focused tests (editor, pure scene operations, API adapter) passed. Covers
  explicit conversion/undo, clean selection, per-scene board changes, 50 undo
  transitions, readonly/busy, conflict retention, modal keyboard isolation,
  cancel focus/return, strict limits, token propagation and no conflict retry.
- Synthetic headed Playwright CLI harness with real React-Konva: selected a
  second scene without dirtying; duplicated to three scenes; explicit Save
  captured the full three-scene document in browser memory, never the database.
- 1672×941, 1024×900, 390×844 inspected. Mobile document width = 390px;
  scene strip scrolls internally, forms/actions wrap, long title remains named
  accessibly. Delete Dialog fits (about 359px), opens on Cancel, Escape returns
  focus to Delete. Newly selected scenes scroll into view without animation.
- Screenshots retained under `output/playwright/scenes-2026-09-19/`:
  `desktop.png`, `desktop-full.png`, `tablet.png`, `tablet-full.png`,
  `mobile-scenes.png`, `mobile-full.png`, `mobile-dialog.png`.
- The isolated harness has no favicon (one expected 404); its React DevTools
  development notice is not an application failure. No user browser session or
  application data was used. The existing frontend on 3132 was left running.
  The named QA browser and temporary server on 3144 were closed after checks.

## Delivery boundary and next step

BL-058c is a component acceptance gate, not a retained UI rollout. Existing
route containers remain V1 and `TACTICAL_V2_WRITES_ENABLED` stays default-off.
BL-058d adds playback/pause/seek/speed/reduced-motion. BL-058e must connect
metadata/document loading, resource-bound tokens, conflict recovery, club copy,
plan snapshot, match and exports; run disposable HTTP/browser E2E before any
separately approved retained write enablement. Metadata readers that currently
reject V2 must be handled explicitly, never replaced by an empty board.

No physical touch-device, real club pilot, production FPS or formal WCAG claim.
