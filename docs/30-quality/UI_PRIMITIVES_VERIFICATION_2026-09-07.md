# BL-047 — Phase 2 Primitive Interaction Gate

- Date: 2026-09-07
- Verdict: **Pass for the current primitive interaction gate**.
- Scope: tests and documentation only; no runtime component, CSS, route, API,
  business rule, dependency, schema or permission change in this slice.
- [Migration plan](../20-execution/UI_MIGRATION_PLAN.md).

## Automated coverage

Two new test files add 12 passing tests, complementing phase 1's nine tests:

| Primitive | New evidence |
| --- | --- |
| Select | Keyboard selection, disabled-item skip, controlled callback exactly once, form serialization, Escape cancels uncommitted focus, trigger focus return, disabled trigger and ref |
| DropdownMenu | Keyboard open/first enabled item, activation exactly once, disabled-item skip, Escape without action, focus return |
| Tooltip | Keyboard accessible description, Escape, pointer hover and leaving the hoverable-content grace region |
| ScrollArea | Root ref, child-control keyboard order, disabled child skip and activation; no jsdom physical-scroll claim |
| Card | Semantic heading/content and existing density classes retained |
| Avatar / Separator | Fallback and decorative versus semantic vertical separator |
| Sonner | Actual notification rendering, default/override placement, keyboard close-button activation, plain-text error markup (no image element created) |

Files:
[interactive-primitives.test.tsx](../../apps/frontend/src/components/ui/interactive-primitives.test.tsx),
[sonner.test.tsx](../../apps/frontend/src/components/ui/sonner.test.tsx).

The first run exposed missing jsdom scrollIntoView/hasPointerCapture APIs and a
test assumption that leaving a tooltip trigger immediately closes hoverable
content. Scoped, restored DOM shims and an explicit pointer move outside the
grace region corrected the test environment/sequence; no runtime workaround,
suppressed console error, any cast or skipped test was added. Sonner is real,
not mocked. Its optional closeButton is exercised in isolation; the application
default was not changed to add that button.

`npm run quality` passed: 655 backend tests / 48 suites, 164 frontend tests /
30 files, four Sites packaging tests, typecheck, lint, format, backend/frontend
build, Markdown links, CDSK and whitespace. Existing Prisma configuration
deprecation warning remains. No full disposable API/browser E2E or migration
was run in this test-only slice.

## Current-browser evidence — 1024 × 900

The running local app was tested through its existing authenticated synthetic
workspace. No form/save/logout action was submitted and no board element was
created. Temporary viewport override was reset; dashboard remains open.

1. Account DropdownMenu: pointer open, Escape, Return keyboard reopen focused
   Settings; Escape restored focus to the trigger. No account action executed.
2. Notifications: the existing button displayed “1 maç çalışma alanında hazır.”
   in the top-right toast. This is the current count, not a new notification API.
3. Tablet icon navigation: Tab focused Hafta and exposed its tooltip; Escape
   removed the tooltip without navigation or losing link focus.
4. New tactics form: category opened at Taktik; ArrowDown focused Soğuma;
   Escape returned to the trigger with **Taktik unchanged**. No dirty save.
5. Tool ScrollArea: Tab traversed from the first tool to the final Metin tool;
   browser brought the final control into view. The two measured viewports were
   751/751 and 465/465 clientHeight/scrollHeight, so this fixture did not exercise
   independent internal overflow. Long overflowing layers remain a phase 6/8
   domain/responsive QA case; keyboard reachability is not a wheel/drag assertion.

| Evidence | Saved screenshot |
| --- | --- |
| Account menu keyboard focus | [01](../../apps/frontend/qa/ui-primitives-2026-09-07/01-dropdown-keyboard.jpg) |
| Notification | [02](../../apps/frontend/qa/ui-primitives-2026-09-07/02-notification.jpg) |
| Keyboard tooltip | [03](../../apps/frontend/qa/ui-primitives-2026-09-07/03-tooltip-keyboard.jpg) |
| Select highlighted but uncommitted option | [04](../../apps/frontend/qa/ui-primitives-2026-09-07/04-select-focused-option.jpg) |
| Final tool keyboard focus | [05](../../apps/frontend/qa/ui-primitives-2026-09-07/05-scroll-area-keyboard.jpg) |

These are interaction evidence, not a new full-app visual audit or a formal WCAG
claim. Phase 1's matched 1440/1024/390 screenshots remain historical evidence;
only the listed current-browser states were exercised in this slice.

## Type and density review / scoped follow-up

No typography or density values were changed. Current primitives use h-10
controls, h-8 small buttons, p-5 Card sections, p-6 Dialog/Sheet content,
token-derived 0.65rem radius with calculated smaller sizes, and existing Tailwind
spacing/elevation scales. The existing compiled Barlow utility resolves to a
font-family rule, not an invalid font-weight rule.

Computed dashboard measurements at 1024px show Inter body/search input at 16px,
40px control height, 8.4px medium radius; the primary link is 14px/600 and 40px
high, H1 Barlow Condensed 40.96px/600, and current Card headings Inter 20px/600.
The unlayered `button, input, textarea { font: inherit; }` in styles.css overrides
layered font utilities for native controls: a native shell button measures
16px/400 while the asChild action link is 14px/600. This existing cascade risk
must be handled with each migrated consumer, not a blind global reset removal.

Phase 2's current primitive verification gate is complete; phase 3 begins with
PageContainer/Header/Actions on dashboard/settings and the mobile account-menu
name/visibility fix. That pilot must explicitly review computed typography for
native versus asChild controls. Phase 4 retains label/control spacing and native
validation; phase 6/8 retains overflowing board lists and full responsive QA.
No new ADR is required under Accepted ADR-0011/0013. BL-043/044/009 and M4 stay open.

## Preservation

Turn-start working tree: 225 status entries, including prior uncommitted work.
Protected backend + API/session/workspace + frontend manifest/lockfile diff hash
is unchanged:
`e19505d16184ab5ae22ac8ab769d6c096666f0a9a312c56f1e435d0e3551d4aa`.
No business DB write, reset, migration, stage, commit, push or deployment.
Ordinary session refresh is possible during browsing; no all-DB fingerprint
equality is claimed. Reverting this slice means removing only its new tests,
evidence and documentation updates, not resetting the user working tree.
