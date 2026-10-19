# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## NGCS visual target

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
  pointer and disabled controls use not-allowed; plan cards expose separate
  Detail/Edit/Delete actions without nested interactive content. Edit is limited
  to title/local date-time/purpose; permanent delete requires explicit Dialog
  confirmation and never removes a card optimistically. Five catalogue metrics
  remain 5 desktop, 3/2 tablet and 2/2/1 mobile; plan cards use auto-fit and
  unsupported board-status copy stays hidden.

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
