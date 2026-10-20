# Match detail UI/UX — 2026-10-19

Status: implemented; visual QA passed. Full frontend typecheck has a separate
concurrent-work blocker described below.

## Approved direction and delivery

The user requested the already selected third Matches concept's design language
on match detail, including mobile. This is an adaptation to the existing detail
workflow, not a pixel-for-pixel copy of a catalogue. No new design selection,
raster asset, product feature, dependency or ADR was required.

Source: [selected catalogue concept](../../apps/frontend/qa/matches-ux-2026-10-19/selected-design-3.png).
The existing repository detail capture was inspected for context, not treated
as a fresh before-state audit. Concurrent library/HMR changes initially blocked
live access; the resulting implementation was verified in authenticated Chrome.

- Replaced the photographic header with a compact opponent heading, actual
  competition label and back link.
- Combined saved date, local time, venue, formation and board status in one
  semantic description list. Removed five metric cards and the duplicate facts
  sidebar. Summary formation still updates only after an accepted server write.
- One white panel contains the existing analysis/tactics tabs. Analysis and
  formation/focus fields sit side by side on desktop; full-width coach notes
  and the explicit save footer follow. Mobile stacks fields, uses 16px control
  text and at least 44px back/tab/save targets.
- Preserved resource/session/scope keys, metadata-first reads, explicit
  analysis payload, pending-write lock, failed-save draft retention, PLAYER
  readonly access, lazy token-bound tactical reads/writes and dirty/conflict
  tab transitions. Pitch art, equipment and document formats are unchanged.
- Existing normalized `TBD` values in analysis fields remain part of their
  existing contract; this UI slice does not silently rewrite them.

## Changed files

- [Detail route](../../apps/frontend/src/routes/match-detail.tsx).
- [Scoped responsive styles](../../apps/frontend/src/styles/match-detail-reference.css).
- [Read/write presentation regressions](../../apps/frontend/src/routes/match-reads.test.tsx).
- Frontend AGENTS, UI migration plan, Changelog, Project Boot/handoff and root
  design QA record the approved direction and evidence.

No backend/API, schema/migration, permissions, session flags or retained-record
write was performed by this slice. Other existing worktree changes are preserved.

## Automated verification

- Matches catalogue, detail reads, real-editor tactical integration and
  ResourceBoard suites: **4 files / 27 tests passed** (`--maxWorkers=2`).
- Two added regressions cover pending disabled controls plus failed-save draft
  retention/no automatic retry, and saved-summary advancement after accepted
  formation writes. Existing stale-scope, lazy board, Cancel/Discard/Save-and-leave,
  conflict-token and PLAYER tests pass.
- Scoped ESLint and Prettier: pass. Production React Router build and Sites
  preparation: pass. Sites packaging tests: **4/4 pass**.
- Full frontend `tsc --noEmit`: **blocked** by the independently edited
  [add-drill dialog](../../apps/frontend/src/components/add-drill-to-plan-dialog.tsx), line 78:
  `Property 'total' does not exist on type 'TrainingPlanCatalogPage'`.
  No diagnostic points to the changed match files. The unrelated file was not
  modified to mask this blocker. No clean root-quality/full-suite claim.
- External CDSK validator remains unavailable at the documented sibling path;
  local Markdown links and whitespace are checked separately.

## Browser and visual verification

Actual retained sample match, actual route/API and authorized existing account;
no record was saved. Existing prefilled login was resubmitted after session
resets during concurrent development. Credentials were not extracted or stored.

1. Desktop analysis at 1487×1058: all fields and save action readable; selected
   catalogue reference and rendered detail were combined and reviewed for shared
   typography, surfaces, spacing, blue actions and restrained dividers.
2. Tablet at 1024×900: summary and two-column form fit; page scroll width equals
   client width (1009px excluding the classic scrollbar).
3. Mobile at 390×844: no horizontal page overflow (375px client/scroll width).
   All five inputs/textareas use 16px text. The explicit save button is 44px high,
   y=674.6–718.6 when scrolled to the bottom, clear of the fixed navigation.
4. Mobile board: real empty V1 document loaded lazily. Fit-to-pitch view, internal
   horizontal tool rail, inspector and tab controls remain reachable without
   expanding page width. No element, document or feature flag was saved/changed.
5. Entered a temporary analysis draft, opened the clean board and returned:
   analysis text remained. Cleared that temporary text without saving. Full
   sample coach notes/source URLs remain available in the textarea.

Captured warning/error log after the authenticated checks is empty. A later
session reset interrupted an additional desktop-board capture; the login
capture was rejected and removed. Desktop board behavior is covered by the
existing integration tests; no completed extra desktop-board capture is claimed.
Viewport override was reset. Physical touch, screen readers and formal WCAG
compliance are not claimed.

Evidence: [style comparison](../../apps/frontend/qa/match-detail-ux-2026-10-19/comparison-style.png),
[desktop analysis](../../apps/frontend/qa/match-detail-ux-2026-10-19/08-desktop-analysis.png),
[tablet](../../apps/frontend/qa/match-detail-ux-2026-10-19/07-tablet.png),
[mobile summary](../../apps/frontend/qa/match-detail-ux-2026-10-19/02-mobile-first.png),
[mobile form](../../apps/frontend/qa/match-detail-ux-2026-10-19/05-mobile-analysis.png),
[mobile save](../../apps/frontend/qa/match-detail-ux-2026-10-19/06-mobile-save.png),
[mobile pitch](../../apps/frontend/qa/match-detail-ux-2026-10-19/04-mobile-pitch.png).

## Handoff

Visual result: passed; no outstanding P0/P1/P2 presentation issue in the checked
states. Review the detail from Matches. The separate drill task owns the full
typecheck blocker. No commit, push or deployment was performed here.
