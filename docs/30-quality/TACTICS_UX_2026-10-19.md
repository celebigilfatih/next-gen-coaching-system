# Tactical workspace UI/UX — 2026-10-19

Status: implemented; visual QA passed.

## Direction and delivery

User requested the selected Matches/detail language on the tactical board and
easier mobile pitch/scene controls. Existing captures, tokens and components
are the source. This is a cross-page adaptation, not identical-content cloning.
No new asset, dependency, architecture or ADR. ADR-0035/0036 remain unchanged.

- Catalogue: text heading, white native register, thin dividers, scoped total/
  cursors and explicit links. Removed hero/card photos, metrics and capabilities
  sidebar. Source category/age/duration/scope remain API values. Global links
  retain the copy workflow. Mobile stacks the same native rows.
- Editor route: match-style back link, 40px/30px desktop/mobile title and existing
  collapsible metadata above one panel. Metadata remains an explicit draft.
- Shared editor: pitch/tools, playback and scenes precede one optional inspector
  in DOM. Desktop places properties alongside; mobile starts collapsed. A native
  view disclosure groups grid/shirt/disc controls. The viewport subscription has
  a stable SSR snapshot; explicit panel preference survives viewport changes.
- Mobile: 44px commands, playback/scene actions, zoom and inspector controls;
  16px scene/property fields; readable two-column settings and internally
  scrolling tools/scenes. The timeline touch area is 44px high.
- Focus mode: intrinsic-height rows and scrolling workspace/footer keep the
  pitch visible. Layer 45 covers navigation at 40, below dialogs at 50.

V1/V2 JSON, tokens, roles, source snapshots, pending writes, conflict/draft
guards, scene operations, history and exports are preserved. No backend, API,
migration, flag or saved-data write by this UI slice.

## Changed files

- [Catalogue](../../apps/frontend/src/routes/tactics.tsx),
  [editor route](../../apps/frontend/src/routes/tactics-editor.tsx),
  [shared editor](../../apps/frontend/src/components/tactics/tactical-board-editor.tsx).
- [Studio CSS](../../apps/frontend/src/styles/tactical-studio.css),
  [workspace CSS](../../apps/frontend/src/styles/tactics-workspace.css).
- Catalogue/editor/shared-editor and drill integration test files. New mobile
  regression verifies scene selection, optional properties and view preferences
  preserve the entire saved V2 document without undo entries.
- Frontend AGENTS, UI migration plan, CHANGELOG, Project Boot/handoff,
  design-qa and this report. Other in-progress work was preserved.

## Verification

- Initial focused suites: **58/58**, 6 files.
- Full frontend: **478/478**, 59 files, two workers.
- After final focus-mode layout/DOM correction: shared editor, match/drill
  integrations **44/44**.
- TypeScript, scoped ESLint/Prettier, production build and Sites **4/4** pass.
- Markdown links and whitespace checks pass. No clean root quality/CDSK claim;
  existing Windows tooling limitations remain separate.

## Actual browser evidence

Actual localhost UI/API and the existing two-scene/five-second V2 pilot
`cmvf3z4jd00012yxw62fpw3zf`. No transport mocks or credential extraction.
Chrome initially worked, then its control connection stopped responding. User
signed into IAB to finish; a concurrent backend restart invalidated the session
once and normal login restored it.

- Desktop 1440×1000: catalogue and saved editor inspected. Catalogue total changed
  during separately authorized publication/weekly work: first one record, later 93. Real pagination passed **25 / 25 / 25 / 18**, preserving total 93; pilot
  opened from page 4. This UI task did not create those other records.
- Tablet 1024×900: pitch, inspector and command bar fit horizontally; page width
  1009px / viewport 1024px reflects native scrollbar space.
- Mobile 390×844: page 375px / viewport 390px, no horizontal overflow. Inspector
  initially hidden; commands 44px high, scene arrows 44×44px, cards over 60px;
  scene fields 44px high with 16px text.
- Mobile focus: editor 390×844 with complete pitch above playback. Playback
  reached 5000/5000ms/scene 2. Returned explicitly to static editing, added a
  temporary scene, opened deletion confirmation, cancelled and undid the add.
  Original two-scene saved state restored. Shirt/disc returned to shirt.
  No Save or retained write. Dialog remained above the expanded editor.
- Mobile catalogue/actions fit stacked rows. Final IAB warning/error log empty;
  IAB viewport reset. Chrome control unavailable for its final override reset.

Screenshots in `apps/frontend/qa/tactics-ux-2026-10-19/`:

- `00` baseline catalogue; `01` compact catalogue; `02` first editor iteration.
- `03/04` normal mobile; `05` focus failure; `06` corrected focus; `07` scenes.
- `08` later catalogue; `09` final desktop editor; `10` tablet; `11` mobile catalogue.
- `comparison-style.png`, `comparison-heading.png`, `comparison-focus-fix.png`.

Match reference is 1472×1047 pixels; final full-page desktop is 1425×1587 pixels
at 1440×1000 CSS viewport. Combined full/focused style comparisons preserve
aspect ratio at equal 800px widths. This normalizes capture size for cross-page
hierarchy review, not a pixel overlay/identical-state claim. Focus before/after
is the same expanded static first-scene state at native 390×844 density.
Existing pitch art and actual content intentionally differ from the analysis
form. See [design QA](../../design-qa.md).

## Findings and remaining limits

Resolved P2: legacy studio CSS overrode heading alignment/size; scoped selectors
restore the match hierarchy (`02` → `09`). Resolved P1/P2: focus grid collapsed
the pitch row and navigation covered controls; intrinsic rows, scrolling footer
and correct layering resolve both (`05` → `06`). Combined full-view and focused
comparisons have no remaining actionable P0/P1/P2 finding.

Physical touch/landscape devices and formal accessibility remain unverified.
No production deploy, commit or push. Next: user review on their normal device.
