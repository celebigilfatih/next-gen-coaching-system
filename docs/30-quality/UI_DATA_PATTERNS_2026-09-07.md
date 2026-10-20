# BL-047 — Phase 5A Shared Data Presentation Pilot

- Date: 2026-09-07
- Verdict: **Pass for the selected presentation pilot**, not full phase 5.
- Authority: approved [UI migration plan](../20-execution/UI_MIGRATION_PLAN.md),
  ADR-0011/0013. No new architecture, authorization or dependency decision.

## Delivery and boundaries

`components/feedback/page-pagination.tsx` composes the existing Button with a
named navigation region, polite summary and responsive arrangement. Callers
supply the summary, disabled conditions and callbacks; it owns no cursor, total,
request or domain state. On mobile, summary occupies its own row above the two
actions. Action type is scoped to 14px/600, with existing 40px button height.

`components/feedback/data-state.tsx` supplies named skeleton loading, an
Alert-composed plain-text error with optional caller-owned retry, and a semantic
token-based empty surface with a decorative icon. Existing resource-specific
messages and skeleton counts/heights remain. Retry no longer stretches across
the error surface; both directory errors use consistent semantic error tint.
Empty spacing/type/color intentionally converge; no domain card is redesigned.

Players/Teams use the patterns; AssignmentPageControls delegates presentation
and preserves its typed AssignmentPageInfo/count/state adapter. Team roster and
Player 360 therefore share the pager too. No request effect, 250ms search debounce,
keyed scope reset, stale-response guard, selected team action, cursor update,
date or permission code was changed. Loading hides the old page; failures do not
become empty results. Failed continuation retains previous navigation and retries
the same cursor. Workspace failures still have no invented directory retry.
Directory summaries show only returned item count, never an invented total;
assignment summaries keep count/full total, including empty continuation pages.

No legacy CSS is deleted: other consumers still use loading-grid/empty-state/
route-error. Workspace initial skeletons remain unchanged. Compact catalog
controls differ in successful-read cursor ownership and are deferred to phase 5B.

## Verification

- 14 added regressions: six shared pattern/adapter tests plus four each for
  Players/Teams. All 26 targeted tests passed, including existing page tests.
- Native keyboard pagination and non-submit buttons, disabled callbacks, named
  loading/decorative skeletons, plain-text error rendering and caller-owned retry,
  empty semantics, opaque cursor dispatch and 0/120 assignment totals.
- Both route pilots: pending-page gates, error versus empty, continuation retry
  with the same cursor, no stale count/data, workspace failure without reads,
  empty continuation and return. Existing search/scope/stale/selection tests pass.
- Root `npm run quality` passed: 655 backend, 226 frontend, four Sites tests;
  typecheck, lint, format, build, Markdown links, CDSK and git whitespace passed.
  Existing Prisma package.json deprecation warning remains.
- Protected backend/frontend lib/package diff SHA-256 unchanged:
  `e19505d16184ab5ae22ac8ab769d6c096666f0a9a312c56f1e435d0e3551d4aa`.

## Browser evidence and limits

`apps/frontend/qa/ui-data-patterns-2026-09-07/` contains before/after Players and
Teams at 1440×900, 1024×900, 390×900, plus a matched 390px empty player search.
The same synthetic club/team and returned list items are used. Cards, search,
nav and scope remain; pager typography and mobile summary/action layout converge.
At 390px empty search, the pager spans x=16–374px; both 40px-high actions share
the row below its summary and end at y≈792px, above the fixed mobile navigation.
Document width is 390px (also 1024px/1440px at those checks). A player link opens
Player 360 with Enter. Temporary viewport overrides were reset after QA.
The fixture has one page, so enabled next/previous actions, failed continuation
and retry are verified in automated tests, not represented as live backend QA.
Real browser work is read-only list/search/profile navigation; no sporting write.
Loading/error branches are tested with mocked requests; no retained DB failure
is induced. Full WCAG, physical keyboard/device and dark-mode certification are
not claimed. Broader module responsive checks remain phase 6/8.

## Next

Phase 5B: compact catalog/option pagination presentation with successful-read
cursor commit, pinned selections and loading/error/retry rules retained. Then
football cards. Other module adoption remains phase 6; phase 5 as a whole and
6–8, BL-043/044/009 and M4 remain open. No API/schema/session changes, installs,
migration/reset/seed, disposable E2E, commit/push or deployment in this slice.
