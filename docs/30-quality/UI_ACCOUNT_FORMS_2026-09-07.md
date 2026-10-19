# BL-047 — Phase 4A Account Forms

- Date: 2026-09-07
- Verdict: **Pass for the public account-form implementation slice**.
- Scope: login, invitation acceptance, password reset and completion shell.
- Authority: approved BL-047 plan, ADR-0011/0013; no new ADR needed.
- [Plan](../20-execution/UI_MIGRATION_PLAN.md).

## Changes and preserved contracts

- Shared presentation-only FormField associates a native label with its input;
  FormError composes existing Alert/AlertDescription with plain-text output.
- Existing shadcn Input/Button and PageActions replace legacy native styles.
  Fields and submit buttons are 48px high; inputs inherit 16px/400 and actions
  14px/600. Field-label gap is 8px, between-field gap 20px. Public shell,
  navy/blue identity, Barlow headings and 430px form width remain.
- The old 52px inputs/58px buttons, 650-weight labels and inline error paragraph
  intentionally converge to the shared control density/error surface. This is
  not an unchanged-pixel claim. Login-only style selectors have no remaining
  consumers and were removed; global native font rules and other forms remain.
- Required/type/autocomplete/minLength=12, controlled values, mismatch checks,
  token fragment cleanup/clear, API payloads and success/error/retry remain owned
  by the routes. Handler logic, session code and token hook are unchanged.
- Success still shows a status and real /login link; no automatic login added.
  Forms expose aria-busy while their existing submit buttons are disabled.

## Automated verification

- 16 new tests, 18 total in the two targeted account-route files.
- Login: constraint/autocomplete props, invalid email/empty request prevention,
  keyboard submit, deferred busy/success, exact payload, Error/non-Error retry,
  retained values and existing-session redirect.
- Both completion routes: minimum/required/autocomplete props, mismatch without
  API call, missing-token disabled state, deferred busy/success, exact token
  payload, password control removal, login link, plain-text errors and retry.
  Existing StrictMode invitation fragment cleanup and missing reset tests pass.
- `npm run quality`: 655 backend and 188 frontend tests, four Sites tests,
  typecheck/lint/format/build, CDSK, local Markdown links and git whitespace passed.
  Existing Prisma package.json deprecation warning remains.
- Protected backend/API/session/workspace/package diff SHA-256 unchanged:
  `e19505d16184ab5ae22ac8ab769d6c096666f0a9a312c56f1e435d0e3551d4aa`.

## Browser verification and limits

Local public routes were opened in a separate tab without ending the user's
existing session. No actual login, invitation acceptance or password reset was
sent to the server; all successful/error API branches above use mocked tests.

- Invitation: matched empty/missing-token before/after at 1440×1024, 1024×900,
  390×844; visible error and disabled submit remain, responsive shell retained.
- Login: final screenshots and computed widths at those three sizes; 48px input,
  16px input text, 14px/600 submit, visible keyboard focus, no horizontal overflow.
  Original screenshots were discarded because browser autofill preview showed
  personal data despite empty DOM values. Final captures use only synthetic
  form text and are not a matched-value before/after assertion.
- Reset: missing-token state and final 390×844 screenshot; disabled submit and
  no horizontal overflow. Desktop reset is not a separate screenshot gate here.
- Native required/email validation and keyboard traversal checked without a
  successful server submission. Browser minLength behavior is checked with
  synthetic short input; jsdom tests additionally assert the original attribute.
- Final images: `apps/frontend/qa/ui-forms-2026-09-07/`, invitation before/after
  and login after at three sizes, plus reset after at 390px. Transient resize
  compositor captures were replaced with settled-view captures.

No dependency, API, schema, session, permission, migration, seed/reset, business
record mutation, commit/push or deployment. No disposable full E2E suite this
slice. Formal WCAG, full browser matrix and dark mode remain unverified/TBD.

## Next

Phase 4B training creation dialog, then assignment forms: preserve native
constraints, local dates, busy/errors, closure, Escape/focus return and dirty
guards. Phase 4 is not fully complete. Phase 5–8, BL-043/044/009 and M4 remain open.
