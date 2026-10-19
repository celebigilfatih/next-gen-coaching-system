# NGCS — Incremental shadcn/UI Migration

- Date: 2026-09-07
- Status: Approved direction by the user's UI migration brief; implementation incremental.
- Tracking: BL-047; phase 1 foundation, phase 2 current primitive interaction
  gate, phase 3 dashboard/settings layout pilot and phase 4A public account forms
  complete. Phase 4B training and sporting assignment dialogs are complete;
  phase 5A shared data-state/directory pagination pilot and phase 5B compact
  option pagination are complete. Phase 5C football cards is complete, closing
  phase 5. Phases 6–8 remain open, including broader page/shell adoption in
  phase 6. Consumer-specific typography/cascade
  convergence continues with the page/form pilots, not a global reset.
  [Foundation](../30-quality/UI_MIGRATION_FOUNDATION_2026-09-07.md),
  [primitive verification](../30-quality/UI_PRIMITIVES_VERIFICATION_2026-09-07.md),
  [layout pilot](../30-quality/UI_LAYOUT_PILOT_2026-09-07.md).
- Authority: ADR-0011/0013 already select React Router, shadcn/Radix, Tailwind,
  Phosphor and the navy/blue/amber NGCS identity. No Next.js migration is proposed.

## Visual-system follow-up — approved 2026-09-07

Three user-supplied screenshots are now the visual source for the next page-by-page
delivery: Dashboard (1672 × 941), Teams (1536 × 1024) and Matches (1672 × 941).
The work order is shared white shell + Dashboard, Teams, Matches, then the remaining
existing pages. The sidebar shows only working routes; unsupported health, scouting,
analysis, reporting, advanced statistics and aggregate team claims remain hidden.

The first slice introduces the white compact shell, top-bar workspace selection,
keyboard focus for the existing route search, `PageHero`, `MetricCard` and
`SectionCard`, and a generated coach hero asset. It retains all existing REST reads,
roles, scope/pagination/date semantics and mobile task navigation. The original
missing-API blocker is historical: the retained runtime and coach login now work.

### Dashboard correction — approved 2026-09-08

The four-metric/two-panel pilot is replaced by the 185/78px shell, unframed Inter
welcome, generated photographs, six real metrics and three-column operational
panels. Daily reads retain cursor/retry/stale-response boundaries; dated/undated
values are server totals. Matches are scoped, not falsely described as upcoming.
Home/login/app-index land on Dashboard. Tablet uses 3/2 and mobile 2/1 grids.

Root quality passes (657 backend, 255 frontend, 4 Sites). Exact-size captures at
1672×941, 1024×900 and 390×844 plus the mobile Sheet are retained, and the matched
review closed without actionable P0/P1/P2 findings.

### Teams slice — completed 2026-09-08

The approved 1536×1024 reference is implemented with a photographic training
ground hero, API-backed team cards and an accessible compact native table. Search
debounce, stale-response rejection, cursor paging, work-team selection, detail
links and responsive behavior remain intact. Four generated raster assets cover
hero and category variants without text, logos or invented club identity.

Matched 1536×1024, 1024×900 and 390×844 captures are retained under
`apps/frontend/qa/teams-reference-2026-09-08/`; [QA](../../design-qa.md) passes
with no actionable P0/P1/P2. Unsupported player/staff totals, league form,
comparison, aggregate distribution, video and create-team claims remain absent.
Root quality passes with 657 backend, 256 frontend and 4 Sites tests. No
API/schema/data, migration, seed/reset, deployment, commit or push changes. The
next approved slice is Matches.

### Matches slice — completed 2026-09-08

The approved 1672×941 reference is implemented with the shared photographic
hero, a compact real date filter and date-grouped match rows. Existing cursor
history, full totals, stale-scope rejection, independent retries, detail links
and all-season behavior remain intact. The date filter uses the existing bounded
daily endpoint with local half-open midnight boundaries and clears back to the
full catalogue.

Exact-size 1672×941, 1024×900 and 390×844 captures are retained under
`apps/frontend/qa/matches-reference-2026-09-08/`; [QA](../../design-qa.md) passes
without actionable P0/P1/P2. Match-type tabs, aggregates, team filter, match
center and create-match actions remain absent because their contracts are not
proven. Root quality passes with 657 backend, 257 frontend and 4 Sites tests. No
API/schema/data, migration, seed/reset, deployment, commit or push changes.

### Week slice — completed 2026-09-08

The Week page uses the approved reference system rather than a dedicated page
mock: Dashboard supplies the shell/hero/card language and Matches supplies the
calendar/list density. The existing training-ground raster, compact week controls
and responsive seven-day cards are used. Local Monday–Sunday date behavior, seven
independent daily plan/match reads, full totals, cursor histories, retries,
stale-response rejection and detail links remain unchanged.

Exact-size 1672×941, 1024×900 and 390×844 captures are retained under
`apps/frontend/qa/week-reference-2026-09-08/`; [QA](../../design-qa.md) passes
without actionable P0/P1/P2. No aggregate, API/schema/data, migration, seed/reset,
deployment, commit or push change occurred.

### Trainings and training-detail slice — completed 2026-09-08

The plan catalogue and editor now use photographic heroes, five server-backed
catalogue metrics, a compact editor summary, scoped tabs and responsive plan/phase
cards. Cursor totals and history, stale/retry handling, plan creation semantics,
on-demand phase-board reads, dirty transitions, uncertain-save reconciliation,
attendance and role checks remain unchanged.

Exact-size 1672×941, 1024×900 and 390×844 captures for both routes are retained
under `apps/frontend/qa/trainings-reference-2026-09-08/`; [QA](../../design-qa.md)
passes without actionable P0/P1/P2. The browser smoke opened/dismissed the create
dialog without submission, traversed all editor tabs, verified invalid board data
fails closed and loaded real attendance. No API/schema/data, migration, seed/reset,
deployment, commit or push change occurred.

### Library, Tactical Board and editor slice — completed 2026-09-08

The exercise catalogue, tactical catalogue and new-board editor now use the
approved white visual system with existing photographic assets, real catalogue
totals, category controls, verified capability guidance and compact board chrome.
Drill category/kind pagination, global/club visibility, JSON import/export,
undo/redo, dirty navigation and authorization semantics remain unchanged.

Exact-size 1672×941, 1024×900 and 390×844 captures for all three routes are
retained under `apps/frontend/qa/library-tactics-reference-2026-09-08/`;
[QA](../../design-qa.md) passes without actionable P0/P1/P2. Browser smoke
verified category filtering and dirty cancel/discard behavior without a save.
No API/schema/data, migration, seed/reset, deployment, commit or push occurred.

### Match detail slice — completed 2026-09-08

Match detail now uses the approved white system with the shared photographic
hero, five verified match facts, a compact analysis/facts composition and the
existing tactical-board editor. The independent authorized match read, explicit
analysis save, board state, import/export and dirty semantics remain unchanged.

Exact-size 1672×941, 1024×900 and 390×844 captures for both analysis and board
states are retained under
`apps/frontend/qa/match-detail-reference-2026-09-08/`; [QA](../../design-qa.md)
passes without actionable P0/P1/P2. The live browser switched between both tabs
without a write; the detected mobile hero overflow was corrected and 390px
document width now equals the viewport. No API/schema/data, migration, seed/reset,
deployment, commit or push occurred.

### Player operations slice — completed 2026-09-08

Players, Player 360, Squad and Attendance now use the approved white visual
system with existing photographic assets, real server/scope metrics and compact
player/plan surfaces. Server-side player search, cursor totals and histories,
dated assignment evidence, role/tenant visibility and attendance uncertain-save
handling remain unchanged.

Exact-size 1536×1024, 1024×900 and 390×844 captures for all four routes are
retained under
`apps/frontend/qa/player-operations-reference-2026-09-08/`;
[QA](../../design-qa.md) passes without actionable P0/P1/P2. All four 390px
documents match their viewport width. Browser QA was read-only; no assignment or
attendance write was triggered. No API/schema/data, migration, seed/reset,
deployment, commit or push occurred.

### Settings slice — completed 2026-09-08

Settings now uses the approved white visual system with the shared photographic
hero, four truthful account/workspace metrics and compact profile, active-context
and session-security surfaces. Persistent/temporary session messaging,
all-season versus missing-season semantics, awaited logout and error handling
remain unchanged.

Exact-size 1672×941, 1024×900 and 390×844 captures are retained under
`apps/frontend/qa/settings-reference-2026-09-08/`; [QA](../../design-qa.md)
passes without actionable P0/P1/P2 and the 390px document width equals the
viewport. No API/schema/data, migration, seed/reset, deployment, commit or push
occurred.

All page slices in the approved BL-048 reference sequence are complete. The next
work item is the separately planned product gap audit; it must not invent missing
health, scouting, analysis, reporting or aggregate contracts.

## Current architecture / inventory

This is a hybrid system, not an application without shadcn. `components.json`
uses new-york, CSS variables and Phosphor. Tailwind 4 is integrated through Vite;
there is no need to generate a Tailwind 3 configuration or rerun shadcn init.
Before this slice, root `styles.css` has 1,220 lines, route-imported `workspace.css`
has 1,507 lines. These counts include legacy rules and whitespace, not proven
dead CSS. Seventeen local UI primitive modules coexist with page-specific CSS.

| Current surface / evidence in apps/frontend/src                                            | Classification                    | Target and preservation rule                                                                                                             |
| ------------------------------------------------------------------------------------------ | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| styles.css :root and @theme, workspace.css literals                                        | MERGE                             | styles/tokens.css, semantic tokens and explicit legacy aliases; retain values before visual convergence                                  |
| components/ui/button.tsx                                                                   | KEEP                              | Existing CVA/Radix Slot API; semantic amber/destructive colors, no NGCSButton wrapper                                                    |
| ui/input.tsx, textarea.tsx                                                                 | KEEP                              | Semantic input surfaces; preserve native props, refs, validation and controlled state                                                    |
| ui/card.tsx, badge.tsx, alert.tsx, skeleton.tsx                                            | KEEP                              | Central surface/status tokens; keep current structure and density initially                                                              |
| ui/dialog.tsx, sheet.tsx                                                                   | KEEP                              | Radix focus/portal behavior; later standardize spacing/confirm patterns without bypassing dirty guards                                   |
| ui/dropdown-menu.tsx, select.tsx, tabs.tsx, tooltip.tsx                                    | KEEP                              | Existing Radix behaviors, semantic surfaces; no blanket package replacement                                                              |
| ui/avatar.tsx, separator.tsx, scroll-area.tsx, sonner.tsx                                  | KEEP                              | Existing small primitives/toasts; tune only against measured needs                                                                       |
| routes/login.tsx, accept-invitation.tsx, reset-password.tsx; account-completion-shell.tsx  | MIGRATE TO SHADCN                 | Input/Button/field patterns; retain minLength, required, autocomplete, token handling, errors and redirects                              |
| root.tsx bootstrap/error native actions                                                    | MIGRATE TO SHADCN                 | Shared Button/link and error state; session/bootstrap logic untouched                                                                    |
| workspace-scope-selector, assignment-catalog-select, plan-drill-picker, board phase select | REBUILD USING SHADCN PRIMITIVES   | Styled native select where native semantics fit; do not replace every select with Radix or change cursor/selection behavior              |
| repeated page-shell/page-header/page-actions in route modules                              | MERGE                             | PageContainer, PageHeader, PageActions with a small size/density API; pilot two pages before broad adoption                              |
| repeated page loading/alert/empty branches                                                 | MERGE                             | Small LoadingState/ErrorState/EmptyState patterns; retain retry boundaries and accessible announcements                                  |
| assignment-page-controls, catalog-controls and route-local pagination                      | MERGE                             | Shared visual pagination pattern while retaining distinct cursor/state ownership                                                         |
| routes/app-layout.tsx + ngcs-\* styles                                                     | REBUILD USING SHADCN PRIMITIVES   | Preserve existing routes, grouping, search, notifications and five mobile tasks; do not create scouting/analysis menus                   |
| training/match/drill cards, squad and Player 360 rows                                      | CUSTOM COMPONENT — KEEP AS CUSTOM | Football semantics composed with Card/Badge/Button; bounded reads, full totals and links unchanged                                       |
| tactical-board-editor.tsx, pitch rendering, layers/history/import/export                   | CUSTOM COMPONENT — KEEP AS CUSTOM | Konva stays custom; only surrounding controls migrate after editor regression gates                                                      |
| native date/datetime-local inputs                                                          | KEEP                              | Preserve local dates/timezone/min/max behavior initially; Calendar/Popover only if justified by an existing task                         |
| data tables/charts/accordions/complex sorting/column visibility                            | KEEP (absence)                    | No rendered table/chart framework found in current source; do not install TanStack Table/chart libraries for simple lists                |
| legacy .workspace-shell/.primary-nav/.day-row and .button style families                   | REMOVE (candidates only)          | Inventory references including dynamic class construction and error/public routes; delete only after all consumers migrate and QA passes |
| Konva element position/color properties in football canvas                                 | CUSTOM COMPONENT — KEEP AS CUSTOM | Data-driven domain rendering must not become a forced generic theme                                                                      |

Native form controls, CSS selectors, Tailwind utilities and Radix controls coexist.
Page structure is repeated in almost every route. Global selectors such as
`.page-header h1`, `.settings-grid h3` and `.dashboard-stat > div`
couple page markup to visual rules. Pagination components look similar but their
catalog/assignment request and cursor semantics differ: merge presentation only.

## Target design system

Keep owned shadcn/Radix primitives in `components/ui`, semantic CSS variables in
`styles/tokens.css`, repeated application patterns in `components/layout` or
`components/feedback` only when used by two or more real surfaces. Domain
components remain NGCS-specific and routes keep their orchestration/business logic.

Tokens cover background/foreground, cards/popovers, primary/secondary/muted/accent,
destructive, border/input/ring, sidebar and chart slots. Layout tokens describe
existing spacing, gutters, section/form gaps, widths, type families, radius and
elevation. Tailwind's spacing scale remains the base; do not create 20 wrappers
or arbitrary-value variants. Preserve source colors first, converge deliberately
per component later. Amber match emphasis is distinct from generic neutral states.

The old `--muted` is #617089 text, incompatible with shadcn's muted **surface**
contract. Its 33 CSS uses are all `color` declarations: rename these to an explicit
legacy text alias without changing their visual value, then expose muted surface.
Do not substitute foreground and background tokens blindly.

Before this slice, only a dark custom variant existed. Phase 1 adds an inactive
semantic dark palette, with no provider/toggle and no whole-app dark-mode claim.
Legacy rules still require migration and dark visual QA. Chart/table tokens stay
deferred to phase 5 because no corresponding rendered framework exists; chart
meaning and density must follow a real consumer, not invented analytics. Existing
Tailwind spacing/shadow scales remain in use. Form gaps, display typography and
page-specific elevations converge in the relevant later phases, not silently here.

## Sequence / first ten targets

| Phase               | Delivery / first targets                                                                                     | Exit gate                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| 1 — Foundation      | 1. token module and compatibility mapping                                                                    | No visible drift at matched viewports; CSS token tests, quality                                            |
| 2 — Core primitives | 2. Button/Badge; 3. Input/Textarea; 4. Card/Alert/Skeleton; 5. Dialog/Sheet; 6. Select/Dropdown/Tabs/Tooltip | Surface wiring begins with phase 1; interaction/focus/disabled/ref checks before full completion           |
| 3 — Shell/layout    | 7. PageContainer/Header/Actions with dashboard/settings pilot; 8. existing shell/scope/nav                   | Preserve routes, active states, responsive navigation, BL-045 labels and dirty scope transitions           |
| 4 — Forms/dialogs   | 9. login/completion then plan creation and assignment forms                                                  | Unchanged validation/error/busy/submission; keyboard/escape/focus-return; no real data writes in visual QA |
| 5 — Data display    | 10. pagination and shared empty/loading/error patterns, then football cards                                  | Cursor/full totals/retry/permission invariants; no unnecessary data-table framework                        |
| 6 — Modules         | Week, trainings/detail, library/tactics, matches/detail, squad/attendance, teams/players/detail              | Per-module functional and responsive gates; board last                                                     |
| 7 — Legacy cleanup  | Remove only proven unused styles/components/dependencies                                                     | Reference scan + dynamic-class review + build + visual regression; no broad delete                         |
| 8 — Consolidated QA | All routes, 1440/1024/390, keyboard and interaction states                                                   | Full quality + disposable browser/API suite as appropriate; record untested cases                          |

Phase 2 verification (2026-09-07): 12 new interaction/display tests; root quality
655/164 passed. Current local dropdown/tooltip/select/notification and tool-list
keyboard smoke passed. Existing native-control font inheritance versus asChild
links is measured and assigned to phase 3/4 consumer migration. Internal overflow
of long board lists remains phase 6/8 coverage; no full WCAG or dark-mode claim.

The user requested incremental implementation, so the first handoff must clearly
separate completed phase-1 work from remaining phases. No large-scale CSS cleanup,
new module, new backend/API, auth/state rewrite, validation framework, or vendor
dependency is included in the first slice. Additional architectural dependencies,
changed navigation destinations or business rules still need explicit approval.

Phase 3 pilot verification (2026-09-07): two page consumers use the shared
presentation layer; mobile avatar visibility/name and keyboard menu navigation
are fixed and verified. Eight additional tests; quality 655/172 and four packaging
tests passed. Native/asChild action typography converges inside PageActions only.
Two pages checked at 1440/1024/390; remaining shell/scope consumers and dirty-flow
visual coverage continue in phase 6/8. Next is phase 4 login/completion forms,
then plan creation and assignment forms. No whole-app migration completion claim.

## Risks and checks

Phase 4A verification (2026-09-07): shared field/error patterns and existing
Input/Button/PageActions on login, invitation and reset routes. Sixteen new
regressions, quality 655/188 and four packaging tests passed. Required, email,
autocomplete, 12-character minimum, token handling, mismatch, busy, retry and
redirect semantics are preserved. No account POST in browser QA. Invitation
matched before/after at three widths; login final responsive and reset mobile
checks have the evidence limits recorded in the [report](../30-quality/UI_ACCOUNT_FORMS_2026-09-07.md).
Phase 4B.1 training creation completed: shared fields/error, scoped footer type,
short-viewport scrolling; existing click-driven title/date gate, local-date ISO,
create/reload/navigation and draft retention preserved. Nine new tests, quality
655/197 and responsive keyboard verification passed. [Evidence](../30-quality/UI_PLAN_DIALOG_2026-09-07.md).
Phase 4B.2 sporting assignment completed: shared FormField, owned NativeSelect
and scoped footer, local height/scroll, removal of only orphaned assignment CSS.
Five mutation dispatches, catalog selection/pagination, required UTC date (no
existing min/max), toast failures, busy and reopen/reset remain unchanged.
Fifteen new tests, 24 targeted, quality 655/212 and matched responsive/short-screen
keyboard checks passed without an assignment POST.
[Evidence](../30-quality/UI_ASSIGNMENT_DIALOG_2026-09-07.md).
Phase 4 selected targets are closed; broader module forms continue in phase 6.
Phase 5A completed: shared PagePagination and EmptyState/LoadingState/ErrorState
on Players/Teams; AssignmentPageControls delegates presentation while retaining
its count/total and cursor adapter. Fourteen new tests, 26 targeted, quality
655/226 and matched responsive/browser empty-result checks passed.
[Evidence](../30-quality/UI_DATA_PATTERNS_2026-09-07.md).
Phase 5B completed: shared OptionPagination for workspace and assignment options.
Workspace cursor commits only on success; assignment cursor moves when requested
and stays on a failed page for retry. Both original policies, pinned selection,
labels, disabled gates and visibility stay in the adapters. Fifteen new tests,
39 targeted and quality 655/241 plus four Sites tests passed; matched responsive
checks and Escape focus return verified. [Evidence](../30-quality/UI_OPTION_PAGINATION_2026-09-07.md).
Phase 5C completed: presentation-only FootballCard composes training, match,
library and tactics cards. Existing links, boardless drill non-link behavior,
field semantics, totals, pagination and permissions remain route-owned. Four new
tests, 34 targeted and quality 655/245 plus responsive browser checks passed;
eight now-unreferenced card-only selector blocks were removed.
[Evidence](../30-quality/UI_FOOTBALL_CARDS_2026-09-07.md).
Phase 5 is complete. Week, Trainings/training detail, Library/Tactical Board/
editor and Match detail passed phase 6 presentation and responsive gates. Other
route-local pagers/data states continue in phase 6; the next slice is Players,
Player 360, Squad and Attendance.
No table/chart framework is justified by current consumers and none is added.

- CSS cascade: legacy unlayered styles can override Tailwind utilities. Preserve
  import order and compare computed styles; move selectors only with their consumers.
- `--muted` naming collision, hardcoded whites and amber shades: semantic wiring
  must retain current colors until a reviewed visual pass changes them.
- Radix replacing native controls can alter keyboard/form serialization/empty
  values/focus. Native selects are valid; keep behavior over component uniformity.
- Form DTO validation, disabled states, date/time and uncertain-save behavior are
  contracts, not styling opportunities.
- Responsive shell: desktop labels become icon-only at tablet widths; mobile
  relies on a Sheet. The initial missing user-menu name/hidden avatar was fixed
  in the phase 3 pilot; keyboard checks passed, not a full WCAG certification.
- Existing working tree contains substantial user work. No force push, reset,
  generated replacement project or unrelated reformatting.
- Visual scope of initial review: dashboard at three widths and new-plan dialog;
  other routes are source-inventoried, not claimed visually audited yet.
- Unknown design owner, formal WCAG/browser matrix, pilot capacity and production
  rollout remain TBD. BL-043/044/009/M4 remain open; migration does not approve them.

## References

Checked 2026-09-07: [shadcn theming](https://ui.shadcn.com/docs/theming),
[React Router installation](https://ui.shadcn.com/docs/installation/react-router),
[Native Select](https://ui.shadcn.com/docs/components/base/native-select).
Existing stack is retained; current CLI defaults are not used to overwrite the
repository's accepted design or installed dependency versions.
