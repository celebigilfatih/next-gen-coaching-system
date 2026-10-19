# BL-047 — Phase 5C Football Cards

- Date: 2026-09-07
- Verdict: **Pass for phase 5C and phase 5 data-display scope**.
- Authority: approved UI migration plan and ADR-0011/0013; no new ADR needed.
- [Plan](../20-execution/UI_MIGRATION_PLAN.md).

## Change and preservation

`components/domain/football-card.tsx` is a presentation-only composition over
the existing Card primitives. It provides title, badge, description, metadata,
detail, action and optional pitch-preview slots, with default, board and match
accents. Training, match, drill-library and tactical-board catalogs now use this
single football-specific pattern.

The route-owned contracts remain unchanged:

- every training and match card still links to its existing detail route;
- tactical-board cards still link to their existing editor route;
- a library drill without a board remains a non-link card;
- global/club scope, competition, duration, phase, location, formation, board
  state, equipment and fallback text retain their source values;
- pagination, full totals, loading/error/empty branches, request ownership,
  authorization and data projections are untouched.

Eight selector blocks used only by the migrated cards were removed after a
reference scan: the library-card/equipment/plan-hint, pitch-preview, copy-hint
and match-card rules, including their variant/child selectors. Shared
`card-title-row` and `meta-row` rules remain because other module consumers still
use them. No API, hook, session, schema, dependency or backend file changed in
this slice.

## Automated evidence

Four new component tests cover optional slot composition, default/board/match
tones, forwarded card attributes and decorative preview semantics. The four route
suites also assert the new tone contract while retaining existing link, non-link,
totals, page replacement, stale response, retry and empty-state coverage.

Targeted result: 34/34 tests. Full frontend result: 245/245 tests. Root
`npm run quality` passed with 655 backend, 245 frontend and four Sites tests,
including typecheck, lint, format, builds, Markdown links, CDSK and whitespace.
The first sandboxed production-build attempt could not bind the prerender preview
server to `127.0.0.1` (`EPERM`); the same build passed outside that sandbox
restriction and generated the SPA/Sites artifacts.

Protected backend/frontend lib/package diff SHA-256 remains:
`e19505d16184ab5ae22ac8ab769d6c096666f0a9a312c56f1e435d0e3551d4aa`.

## Browser evidence and limits

`apps/frontend/qa/ui-football-cards-2026-09-07/` contains final training,
match, library and tactics screenshots at 1440×900, 1024×900 and 390×844, plus
the 1440×900 training baseline. The authenticated retained coach workspace was
read only: no plan, drill, match or assignment was created or changed.

The training fixture verifies a long title and multi-line note beside a shorter
card without badge overlap or metadata overflow. Match/library/tactics routes
retain their current empty or populated state at each viewport. The retained
tactics fixture contains zero boards, so pitch-card browser rendering is backed
by component and route tests rather than a fabricated database record. Physical
mobile, dark mode, formal WCAG and production acceptance are not certified.

## Next

Phase 5 is complete. Begin phase 6 with the Week module presentation/layout
slice, preserving local-date navigation, plan/match reads, full totals and scope
behavior. Then proceed through training/detail, library/tactics, match/detail,
squad/attendance and team/player modules; board controls remain last. Phase 7/8
and BL-043/044/009/M4 remain open. No migration/reset/seed, database E2E,
commit/push or deployment was performed here.
