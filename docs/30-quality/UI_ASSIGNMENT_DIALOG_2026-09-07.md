# BL-047 — Phase 4B.2 Sporting Assignment Dialog

- Date: 2026-09-07
- Verdict: **Pass for this dialog migration slice**.
- Authority: approved UI migration plan, ADR-0011/0013; ADR-0023 capability
  boundary retained. No new ADR, dependency or permission decision.
- [Plan](../20-execution/UI_MIGRATION_PLAN.md).

## Implementation and preserved contracts

`routes/player-detail.tsx` uses shared FormField, NativeSelect and DialogFooter
for the sporting assignment dialog. `assignment-catalog-select.tsx` reuses the
same field/select presentation with unique label IDs and wrapping pagination
actions. NativeSelect is a small owned styled HTML select, not a Radix rewrite:
native options, required validation, names and FormData remain intact. Controls
measure 40px high with 16px/400 text; labels use 14px/500, footer 14px/600.
Two columns at desktop/tablet become one below 640px. This dialog alone receives
the dynamic-height/internal-scroll limit already used by the training pilot.
Only unreferenced assignment-form/wide/actions CSS was removed; the unrelated
as-of date input and player overview mobile rule are retained.

The submit handler is unchanged. Team/role must be explicitly selected; selected
catalog records stay pinned across pages. Four non-primary types call create,
PRIMARY_REGISTERED calls transition with validAt instead of validFrom. Reason
is trimmed or undefined; date defaults to the UTC day and serializes at 12:00Z.
The date is required; it has no existing min/max and none were added. There is
no season selector. Pending save disables its button; success closes then reloads;
failure uses the existing Sonner error and retains values. Reopening resets the
draft. Native Enter submission and dismissals while saving remain existing
behavior; no dirty confirmation or uncertain-save policy is invented.

The existing technical-role UI hint hides the trigger for PLAYER. This does not
implement or prove a complete capability matrix; backend authorization remains
authoritative and unchanged. No real assignment POST was made during browser QA.

## Automated verification

- 15 new tests in `routes/assignment-dialog.test.tsx`; 24 targeted tests passed
  including existing catalog and dated-assignment page regressions.
- PLAYER UI hint/no catalog call, required explicit selections and date/default,
  exact five-type dispatch/payload, success refresh, empty-date native validation,
  Enter submission, blank reason, pending gate, Error/non-Error toast and retry,
  Escape/cancel/close focus-return/reset, empty role catalog save gate.
- Existing catalog tests cover selected-row pinning across pagination, error/
  retry/empty states and reopening; existing page tests cover totals, dated scope
  and stale-result protection. Server mutation branches are mocked here.
- Root `npm run quality` passed: 655 backend, 212 frontend and four Sites tests;
  typecheck, lint, format, builds, Markdown links, CDSK and git whitespace passed.
  Existing Prisma package.json configuration deprecation remains.
- Protected backend/API/session/workspace/package diff SHA-256 is unchanged:
  `e19505d16184ab5ae22ac8ab769d6c096666f0a9a312c56f1e435d0e3551d4aa`.

## Browser evidence

`apps/frontend/qa/ui-assignment-dialog-2026-09-07/` contains matched before/after
JPEGs at 1440×900, 1024×900 and 390×900. Same synthetic Player 360, empty team/role,
default assignment type/date, empty reason and disabled save are compared.
Current initial focus is assignment type because catalogs load asynchronously;
no autofocus override was introduced. Desktop/tablet dialog is 560×504px; mobile
is approximately 359×700px. Document width matches each viewport, without
horizontal overflow. Existing navy/blue identity and shell remain intact.

At 390×430, dialog bounds are top 16/bottom 414px; clientHeight 396px versus
scrollHeight 698px. Tab from reason reaches the visible Vazgeç button and scrolls
internally to 302px. `short-screen-390x430.jpg` records this. Escape returns focus
to Atama ekle. Reopening clears the draft; Tab from Kapat wraps to the team
selector inside the dialog. Opening the native team menu, ArrowDown and Return
selects the available synthetic team while save stays disabled without a role.
The dialog was dismissed without saving and the viewport override was reset.
This is a resized desktop-browser check, not physical mobile
keyboard or formal WCAG certification. API failure states are covered in mocked
tests, not induced against the retained database.

## Handoff and limitations

Phase 4 selected login/completion, training creation and assignment targets are
complete. Next: phase 5 shared pagination and empty/loading/error presentation,
preserving cursors, full totals, retry and permission boundaries. Broader module
forms and shell adoption remain phase 6; phases 5–8, BL-043/044/009 and M4 are open.
Full dark-mode/accessibility/browser matrix and production acceptance remain TBD.
No backend/API/schema/session changes, migration/reset/seed, disposable E2E,
commit/push or deployment in this slice.
