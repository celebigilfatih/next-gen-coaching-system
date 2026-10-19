# NGCS visual QA — BL-048 reference migration (2026-09-08)

## Training tactical integration — 2026-09-26

Actual TrainingDetailRoute/Konva with isolated synthetic workspace/session and
memory API checked at 1672×941, 1024×900 and 390×844. Explicit phase opening,
whole-scene Save, retained undo, dirty tab cancellation and conflict draft
retention verified. Header's mobile gutter was inconsistent with page padding;
scoped correction removes 6px horizontal overflow (396 → 390px). Existing board
layout preserved; physical touch/formal WCAG remain TBD.
[Report and artifacts](docs/30-quality/TACTICAL_TRAINING_INTEGRATION_2026-09-26.md).

## Drill tactical integration — 2026-09-26

Actual TacticsEditorPage/Konva checked at 1672×941, 1024×900 and 390×844,
with isolated synthetic session and memory-backed API. Global-to-club copy
preserved both scenes; a later conflict retained a three-scene draft without
changing persistence or token. Existing studio hierarchy retained. A measured
6px mobile horizontal overflow was fixed with an editor-specific margin rule;
final page width is 390px. Physical touch and formal WCAG remain TBD.
[Report and local artifacts](docs/30-quality/TACTICAL_DRILL_INTEGRATION_2026-09-26.md).

## Match tactical integration — 2026-09-26

Actual MatchDetailRoute/editor checked with a synthetic memory-backed API at
1672×941, 1024×900 and 390×844. Existing page design retained. Mobile negative
board margins were removed after observing clipped timeline labels. Scoped
metadata then lazy document requests, full-scene Save-and-leave and keyboard/
dialog semantics verified. No user session or retained records were used.
[Report](docs/30-quality/TACTICAL_MATCH_INTEGRATION_2026-09-26.md).

## Tactical playback — 2026-09-26

BL-058d uses the existing pitch-first studio with a labelled transport/range
control. Isolated real-Konva QA at 1672×941, 1024×900 and 390×844 confirms
wrapped controls, internal scene scrolling and no page-wide horizontal overflow.
Reduced-motion notice and keyboard seek checked; retained sessions/data unused.
Source position/save invariance verified after preview. Actual route integration,
physical touch-device QA and professional match-day acceptance remain separate.
[Report](docs/30-quality/TACTICAL_PLAYBACK_2026-09-26.md).

## Tactical scene editor — 2026-09-19

BL-058c opt-in editor checked with real Konva/synthetic browser-memory saves at
1672×941, 1024×900, 390×844. Scene strip scrolls internally, settings/actions
reflow, Cancel receives dialog focus and Escape restores it. Mobile page width
is 390px. Existing user sessions/data were not used. Playback and actual route
integration remain later gates. [Report](docs/30-quality/TACTICAL_SCENE_EDITOR_2026-09-19.md).

## Tactical studio follow-up — 2026-09-19

Increment 3: formation-slot selector, name replacement confirmation, Cancel
focus/focus return and undo verified with isolated synthetic data at
1672×941, 1024×900 and 390×844. Mobile width remains 390px; no retained-data
mutation or authenticated write E2E. [Report](docs/30-quality/TACTICAL_SLOT_ASSIGNMENT_2026-09-19.md).

Increment 2: actual authenticated A Team roster panel read succeeded (18 players),
without saving or deleting the user's open draft. Unit-selection/drag/one-step
undo and 1672/1024/390 layout were checked on the isolated synthetic board;
tablet nudge controls now remain in four columns. This is not a retained-data
write E2E. [Increment report](docs/30-quality/TACTICAL_ROSTER_SELECTION_2026-09-19.md).

ADR-0035 adds a pitch-first 2D editor with shirts, shared equipment artwork,
zoom/pan/fit, collapsible inspector and focus mode. Actual editor components
were inspected in an isolated synthetic-data harness at 1672×941, 1024×900
and 390×844. Tablet/mobile document widths do not overflow. This is component
visual evidence, not authenticated API persistence or the whole-route gate.
The local app restarted and requires login for integrated route verification.
[Current report](docs/30-quality/TACTICAL_STUDIO_2026-09-19.md).

## Result

Presentation and real-data behavior are implemented. Matched desktop and
responsive checks found no remaining actionable P0/P1/P2 issue. Durable evidence
is retained in the repository and the Dashboard gate passes. The earlier
missing-login/database and screenshot-export blockers are historical.

## Player 360 / notes follow-up — 2026-09-09

The prior Player 360 audit capture at `/private/tmp/ngcs-player-audit/01-player-detail.jpg`
was compared with the authenticated Chrome implementation at 1710×895. The
generic photographic hero, raw `ORTA_SAHA`, “izin filtreli görünüm”, repeated
evidence counters and unexplained `Kanıt yok`/`TBD`/`N/A` cards are replaced by a
compact initials identity, localized football facts, real activity and four clear
task tabs. The primary note action, structured Sheet, archive/restore confirmation,
URL filters, Activity and journey-only date control were exercised against a
disposable browser fixture.

The inspected desktop state has no actionable P0/P1/P2 visual finding. The chosen
Chrome surface was not resized programmatically, so this follow-up does not claim
new 1672×941, 1024×900 or 390×844 binary captures. Responsive stacking, horizontal
tab safety, full-width mobile Sheet and long-copy reflow are covered by the
1100/720px CSS boundaries and component regressions. Formal WCAG remains `TBD`.

Evidence: [Player 360 and notes verification](docs/30-quality/PLAYER_360_NOTES_VERIFICATION_2026-09-09.md).

## Team lifecycle follow-up — 2026-09-08

The Teams surface now separates the protected first team from the academy
directory without duplicating card/table content. The default `A Takım` view,
URL-persisted `Altyapı` view, real academy card, administrator-only create/edit/
archive controls, explicit history-preserving confirmation and archived-team
Sheet were inspected in the user's authenticated Chrome session. Dialogs were
opened and dismissed; no retained team mutation was submitted.

Existing NGCS photographic assets, white shadcn surfaces, Inter hierarchy,
blue-gray borders and Phosphor icons were retained. Desktop action placement,
long labels, empty/loading/error states and keyboard-labelled controls have no
open P0/P1/P2 finding. Responsive grid/stack behavior is covered by CSS breakpoints
and route/component tests; no new exact-size screenshots are claimed for this
follow-up because the chosen browser surface was not programmatically resized.
Formal WCAG conformance remains `TBD`.

Evidence: [team lifecycle verification](docs/30-quality/TEAM_LIFECYCLE_VERIFICATION_2026-09-08.md).

## Comparison evidence

### Follow-up verification — 2026-09-08

Local frontend/backend processes had stopped. Restarted frontend 3132 and backend
4000 against the retained `ngcs_local_session_dev` database, with both documented
persistent-session flags enabled and exact frontend origin. No reset, migration,
seed or application-code change. Existing coach credentials successfully opened
Dashboard again. Scope for this repeat: existing club/U17, **all seasons**.

Source and live desktop capture were compared together at 1672×941; tablet
1024×900, mobile 390×844 and the open mobile Sheet were inspected again. Native
capture after layout settled was usable; the first immediate CDP bitmap retained
the old narrow surface and was discarded, not treated as evidence. Tablet/mobile
document widths matched 1024/390. Temporary viewport overrides were cleared.
The console retains Vite fetch errors from before service restart; these are not
evidence of a new post-login regression.

The browser download path still timed out. After explicit user approval for the
local Playwright capture fallback, the existing authenticated in-app session was
used to avoid exposing credentials in command history. Browser screenshots were
written directly as binary QA artifacts. Their dimensions were checked on disk,
then the retained desktop artifact and source were opened together for the final
comparison. No data-mutating E2E suite was run.

- Source visual truth path:
  `/Users/fatih/Downloads/ChatGPT Image 7 Eyl 2026 17_40_12.png`.
- Source dimensions: 1672×941 pixels, 1×.
- Implementation: `http://localhost:3132/app/dashboard`.
- Implementation screenshot paths:
  - `apps/frontend/qa/dashboard-reference-2026-09-08/implementation-1672x941.png`
  - `apps/frontend/qa/dashboard-reference-2026-09-08/implementation-1024x900.png`
  - `apps/frontend/qa/dashboard-reference-2026-09-08/implementation-390x844.png`
  - `apps/frontend/qa/dashboard-reference-2026-09-08/implementation-390x844-sheet.png`
- CSS viewports: desktop 1672×941, tablet 1024×900, mobile 390×844.
- Density: IAB DPR 2. Ordinary wide capture mixed surface sizes. Raw CDP capture
  followed by scaling the captured bitmap on a detached canvas to CSS dimensions
  produced the readable comparison. App content was not rewritten for capture.
- State: authenticated coach, selected U17/test season; 2 players, 2 plans,
  108 minutes, 5 accessible drills, 0 present attendance, 1 scoped match.
  Local 8 September 2026 daily program is genuinely empty.
- Full-view evidence: source and normalized desktop screenshot were emitted
  together in the same comparison input. Source plus implementation were opened,
  not accepted from paths or code alone.
- Focus evidence: separate native open-Sheet and lower-page keyboard-focus
  captures inspected. Full desktop images were readable for hero, metric,
  card and branding inspection; no separate source mobile mock exists.
- Measured desktop sidebar/topbar: 185/78px. Document width equals viewport for
  all three sizes. Tablet columns: 3 metrics/2 panels; mobile: 2 metrics/1 panel.

## Findings and comparison history

| Finding                                               | Fix                                                                             | Post-fix evidence                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------- |
| P1 — Four metrics/two panels and boxed condensed hero | Six metrics, three main columns, unframed Inter/photo welcome                   | Matched desktop capture                                 |
| P2 — Oversized/right-shifted coach crop               | Regenerated smaller subject near 70% width, adjusted crop and photographic fade | Head/shoulders visible in desktop/tablet                |
| P2 — Small/narrow metric and section typography       | 12px metric copy, 16px Inter section titles, 13px navigation                    | Desktop/tablet readability checked                      |
| P2 — Narrow tablet scope controls                     | 140px selectors and compact avatar-only user control                            | Tablet capture and selected/all-season round trip       |
| P1 — Navy Sheet behind dark navigation text           | White Sheet, navy title/close control                                           | Native 390px open-Sheet capture; all 11 routes readable |
| Evidence gate — No saved screenshot files             | Four exact-size binary captures retained after explicit local-capture approval  | Closed; source and desktop artifact reopened together   |

## Required fidelity surfaces

- **Fonts/typography:** Inter welcome, section and body hierarchy; Barlow retained
  for decorative banner. Long training titles wrap without colliding with badges.
- **Spacing/layout:** 185/78px desktop shell, 42px content inset, six compact
  metrics, three columns, roughly 10px corners and 12–14px panel gaps. Empty
  panels keep minimum height. Reduced record density is approved real-data use,
  not missing fabricated rows.
- **Colors:** white/pale blue surfaces, navy text, restrained blue/slate planning
  progress. No health/medical availability semantics. Mobile Sheet matches shell.
- **Images/icons:** generated raster coach and football banner, existing Phosphor
  shield/icons, no fake club crests or baked-in lettering. Banner top-aligned to
  preserve player's face. Gradient only fades a real photo edge, not CSS art.
- **Copy/content:** actual API totals, daily program, latest/recent plans,
  scoped matches, scheduled/undated distribution and four working quick links.
  Unsupported health, scouting, todo, video and performance claims remain absent.

## Behavior and verification

- Real coach login landed on Dashboard. Root/app-index and authenticated
  in-memory login redirects also covered by route tests.
- Control+K search focus, Sheet open/close, all 11 routes, five mobile tasks,
  lower-page visible focus, and season selection round trip inspected.
- Browser console error query returned no captured errors.
- Tests cover six real counters, PLAYER no-member-read, errors/loading/empty,
  independent retries, stale scopes, month/year/local-day boundaries, hour-based
  greeting, daily cursor history, detail links and plan distribution.
- Populated daily and failure states were tested with component fixtures, not
  by seeding the retained database. Today-empty state was verified live.
- Root `npm run quality` passed: 657 backend, 255 frontend and 4 Sites tests;
  typecheck, lint, format, both builds, CDSK, Markdown and whitespace gates.
  Preview startup required sandbox loopback permission. Old season-label tests
  were updated for the approved topbar-only scope and club footer.
- No API/Prisma, business-data, seed/reset/migration, commit/push or deployment
  changes. Routine login/session maintenance is the only runtime write.

## Follow-up polish

1. P3: optional raster compression and fine optical spacing. Formal WCAG remains
   TBD; these checks do not constitute a conformance audit.

Dashboard result: passed

## Teams reference slice

### Result

The Teams page now follows the approved white-shell reference with a wide
photographic training-ground hero, a real-data team card catalogue and a compact
accessible native table. The matched desktop and responsive review found no
remaining actionable P0/P1/P2 issue. This slice passes and the next approved
visual slice is Matches.

### Comparison evidence

- Source visual truth:
  `/Users/fatih/Downloads/ChatGPT Image 7 Eyl 2026 17_39_50.png` at 1536×1024.
- Implementation: `http://localhost:3132/app/teams`.
- Retained implementation screenshots:
  - `apps/frontend/qa/teams-reference-2026-09-08/implementation-1536x1024.png`
  - `apps/frontend/qa/teams-reference-2026-09-08/implementation-1024x900.png`
  - `apps/frontend/qa/teams-reference-2026-09-08/implementation-390x844.png`
- The source and 1536×1024 implementation were opened together in one review
  input. Tablet and mobile captures were inspected in the same review pass.
- State: authenticated coach, one real visible team, all seasons, selected work
  team. The catalogue and table both show the API-backed name, category, age
  group and linked season; no placeholder team rows were introduced.
- Exact dimensions were verified on disk. Temporary viewport overrides were
  reset and the authenticated browser was left on Teams.

### Required fidelity surfaces

- **Layout:** compact white shell, pale-blue active navigation, wide hero,
  image-card catalogue and bordered list table reproduce the reference hierarchy.
- **Typography and color:** Inter hierarchy, navy text, blue accents, thin
  blue-gray borders and restrained shadow density match the approved system.
- **Images and icons:** four generated raster photographs provide the hero and
  professional/academy/women category variants. They contain no text, brand or
  real club crest. NGCS marks and actions use existing Phosphor icons.
- **Real content boundary:** player/staff counts, league form, comparison,
  aggregate distribution, video banner and create-team action remain absent
  because the active API does not prove them. One card rather than the reference's
  six is the correct retained database state, not a missing fabricated row.
- **Responsive behavior:** desktop keeps the full rail and scope bar; tablet
  uses the icon rail and three-column-capable catalogue; mobile keeps readable
  hero/card content, stacked scope selectors and the five-task bottom navigation.

### Behavior and verification

- Remote search debounce, stale-response rejection, cursor paging, team
  selection and detail links were preserved. Live search was checked with a
  matching query, a no-result query and a cleared query returning the real team.
- The native table retains column semantics and horizontal overflow behavior.
  Loading, error, empty and retry paths remain covered by component tests.
- Browser error-log query for `/app/teams` returned no errors.
- Targeted Teams tests passed (8); frontend typecheck and lint passed before the
  retained captures. Root quality passed with 657 backend, 256 frontend and 4
  Sites tests plus both builds, CDSK, Markdown and whitespace gates.
- No REST, Prisma, permission, business-data, migration, seed/reset, commit,
  push or deployment change was made.

### Follow-up polish

1. P3: optionally compress the generated PNG photographs after visual approval.
   Formal WCAG conformance remains TBD and was not claimed by this review.

Teams result: passed

## Matches reference slice

### Result

The Matches page now follows the approved white-shell reference with the shared
photographic coach hero, a compact date filter and date-grouped match rows. The
matched desktop and responsive review found no remaining actionable P0/P1/P2
issue. The three supplied reference pages are now complete; the next approved
page-by-page slice is Week.

### Comparison evidence

- Source visual truth:
  `/Users/fatih/Downloads/ChatGPT Image 7 Eyl 2026 17_39_33.png` at 1672×941.
- Implementation: `http://localhost:3132/app/matches`.
- Retained implementation screenshots:
  - `apps/frontend/qa/matches-reference-2026-09-08/implementation-1672x941.png`
  - `apps/frontend/qa/matches-reference-2026-09-08/implementation-1024x900.png`
  - `apps/frontend/qa/matches-reference-2026-09-08/implementation-390x844.png`
- The source and implementation were opened together in one comparison input at
  1672×941. Tablet and mobile captures were inspected in the same review pass.
- State: authenticated coach, selected U17 team, all seasons and one real scoped
  match. The list shows the API-backed opponent, local date/time, competition,
  location, formation, board state, notes and detail link.
- Pixel dimensions were verified on disk at DPR 1. Temporary CDP viewport
  overrides were cleared and the authenticated browser remained on Matches.

### Required fidelity surfaces

- **Layout:** compact white shell, full-width hero, left filter and bordered
  date-grouped list reproduce the approved hierarchy without inventing the
  reference's unsupported statistics or action panels.
- **Typography and color:** Inter hierarchy, navy text, pale-blue active state,
  small tabular times, thin blue-gray borders and restrained status colors match
  the reference system.
- **Image and icons:** the already approved raster coach photograph is reused
  because the Dashboard and Matches references share this art direction.
  Phosphor icons replace unavailable club crests; no fake logo or custom SVG was
  introduced. The fade is an edge treatment over a real photo, not substitute art.
- **Copy and content:** only verified catalogue fields are shown. The reference's
  match-type tabs, aggregates, team filter, match center and create action stay
  absent because the active API does not prove those contracts. One row rather
  than several mock fixtures reflects the retained database, not missing content.
- **Responsive behavior:** desktop uses a filter/list split, tablet preserves the
  same hierarchy with an icon rail, and mobile stacks the filter and list while
  retaining the five-task bottom navigation and readable controls.

### Behavior and verification

- Cursor history, independent retry, stale scope rejection, all-season handling,
  detail links and full server totals remain intact.
- The date control uses local half-open midnight boundaries and the existing
  bounded daily endpoint. Live browser checks covered a zero-result filtered day
  and clearing back to the full one-match catalogue.
- Loading, workspace error, continuation-empty, first-page empty and invalid
  season context remain covered by tests. Browser error logs were empty.
- Targeted Matches tests passed (6). Root quality passed with 657 backend, 257
  frontend and 4 Sites tests plus typecheck, lint, format, both builds, CDSK,
  Markdown and whitespace gates.
- No new asset was generated for this slice, and no REST, Prisma, permission,
  business-data, migration, seed/reset, commit, push or deployment change occurred.

### Follow-up polish

1. P3: the mobile date-filter card can be made optically denser in a later shared
   page pass. Formal WCAG conformance remains TBD and was not claimed here.

Matches result: passed

## Week reference-system slice

### Result

The Week page now uses the approved white visual system with a photographic
training-ground hero, compact week controls and a responsive seven-day planning
board. Dashboard and Matches were used as the visual-system sources because the
user did not supply a dedicated Week mock. The existing Week state and real API
data were used as the product-state source. No actionable P0/P1/P2 issue remains.

### Comparison evidence

- Visual-system source truths:
  - `/Users/fatih/Downloads/ChatGPT Image 7 Eyl 2026 17_40_12.png` at
    1672×941 for shell, hero, typography and card density.
  - `/Users/fatih/Downloads/ChatGPT Image 7 Eyl 2026 17_39_33.png` at
    1672×941 for calendar/list hierarchy and compact controls.
- Implementation: `http://localhost:3132/app/week?start=2026-09-07`.
- Retained implementation screenshots:
  - `apps/frontend/qa/week-reference-2026-09-08/week-desktop-1672x941.png`
  - `apps/frontend/qa/week-reference-2026-09-08/week-tablet-1024x900.png`
  - `apps/frontend/qa/week-reference-2026-09-08/week-mobile-390x844.png`
- Both visual sources and all three implementation captures were opened in the
  same comparison input. This was a system-level comparison, not a claim of
  pixel identity to a nonexistent Week mock.
- State: authenticated coach, selected U17 team, all seasons; two real plans on
  7 September and genuine empty states on the remaining visible days.
- Source and implementation desktop images are 1672×941 at 1×. Responsive
  implementation images are 1024×900 and 390×844 at 1×. Exact dimensions were
  checked on disk and the mobile capture used a 390 CSS-pixel desktop-mode CDP
  viewport so media queries, rather than browser page scaling, were measured.
- Focused evidence was not needed: the full-size comparison makes the shell,
  hero, controls, all seven day headers and event cards readable. Separate
  tablet/mobile captures were inspected for responsive structure and overflow.

### Required fidelity surfaces

- **Fonts and typography:** Inter provides the 42px desktop title, compact day
  labels, tabular dates and readable event hierarchy. Long event names truncate
  within their card instead of forcing a wider column.
- **Spacing and layout:** the full-width 188px hero, 74px control surface and
  nine-pixel seven-column gaps follow the approved dense operational rhythm.
  The board moves to four, two and one column without horizontal page overflow.
- **Colors and tokens:** white/pale-blue surfaces, navy type, restrained blue
  selection and amber match surfaces use the established NGCS reference tokens.
- **Image quality and icons:** the approved generated training-ground raster is
  reused with a measured crop. Calendar, training, clock and football affordances
  use Phosphor; no custom SVG, placeholder logo or CSS-drawn asset was added.
- **Copy and content:** group, season, dates, plan totals, durations, match data
  and empty states come from the existing contracts. Unsupported medical,
  performance, scouting or aggregate claims remain absent.
- **Interaction and accessibility:** previous/today/next/date controls retain
  accessible names; day reads, plan links, match links, errors, retries and both
  cursor histories remain keyboard-addressable. Formal WCAG remains TBD.

### Behavior and verification

- Live next-week navigation changed the date control and URL to 2026-09-14;
  previous restored 2026-09-07 while retaining the selected workspace scope.
- Runtime error capture during the live week transition returned an empty list;
  the document title remained `Hafta | NGCS`.
- Targeted Week tests passed (11), including the reference surface, seven local
  half-open daily reads, independent plan/match pagination and retries, stale
  response rejection, missing-season fail-closed behavior, DST and year changes.
- Root `npm run quality` passed with 657 backend, 258 frontend and 4 Sites tests,
  plus typecheck, lint, format, both builds, CDSK, Markdown and whitespace gates.
- No REST, Prisma, authorization, business-data, migration, seed/reset, commit,
  push or deployment change occurred.

### Comparison history and findings

| Finding                                                                                 | Fix                                                                                 | Post-fix evidence                                                                                                          |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| P1 — Legacy generic header and oversized empty calendar chrome                          | Added photographic PageHero, compact range controls and reference-aligned day cards | 1672×941 comparison shows the approved hierarchy and all seven days above the fold                                         |
| P2 — Mobile capture initially used browser mobile scaling and clipped the wide document | Re-captured with a true 390 CSS-pixel layout viewport                               | 390×844 evidence shows stacked scope, hero, controls, day card and bottom task navigation without horizontal page overflow |
| P2 — Abbreviated day labels and 129px headers consumed event space                      | Full Turkish weekday labels and compact 82px split headers                          | Desktop/tablet evidence keeps dates prominent and event rows readable                                                      |

### Follow-up polish

1. P3: optional raster compression can be evaluated with the other approved
   page assets after the page-by-page migration closes.

Week result: passed

## Trainings and training-detail reference-system slice

### Result

The Trainings catalogue and training-detail editor now use the approved white
visual system. Dashboard and Matches are the visual-system sources because no
dedicated training mock was supplied; this is a system-level match, not a claim
of pixel identity to a nonexistent training reference. No actionable P0/P1/P2
issue remains.

### Comparison evidence

- Visual-system source truths:
  - `/Users/fatih/Downloads/ChatGPT Image 7 Eyl 2026 17_40_12.png` at
    1672×941 for shell, photographic hero, metrics, typography and card density.
  - `/Users/fatih/Downloads/ChatGPT Image 7 Eyl 2026 17_39_33.png` at
    1672×941 for compact operational controls, grouped content and list rhythm.
- Implementations:
  - `http://localhost:3132/app/trainings`
  - `http://localhost:3132/app/trainings/cmtotozut0005r1puwqggqc2r`
- Retained implementation screenshots:
  - `apps/frontend/qa/trainings-reference-2026-09-08/trainings-1672x941.png`
  - `apps/frontend/qa/trainings-reference-2026-09-08/trainings-1024x900.png`
  - `apps/frontend/qa/trainings-reference-2026-09-08/trainings-390x844.png`
  - `apps/frontend/qa/trainings-reference-2026-09-08/training-detail-1672x941.png`
  - `apps/frontend/qa/trainings-reference-2026-09-08/training-detail-1024x900.png`
  - `apps/frontend/qa/trainings-reference-2026-09-08/training-detail-390x844.png`
- Both source images and the implementation captures were opened together in
  the same comparison input. The desktop views made hero, metrics, catalogue,
  summary, tabs and phase cards legible; tablet/mobile were inspected for
  responsive structure and overflow.
- Exact dimensions were verified on disk at DPR 1. State was an authenticated
  coach with the selected E2E U17 team, all seasons, two real plans, 108 planned
  minutes, six real phases and zero attendance records.

### Required fidelity surfaces

- **Layout and typography:** photographic PageHero, Inter hierarchy, five real
  catalogue metrics, bordered plan catalogue, compact three-item detail summary,
  tabs and phase cards follow the approved dense operational system.
- **Colors and tokens:** white/pale-blue surfaces, navy text, restrained blue,
  teal, amber and violet metric accents, thin borders and light shadows reuse the
  approved semantic tokens without introducing medical meanings.
- **Images and icons:** existing approved raster photographs and Phosphor icons
  are reused. No fake crest, text baked into imagery, custom SVG or CSS-drawn
  asset was introduced.
- **Content boundary:** totals, dates, durations, phase counts, notes, drill
  options and attendance come from existing API contracts. Unsupported health,
  scouting, performance and aggregate claims remain absent.
- **Responsive behavior:** metrics move from five to three and two columns;
  catalogue cards move from two to one; detail summary and editor controls stack
  without horizontal page overflow at 1024×900 and 390×844.

### Behavior and verification

- The new-plan dialog opened with labelled fields, retained its date/title gate,
  dismissed with Escape and returned focus to its trigger. No plan was submitted.
- Training detail loaded lightweight metadata; Akış, Taktik snapshot and Katılım
  tabs worked. Opening an invalid retained phase board failed closed without a
  write; attendance loaded two real players. Runtime error capture remained empty
  across tab changes.
- Cursor history, stale-response rejection, retries, on-demand board reads,
  dirty save/discard/cancel, uncertain-save reconciliation and role checks remain
  covered. Targeted tests pass: 36 across the catalogue/detail/board suites.
- Root `npm run quality` passes with 657 backend, 260 frontend and 4 Sites tests,
  plus typecheck, lint, format, both builds, CDSK, Markdown and whitespace gates.
- No REST, Prisma, authorization, business-data, migration, seed/reset, commit,
  push or deployment change occurred.

### Comparison history and findings

| Finding                                                  | Fix                                                                    | Post-fix evidence                                 |
| -------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| P1 — Generic header and raw two-card training list       | Added photo hero, five verified metrics and bordered catalogue         | Desktop comparison preserves dense page hierarchy |
| P2 — Detail lacked hierarchy between metadata and editor | Added photo hero, compact real summary and scoped editor panels        | Detail desktop/tablet captures                    |
| P2 — Legacy cards and controls crowded narrow screens    | Added 3/2 metric, 2/1 catalogue and stacked detail responsive behavior | 1024×900 and 390×844 captures                     |

### Follow-up polish

1. P3: raster compression may be considered after the full page migration.
   Formal WCAG conformance remains TBD and was not claimed.

Trainings result: passed

## Library, Tactical Board and editor reference-system slice

### Result

The Drill Library, Tactical Board catalogue and new-board editor now use the
approved white visual system. Dashboard and Matches are the system sources
because no dedicated Library or Tactical Board mock was supplied; this is a
system-level match, not a pixel-identity claim. No actionable P0/P1/P2 remains.

### Comparison evidence

- Visual-system source truths:
  - `/Users/fatih/Downloads/ChatGPT Image 7 Eyl 2026 17_40_12.png` at 1672×941.
  - `/Users/fatih/Downloads/ChatGPT Image 7 Eyl 2026 17_39_33.png` at 1672×941.
- Implementations:
  - `http://localhost:3132/app/library`
  - `http://localhost:3132/app/tactics`
  - `http://localhost:3132/app/tactics/new`
- Retained exact-size implementation evidence:
  - `apps/frontend/qa/library-tactics-reference-2026-09-08/library-1672x941.png`
  - `apps/frontend/qa/library-tactics-reference-2026-09-08/library-1024x900.png`
  - `apps/frontend/qa/library-tactics-reference-2026-09-08/library-390x844.png`
  - `apps/frontend/qa/library-tactics-reference-2026-09-08/tactics-1672x941.png`
  - `apps/frontend/qa/library-tactics-reference-2026-09-08/tactics-1024x900.png`
  - `apps/frontend/qa/library-tactics-reference-2026-09-08/tactics-390x844.png`
  - `apps/frontend/qa/library-tactics-reference-2026-09-08/tactics-editor-1672x941.png`
  - `apps/frontend/qa/library-tactics-reference-2026-09-08/tactics-editor-1024x900.png`
  - `apps/frontend/qa/library-tactics-reference-2026-09-08/tactics-editor-390x844.png`
- Both source images and all implementation captures were opened together in
  the same comparison input. Exact dimensions were verified on disk. The state
  was an authenticated coach with E2E U17 selected, five real library exercises
  and a real empty tactical catalogue.

### Required fidelity surfaces

- **Layout and typography:** photographic heroes, Inter hierarchy, thin bordered
  catalogue/metric surfaces and dense controls follow the approved system.
- **Content boundary:** counts, categories, scope and board capabilities come
  from existing contracts and implemented editor behavior. No unsupported
  aggregate, health, scouting or performance content was introduced.
- **Responsive behavior:** catalogue cards move 3/2/1; tactical content moves
  main+aside to one column; editor fields stack and the board keeps its own
  bounded working surface. No horizontal page overflow is visible at 1024 or 390.

### Behavior and verification

- Library Taktik filtering returned one real record and Tümü restored five.
- Adding an in-memory player set the editor dirty; navigation showed the guard,
  Cancel retained the draft and Discard returned without a server save.
- Import/export, undo/redo, formations, dirty navigation and authorization remain
  covered by the targeted editor suites. Browser runtime error capture was empty.
- Targeted tests pass: 21 across Library, Tactics, route editor and board editor.
- Root `npm run quality` passes with 657 backend, 263 frontend and 4 Sites tests.
- No REST, Prisma, authorization, business-data, migration, seed/reset, commit,
  push or deployment change occurred.

### Comparison history and findings

| Finding                                                        | Fix                                                                     | Post-fix evidence                                 |
| -------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------- |
| P1 — Generic headers and low catalogue hierarchy               | Added photo heroes, verified metrics and bordered catalogue composition | Desktop comparison preserves the approved density |
| P2 — Tactical empty state hid available editor capability      | Added a capability panel derived only from implemented tools            | Desktop/tablet comparisons and working CTA        |
| P2 — Editor metadata and canvas lacked a shared page hierarchy | Added a compact photo hero, metadata surface and board chrome           | 1672/1024/390 editor captures                     |

### Follow-up polish

1. P3: raster compression may be evaluated after the full page migration.
   Formal WCAG conformance remains TBD and was not claimed.

Library/Tactical Board/editor result: passed

## Match detail reference-system slice

### Result

Match detail now uses the approved white visual system. Dashboard and Matches
are the system sources because no dedicated Match detail mock was supplied; this
is a system-level match, not a pixel-identity claim. No actionable P0/P1/P2
remains.

### Comparison evidence

- Visual-system source truths:
  - `/Users/fatih/Downloads/ChatGPT Image 7 Eyl 2026 17_40_12.png` at 1672×941.
  - `/Users/fatih/Downloads/ChatGPT Image 7 Eyl 2026 17_39_33.png` at 1672×941.
- Implementation:
  `http://localhost:3132/app/matches/cmtod02i5000tr1izgf6v7l7u`.
- Retained exact-size implementation evidence:
  - `apps/frontend/qa/match-detail-reference-2026-09-08/match-detail-analysis-1672x941.png`
  - `apps/frontend/qa/match-detail-reference-2026-09-08/match-detail-analysis-1024x900.png`
  - `apps/frontend/qa/match-detail-reference-2026-09-08/match-detail-analysis-390x844.png`
  - `apps/frontend/qa/match-detail-reference-2026-09-08/match-detail-board-1672x941.png`
  - `apps/frontend/qa/match-detail-reference-2026-09-08/match-detail-board-1024x900.png`
  - `apps/frontend/qa/match-detail-reference-2026-09-08/match-detail-board-390x844.png`
- Both source images and implementation captures were opened together in the
  same comparison input. Exact dimensions were verified on disk. The state was
  an authenticated coach with E2E U17 selected and one real match containing
  analysis, 4-3-3/4-4-2 formations, focus and coach notes; its board was empty.

### Required fidelity surfaces

- **Layout and typography:** photographic PageHero, Inter hierarchy, five real
  match facts, thin bordered surfaces, compact tabs and analysis/facts columns
  follow the approved dense operational system.
- **Content boundary:** opponent, local date/time, location, competition,
  formations, board state and notes come from the existing authorized match
  record. No unsupported health, scouting, video, performance or aggregate
  claim was introduced.
- **Responsive behavior:** metrics move from five to three and two columns;
  analysis/facts become one column; the shared board keeps its bounded working
  surface. At 390px the document width equals the viewport.

### Behavior and verification

- Live browser switching between Analysis and Tactical board passed; no analysis
  or board save was triggered and runtime logs contained no application error.
- Independent match read, explicit analysis save, board persistence,
  import/export, undo/redo, dirty navigation and authorization remain covered.
  Targeted tests pass: 15 across Match reads and the shared board editor.
- Root `npm run quality` passes with 657 backend, 264 frontend and 4 Sites tests,
  plus typecheck, lint, format, both builds, CDSK, Markdown and whitespace gates.
- No REST, Prisma, authorization, business-data, migration, seed/reset, commit,
  push or deployment change occurred.

### Comparison history and findings

| Finding                                                              | Fix                                                               | Post-fix evidence                            |
| -------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| P1 — Generic header and a single undifferentiated form card          | Added photo hero, verified facts and a structured match workspace | 1672×941 analysis comparison                 |
| P2 — Match facts and board readiness were hidden in form fields/tabs | Added five record-backed summary cards and a facts panel          | Desktop/tablet captures                      |
| P2 — Mobile full-bleed hero exceeded the viewport by 6px             | Scoped the mobile page gutter to the actual 16px shell inset      | 390×844 captures report 390px document width |

### Follow-up polish

1. P3: shared raster compression may be evaluated after the page migration.
   Formal WCAG conformance remains TBD and was not claimed.

## Player operations reference-system slice

### Result

Players, Player 360, Squad and Attendance now use the approved white visual
system. The supplied Teams reference is the primary source for the player/team
directory language; Dashboard supplies the metric and photographic hero system.
Because no dedicated player mock was supplied, this is a system-level match, not
a pixel-identity claim. No actionable P0/P1/P2 remains.

### Comparison evidence

- Visual-system source truth:
  `/Users/fatih/Downloads/ChatGPT Image 7 Eyl 2026 17_39_50.png` at 1536×1024.
- Implementations:
  - `http://localhost:3132/app/players`
  - `http://localhost:3132/app/players/cmtod02hl0007r1izmsvd7u32`
  - `http://localhost:3132/app/squad`
  - `http://localhost:3132/app/attendance`
- Retained exact-size implementation evidence consists of all four route names
  at `1536x1024`, `1024x900` and `390x844` under
  `apps/frontend/qa/player-operations-reference-2026-09-08/`.
- The source and all implementation captures were opened together in the same
  comparison input. The state was an authenticated coach with E2E U17 selected,
  two real players, two real attendance plans and one visible assignment.

### Required fidelity surfaces

- **Layout and typography:** photographic heroes, Inter hierarchy, thin bordered
  metric/directory surfaces and compact card/list rhythm follow the approved
  team-management reference.
- **Content boundary:** player, assignment, group and attendance values come from
  the existing authorized contracts. Missing position, birth date and evidence
  remain `TBD`/explicitly unavailable; no health or readiness score is invented.
- **Responsive behavior:** metric and player surfaces move through 4/3/2/1-column
  arrangements as appropriate. All four routes report a 390px document width in
  the 390px viewport after the shared hero gutter correction.

### Behavior and verification

- Browser QA opened all four routes and the real Player 360 record without
  submitting an assignment or changing attendance.
- Player search, cursor paging/retry/stale-response handling, full squad and
  attendance totals, dated assignment history, role visibility and uncertain
  attendance writes remain covered. Targeted tests pass: 43 across six suites.
- Root `npm run quality` passes with 657 backend, 264 frontend and 4 Sites tests,
  plus typecheck, lint, format, both builds, CDSK, Markdown and whitespace gates.
- No REST, Prisma, authorization, business-data, migration, seed/reset, commit,
  push or deployment change occurred.

### Comparison history and findings

| Finding                                                                               | Fix                                                                               | Post-fix evidence                                    |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------- |
| P1 — Player-operation pages used generic headers and low-density cards                | Added shared photographic heroes, verified metrics and compact directory surfaces | Four 1536×1024 captures                              |
| P2 — Player facts, assignment evidence and attendance scope lacked a common hierarchy | Added route-specific metric/fact composition without changing contracts           | Desktop/tablet captures                              |
| P2 — Full-bleed hero exceeded the 390px viewport by 6px                               | Bound the mobile hero to the actual 16px page inset                               | All four mobile captures report 390px document width |

### Follow-up polish

1. P3: shared raster compression may be evaluated after the page migration.
   Formal WCAG conformance remains TBD and was not claimed.

## Settings reference-system slice

### Result

Settings now uses the approved white visual system. Dashboard is the primary
source for the photographic hero, compact metric strip, Inter hierarchy and thin
blue-gray card language. Because no dedicated Settings mock was supplied, this
is a system-level match, not a pixel-identity claim. No actionable P0/P1/P2
remains.

### Comparison evidence

- Visual-system source truth:
  `/Users/fatih/Downloads/ChatGPT Image 7 Eyl 2026 17_40_12.png` at 1672×941.
- Implementation: `http://localhost:3132/app/settings`.
- Retained exact-size evidence:
  - `apps/frontend/qa/settings-reference-2026-09-08/settings-1672x941.png`
  - `apps/frontend/qa/settings-reference-2026-09-08/settings-1024x900.png`
  - `apps/frontend/qa/settings-reference-2026-09-08/settings-390x844.png`
- The source and implementation captures were opened together in the same
  comparison input. The state was an authenticated coach with E2E U17 selected
  and a persistent local session.

### Required fidelity surfaces

- **Layout and typography:** full-width photographic hero, Inter hierarchy,
  four compact metric cards and a dense two-plus-one detail composition follow
  the approved operational system.
- **Content boundary:** user role, session type, team, age group and season are
  existing session/workspace values. No unsupported preferences, notifications,
  password controls or invented capabilities were introduced.
- **Responsive behavior:** metrics move from four to two columns, detail cards
  collapse safely and session actions stack on mobile. The 390px document width
  equals the viewport.

### Behavior and verification

- Settings tests preserve profile/context content, both session descriptions,
  awaited logout navigation and logout failure handling. Season label tests
  cover selected, all, missing and restored scope transitions.
- Root `npm run quality` passes with 657 backend, 264 frontend and 4 Sites tests,
  plus typecheck, lint, format, both builds, CDSK, Markdown and whitespace gates.
- No REST, Prisma, authorization, business-data, migration, seed/reset, commit,
  push or deployment change occurred.

### Comparison history and findings

| Finding                                                                | Fix                                                               | Post-fix evidence                    |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------ |
| P1 — Settings remained a narrow generic page outside the visual system | Added shared hero, truthful metrics and structured detail cards   | 1672×941 comparison                  |
| P2 — Account, scope and session status lacked a scannable hierarchy    | Split existing values into compact profile/context/security areas | Desktop/tablet captures              |
| P2 — Full-bleed hero exceeded the 390px viewport by 6px                | Bound the mobile hero to the actual 16px page inset               | 390×844 reports 390px document width |

### Follow-up polish

1. P3: shared raster compression may be evaluated after the page migration.
   Formal WCAG conformance remains TBD and was not claimed.

## Training-plan lifecycle and catalogue repair

### Result

The user-reported catalogue defects are resolved. The before/after comparison
shows the approved five-card responsive metric layout, equal-width auto-fit plan
cards, wrapped copy/actions, explicit Detail/Edit/menu controls and removal of
the unsupported board-status label. No actionable P0/P1/P2 remains.

### Comparison evidence

- Reported pre-fix source:
  `/var/folders/5f/zj4hfd_n7fsc6613mxlg9l9c0000gn/T/TemporaryItems/NSIRD_screencaptureui_TfuTi9/Ekran Resmi 2026-09-08 16.28.36.png`.
- Current implementation captures:
  - `apps/frontend/qa/training-lifecycle-2026-09-08/catalog-1710x893.png`
  - `apps/frontend/qa/training-lifecycle-2026-09-08/catalog-1024x900.png`
  - `apps/frontend/qa/training-lifecycle-2026-09-08/catalog-390x844.png`
  - `apps/frontend/qa/training-lifecycle-2026-09-08/edit-dialog-1600x900.jpg`
  - `apps/frontend/qa/training-lifecycle-2026-09-08/delete-dialog-1600x900.jpg`
- Combined comparison input:
  `apps/frontend/qa/training-lifecycle-2026-09-08/before-after-1710x893.jpg`;
  both source and current implementation were opened together for the final
  visual judgment. The 1710×893 CSS viewport matches the user's 3420×1786
  HiDPI-reported screen.
- Previously retained exact 1672×941 catalogue/detail captures remain under
  `apps/frontend/qa/trainings-reference-2026-09-08/`. The latest corrective
  captures cover 1024×900 and 390×844 again; temporary viewport overrides were
  cleared and no retained business data was written.

### Behavior and verification

- Edit is limited to title, local date/time and purpose; duration stays derived
  from phases and team/scope values are not submitted.
- Permanent delete requires an explicit named confirmation, defaults focus to
  cancel, blocks repeat submission and never removes a failed record optimistically.
- Active/disabled cursor semantics, focus return, escape/cancel/close draft
  behavior, PLAYER-hidden mutations and responsive wrapping are covered by the
  frontend suites.
- Live read-only interaction confirmed the edit Dialog is prefilled with only
  title/date/purpose. The destructive Dialog names all related records and opens
  with focus on `Vazgeç`; it was closed without confirming deletion.
- A disposable PostgreSQL 16 lifecycle E2E verified create, phase/attendance,
  calendar-projection edit, authorization denial, atomic delete and zero related
  rows. The container was removed; retained local records were not deleted.
- Root quality passes with 663 backend, 268 frontend and 4 Sites tests plus both
  builds, typecheck, lint, format, CDSK, Markdown and whitespace checks.

Training-plan lifecycle result: passed

final result: passed
