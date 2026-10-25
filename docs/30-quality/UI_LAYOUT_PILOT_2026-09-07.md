# BL-047 — Phase 3 Layout Pilot

- Date: 2026-09-07
- Verdict: **Pass for Dashboard/Settings layout pilot and mobile user-menu fix**.
- Authority: approved BL-047 plan, ADR-0011/0013; no new decision or dependency.
- [Migration plan](../20-execution/UI_MIGRATION_PLAN.md).

## Implementation boundary

`apps/frontend/src/components/layout/page-layout.tsx` adds three shared presentation
components. PageContainer has full/readable width; PageHeader composes one h1,
optional eyebrow/description/actions; PageActions supports start/end alignment.
Dashboard and Settings retain data reads, full totals, retry branches, context,
session copy and logout orchestration. Other routes retain legacy layout CSS.
Only the unused `.settings-page` width rule is removed; the 1080px value moves to
a layout token. No global selector cleanup or native font reset.

The mobile menu formerly hid every direct span, including the Avatar. It now
hides only `.ngcs-user-details`; the decorative avatar stays visible and the
trigger has the stable accessible name “Kullanıcı menüsü”. Menu actions, routes
and logout handlers are unchanged.

## Automated evidence

- Eight new tests: container props/ref/width, heading and genuine link/button
  actions, optional slots; Settings persistent/temporary session copy, awaited
  logout success, Error/non-Error failure; real shell menu keyboard/settings route.
- Targeted four files: 25 tests passed, including existing Dashboard bounded-read
  and selected/all/missing season label regressions.
- `npm run quality`: 655 backend tests, 172 frontend tests, four packaging tests;
  typecheck, lint, format, builds, Markdown links, CDSK and whitespace passed.
- Existing Prisma package.json configuration deprecation warning remains.
- Protected backend/API/session/workspace/package diff SHA-256 unchanged:
  `e19505d16184ab5ae22ac8ab769d6c096666f0a9a312c56f1e435d0e3551d4aa`.
- No E2E reset, migration, seed, business record write, commit, push or deployment.
  This is not a fresh disposable full-product E2E run.

## Local browser evidence

Before/after JPEGs are saved under `apps/frontend/qa/ui-layout-2026-09-07/`:
`dashboard-{before,after}-{1440,1024,390}.jpg`,
`settings-{before,after}-{1440,1024,390}.jpg`, `mobile-user-menu-390.jpg`.
Viewports: 1440×1024, 1024×900, 390×844. Final captures use reloaded modules,
not the transient mixed-markup HMR state encountered during editing.

- Navy shell, blue primary, card grids and page/header spacing retained.
  Dashboard mobile CTA now uses the intrinsic shadcn link width, not the former
  grid-track stretch. Settings logout is intentionally 14px/600 rather than
  legacy native 16px/400; Dashboard CTA also measures 14px/600.
- Heading font stays Barlow Condensed 600 at 48/40.96/34px respectively.
  Settings readable container is 1080px on desktop, 938px at tablet, 390px mobile.
- Both pages have document scrollWidth equal to viewport width at target sizes;
  extra Settings check at 320px also has no document horizontal overflow.
- Mobile menu visible, named, opens by pointer and Enter; Escape restores focus
  to trigger; Enter on Settings navigates correctly. Final Settings captures
  include the visible keyboard focus ring. Actual logout was not activated.
- Live Dashboard fixture changed between captures: training count 1→2 and an
  additional “Yeni antrenman” row appeared. No business write was performed by
  this slice. Layout comparison is qualified by that live-data difference;
  screenshots are not a frozen-fixture pixel-identical assertion.

## Remaining work

Next: phase 4 login/account-completion form pilot, then plan/assignment forms,
preserving validation, error/busy state, focus and dirty guards. Wider page/shell
convergence and scope/dirty visual regressions remain phase 6/8. Long board-list
overflow, dark mode and full accessibility/browser matrix are not certified.
WCAG target, production policies and BL-043/044/009/M4 remain separate and TBD.
