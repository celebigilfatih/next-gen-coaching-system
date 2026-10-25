# Training list UI/UX — 2026-10-19

Status: implemented; visual QA passed.

## Direction and implementation

The user requested the same compact Matches/training-detail design language on
the training catalogue, with easier mobile plan inspection and detail access.
Existing Matches captures and the working app are the source. This supersedes
the earlier photographic training catalogue and mobile metric-card grid.

- Compact 40px desktop / 30px mobile heading, existing create action and one white
  panel replace the photo hero and separate cards. A native table aligns local
  date/time, title, duration, phase count and explicit actions.
- All five statistics remain server `summary` values for the active group,
  season and date. Desktop uses five cells; tablet uses 3/2; mobile uses one
  internally scrolling strip, with plan count and duration first. No aggregate
  is inferred from visible rows.
- Mobile stacks the same native rows. Full purpose text opens in a native
  disclosure; no clipping or nested row link. The named detail link includes
  title/date and remains separate from edit/menu controls. Actions are 44px high.
- Date input, Today and reset reuse the existing `getTrainingDayPage` reader.
  Default remains the unfiltered catalogue. Bounds are local midnight to the
  next exclusive local midnight; invalid dates report an error without silently
  fetching everything. Filtering is server-side across the selected scope.
- Both ends of the list have pagers using the existing cursor hook. Filters and
  workspace identity remount only the resource reader, clear old cursor history
  and reject stale results. The date input stays mounted while reads change.
  Server order, null-last dates, 25-record pages, retries, current-page edit
  refresh and first-page delete reload remain unchanged.
- At 320px, inherited `html/body` minimum width caused 15px overflow when the
  desktop browser reserved scrollbar space. Route-scoped `:has` rules remove that
  minimum only while this page is present; mobile action padding/gaps fit the
  remaining width. Other routes keep their existing rules.

No API, backend, schema, migration, dependency, security or new ADR decision.
ADR-0026 edit/delete gates, trigger IDs, focus return, uncertain failures and
PLAYER restrictions remain. No retained plan was created, edited or deleted by
this UI task. Separately authorized concurrent ready-drill/season work was kept.

## Files

- [Route](../../apps/frontend/src/routes/trainings.tsx),
  [scoped CSS](../../apps/frontend/src/styles/trainings-list-workspace.css),
  [route tests](../../apps/frontend/src/routes/trainings.test.tsx).
- Frontend AGENTS, UI migration plan, CHANGELOG, Project Boot/handoff, root
  design-qa and this report record the updated direction and evidence.

## Verification

- Final catalogue/detail suites: **33/33**, two files. Twelve added cases cover
  day/cursor/reset behavior, input identity, late responses, empty results,
  all-seasons/Today, full purpose/detail navigation and strict/local bounds.
- Full frontend: **491/491**, **59 files**, serial execution, 338.36 seconds.
- TypeScript, scoped ESLint/Prettier, production build and Sites packaging /
  worker **4/4** passed. Final CSS correction was included in the repeated build.
- Markdown local links and diff whitespace checks passed. Root Windows/CDSK
  tooling limits remain BL-061; this report does not claim that root gate passed.

## Actual browser evidence

Directory: `apps/frontend/qa/trainings-list-ux-2026-10-19/`.

- Source: `qa/matches-ux-2026-10-19/07-desktop-final.png`, 1457×1047 pixels.
  `comparison-style.png` combines that source with final `11-desktop-final.png`
  (1425×990) at equal 800px widths, preserving aspect ratio. Both were opened
  together. Different content and catalogue statistics are intentional; this is
  cross-page style adaptation, not an identical-content clone.
- Before: `01-before-desktop.png`. Final desktop: `11-desktop-final.png`, CSS
  1440×1000. Tablet: `09-tablet-list.png`, CSS 1024×900. Both have no horizontal
  page overflow, native table semantics and explicit scoped pagination.
- Mobile CSS 390×844: `05-mobile-overview-final.png`,
  `07-mobile-plan-final.png`, `08-mobile-detail-transition.png` and
  `14-mobile-empty-date.png`. The earlier `04-mobile-overview.png` had a tall
  2/2/1 statistics grid; the short strip brings plans closer to the filter.
- Narrow CSS 320×844: before `12-narrow-mobile.png`, after
  `13-narrow-mobile-final.png`. Final content/scroll widths both **305px**;
  normal mobile widths both **375px**. The 15px difference from the requested
  viewport is the desktop scrollbar. Narrow detail/edit targets are **89.5×44px**,
  menu **44×44px**. Normal mobile detail/edit targets are **124.5×44px**.
- Bottom pager ends at **737.2px**, above mobile navigation starting at **774px**.
  Actual lower-pager navigation reached page two (25 / 443), then returned to
  page one. Actual Today query returned the retained 19 October plan, 40 minutes
  / four phases; a far-future keyboard-selected date returned zero totals and the
  explicit day-empty message. Reset restored the complete scoped list.
- Full purpose disclosure and mobile detail link opened the correct existing
  plan. Edit/Escape and delete-dialog Cancel returned focus to the original row
  trigger. No write action was submitted. Development HMR required normal local
  sign-in recovery; authentication behavior was preserved.

No actionable P0/P1/P2 visual issue remains. Date filters remain route-local
state, following Matches. Browser checks use local Chromium, not physical-device
certification. Production rollout is outside this request; the next useful check
is a short phone usability pass.
