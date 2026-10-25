# Tactical PNG/SVG export acceptance — 2026-10-25

User requested actual downloads and comparison with the saved tactical board.
Runtime started from main bd424a6, existing QA tactic cmvo8mkpo000l2ytchrorpagy, half800×600,
nine equipment objects. No source, configuration or retained data was changed.
During closure another authorized chat advanced main to aff1cb7 with its
documentation/evidence publication; the running application source is unchanged.

## Actual browser downloads

- The SVG button in the authenticated in-app browser downloaded
  C:/Users/fcelebigil/Downloads/ngcs-tactical-board.svg:31,378 bytes.
- The PNG button in the in-app browser produced no download within the bounded
  probe and no console error. The same saved record was opened through normal
  authenticated Chrome; its PNG button downloaded
  C:/Users/fcelebigil/Downloads/ngcs-tactical-board.png:102,568 bytes,1600×1200.
- Chrome download-event observation timed out even though actual files appeared
  with the corresponding click timestamps. File existence, decoding, hashes and
  comparison below establish completion independently of that event observer.
- JSON was also downloaded through the normal button as the geometry reference.
  Selecting the ball and increasing view zoom to125%, then clicking PNG and SVG,
  created the respective `(1)` files. Each is byte-identical to its baseline.
  Selection outlines and viewport zoom therefore do not alter these exports.
- View zoom/selection were restored; the editor still reports Kaydedildi, with
  undo disabled. No save, exercise mutation or new record accompanied this check.

## File and visual checks

The actual downloaded PNG/SVG files are copied unchanged into the evidence folder.
The JSON reference is formatted without changing its values.
PNG decodes at2× canonical pitch resolution; SVG has width800, height600 and
viewBox0 0 800 600, with no script, foreignObject or external resource reference.
All nine SVG groups match downloaded JSON positions and rotations, including
the ball's30° rotation. Player8, keeper1, ball, cone, goal, wall, flag, ladder and
marker remain present in the same three-row arrangement.

The PNG was opened directly. The SVG was rendered offline with the bundled sharp
renderer and visually inspected alongside PNG and a fresh actual editor capture.
Pitch boundary, single goal-side penalty area, halfway arc, grass bands, equipment
contours/colors, numbers and object placement agree. No object is missing,
clipped or replaced by a generic placeholder; no selection handles appear.

Local rasterization may substitute SVG's Inter/sans-serif font, visibly changing
the numeral strokes slightly; SVG does not embed a font. Raster antialiasing and
screen-capture scaling also differ, so cross-renderer pixel identity is not
claimed. At512×384, PNG versus locally rasterized SVG has mean absolute channel
difference0.0885/255;0.0275% of pixels differ by over32 in a channel. These are
descriptive comparison metrics, not a universal rendering guarantee.

Browser security policy rejected direct file:// SVG preview. No alternate
browser command or served-file workaround was used; the offline renderer is
the safe local inspection method. In-app PNG download remains an observed host
limitation in this session; Chrome PNG and both file formats are verified.

## Validation and evidence

- Focused frontend export/editor suites:2 files,35 tests pass.
- Actual duplicate PNG/SVG hashes independently match baseline despite selection
  and zoom. Assertion script also checks decoding, dimensions, all SVG object
  transforms and absence of external resources.
- Warn/error logs captured in tested browser tabs are empty.
- Markdown links, CDSK and whitespace checks pass after documentation updates.
- Unchanged runtime at this acceptance: no new ADR, dependency, migration,
  application patch or full root-quality rerun. Evidence initially stayed local;
  the later [PNG fix publication](PNG_DOWNLOAD_COMPATIBILITY_2026-10-25.md#publication-review--2026-10-25)
  includes this report and its evidence after explicit user authorization.

PNG SHA-256:4f08684a919825439ca48239f87ca5ab30356c5483162a6a048c0c22c24c22bc.
SVG SHA-256:8d4f057630bed251633b152f44766dbd8417ca6100e4270bbbc85fbdbcea458a.
Ignored reproducible comparison/assertion script:
output/verify-tactical-exports-20261025.cjs.

- [Downloaded PNG](../../apps/frontend/qa/tactical-exports-2026-10-25/board.png).
- [Downloaded SVG](../../apps/frontend/qa/tactical-exports-2026-10-25/board.svg).
- [Downloaded JSON](../../apps/frontend/qa/tactical-exports-2026-10-25/board.json).
- [Three-way comparison](../../apps/frontend/qa/tactical-exports-2026-10-25/comparison.png).
- [Full editor reference](../../apps/frontend/qa/tactical-exports-2026-10-25/editor-reference.png).
- [Machine-readable assertions and metrics](../../apps/frontend/qa/tactical-exports-2026-10-25/verification.json).

This follow-up closes the file-content verification left pending by the
[earlier browser smoke](MAIN_BROWSER_SMOKE_2026-10-25.md), while retaining the
host-specific in-app PNG limitation above.

Subsequent user-authorized [PNG compatibility correction](PNG_DOWNLOAD_COMPATIBILITY_2026-10-25.md)
replaces data-URL transport with Blob transport and verifies actual byte-identical
PNG downloads in both browsers. The host limitation described above is historical.
