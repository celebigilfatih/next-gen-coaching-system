# Modern 2D pitch and compact tactical editor — 2026-10-20

## Scope and decision

User-approved implementation of eleven distinct pitch templates, proportional
single-scene pitch edits, modern shirt/keeper/ball/cone/goal artwork and removal
of the tall editor heading. Extends REQ-024 / BL-057 / Accepted ADR-0035.
Canonical pitch types/dimensions, V1/V2 JSON, API, permissions and write tokens
are unchanged. No migration, package installation or bulk data conversion.
Existing attendance edits and their documentation were preserved.

## Implementation

- Shared `pitchArt` crops a single football layout for half/third/upper-left
  quarter/penalty/corner/freekick; full/7v7/5v5 have two goal mouths. Training
  has no interior markings; grid has fourteen interior grid lines. These are
  illustrative templates, not certified regulation dimensions.
- One pure pitch edit maps anchors, absolute arrow endpoints and local line
  points to the new dimensions. Identities, numbers, rotations and equipment
  dimensions survive; one undo restores the exact prior document. Oversized
  zones/walls/ladders reject the edit with a useful message instead of silently
  resizing or losing objects. Strict static validation precedes the commit.
- Shirts, keeper distinction, ball highlights, striped cones and framed nets
  share deterministic artwork between React-Konva and SVG. PNG clones the same
  scene. Appearance, fit, zoom and focus remain presentation state.
- Compact accessible title/back navigation live inside the editor toolbar.
  Team/duration/metadata stay in a closed disclosure. Route pitch height uses
  available viewport space; page scroll does not inflate it. Mobile inspector
  starts closed; main editor/inspector/playback controls have44px targets.
- Multi-scene pitch edits remain disabled with an accessible explanation;
  preview/save/conflict and tenant guards are unchanged.

## Automated verification

First root gate passed17/17: backend918 tests/62 suites, frontend540 tests/62
files, Sites4 and tooling8. The new focused editor regression subsequently
passed31/31, including oversized-edit rejection. A final root repeat after the
viewport/touch-target corrections and documentation is recorded below when done.

Coverage includes all eleven canonical templates, clipping bounds, SVG parse/
escaping, proportional arrow/line changes, immutable seed, one-step undo/redo,
fit after zoom, serialized save/reopen, oversized equipment and V2 pitch lock.
Existing drag/selection/roster/playback/conflict coverage remains in the suite.

## Authenticated browser checks

Actual local UI3132/API4000, A Takım, system-admin session:

1. Desktop1672×941: compact editor, distinct full/half pitch, five modern objects,
   property editing,15-degree goal rotation and real shirt drag150/150→220/180;
   undo restored150/150. Page client/scroll width1657/1657.
2. Tablet1024×900: persisted half pitch and all five objects; two home shirts
   selected and nudged together; one undo restored clean saved state. Page
   client/scroll width1009/1009.
3. Mobile390×844: inspector collapsed, saved board, keyboard Enter selection of
   corner template and undo, shirt/disc switch without dirty state and focus
   mode. Page client/scroll width375/375 (native scrollbar accounts for15px).
4. Mobile V2 draft: explicit conversion, scene copy and playback advanced time;
   mutation/save/pitch controls locked during preview. Returning to fixed scene
   and two undos restored the clean saved V1. No V2 write was made.
5. Real create→redirect→reload succeeded for the clearly synthetic club exercise
   `QA 2026-10-20 Modern 2D saha`, id `cmvgepax300172yb8cytunc54`. Saved half
   pitch800×600 has player150/150 (QA Oyuncu,8), keeper150/400 (1), ball400/250,
   cone550/250 and goal550/450 at15 degrees. This named local QA record is
   retained; no existing training, published exercise or match was edited.

[Retained screenshots](../../apps/frontend/qa/tactical-pitch-2026-10-20/).
Files01–05 show desktop full, desktop equipment, tablet saved, mobile saved and
mobile corner. A focus capture is retained as06;07–08 retain the final desktop/
tablet states after the touch-target corrections. DOM measurements found no
visible command/inspector/tab/view button below44px on those two viewports.
Screenshots are browser viewport
emulation, not physical touchscreen or formal WCAG certification.

PNG action was exercised, but IAB did not report its download within10seconds
and no local downloaded artifact was available. No successful PNG-file inspection
is claimed. SVG serialization and common scene geometry are covered by tests;
a downloaded PNG/SVG pair remains a manual export acceptance limitation.

## Final gate

Final root repeat **passed17/17, exit0**. Backend927 tests/62 suites;
frontend542 tests/62 files; Sites4 and Node tooling8 passed. Backend/frontend
typecheck, lint, format and builds passed; Markdown192 files/zero broken links;
CDSK36 required documents/47 ADRs/zero errors; git whitespace passed.

This is the current primary worktree gate, including concurrent attendance,
training-detail and library/attachment work. The higher counts are not attributed
solely to this tactical change. Those files were not reverted or staged here.

Log: `output/tactical-studio-quality-final-20261020.log` (ignored local artifact).
Prior run: `output/tactical-studio-quality-20261020.log`.
The separate PR#1 legacy boardless-attachment P1 remains outside this change.
