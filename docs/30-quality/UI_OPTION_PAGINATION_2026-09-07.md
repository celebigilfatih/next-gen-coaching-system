# BL-047 — Phase 5B Compact Option Pagination

- Date: 2026-09-07
- Verdict: **Pass for the compact option pagination slice**, not full phase 5.
- Authority: approved UI migration plan and ADR-0011/0013; no new ADR needed.
- [Plan](../20-execution/UI_MIGRATION_PLAN.md).

## Change and preservation

`components/feedback/option-pagination.tsx` is a presentation-only compact pattern
used by `CatalogControls` and `AssignmentCatalogSelect`. It retains named groups,
caller-supplied Turkish action names, a polite live page counter and ghost/sm
native non-submit buttons. Both surfaces now share 12px/600 action typography,
32px button height, tabular counter and wrapping for narrow containers. The
assignment surface was already at this density; workspace actions converge to it.
The full-width PagePagination remains distinct; no stateful universal pager is added.

The adapters keep different, intentional policies:

- Workspace: `move` updates cursor history only after `pageCatalog` returns true.
  False keeps the current page and permits retry. First page without continuation
  remains hidden; last page still permits previous. Workspace/all-catalog busy
  gating, club/season/team/revision remount key and provider-owned errors remain.
- Assignment options: the requested cursor/page changes before resolution.
  Pending controls are disabled; failure stays on that page for retry and allows
  previous. Selected rows remain pinned through page/error/empty transitions.
  First single-page controls remain visible. Native selection and FormData,
  required fields, toast/mutation and dialog reset behavior are unchanged.

No hook/provider/API, selection, request handler, schema, session, dependency or
CSS file was changed. Other compact-looking controls and football cards are not
silently migrated in this slice.

## Automated evidence

15 new tests: 11 catalog control cases, two compact pattern cases, two assignment
option cases. All 39 targeted tests passed, including the six existing workspace
provider cases and 15 assignment-dialog regressions.

Root `npm run quality` passed: 655 backend, 241 frontend and four Sites tests;
typecheck, lint, format, builds, Markdown links, CDSK and git whitespace passed.
Existing Prisma package.json configuration deprecation remains. Documentation
checks were repeated after the final report/handoff update.

Coverage includes three catalog kinds and Turkish labels; hidden single page;
pending success-only commit; forward/backward false-result retry; last-page back;
club/season/team/revision reset with a stale pending completion; any-catalog busy;
keyboard Enter/Space and no form submit; pinned assignment selection after a
failed continuation and empty retry; requested-page counter, pending gates and
page replacement without implicit selection. Existing provider tests retain
pinned scope without resource reload and rejection of late old-scope results.

Protected backend/frontend lib/package diff SHA-256 remains:
`e19505d16184ab5ae22ac8ab769d6c096666f0a9a312c56f1e435d0e3551d4aa`.

## Browser evidence and limitations

`apps/frontend/qa/ui-option-pagination-2026-09-07/` contains matched before/after
assignment dialogs at 1440×900, 1024×900 and 390×900. Same synthetic person,
default unselected team/role and date/type are retained. No assignment is saved.
At desktop, both option pagers measure 245px wide and their buttons 32px high
with 12px/600 type. The shared pattern retains the preceding form migration's
layout and existing navy/blue identity.
Document width matches all three viewports. At 390px both option groups have
clientWidth=scrollWidth=309px. Escape returns focus to Atama ekle; the temporary
viewport override was reset and no form submission was performed.

The retained fixture has one page: workspace controls correctly stay hidden and
assignment next/previous stay disabled. Enabled workspace pagination and error/
busy branches are automated-test evidence, not live multi-page browser evidence.
No test records were inserted to expand the retained catalog. Physical mobile,
full WCAG, dark mode and production acceptance are not certified.

## Next

Phase 5C football cards: inspect current training/match/drill card consumers and
converge their presentation without changing links, totals, football semantics
or permissions. Phase 5 overall, phases 6–8 and BL-043/044/009/M4 remain open.
No migration/reset/seed, DB E2E, commit/push or deployment in this slice.
