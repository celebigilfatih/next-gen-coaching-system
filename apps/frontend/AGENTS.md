# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## NGCS visual target

- Exercise detail extension approved on 2026-10-19: compact text heading,
  four-cell semantic summary and one Uygulama/Saha/Kaynak panel. Full numbered
  instructions and equipment precede the coaching column (stack below1100px).
  Keep all age rules, source/license/attribution and safety text. Mount the existing
  readonly board only on Saha; the content API still includes the source board.
  Mobile uses44px actions/tabs, two primary actions together and a compact four-
  fact strip. Put full summary disclosure in Uygulama and keep the duplicate panel
  heading accessible but visually hidden on mobile. Preserve exact-age/PLAYER/
  publication/explicit-picker guards, scope reset and return focus to the add
  trigger. Do not restore the photograph, separate cards or always-mounted pitch.

- Library extension approved on 2026-10-19: carry the compact Matches/training
  register language into the exercise catalogue. Keep one always-visible search,
  horizontal source/phase controls, one advanced-filter Sheet with a scrolling
  body and fixed close/result actions, native full-summary disclosures and
  separate preview/detail actions. Both pagers share the existing cursor reader.
  Preview only the explicitly chosen exercise using the response's resolved age;
  Uygulama/Saha tabs mount the readonly board only on Saha selection. Keep focus
  return, honest legacy fallback, publication and explicit plan-attachment guards.
  Mobile uses44px actions/16px fields and hides the duplicate panel introduction.
  Do not restore the photograph, metric cards or full-row nested links.

- Training catalogue extension approved on 2026-10-19: use the compact Matches
  heading, one white native register and separate detail/edit/menu actions.
  Dates/times, purpose, duration and phase count remain API values; full purpose
  opens in a native disclosure. Mobile stacks the same rows with 44px actions,
  16px date input and a short internally scrolling five-statistic strip led by
  count/duration. Desktop/tablet statistics remain 5 and 3/2. Reuse the existing
  full-day server reader for date/Today/reset; use local midnight boundaries,
  reject invalid dates, reset cursors and ignore stale results. Keep the date
  input outside the keyed reader. Both pagers own no request state. Preserve
  role/lifecycle guards and IDs. The root minimum-width override is scoped to
  this route only. Do not restore the photograph, auto-fit cards or mobile 2/2/1
  metrics grid on this catalogue.

- Training detail extension approved on 2026-10-19: match the compact Matches
  language with a text heading, semantic saved summary and one tab panel.
  Ordered phase buttons expose selection; keep full notes/frozen application
  beside the flow (stack below 900px), and the add picker in a disclosure that
  starts open for an empty plan. Mobile uses 44px tabs/phase navigation and 16px
  selects. Board-tab entry and previous/next are selection only; read the chosen
  board only on explicit open. Retain draft guards, first-save history, snapshot
  identity, frozen content and PLAYER read-only behavior. Keep the embedded
  board within panel gutters and use existing focus mode for the larger pitch.

- Tactical workspace extension approved on 2026-10-19: match the compact
  Matches/detail language on catalogue and editor. Use a native scoped register,
  text headings, white panels and explicit links. Remove catalogue photographs,
  metrics and capabilities sidebar. Mobile puts pitch/playback/scenes before
  optional properties, starts the inspector collapsed and uses 44px actions/
  16px scene fields. View options use a keyboard-accessible disclosure. Focus
  mode keeps the pitch visible and scrolls content above navigation/below dialogs.
  Preserve V1/V2, explicit save, history, exports, readonly and conflict guards.

- Match detail extension approved on 2026-10-19: carry the selected Matches
  design language into `/app/matches/:matchId`. Use a compact text heading,
  one saved-data summary strip and an un-nested analysis/tactics panel. Remove
  the photographic hero and duplicate facts sidebar. Mobile stacks fields,
  uses 16px input text and at least 44px back/tab/save controls. Preserve
  explicit analysis writes, PLAYER readonly access and the lazy token-bound
  tactical editor with its existing transition/conflict guards.

- Matches direction approved on 2026-10-19: use the third generated concept,
  the dense fixture register, and adapt it for mobile. Keep a compact text
  header, inline date/reset toolbar, aligned date/time/fixture/venue/preparation
  columns and explicit Detail links. On mobile, use one stacked fixture per
  row with 44px controls. Keep real scoped totals, cursor/retry behavior and
  exact local-day filtering; preserve full notes through keyboard-accessible
  disclosure. Do not restore the photographic hero or separate filter sidebar.
  Reference: `qa/matches-ux-2026-10-19/selected-design-3.png`.

- Weekly planning approved on 2026-10-19 (ADR-0040): preserve team/season scope,
  chronological mixed records and full server summaries; never duplicate linked
  TrainingPlan/DayPlan cards. Use existing white Radix dialogs for manual events
  and preview/apply. Keep submit controls outside the scrolling preview; team
  sections and phase notes are expandable. Small-age profiles use after-school
  hours and original CLUB examples, not global expert-publication claims. Keep
  request identity across uncertain retries and reload; no silent resubmission.

- Club setup approved on 2026-10-19: five steps (club, season, teams, optional
  technical staff, review) use the existing white shadcn system. Club identity
  includes a raster logo upload and two colors with a live, readable derived
  theme. Applying a saved club changes UI accents, never pitch/equipment or
  semantic warning/error colors. Staff records do not create login accounts,
  send invitations or grant access. Preserve drafts and explicit final save.

- Tactical studio direction approved on 2026-09-19: prioritize the pitch over
  photographic headers; keep metadata collapsible, use numbered shirts with a
  disc alternative, a compact toolbar and a collapsible inspector. Equipment
  geometry is shared by Konva and SVG exports. View preferences must not mutate
  persisted V1 documents or dirty history. ADR-0035 records the first 2D slice;
  roster identities, animation, offline match-day and 3D remain later slices.

- Drill editorial UX correction approved by the existing ADR-0034 boundary on
  2026-09-09: an author must never see an actionable approve/reject path for their
  own version. Keep those controls disabled, explain that an independent football
  reviewer is required, and do not turn an expected authorization boundary into
  a generic 403-only user experience.

- A Takım correction approved on 2026-09-09: `/app/teams/first-team` opens the
  roster center directly and keeps the route while synchronizing the active team.
  Player directories use one accessible native table that becomes compact cards
  below 768px, with URL-backed search, position filter, name sort and explicit
  Player 360 links. Do not restore the intermediate single-team management card.

- Team navigation correction approved on 2026-09-09: A Takım and Altyapı are
  separate sidebar/mobile-Sheet destinations at `/app/teams/first-team` and
  `/app/teams/academy`; do not restore an in-page team tab switcher. Keep
  `/app/teams` only as a compatibility redirect. Local showcase roster names are
  deterministic synthetic Turkish names, not visible `Demo Oyuncu NN` labels.

- Training lifecycle correction approved on 2026-09-08: active controls use a
  pointer and disabled controls use not-allowed; plan records expose separate
  Detail/Edit/Delete actions without nested interactive content. Edit is limited
  to title/local date-time/purpose; permanent delete requires explicit Dialog
  confirmation and never removes a record optimistically. Catalogue presentation
  is superseded by the 2026-10-19 training-list extension above; all five statistics
  remain server-backed and unsupported board-status copy stays hidden.

- Dashboard reference correction approved on 2026-09-08: 185px sidebar, 78px
  topbar, unframed photographic welcome with Inter heading, six real metrics,
  and a three-column/two-row panel layout. At 1024px use 3/2 columns; at 390px
  use 2/1. Home and login land on `/app/dashboard`; Week remains separate.
- Today uses the independent daily read and local midnight boundaries. Summary
  totals, scheduled/undated distribution and scoped matches come from server
  totals, never visible page lengths. Do not label historical matches upcoming.
- Dashboard matched visual QA passed on 2026-09-08 with retained desktop,
  tablet, mobile and Sheet captures. Teams matched visual QA also passed with
  retained 1536/1024/390 captures and real API-only content. Matches matched QA
  passed at 1672/1024/390 with local-day filtering and date-grouped real rows.
  Week, Trainings/training-detail, Library/Tactical Board/editor, Match detail,
  Players, Player 360, Squad and Attendance now also pass at the approved
  desktop/tablet/mobile viewports with real data, pagination, on-demand boards,
  dated assignments, role boundaries and dirty-state behavior preserved. The
  Settings also passes the same exact-size gate. The approved BL-048 page
  sequence is complete; the next work item is the separate product gap audit.

- The 2026-09-07 user-supplied Dashboard, Teams and Matches screenshots supersede
  the former "Koç Operasyon Masası" shell as the source of truth for those
  migration slices. Their durable local references are the three files named
  `ChatGPT Image 7 Eyl 2026 17_40_12.png`, `17_39_50.png` and `17_39_33.png`.
- Match their white compact sidebar, white topbar, pale-blue active navigation,
  Inter/Barlow Condensed hierarchy, thin blue-gray surfaces and restrained blue
  actions. Keep only routes and metrics backed by the active API: do not add
  fake health, scouting, analysis, report or aggregate content.
- The original navy identity remains valid for legacy public/account surfaces
  until their own visual slice is explicitly migrated.
- The primary implementation path is week → training plan → attendance. Match-day
  tactical notes remain a supporting branch of the same workspace.

## Incremental UI migration — 2026-09-07

- The user's shadcn/ui migration brief calls for a coherent NGCS system, not a
  default shadcn redesign. Keep React Router, Radix, Tailwind and Phosphor.
- Follow `../../docs/20-execution/UI_MIGRATION_PLAN.md`: token foundation first,
  then primitives, shell/layout, forms, data patterns, modules, verified cleanup.
- Keep football canvas/domain components custom. Do not rewrite API, session,
  permissions, pagination state, date handling or validation for visual uniformity.
- Use `src/styles/tokens.css` for semantic values. The temporary
  `--legacy-muted-foreground` preserves old text color; `--muted` means a surface.
- Dark tokens are preparation only, not a working application-wide dark mode.
- Compare matched viewport/state screenshots before removing legacy selectors;
  do not install unused components or add empty NGCS wrappers around primitives.

## Ready drill planning — 2026-10-19

- Keep the existing library/card design. Share server filters with the plan picker;
  preview instructions and the board only on explicit open. Show the resolved
  team age, duration, players and area before attachment.
- Library detail selects an existing or newly created plan, then asks for explicit
  attachment. Never lose the exercise during plan creation or retry an uncertain
  write automatically. Preserve selection and offer explicit plan verification.
- Saved plan instructions and duration come from contentSnapshot. Unsupported
  ages do not silently inherit nearby ages; no drafts appear as approved content.
