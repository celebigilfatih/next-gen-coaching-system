# Exercise library UI/UX — 2026-10-19

Status: implemented; browser visual QA and final affected/build gates passed.

## Implementation and boundaries

The requested Matches/training-register language now extends to `/app/library`:
compact text heading, one white panel, native exercise list and separate preview/
detail actions. Full summaries remain in keyboard-accessible native disclosures.
The existing source, category, age, objective, difficulty, duration, player and
equipment filters still use the server reader. Totals and age adaptation are
server values; cursor history resets on filters/scope and rejects late responses.

Search stays mounted outside the filter Sheet. Its 250ms debounce now keeps the
query object stable while typing, avoiding reads with the previous query on each
keystroke. All widths use one scrolling filter body with fixed header/footer;
the result button closes the live filter panel. Clear resets all filter fields.

Explicit preview reads only the chosen exercise with the catalogue response's
resolved age, including when its authored title refers to another age. Uygulama/
Saha tabs keep instructions and the readonly pitch easy to reach. The board mounts
only on Saha selection. The preview has a scrolling body, sticky tabs and fixed
close/detail actions. Closing returns focus to the exact row. Existing in-plan
preview shares this layout; publication, snapshot and explicit attachment guards
remain unchanged. Legacy records show available scalar information and an honest
missing-professional-content message. No fabricated instructions or board.

No API, schema, dependency, retained business write, role or feature-flag change.
No new ADR is needed for this presentation slice; ADR-0034/0039 boundaries remain.
Detail links retain the existing team-scoped detail/planning behavior.

## Browser evidence

Actual local Chromium checks at CSS1440×1000, 1024×900, 390×844 and 320×844.
Directory: `apps/frontend/qa/library-ux-2026-10-19/`.

- `17-desktop-final.png`, `16-tablet-final.png`, `11-mobile-final.png` and
  `20-narrow-final.png`: native rows, source/category controls and explicit actions.
- `05-mobile-filters.png`, `18-desktop-filters.png`, `19-narrow-filters.png`:
  scrollable fields and reachable result action. At320 all eight fields are
  44px high /16px text; panel content and scroll widths both282px.
- `06-mobile-application.png`, `07-mobile-pitch.png`, `08-mobile-focus.png`,
  `21-mobile-preview-final.png`: application/readonly pitch, focus-mode exit and
  fixed actions. Actual selected U14 adaptation loads for a U16-authored record.
- `12-mobile-description.png`, `14-mobile-detail.png`, `15-mobile-legacy.png`:
  full disclosure, correct detail ID and honest legacy fallback. Escape and row
  focus return pass. No save/attachment was submitted.
- `09-mobile-empty.png`: combined NGCS/U14/max20/equipment/search empty response;
  reset restores the catalogue. Lower next/previous reaches25 then23 of48 NGCS
  records. Category changes retain the existing first-page behavior.

At390, page content/scroll widths both375px and row actions151.5×44px. At320,
both305px and row actions116.5×44px. Source/phase scrolling stays inside the panel.
The minimum-width override is scoped to this route.

`comparison-style.png` combines approved training register
`qa/trainings-list-ux-2026-10-19/11-desktop-final.png` and the final library capture
at equal800px widths, preserving aspect ratio. Both were opened together. This is
intentional cross-page adaptation, not a pixel clone of training data columns.
No actionable P0/P1/P2 remains. Physical-device certification is outside this check.

## Automated verification

Final library/planning/integration suites: **29/29**, three files. TypeScript,
scoped ESLint and Prettier pass. The initial full run reached **497/498** in60
files with one existing scene-history test timing out. Its file retry exposed a
test bug: it retained references to input/submit nodes across the intentionally
keyed scene-form remount. The test now re-queries current controls, confirms
all55 edits actually applied, and verifies exactly50 undo transitions. Its local
budget is60seconds for110 real UI actions; production editor code is unchanged.
Corrected board file: **29/29**, one file,43.15seconds. Together with the final
library suites this is **58/58** affected checks. The initial full suite's497
passing checks and this corrected-file pass cover all498 collected cases; a new
single full-suite run was not claimed. No failing assertion remains unaddressed.

Final TypeScript, scoped ESLint/Prettier, production build, Sites packaging and
worker **4/4**, and whitespace checks pass. The initial concurrent build timed out in SPA prerender; a sequential retry
generated all required artefacts successfully. Available RAM was about599MB of
32GB during the slow initial gates. Runtime/configuration limits were not changed
to force the build through. Evidence logs: `full-tests.log`, `final-targeted.log`,
`board-final.log`, `build-final.log` and `sites.log` in the QA directory.
The final affected suites cover debounced reads, combined filters, resolved-age
lazy preview, focus return, readonly tab mounting, cursors/retries/stale scope and
existing attachment/publication behavior. Root Windows/CDSK limits remain BL-061;
workspace checks do not claim the root quality command passed. The initial
Markdown scan passed167 files/0 broken; a later concurrent change added ADR-0043
references before its report existed. The final169-file scan currently finds3
missing links to `TWO_MATCH_PROGRAM_2026-10-19.md` in ROADMAP, RUNBOOK and ADR-0043.
These are outside this library slice; no placeholder report or unrelated edit was
created to hide the missing evidence. Library report links resolve.

## Changed files and continuation

Follow-up verification during the exercise-detail extension: the previously
pending ADR-0043 report now exists and all173 Markdown files resolve with0 broken
links. The older169-file failure above records the state at that earlier check.
Root/CDSK acceptance is now tracked separately by the newer repository-owned
validator work; historical BL-061 statements above do not describe its final state.
[Follow-up evidence](LIBRARY_DETAIL_UX_2026-10-19.md).

- `apps/frontend/src/routes/library.tsx`: compact catalogue, search/filter panel,
  native disclosures, explicit previews and both pagers.
- `apps/frontend/src/components/drill-catalog-filters.tsx` and `drill-preview.tsx`:
  optional shared search visibility, stable debounce and responsive lazy preview.
- `apps/frontend/src/styles/library-workspace.css` and
  `drill-preview-workspace.css`: route/preview presentation and mobile controls.
- `routes/library.test.tsx`, `components/ready-drill-planning.test.tsx` and
  `components/tactics/tactical-board-editor.test.tsx` under frontend `src/`:
  interaction regressions and repaired current-form history test.
- Frontend AGENTS/README, root README/CHANGELOG/Project Boot/design QA, UI migration
  and test strategy: durable direction, evidence and handoff.

Next: review `/app/library` with the existing team/season and actual content;
preserve explicit plan selection/save and independent publication policy. No new
backend work is required by this UI request. Physical-device QA and BL-061 remain
the stated external limits.
