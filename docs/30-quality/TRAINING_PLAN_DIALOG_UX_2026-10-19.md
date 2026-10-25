# Training plan form UI/UX — 2026-10-19

Status: implemented; responsive visual and affected automated gates passed.

## Implementation

The user's compact Matches/library/add-exercise language extends to the shared
TrainingPlanDialog. The same presentation covers create/edit; delete is untouched.
No API/schema/dependency or permission change; ADR-0039 remains authoritative.

Changed source: apps/frontend/src/components/training-plan-dialogs.tsx,
components/plan-coach-picker.tsx, styles/training-plan-workspace.css and
routes/trainings.test.tsx (the last three relative to apps/frontend/src/).

- Compact Inter header, inline team context, white surface/thin borders and blue
  explicit primary action. Desktop pairs title/date; mobile stacks every field.
- Title/date remain necessary under the existing gate. Purpose remains optional.
  Connected descriptive hints explain local-device time and optional notes.
  Native datetime-local, defaults, raw title/notes and ISO conversion are retained;
  no required/min/max attribute, split-date state or Enter-to-submit is introduced.
- Inputs/selects are48px with16px text. Purpose is112px high desktop/144px mobile.
  Header/footer sit outside the scrolling body. Buttons/close are at least44px;
  mobile footer has two equal columns. Long recovery actions can wrap.
- Administrator creation still explicitly selects an active club COACH through
  existing cursors/pinned choice. Previous/Next visible labels are compact, while
  accessible names retain Antrenör context. Empty/error/retry states remain.
- Initial focus is the title with its text selected, retaining easy replacement.
  Existing caller focus return and draft lifetime
  remain. Pending saves disable Cancel as well as fields/submit; dismissals still
  pass through the existing saving guard. Creation from the exercise picker
  never automatically attaches the exercise.

## Verification

- Full frontend: **512/512**, **61 files**,359.74seconds, serial execution.
- Final affected training-list/planning/detail: **44/44** after title-selection
  refinement. Existing tests cover native/default/blank-title gates, raw title/
  notes/local ISO, pending/reload ordering, retry/error escaping, keyboard trap,
  Enter behavior, dismissal/focus/draft, edit/delete and active-coach/no-auto-attach.
  Added assertions check field descriptions, team context, selected initial title
  and disabled Cancel during pending save.
- React Router typegen/TypeScript, scoped ESLint/Prettier, production build,
  Sites packaging and worker **4/4** pass. Required client/server/hosting artifacts
  exist; protected hosting/worker source files are unchanged.
- Markdown links:183 files/zero broken. CDSK:36 required documents,47 ADRs,
  zero errors. Git whitespace passes. The full17-stage root gate is not claimed
  for this presentation slice; no backend behavior changed.

Actual browser uses retained local API/session only; no create/edit/attach/delete
submit was clicked. At this UI slice's verification the administrator's club had no active COACH, so
primary creation correctly stays disabled even after filling title/date/purpose.
Valid-coach creation and COACH-derived ownership remain automated test coverage.
No account was created or granted access for UI verification.

- CSS1440×1000: final dialog640×831.8px, paired required fields, full purpose and
  truthful unavailable-coach message. Local date entered20Oct2026 18:30 stays
  after other field editing. Browser automation needed a real arrow-key change
  to commit the native date value; app input handling was not altered for it.
- CSS390×844:48px/16px inputs, original multiline purpose, fixed69px footer.
- CSS320×568: dialog300.8×533.9px inside viewport; body356px with880px content,
  equal284px client/scroll widths.144px purpose has142px client/scroll height
  for the four wrapped lines; no extra textarea scroll is needed for this sample.
  Footer stays at y481–550 while purpose is edited.
- CSS1024×900: dialog640×810px, body632px with654px content; equal623px client/
  scroll widths. All action buttons44px and input/select48px.
- CSS844×390: dialog640×351px; body173px with654px content, footer292.5–369.5px.
- Escape from the embedded create form restores drill-create-plan and returns to
  the existing attachment dialog. No attachment was made.
- Actual list create/Escape/reopen retains title, date and purpose; focus returns
  to training-create-trigger. Fresh first opening selects all14 default-title
  characters. Actual Shift+Tab/Tab loops through close/title within the dialog.
  Shared edit loads the existing22May2027 10:00 title/date/purpose correctly;
  no create-only coach picker. Its320px footer wraps the longer save label and
  remains in bounds (89px high), body client/scroll widths284/284px. Cancel/close
  returns to the exact row edit trigger; no edit was saved.

Evidence directory: apps/frontend/qa/training-plan-dialog-ux-2026-10-19/.
01-desktop-before,02-desktop-draft (intermediate),03-desktop-final,
04-mobile-fields,05-mobile-purpose,06-narrow-purpose,07-tablet,08-landscape,
09-mobile-reopened-draft,10-tablet-edit,11-narrow-edit and12-mobile-initial PNGs.
comparison-style.png compares the approved attachment dialog with the final form;
both1440×1000 sources are scaled to equal800px widths without aspect distortion.
Both were inspected together. comparison-form.png retains original/revised forms.

P2 refinements: paired desktop required fields and inline team context reduce
vertical density; mobile remains one column. Purpose grew from112 to144px on
mobile so the narrow four-line sample needs no nested textarea scroll. The title
selects its current text on open and long footer/retry labels wrap. No actionable
P0/P1/P2 remains after source/result and narrow/mobile inspection.

Physical keyboard/OS-native date sheet certification is outside viewport-based
Chromium QA. No new ADR is required. Next: user review of the completed dialog.


## Subsequent local-data correction

The user's later explicit request creates two synthetic accounts, including the
active coach required by this unchanged ownership contract. The picker also gains
explicit draft-preserving refresh. The earlier empty-state capture remains valid
historical evidence. [Operation](LOCAL_COACH_PLAYER_2026-10-19.md).
