# Weekly club program — 2026-10-19

## Approval and delivered behavior

The user explicitly requested implementation of the complete proposed plan:
Spor Manage / 2026-2027 / all ten teams /19–25 October2026; balanced development,
age-specific frequency and after-school academy hours; match-relative senior
sessions; four phases with original exercise instructions; meetings and rest;
editable preview and subsequent approved local application. ADR-0040 Accepted,
CR-029/REQ-028/BL-063 implemented. No additional approval was inferred for unrelated
work, production, accounts, players, global publication or clinical/measurement data.

Week keeps existing team/season controls and white design system. It shows one
chronological paginated stream per day, with complete server totals, independent
cursor/retry and scope/week stale-response guards. Linked DayPlan never duplicates
TrainingPlan. Dates without a concrete season mapping do not widen to all seasons;
explicit all-seasons reading remains available. Meeting/rest minutes are excluded
from physical totals. Training/match cards open existing detail routes.

Manual events support training/recovery/tactical, meeting agenda/location and rest.
Physical sessions have real four-phase plans and team/age-specific CLUB exercises;
meeting/rest is only DayPlan. Edits/deletes preserve the existing training lifecycle;
nonlinked day edits keep type/season immutable. Permanent delete uses an explicit
confirmation Dialog. Private GORUSME entries are excluded from the shared calendar.

Program preview includes team choices, fixture context, editable times/excluded
rows, expandable phase instructions and conflicts. Teams collapse independently;
submit controls stay outside the scrolling preview. Preview performs no business
writes. Apply regenerates the server-owned template, checks the current ACTIVE
actor and each season, locks team/week targets and writes all selected records in
one Serializable transaction. Two-or-more-match weeks require manual scheduling.

## Durable recovery and compatibility

Only SecurityAuditAction.WEEK_PLANNING_APPLIED was added. Actor/request-bound audit
anchors normalized hash and minimal result IDs/counts; per-season/week marker
blocks new-request reapplication. Same request replays without writes; changed
body, changed calendar, overlap and duplicate program return409. URL stores only
planningRequest UUID. An uncertain submission preserves its input for identical
retry/status; reload only queries the result. Missing-result edits retain the ID.
Opening a fresh manual form while a request is pending redirects to recovery.

Calendar stays Monday–Sunday; WeekPlan numbers remain season-start-relative.
Only the two needed persisted weeks per team were created, with inclusive last
local-day boundaries. Template dates use Turkey +03:00. Existing API read/write
roles and100KiB body limit remain; apply payload sends selections/overrides, not
all generated instructions. Phase instructions are original PlanDrill.notes;
blank valid V1 boards are placeholders, not fabricated tactical diagrams. No
new DrillVersion, reviewer or publication approval is created by this program.

## Initial retained result

| Team age | Physical sessions | Planned physical minutes |
| --- | ---: | ---: |
| SENIOR | 11 | 565 |
| U8 | 3 | 180 |
| U9 | 3 | 180 |
| U10 | 4 | 285 |
| U11 | 4 | 285 |
| U12 | 4 | 285 |
| U13 | 5 | 380 |
| U14 | 5 | 380 |
| U15 | 6 | 460 |
| U16 | 6 | 460 |
| Total | 51 | 3460 |

There are204 phases/exercises,13 meetings and26 rest rows:90 DayPlans across20
WeekPlans. Physical rows are50 TRAINING plus1 RECOVERY; every phase sum equals its
plan duration and each plan has exactly one DayPlan link. A Takım retains the
existing sample25 October16:00 Beşiktaş match, with prior-match recovery and
normal-day10:00/16:00 double sessions. Academy has no fabricated match: Saturday
development games and short reflections are sessions/meetings. U15/U16 have the
additional Tuesday18:45 technical block; small ages use play-focused instructions.
All created content is visibly an original example club program, not measured
training performance or globally expert-approved content.

## Database rehearsal and rollout

- Dedicated `ngcs_week_planning_test`: clean PostgreSQL16 deployment of14 tracked
  migrations passed. It is the exact loopback-only target accepted by HTTP tests;
  random fixture IDs isolate runs without retained reset.
- Private pre-rollout backup:
  `%LOCALAPPDATA%/NGCS/backups/before-week-planning-20261019.dump`. Restored into
  separate `ngcs_week_planning_restore_test`; only the weekly enum remained
  pending there. Deployment and empty full-schema diff passed.
- ADR-0039 contentSnapshot had already been separately approved/applied by the
  concurrent work. This task inspected the actual retained diff and deployed only
  `20261019020000_add_week_planning_audit`, from an ignored staging copy of13
  already-applied migrations plus that exact file. Retained status now14/current;
  full Prisma live-schema diff is empty. No blanket unrelated migration rollout.
- Guarded operator `apps/backend/scripts/apply-spor-manage-week.js` calls the same
  product service, defaults to dry run and accepts only exact loopback local/restore
  targets plus an existing active admin. Apply additionally requires CLI/process
  opt-in. Retained dry run reported10/51/13/90; apply reported the same with36
  preserved matches/204 phases. Re-run returned unchanged-replay with no writes.
- Full-row aggregate digest comparison against restored data passed across14
  protected tables: Club, User, ClubSeason, Team, TeamSeason, PlayerGroup, Season,
  Person, StaffProfile, SportingAssignment, FunctionalRole, RoleCapability,
  GroupMember and Match. Counts remain1 club,1 user,10 teams,30 staff people,
  0 grants/members and36 matches. Private values/digests are not written here.
- Independent global starter import/publication/ADR-0041 and tactical activation
  continued concurrently; their files/flags/decisions were preserved. They are
  not this program's source or a general review exception. Existing fixture
  records and account/staff rows remain unchanged.

## Automated verification

- 21 pure template/input tests: every exact age's frequency/school hours, senior
  recovery/double sessions/match-day activation, four-phase positive duration
  totals, explicit instructions, unsupported ages/congested weeks and strict DTOs.
- 7 real PostgreSQL/HTTP tests: role/cross-club denials; coach assignment revoked
  between preview/apply; manual recovery phases/private meeting exclusion;
  no-write preview; all-ten-team atomic apply; four concurrent identical requests;
  restart replay and changed-payload conflict; unchanged fixtures/accounts;
  chronological cursor/full summaries; stale calendar and overlap rejection;
  injected final audit failure with complete rollback; meeting CRUD and type guard.
  Expected fault logs only fixed WEEK_PLANNING_FAILED. Final rerun7/7 passed.
- Frontend focused16 tests including existing date helpers; final affected route/
  dialog rerun14/14. Covers local day/cursor/totals, late response/scope changes,
  missing season, role-only controls, preview edits/conflicts/no early writes,
  frozen identical retry, URL reload lookup, meeting payload, derived physical
  duration and explicit/nonoptimistic delete failure.
- Full backend61 suites/890 tests passed. Full frontend59 files/478 tests passed.
  Final typechecks/lints pass; backend normal+quality builds, frontend production
  build and4 Sites tests pass. Final minor guards received focused reruns.
- Root quality was actually attempted and fails at unchanged Windows spawnSync npm
  ENOENT. CDSK check was actually attempted and reports external validator absent.
  BL-061 remains open; neither root gate is claimed as passed. Workspace commands
  use pnpm-provided npm. Checkout CRLF formatting is checked separately with EOL-auto;
  source changes are explicitly formatted, without mass-normalizing old files.
  Final complete backend/frontend EOL-auto format checks passed;157 Markdown files
  have zero broken local links, and git diff --check passed.
- Prisma generate updated client types but the standard Windows engine copy hit
  EPERM because another task's QA API held the unchanged DLL. No unrelated process
  was killed. The generated client and existing same-version engine passed all
  HTTP/build/runtime checks; this is not a successful standard generate claim.

## Browser verification

Actual authenticated UI-to-API-to-restored-PostgreSQL flow used API4013/UI3135.
Selected all ten teams, reviewed phase instructions, applied90 rows, reloaded the
same result, then opened the filled week. Created a separate TEST meeting, edited
its agenda and opened/cancelled its delete confirmation; no retained QA meeting
was created. Permanent-delete success/failure is covered in HTTP/frontend tests.

Verified senior double sessions, meeting agenda/time order and the existing Sunday
match. Switching to U8 showed only its three physical sessions at17:00 weekdays,
Saturday10:00 and5-minute reflection. Opened U8 training detail:60 minutes, four
actual phases, exact-age original instructions and no fabricated player attendance.

Desktop1440x1024, tablet1024x900 and mobile390x844 DOM checks found no horizontal
overflow. Ignored screenshot artifacts are under `output/playwright/week-planning/`:
`desktop.jpg`, `mobile.jpg`, `mobile-u8.jpg`, `tablet-u8.jpg`, and actual retained
`retained-week-desktop.jpg`. Viewport override reset; temporary QA tab/API/UI closed.
Canonical API4000 was rebuilt/restarted preserving the ignored tactical flag;
ordinary admin login and actual3132 filled-week reads passed. Canonical week is
left open with A Takım selected; no credentials are stored in repository/docs.

## Source context and remaining limits

[England Football planning](https://learn.englandfootball.com/articles-and-resources/coaching/resources/2024/How-coaches-can-plan-for-the-football-season)
supports matching sessions to age, development needs and match purpose.
[FIFA microcycle context](https://www.fifatrainingcentre.com/en/environment/expert-knowledge/david-aznar-on-planning-the-microcycle.php)
frames preparation around matches. The concrete timetable and original exercise
text are this user-approved example, not a federation prescription or imported
copyrighted session pack. Coaches can edit it to fit actual players/resources.

No commit/push or production rollout was requested. Future weeks are prepared
explicitly through preview/apply; no whole-season backfill or automatic reflow of
existing programs. Two-plus-match weeks remain manual. Resource/pitch allocation,
individual load/health, private interviews and notifications are outside this slice.
Next: use the populated week and prepare the following week through the new flow;
resolve BL-061 tooling independently.
