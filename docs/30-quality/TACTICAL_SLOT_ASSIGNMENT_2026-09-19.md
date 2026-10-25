# Tactical formation-slot assignment — 2026-09-19

Scope: ADR-0035 / CR-025 / REQ-024 / BL-057, increment 3. Shared editor only;
no API, schema, dependency, retained-data write, migration, seed or reset.

## Delivered behavior

- Kadro separates new-marker creation from explicit existing-slot assignment.
- Select a player/goalkeeper on the pitch or through the labeled slot selector.
  Team, current number and name distinguish positions; no automatic matching.
- Confirmation names the target and replacement, starts focused on Cancel,
  restores focus to the initiating player button and rejects a changed target.
- Only the V1 name snapshot changes, with the old number deliberately cleared.
  Users can enter the actual shirt number in Properties. Element id, geometry,
  type, rotation and team are preserved; no Person identifier is stored.
- Assignment remains available at the 250-element cap; adding does not.
  Saving/read-only guards remain. Assignment is one undo/redo transition and
  becomes persistent only through the existing explicit Save action.
- Editor keyboard shortcuts are inactive while a Dialog owns interaction.
  This prevents background delete, duplicate, undo and save during confirmation.

## Verification

- Component tests: target required, add cap versus assignment, cancel focus,
  focus return, stale-target denial, saving guard, no inferred number/identity,
  unchanged geometry/type, modal shortcut isolation and single-step undo/redo.
- Chrome synthetic component harness (no production API or database): selected
  home slot 9, assigned a synthetic name, saw 27 unchanged elements, blank number
  and dirty status; one undo restored Saved. Temporary fixture is outside repo.
- 1672×941, 1024×900 and 390×844 inspected. Desktop/tablet inspector scrolls;
  mobile confirmation reflows and both buttons remain usable. Cancel returns
  focus to the player row. Mobile document width equals viewport width (390px).
  Temporary viewport was reset and QA tab closed. User draft was not touched.
- Root quality: 725 backend / 306 frontend / 4 Sites tests pass; builds,
  typecheck, lint, format, CDSK, Markdown links and whitespace checks pass.

## Remaining boundaries

This is not Person identity linking, match eligibility checking, automatic
lineup optimization or an authenticated write E2E. The same person may appear
more than once on a coaching diagram intentionally; no identity uniqueness is
claimed. Physical touch-device pilot and formal WCAG remain TBD.
Next: specify scene/timeline and animation contracts under a separate Proposed
ADR before extending V1; offline storage, persistent units and 3D remain later.
