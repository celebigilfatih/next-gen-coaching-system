# Tactical equipment icon concepts — 2026-10-20

User requested an original professional six-object family shown in the toolbar
and on the pitch, following the [competitor research](TACTICAL_ICON_COMPETITOR_RESEARCH_2026-10-20.md).
Audience: coaches using the existing NGCS modern2D tactical board.

## Preview delivery

Three independent built-in Image Gen concept images were displayed in order:

1. [Precision Kit](../../apps/frontend/qa/tactical-icon-concepts-2026-10-20/01-precision-kit.png):
   horizontal equipment strip, outlined miniatures and enlarged specimens.
2. [Touchline Compact](../../apps/frontend/qa/tactical-icon-concepts-2026-10-20/02-touchline-compact.png):
   compact horizontal labeled controls and a flat half-pitch practice arrangement.
3. [Field First](../../apps/frontend/qa/tactical-icon-concepts-2026-10-20/03-field-first.png):
   vertical equipment strip maximizing the pitch, with a bottom specimen row.

All cover player, goalkeeper, ball, cone, netted goal and mannequin wall.
All used the actual [current board capture](../../apps/frontend/qa/tactical-icon-concepts-2026-10-20/current-board.png)
as the attached visual reference. The user's existing empty draft was only read;
no editor action, save, database write or runtime source change was performed.

These are raster design concepts, not implemented controls, extracted production
assets or measured24/32px accessibility checks. Generated layout is approximately
landscape1440×1024; exact dimensions and touch targets require implementation QA.
The first concept introduces pitch perspective; the third adds shorts/legs on
some on-pitch tokens. Those generated deviations do not approve a perspective
renderer or override the existing shirt default. Refine the selected direction
to preserve shared silhouettes and orthographic pitch geometry before coding.

## Brief and constraints

- Original artwork; no copied competitor assets. Existing white/blue Inter-style
  compact interface and green pitch are the design context.
- Six miniatures in the toolbar and the same family on the pitch, with larger
  specimens for comparison. Recognizable keeper sleeves/gloves, classic black/
  white ball panels, broad-based orange cone, real goal/net and training mannequins.
- Retain2D, shirt default/disc alternative, existing V1/V2 dimensions and shared
  Konva/SVG/PNG contract. No dependency, renderer, API or schema decision.
- Selection is pending. Do not silently replace production artwork from a mock.

## Verification

Each returned image was visually inspected for the six objects, toolbar/pitch
context and alignment with the brief. No code tests or root quality gate are
claimed for this design-only pass. Markdown links and CDSK validation were run
after recording the preview handoff.
