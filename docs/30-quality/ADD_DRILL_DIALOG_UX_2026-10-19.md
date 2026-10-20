# Add exercise to training dialog UI/UX — 2026-10-19

Status: implemented; responsive visual and affected automated gates passed.

## Implementation

The existing library detail picker now shares the compact Matches/training/library
language: Inter heading, white bordered dialog, explicit blue primary action and
a compact selected-plan summary. No new endpoint, dependency, model or migration.
ADR-0034/0039 publication, exact-age, ownership and expected-version guards remain.

Changed source: `apps/frontend/src/components/add-drill-to-plan-dialog.tsx`,
`src/styles/drill-plan-workspace.css`, caller `src/routes/library-detail.tsx` and
`src/components/ready-drill-planning.test.tsx` (the latter three under
`apps/frontend/`). Frontend instructions, migration plan, test strategy, design QA,
CHANGELOG and Project Boot2.138 handoff record the completed slice.

- The published exercise title, team and target phase identify what is being added.
  The caller passes the already resolved version title; no second content request.
- Existing native plan select and cursor reader remain. Full title, local date/time,
  saved duration and phase count appear below it. Full purpose opens in a native
  disclosure; target placement is explained. Selection survives option-page changes.
  Totals use the actual server summary; loading does not claim zero plans.
- New training stays a separate explicit action. Cancel restores its trigger and
  retains selection. Administrator creation still requires an active club COACH;
  creating never attaches the exercise automatically.
- Header/footer stay outside the internally scrolling body. All dialog actions and
  the select are at least44px; select text16px. At narrow widths footer actions
  share two equal columns, long titles wrap and recovery actions can wrap too.
- First open focuses the plan select. Escape/close restores the exercise-detail
  add trigger. Pending metadata, foreign-group errors, duplicate attachment and
  uncertain writes still block addition. Uncertain writes require explicit plan
  verification before retry; no automatic mutation.

## Verification

- Full frontend: **512/512**, **61 files**,344.48seconds, serial execution.
- Affected planning/library/detail: **32/32**. Final planning-only rerun after
  focus/summary refinements: **11/11**. New regressions cover cross-page selection,
  real server totals/exercise context, duplicate blocking/full purpose and metadata
  read retry. Existing version/explicit add, active-coach creation, no auto-attach,
  uncertain verification and stale-read tests pass. First-open focus is asserted.
- React Router type generation/TypeScript, scoped ESLint and scoped Prettier pass.
  Production build, Sites packaging and worker **4/4** pass; required client,
  server and hosting artifacts exist. No protected hosting/worker source changed.
- Markdown links:182 files/zero broken. CDSK:36 required documents,47 ADRs,
  zero errors. Git whitespace check passes. Root17-stage rerun is not claimed
  for this presentation-only change; no backend behavior changed.

Actual browser checks use the retained local API/session and existing records only.
No create or attach submit was clicked; both edited121/103min plans are untouched.
The selected May19 plan still shows103min/6 phases, and the catalogue443 scoped plans.

- CSS1440×1000: initial/final dialog and long selected title.
- CSS1024×900: tablet dialog client/scroll widths638/638px.
- CSS390×844: selected/initial/page2 views; all seven buttons/select44px high.
  Canceling new-plan creation keeps the selected ID and focuses drill-create-plan.
- CSS320×568: dialog300.8×533.9px remains inside viewport; scrolling body330px
  high with689px of content and equal284px client/scroll widths. Footer stays
  visible at y481–550 while the full purpose is opened and scrolled into view.
- CSS844×390: dialog640×351px; body173px with529px content, footer visible.
- Page2 still shows the selected May19 plan from page1. Previous returns normally.
  Actual close reports zero dialogs and focus exercise-add-to-plan; reopening
  focuses drill-target-plan. No login or service restart was needed.

Evidence: apps/frontend/qa/add-drill-dialog-ux-2026-10-19/.
01-desktop-before,02-desktop-selected,04-narrow-short,05-narrow-summary,
06-mobile-page-two,07-tablet,08-landscape,09-mobile-initial,10-mobile-final and
11-desktop-final PNGs. The initial mobile resize-transition frame was discarded;
10-mobile-final is the settled390px result.

comparison-style.png opens the approved detail1425×990 source and dialog1440×1000
result together at equal800px widths with aspect ratio preserved. Both were
inspected, along with the320px full-purpose view and final mobile capture.
comparison-dialog.png retains the original/revised dialog. P2 corrections keep
footer actions fixed, first focus on the plan select and recovery buttons within
narrow widths. No actionable P0/P1/P2 remains.

Physical device/OS-native select-sheet certification is outside this Chromium
viewport check. No unresolved implementation risk or new ADR requirement found.
