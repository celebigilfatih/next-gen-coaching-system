# Tactical action icons and football — 2026-10-20

User requested button icons and a more recognizable football on `/app/tactics/new`.
This is a presentation refinement within Accepted ADR-0035 / REQ-024 / BL-057;
no new architecture decision, dependency, schema or API change.

## Documentation publication review

The user authorized publishing the remaining icon documents and three JPEG QA
images after `1d75b9f`. The action/artwork implementation was already committed
in `9015b31`, followed by the pitch/header work in `24a4a2a`. This commit contains
documentation and historical QA only. The latest full root17/17, backend937 /
frontend556 / Sites4 / tooling8 and dedicated HTTP11 results belong to the
[training workflow publication](TRAINING_WORKFLOW_PUBLICATION_2026-10-20.md).
They are not rerun or claimed fresh for these document/image changes.

All three JPEGs were opened and inspected: the closeup shows the black-panelled
football, the desktop view shows the first command-icon toolbar, and the mobile
view retains labeled save/view controls and compact history. These captures
precede the horizontal shared-art equipment rail. The completed nine-tool family
has its own [implementation evidence](TACTICAL_EQUIPMENT_IMPLEMENTATION_2026-10-20.md).
Original JPEG bytes are preserved; no browser save, image regeneration or retained
data operation is performed. Physical-device/export limitations below remain.

The remaining shared-document additions/reordering were reviewed against HEAD;
completed selections are stated explicitly, while earlier implementation notes
and their test counts remain historical. Fresh Markdown/CDSK/whitespace and
frontend instruction-format checks are recorded before commit/push to
`codex/mvp-stabilization`. No new ADR or production activation is introduced.

Final publication checks:202 Markdown files/zero broken links, CDSK36 required
documents/47 ADRs/zero errors, frontend AGENTS Prettier and staged whitespace pass.
All eight staged paths are documentation/QA; five text files pass the limited
credential-pattern scan and three JPEG signatures are valid. Existing83 changelog
sections are retained through the history reordering. Ignored manifests/logs are
in `output/icon-docs-publication-20261020/`.

## Implementation

- Shared editor: history, view disclosure, animation conversion, multiselect,
  team selection/clear, directional nudge and home/away formation icons.
- Metadata uses Info; scene apply uses Check; playback loop/fixed-scene uses
  Repeat/Stop. Existing text/accessibility labels and handlers remain.
- Mobile history labels are visually hidden, while named buttons remain44×44px.
  Other action labels stay visible. Decorative new icons are aria-hidden.
- Ball tool uses the existing Phosphor SoccerBall in filled neutral styling.
  `board-art.ts` replaces the star-like spokes with a central black pentagon,
  five clipped edge panels, fine gray seams, white surface and restrained shadow.
  All panels remain inside the radius. Konva and SVG share this drawing;
  PNG retains the existing shared-scene path. Existing radii/documents are intact.

## Verification

- Focused frontend58/58 across5 files: editor, route/integration, pitch art and
  SVG parse/escaping; typecheck, ESLint and production build passed.
- Frontend format, Sites, Markdown and CDSK results are recorded below.
- Authenticated local1672×941: added one ball to an unsaved new draft, edited
  its position and inspected it at300% without selection handles. Icons and
  existing fit/selection controls work. No API save was submitted.
- 390×844: named undo/redo measured44×44; client/scroll width375/375. The
  toolbar and metadata stay inside the page and the inspector starts collapsed.
- Screenshots: [football closeup](../../apps/frontend/qa/tactical-icons-2026-10-20/01-football-closeup.jpg),
  [desktop toolbar](../../apps/frontend/qa/tactical-icons-2026-10-20/02-desktop-toolbar.jpg),
  [mobile toolbar](../../apps/frontend/qa/tactical-icons-2026-10-20/03-mobile-toolbar.jpg).
  Viewport emulation, not a physical
  touchscreen certification. The prior root17/17 is historical, not rerun for
  this small presentation change. No new downloaded PNG-file claim is made.

Frontend Prettier, Sites4/4, Markdown193 files/zero broken local links and
CDSK36 required documents/47 ADRs/zero errors passed. The three draft edits
(add ball, X, Y) were undone; the new-board screen returned to zero objects /
Henüz kaydedilmedi, and the temporary viewport override was reset.

Changed runtime files: shared editor, scene strip, playback controls, tactical
route metadata, board artwork and tactical studio CSS. Frontend AGENTS,
CHANGELOG and Project Boot handoff record the approved presentation refinement.
