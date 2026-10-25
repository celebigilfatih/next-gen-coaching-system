# Guided club setup and branding — 2026-10-19

## Authorization and scope

User explicitly approved five steps in the existing design system, optional
technical staff, separate account invitations, then logo/colors/derived theme.
The exact two-nullable-color migration received separate explicit local approval.
ADR-0037/0038 Accepted; CR-027, REQ-026, BL-060 implemented. No production,
new vendor/service, player seed, automatic sample staff or invitation rollout.

## Delivered behavior and files

- Frontend `/app/setup`: club/logo/two colors → season → first team/academy →
  optional staff → review. Draft/back/errors/dirty confirmation, single final
  write, explicit retry/status recovery and scope navigation are implemented.
  Settings and admin empty-state link to setup. Existing-club branding editing
  is not part of this new-club flow.
- `apps/frontend/src/routes/club-setup.tsx`, `lib/club-setup.ts`,
  `lib/club-branding.ts`, `lib/use-club-theme.ts`, setup/branding CSS and tests;
  route/API/shell/dashboard/settings integration. Existing white shadcn/Radix,
  native controls and typography are reused; no dependency change.
- `apps/backend/src/sporting/club-setup.{controller,service}.ts`, strict nested
  DTO/branding validators, module registration, selected-club catalog projection
  and `test/club-setup.e2e-spec.ts`. Serializable legacy adapters preserve
  canonical/legacy parity; current ACTIVE SYSTEM_ADMIN is rechecked under lock.
- Request UUID + actor + version deterministically identifies club/audit;
  transaction advisory lock and serialization retries handle simultaneous POSTs.
  Actual first-team audit anchors normalized body hash/minimal result. Same body
  replays unchanged; changed body or missing/inconsistent marker is 409. GET
  status is actor-bound/no-store; another admin cannot retrieve that result.
- No Person list/logo payload in audit, localStorage or query string. Staff rows
  create Person/StaffProfile and dated STAFF assignments, never accounts,
  GroupMember, invitations or capability grants. Same-name people stay distinct.
- PNG/JPEG/WebP input <=2MiB, local max512px preparation, final <=48KiB raster;
  backend independently checks MIME/magic/canonical base64/size. No SVG/remote
  upload service. Existing 100KiB request limit stays; client checks final bytes.
- Primary/secondary colors derive buttons, links, surfaces and selected navigation.
  Black/white foreground and white-surface link contrast >=4.5:1 are tested.
  Scope/logout cleans overrides; absent colors retain default. Semantic status,
  field, shirt and equipment colors remain domain-specific.

## Database rollout and retained-data evidence

Migration `20261019000000_add_club_brand_colors` adds only nullable VARCHAR(7)
primaryColor/secondaryColor with hex constraints; existing logo is reused.
Empty dedicated PostgreSQL16 migration/status/schema-diff and repeat deployment
passed. Retained snapshot was privately backed up to
`%LOCALAPPDATA%/NGCS/backups/before-branding-20261019.dump`, restored into separate
`ngcs_branding_restore_test`, migrated and verified before requesting approval.

After explicit user approval, only this exact migration was applied to retained
`ngcs_local_session_dev` (12 total applied). Backend was stopped briefly for
Windows Prisma engine regeneration and restarted; ordinary sign-in passed.
No reset, seed or new retained club/person/account/grant was performed.

Final read-only aggregate-digest comparison with restored pre-rollout business
data passed, including timestamps, across Club, User, ClubSeason, Team,
TeamSeason, PlayerGroup, Season, Person, StaffProfile, SportingAssignment,
FunctionalRole, RoleCapability, GroupMember, Match and TrainingPlan.
Counts remain: 1 club, 1 account, 10 teams/team-seasons/groups/legacy seasons,
1 ClubSeason, 30 people/staff/assignments, 3 roles, 0 grants/members, 36 matches,
0 training plans. Old colors remain null. No private values/digests are recorded.

Concurrent work independently adds PlanDrill.contentSnapshot/ADR-0039 and its
migration; it is outside this approval and was not deployed by this task. A
blanket migrate deploy is therefore inappropriate. The 12-migration statement
is this task's observed approved branding rollout, not a claim that later
concurrent repository migrations have also been applied.

## Automated verification

- DTO: 16/16; malformed dates, key/name duplication, team references, bounds,
  extra fields, colors, raster types/base64/size and nested allowlists.
- Dedicated real PostgreSQL HTTP: 6/6. Role/anonymous denials; all projections
  and account-free distinct same-name staff; service recreation replay with
  unchanged timestamps; changed body conflict; four concurrent requests produce
  one club; injected late audit failure rolls back every earlier write; foreign,
  malformed and oversized 413 requests create nothing. Latest rerun passed.
  The deliberately injected failure logs fixed `CLUB_SETUP_FAILED` only.
- Frontend wizard/branding focused: 17/17; final write, back/draft/errors,
  optional staff, roles/no invitation fields, exact retry, reload lookup,
  missing-result same-ID reentry, dirty navigation and contrast/theme reset.
- Full backend: 58 suites / 859 tests passed before concurrent plan changes;
  typecheck, lint and build:check passed in that verification.
- Final full frontend run: 57 files / 465 tests passed in 293 seconds. Earlier
  duplicate-header label regression was fixed by retaining the NGCS shell brand;
  layout/season/wizard targeted rerun 21/21 also passed.
- Frontend typecheck/lint/build and 4 Sites tests passed before the concurrent
  library rewrite. A later attempt observed that file mid-write (expected `}`
  at EOF), so its build and Sites packaging failed then. Final production build,
  4/4 Sites tests, scoped wizard frontend lint/format and backend typecheck,
  scoped lint/format/build passed. Final global frontend typecheck still reports
  concurrent `src/components/add-drill-to-plan-dialog.tsx:78`: `page.data.total`
  does not exist on TrainingPlanCatalogPage (its total is under summary). This
  independent in-progress file was preserved; no final global typecheck pass
  is claimed. Initial backend rerun saw concurrent Prisma client regeneration
  in progress; after generation, all six wizard HTTP tests passed again.
- Unmodified CRLF files fail raw LF Prettier policy; EOL-auto workspace checks
  passed before concurrent edits. Changed wizard source is formatted explicitly.
- Root `quality` was actually attempted and stops at Windows `spawnSync npm
  ENOENT`. External `../cdsk/scripts/validate_project.py` is absent. Neither is
  claimed as passed. BL-061 tracks runner/checkout/validator portability.

## Browser verification

Separate disposable DB `ngcs_club_setup_wizard_test`, API4010/frontend3134:
actual logo file preparation, two changed colors, season/A Takım/U8/U16 and one
technical assignment were entered and created through the UI. Final result
reports three teams/one staff. Reload retrieves the same completed result;
workspace transition displays the saved logo/colors. DOM confirms loaded logo,
expected primary/secondary variables and no horizontal overflow. No retained
Spor Manage data was used as browser-write fixtures.

1440x1024 desktop, 1024x900 tablet and 390x844 mobile checks passed. First-step
focus keeps page header visible; later step focus follows the heading. White
primary buttons retain an inset boundary. Source screenshots are local ignored
artifacts under `output/playwright/club-setup/`: `mobile-review.jpg`,
`tablet-review.jpg`, `saved-club-theme.jpg`, `wizard-ready-desktop.jpg`.

Canonical retained session was signed in normally after the backend restart;
Ayarlar → Yeni kulüp kur reaches the empty first step at
`http://localhost:3132/app/setup`, with existing Spor Manage scope preserved.
No second retained club was created. Viewport override was reset.

Final Markdown links: 149 files, zero broken local links; git diff --check passed.
QA-only API4010/frontend3134 processes were stopped; canonical servers remain.

## Decisions, limitations and next step

No commit/push was requested for this increment. Production rollout, existing
club branding edit, general person/account linking and next-season workflows
remain separate work. Preserve durable audit markers if retention changes.
Next: user reviews the ready wizard; resolve BL-061 independently. Do not deploy
other concurrent migrations under this branding approval.
