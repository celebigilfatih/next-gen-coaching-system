# Matches UI/UX exploration — 2026-10-19

Status: user selected the third concept and requested mobile adaptation;
implementation and responsive browser verification completed.

## Scope and evidence

User requested UI/UX improvements to `/app/matches`. Inspected the current
authenticated Chrome screen and current route/presentation CSS. The in-app
browser could not sign in using its prefilled credentials; the existing Chrome
session provided the actual source capture without credential changes.

Source capture: [current desktop](../../apps/frontend/qa/matches-ux-2026-10-19/01-current-desktop.png).

Observed desktop issues: the standalone date-filter column consumes list width;
the fixture spreads home/away names far apart; small metadata and truncated
provenance notes make scanning difficult. The photographic header also consumes
vertical space before the fixtures. These are observations at the captured
viewport, not a formal accessibility or responsive compliance claim.

## Design constraints and concepts

The existing white shell and pale-blue active navigation are grounded in the
later visual-reference instructions in `apps/frontend/AGENTS.md` and the UI
migration plan. ADR-0011's earlier navy identity remains applicable to legacy
public surfaces; this exploration does not change architecture or brand tokens.

Three independent built-in ImageGen concepts use the actual screenshot:

1. Compact horizontal date toolbar with grouped fixture rows.
2. Date-rail agenda with a reduced photographic header.
3. Dense fixture register with aligned columns.

They retain the current exact-day filter, scoped total, cursor pagination and
detail navigation. Unsupported search, type/status filters, match creation,
analytics and scores are excluded. The visible local fixtures remain explicitly
synthetic. Generated text, opponent/date pairings and pagination illustrations
are design material, not authoritative data; implementation must use real API
values and existing contracts. Full provenance notes must remain accessible.

## Initial exploration

The actual source screenshot was saved and reopened. All three concept outputs
were visually inspected and shown in chat in generated display order. No app
code, API, data, schema, dependency, permissions or feature flags were changed.
No runtime tests/build or mobile QA are claimed for these concept images.

## Selected implementation

Selected reference: [third concept](../../apps/frontend/qa/matches-ux-2026-10-19/selected-design-3.png).
The photographic hero and separate filter column are replaced by a compact
heading and one native table. Its columns retain real date/time, teams/result,
competition, venue and preparation data. The same DOM becomes stacked fixture
rows below 1100px, then compact mobile rows below 640px with 44px controls.
Unknown fields use explicit Turkish missing-data labels. Notes retain a short
visual preview and full text in native keyboard-accessible `details`.

The date control remains outside the keyed read boundary so filter edits keep
focus. Existing scope keys, local half-open day bounds, independent retries,
full totals and cursor replacement/history are retained. No new feature,
dependency, backend/API, model, permission, flag or retained-data write.
No new ADR is required for this presentation-only approved direction.

## Verification

Implementation files: [Matches route](../../apps/frontend/src/routes/matches.tsx),
[day rows](../../apps/frontend/src/components/presentation/match-day-group.tsx),
[responsive styles](../../apps/frontend/src/styles/matches-reference.css) and
[route regressions](../../apps/frontend/src/routes/matches.test.tsx).
The approved direction is recorded in frontend AGENTS, the UI migration plan,
Project Boot/handoff, Changelog and root design QA.

- Focused Matches/detail suites: 14/14 pass, including date-focus retention,
  native column/row semantics, same-day rows, away order, long-note disclosure,
  missing data, paging, retry and stale-scope rejection.
- Frontend TypeScript check and scoped ESLint/Prettier pass. Initial typecheck
  briefly found a concurrent club-setup test error; final check passes.
- React Router production build and Sites preparation pass; Sites tests 4/4.
- Full frontend run with two workers: 464 passed / 1 failed in 57 files. The
  unrelated tactical editor's 50-undo test hit its existing 15-second timeout.
  Isolated rerun with unchanged timeout passes (6.17 seconds test duration).
  An earlier default-worker run was interrupted; it is not a passing gate.
- Authenticated Chrome uses the actual route, API and existing sample records.
  Desktop, 1024×900 tablet and 390×844 mobile layouts inspected; no horizontal
  overflow at these accepted widths. A 320px observation confirms fixture
  contents fit, but the existing shared shell's 320px body minimum produces a
  classic-scrollbar edge case; do not claim a whole-app 320px compliance gate.
- Native date-key input verified a zero-result day (16 September) and one-result
  day (16 August), then reset to all 36. Browser fill alone did not commit the
  native change event; keyboard month adjustment did. Input behavior is also
  covered by component regression.
- Enter opens all 309 characters of the first sample note, including source
  URLs, and its focus is visibly outlined. Pagination returns 25 then 11 of 36;
  mobile pager remains above fixed navigation. Detail opens the real Galatasaray
  match and browser Back returns to the catalogue. No record was edited.
- Captured browser warning/error log: empty. Physical touch, screen-reader
  testing and formal WCAG compliance remain unclaimed. Local CDSK validator
  `../cdsk/scripts/validate_project.py` is absent.

## Visual QA and handoff

The first comparison found excess row height and wrapped preparation data.
Reduced vertical padding and widened the preparation column; final desktop
comparison preserves the selected hierarchy. Real competition/notes, fixture
pairings and 25-row pagination replace generated illustrative copy. Existing
shell branding/search can differ because of separate concurrent work.

Evidence: [combined comparison](../../apps/frontend/qa/matches-ux-2026-10-19/comparison-final.png),
[desktop](../../apps/frontend/qa/matches-ux-2026-10-19/07-desktop-final.png),
[tablet](../../apps/frontend/qa/matches-ux-2026-10-19/06-tablet.png),
[mobile](../../apps/frontend/qa/matches-ux-2026-10-19/09-mobile-final.png),
[expanded note](../../apps/frontend/qa/matches-ux-2026-10-19/04-mobile-note-open.png),
[mobile pager](../../apps/frontend/qa/matches-ux-2026-10-19/05-mobile-pagination.png).

Next: user reviews the responsive screen. Existing unrelated worktree changes
are preserved; no commit, push or deployment performed by this slice.
