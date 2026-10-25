# Taktik kadro ve birim araçları — 2026-09-19

## Scope and implementation

ADR-0035 increment 2 / CR-025 / REQ-024 / BL-057. User requested the next step.
No API, Prisma, migration, permission grant, local record or credential change.

- Existing paged `GET /sporting/players/page` supplies a lazy roster tab to
  tactics, training-phase and match board editors in the workspace scope.
- Name snapshots only: existing V1 `name`, empty number until user input,
  goalkeeper marker based on the visible football profile. No persistent
  Person binding or automatic roster synchronization is claimed.
- Search debounce, cursor reset, loading/error/retry, no late response after
  scope change; maximum name length and 250-element addition guard.
- Multi-selection via Shift/click or explicit toggle, whole-team selection,
  unit drag and accessible direction buttons; one-step undo for move/copy/delete.
- Shared clamped translation preserves relative spacing; arrow endpoints move
  with anchors. Multi-transform disabled; individual resize/rotation retained.
- History and index are atomic. Selection rings are excluded from PNG export.
- PLAYER/read-only mode hides new roster and mutation controls.

## Evidence

- Targeted frontend and helper tests cover snapshot serialization without
  Person identity/guessed number, unauthorized read/retry, cursor/search,
  stale responses, read-only visibility, unit actions and arrow bounds.
- Authenticated Chrome A Team roster read returned 18 visible players in the
  actual new-tactics editor. No add/save/delete was invoked on that user's
  unsaved board. The panel identifies current roster rather than historical
  match-day eligibility.
- Isolated harness with 22 synthetic players: selecting home team leaves
  persistence status saved; dragging one selected player moves all 11;
  one undo returns status to saved. This found and fixed Konva Transformer's
  multi-node drag interaction: the transformer now attaches only to a single
  selected node; multi-selection uses non-interactive rings.
- Chrome isolated component checked at 1672×941, 1024×900 and 390×844;
  mobile tools remain horizontally scrollable and the inspector is vertically
  scrollable. Direction controls use four grid columns to avoid tablet wrap.
  Viewport override was reset after QA. Physical touch-device pilot is not claimed.
- Targeted component/helper/route tests: 23 passed before final history/lint
  corrections; component/helper rerun: 22 passed after corrections. Scope-keyed
  async results avoid synchronous effect state resets and hide stale pages.

## Limitations and next slice

Closure: `npm run quality` exit 0. Backend 725 tests, frontend 303 tests
(47 files), Sites 4 tests; typecheck/lint/format, backend/frontend build,
132-document Markdown link check, CDSK and `git diff --check` all pass.
The earlier lint failure was fixed with request-keyed asynchronous results;
the earlier browser group-drag failure was fixed and successfully rechecked.

Roster identity linking, filling existing formation slots, named persistent
units, custom formation storage, animation and offline match-day remain open.
The read-only live check is not an authenticated write/persistence E2E. Formal
WCAG and physical tablet/touch pilot remain TBD. No real data was mutated.
