# Training detail UI/UX — 2026-10-19

Status: implemented; visual QA passed.

## Direction and implementation

The user requested the existing compact Matches/detail language on training
detail, with easier mobile phases and tactical-board controls. The existing
application and screenshot references remain the design source. No new asset,
dependency, backend, schema, migration, security or ADR decision is introduced.

- Replaced the photographic hero with a back link, 40px desktop / 30px mobile
  title and existing edit/delete actions. Saved duration, phase count and purpose
  share one semantic definition-list strip.
- Flow, tactical board and attendance share one white panel. Phase buttons are
  an ordered list with number, type, title, duration and `aria-pressed` selection.
  Long notes and frozen instructions stay in the selected phase, outside buttons.
- Desktop/tablet place phases beside the selected application. Below 900px they
  stack. The existing exercise picker follows the flow in a native disclosure;
  it starts open for an empty plan. Frozen application age/version remain visible.
  Catalogue filters, preview and explicit
  attachment remain unchanged.
- The selected phase has an explicit board-tab action. The board picker adds
  previous/next controls and position count. Displayed ordinals use the complete flow, even when different phase types
  have the same category-local order. Neither phase selection nor tab
  selection fetches a board. Only the explicit open action reads it.
- Mobile uses 44px tabs, phase navigation and open controls, 16px selects and
  88px minimum phase rows. The embedded board fits the panel without inherited
  negative margins; the existing focus mode provides the larger pitch. Shared
  playback, scene settings and optional properties retain their recent changes.

ADR-0025 lazy loading, snapshot/source identity, first-save undo, conflict and
uncertain-save behavior are preserved. ADR-0039 frozen `contentSnapshot`, plan
duration, role restrictions and read-only playback remain unchanged. This slice
made no retained data writes; another task's explicitly approved attachments and
weekly-program records were preserved.

## Files and checks

- [Training detail](../../apps/frontend/src/routes/training-detail.tsx),
  [scoped style](../../apps/frontend/src/styles/training-detail-workspace.css),
  [board route tests](../../apps/frontend/src/routes/training-board.test.tsx).
- Frontend AGENTS, UI migration plan, CHANGELOG, Project Boot/handoff and root
  design-qa record this direction and evidence.
- Focused training detail, board and catalogue suites: **47/47**. The updated
  presentation assertion checks accessible phase selection and the explicit
  transition. A new integration checks previous/next bounds, cancel/discard
  draft guard, selected phase and lazy loading.
- TypeScript, scoped ESLint/Prettier, production build and Sites worker **4/4**
  passed. Full frontend: **479/479**, **59 files**, serial execution (264.81s).
  After the final age/version and ordinal wording adjustment, the three focused
  suites and production build were run again.
- Initial focused run had two five-second scene-test timeouts under concurrent
  load and one obsolete hero assertion. Updated assertion and serial 15-second
  timeout invocation passed. An attempted two-worker full run exhausted local
  process memory; it was stopped and rerun with one worker and file parallelism
  disabled. No application behavior or committed timeout configuration changed.

## Actual browser evidence

Directory: `apps/frontend/qa/training-detail-ux-2026-10-19/`.

- Source: existing Matches detail `08-desktop-analysis.png` in its QA directory.
  `comparison-style.png` combines source 1472×1047 and final 1425×1085 at equal
  800px widths with preserved aspect ratio. Both were inspected together. This
  is a deliberate cross-page adaptation with different content.
- Before: `01-before-desktop.png`. Desktop final: `02-desktop-flow.png`, CSS
  1440×1000. Tablet final: `12-tablet-final.png`, CSS 1024×900; the earlier tablet
  capture stacks the flow, corrected to two columns at this width.
- Mobile CSS 390×844: `03-mobile-flow.png`, `10-mobile-phases.png`,
  `09-mobile-phase-picker.png`, `14-mobile-board-final.png`,
  `05-mobile-focus.png`, `06-mobile-scenes.png`,
  `07-mobile-scene-fields.png`, `08-mobile-draft-guard.png`.
  Native scrollbars reduce content width to 375px outside focus mode.
  `13-desktop-board.png` records the final complete embedded editor.
  `mobile-pitch-preview.png` combines the phase list and focus mode for delivery.
- Mobile computed measurements: phase rows 88px or taller; previous/next and
  scene actions 44px; scene inputs 44px high with 16px text. Page width equals
  scroll width. The embedded-board margin was corrected from −16px to zero;
  the board then fits the panel at x=17…358 in the 375px content area.
- Actual retained plan `cmvf4syjo00032yx4bhbw6631`, 19 October, 40 minutes / four
  phases. Selected phase → board; explicit open; temporary home formation,
  V1→V2 conversion, scene add and four-second playback all worked. Leaving the
  board opened the dirty dialog; cancel kept the draft and discard advanced to
  the next phase. No Save was used. Attendance loaded its real empty roster.
  Edit/Escape returned focus to `training-detail-edit-trigger` without a write.
- Concurrent local development invalidated the memory-only session during
  attendance verification. Normal local sign-in recovered it; no auth bypass.

No actionable P0/P1/P2 visual issue remains. This is local Chromium responsive
QA, not a physical-device/browser certification. Production rollout is not part
of this request. Existing root Windows/CDSK command limitations remain separate.
