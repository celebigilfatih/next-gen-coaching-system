# Selected tactical equipment family — 2026-10-20

User selected the second displayed [concept](TACTICAL_ICON_CONCEPTS_2026-10-20.md),
`02-touchline-compact.png`, and requested implementation in toolbar and pitch.
This implements the existing Accepted ADR-0035 presentation boundary.

## Changes

- Six labeled equipment actions now share a compact horizontal rail: Oyuncu,
  Kaleci, Top, Huni, Kale and Baraj. Other drawing/navigation tools remain in
  their existing rail. An action immediately adds the object as before; no false
  persistent selected-tool state is introduced.
- The toolbar uses miniature SVG images serialized from `elementArt`, the same
  source as Konva, board SVG and the existing PNG canvas export. No separate
  copied illustration or screenshot sprite becomes a production asset. This
  follows the user's explicit shared Konva/SVG/no-new-renderer scope.
- Numbered shirts have navy contours; keepers add long sleeves and dark gloves.
  Ball retains classic black panels. Orange cones have white bands/broad feet;
  goals have white posts, dark contours and gray net; amber mannequins have body
  slots, legs and dark bases. New wall defaults to84px/three mannequins; saved
  widths are not rewritten. Colors/identities/positions/radii and rotations are
  still stored in the existing document. Shirt/disc switching remains available.
- Six actions have48px height. Narrow viewports scroll the equipment rail,
  including native keyboard focus scrolling, rather than widening the page.
- No API, dependency, document schema, migration, record save or database write.
  A concurrently edited library test had two invalid Testing Library `exact`
  options removed while fixing the same issue in the added editor test; string
  role names retain their default exact matching. No library runtime change.

## Verification

- Focused55 tests across5 files passed: shared equipment parity, legacy identity/
  color/size preservation, shirt/disc, board/pitch SVG and editor/route behavior.
  All six buttons add through existing undo/redo and explicit-save callbacks.
- Actual authenticated browser1440×1024,1024×900,390×844: six objects added to an
  unsaved half-pitch draft and positioned independently; player dragged from
 560/300 to620/340. Rotation15 → undo0 → redo15, then undo restored the arrangement.
- Mobile page width375/scrollWidth375. Equipment viewport341/scrollWidth593;
  every image loaded and all six buttons48px high,84px or wider. Tab from Kale
  reaches Baraj and scrolls the rail to252px. Console error list empty.
- Browser screenshots and source/implementation comparisons are retained in
  [QA evidence](../../apps/frontend/qa/tactical-equipment-2026-10-20/).
  The selected mock is a specimen presentation; app navigation, remaining tools,
  canonical half-pitch orientation and existing equipment sizes are intentional
  integration constraints. The specimen footer is not added to the live product.
- All15 QA history changes were undone, restoring the original empty full pitch,
  Henüz kaydedilmedi and disabled Undo. Temporary viewport override was reset.
  A later unrelated workspace-context hot refresh raised a provider mismatch;
  full page reload restored the existing session and all six loaded miniatures.
  The earlier interaction session's console was clean; no claim of an entirely
  error-free development log is made after that hot refresh.
- Root quality gate passes17/17, exit0: backend932/62 suites, frontend551/63
  files, Sites4 and tooling8; both builds, typecheck/lint/format, Markdown/CDSK
  and whitespace checks pass. This is the full current worktree, including
  concurrent library work, not a claim that all test additions belong to icons.
  Ignored log: `output/tactical-equipment-quality-20261020.log`.

## Delivery boundary

The existing shared editor means the art also appears in training, match and
library boards. Saved documents are not bulk-converted. Physical touchscreen
and print/downloaded-PNG inspection are not claimed by viewport/SVG checks.

## Follow-up — nine equipment actions

User explicitly requested matching Bayrak/Merdiven/İşaret. All nine equipment
actions now live in the same horizontal rail; generic flag/ladder/circle glyphs
were removed from the other tool rail. The three additions use the identical
`elementArt` serialization path. Navy-outlined flag/pole/base, amber ladder rungs
and a navy-edged marker disc follow the selected family. Existing flag60px,
ladder140px/six rungs and marker24px defaults are retained; no document rewrite.

Fresh focused46/46 across4 files includes all nine shared-art/SVG parity cases
and all nine buttons through add/undo/redo/explicit-save callbacks. Typecheck,
lint and frontend format pass. The earlier full17-stage run above belongs to
the six-object implementation; it is not rerun or claimed for this small follow-up.

Authenticated1440×1024: three added objects independently positioned, without
saving. [Desktop](../../apps/frontend/qa/tactical-equipment-2026-10-20/07-nine-tools-desktop.png).
Tablet page/content1009/1009; mobile375/375. All nine images loaded, every button
48px high. Tab from Merdiven reaches İşaret and scrolls the rail to577px.
[Mobile](../../apps/frontend/qa/tactical-equipment-2026-10-20/08-nine-tools-mobile.png).

Production build and Sites4 pass. Markdown199/zero broken links and CDSK36/47/
zero errors pass. All8 temporary QA history changes were undone, returning the
full-pitch empty draft, Henüz kaydedilmedi and disabled Undo; viewport reset.
No save request or retained record write was made.
