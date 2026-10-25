# BL-047 — Phase 4B.1 Training Creation Dialog

- Date: 2026-09-07
- Verdict: **Pass for this dialog migration slice**.
- Authority: approved UI migration plan and ADR-0011/0013; no new ADR required.
- [Plan](../20-execution/UI_MIGRATION_PLAN.md).

## Implementation and preservation

Only runtime `routes/trainings.tsx` changes in this slice: the three controls use
shared FormField labels/spacing, the error uses FormError, and DialogFooter gets
wrapping plus scoped 14px/600 typography. Input/Textarea stay unchanged at their
existing sizes. Fields use 8px label spacing and 20px separation, replacing the
un-styled `dialog-form` container whose labels previously touched adjacent inputs.
DialogContent gets `max-height: calc(100dvh - 2rem)` and internal vertical scroll;
this is local to training creation, not a global dialog rewrite.

The original createPlan handler is unchanged: raw title/notes, current group,
local datetime converted with `new Date(date).toISOString()`, then create → await
reload → close → navigate. Button gating still requires nonblank trimmed title,
date and no active save. No native required/min/max or implicit Enter submit is
invented. The original flow is not a form element. Dismissal still retains the
route-owned draft on reopen; no dirty confirmation is introduced. Existing
dismissal while saving and post-create reload-error policy are not redesigned.
Catalog pagination, selected scope and all existing reads are untouched.

## Verification

- Nine new regressions, 15 targeted training-route tests passed.
- Defaults and title/date gate; original absence of native required/min/max;
  exact raw payload and local-date ISO across a year boundary; pending create and
  reload sequence; Error/non-Error plain-text failures and retained values;
  Escape/cancel/close, initial focus, focus return, retained draft, keyboard focus
  trap and no implicit title Enter submission; workspace-error creation gating.
- Existing pagination, scope reset/stale response and retry/success tests pass.
- Root `npm run quality` passed: 655 backend, 197 frontend and four Sites tests;
  typecheck/lint/format/build, Markdown links, CDSK and git whitespace.
  Existing Prisma package.json deprecation warning remains.
- Protected backend/API/session/workspace/package diff SHA-256 unchanged:
  `e19505d16184ab5ae22ac8ab769d6c096666f0a9a312c56f1e435d0e3551d4aa`.

## Browser evidence

`apps/frontend/qa/ui-plan-dialog-2026-09-07/` contains matched `before-` and
`after-` JPEGs for 1440×1024, 1024×900 and 390×844. Same default title, empty
date/notes, disabled create and initial title focus are compared. Navy backdrop,
dialog surface and existing controls remain; field separation and footer type
are intentional visual changes. No real plan was created.

Extra 390×430 check: dialog top/bottom 16/414px, clientHeight 396px versus
scrollHeight 485px; keyboard Tab from notes scrolls internally to the visible
Vazgeç button (scrollTop 88.5px). Document width remains 390px. Screenshot:
`short-screen-390x430.jpg`. Escape returns focus to Yeni plan. This is a short
desktop-browser viewport test, not a physical-device virtual keyboard claim.
Server success/failure branches are mocked in tests, not replayed on retained DB.

## Remaining work

Next: phase 4B.2 `player-detail.tsx` sporting assignment dialog; retain capability,
catalog pagination/selection, native date limits and mutation/closure rules.
Full phase 4, phases 5–8, BL-043/044/009 and M4 remain open. Full WCAG, long-error
browser states, physical mobile keyboards and dark-mode QA are not certified.
No dependency/API/schema/session changes, migration/reset/seed, disposable E2E,
commit/push or deployment in this slice.
