# Season club program — 2026-10-19

## Request and delivered behavior

The subsequent explicit user request extends the existing structure throughout
Spor Manage2026-2027:14 August2026–23 May2027, including past weeks,41 Monday–Sunday
weeks/410 team-week slots for A Takım/U8–U16. ADR-0040's approved extension uses the
existing service through a guarded local operator. No model, migration, new API,
external service, account, invitation, player, clinical record or measured
performance was introduced. All generated content remains editable example CLUB
content, separate from global publication.

BALANCED_WEEK_V2 bases opponent preparation on stored fixtures, including the
following week's context. Kickoff drives match-day activation/meeting; prior-match
recovery and lighter match-adjacent days remain. Fixture-free breaks use development,
Saturday reflection and Sunday rest, with no invented opponent preparation.
The36 existing matches remain explicitly examples; no academy fixture is created.
Saved plans need coach review if fixtures subsequently change; no background
rescheduling is introduced.

U8/U9 have three weekly sessions; U10–U12 four; U13/U14 five; U15/U16 six, including
Tuesday18:45 technical work. Weekdays start17:00 or later, Saturday10:00. Exact-age
durations and four-phase instructional examples follow the approved template.
No school holiday calendar or actual venue/staff resource allocation is asserted.
Partial boundary weeks are clipped before overrides; edits moved outside the
season still conflict. The existing19–25 October week is skipped and preserved.

All unapplied weeks preflight before the first write. Each week commits atomically
for selected teams; interruption may leave completed weeks. Stable request IDs and
existing slot markers resume without duplicates. Conflicting manual records or
two-match weeks block preflight for review. Existing records are never rebuilt or
updated. Old user-edited sessions may legitimately have more than four phases;
structural checks apply only to the operator's new plans.

## Backup, rehearsal and retained result

Fresh private backup before writes:
`%LOCALAPPDATA%/NGCS/backups/before-season-program-20261019.dump`.
Successfully restored to separate `ngcs_season_program_restore_test` on local
PostgreSQL16. No migration needed;14 applied migrations remain.

Dry-run:41 weeks,10 skipped team-weeks,400 new team-weeks,3539 new events:
2009 physical sessions,504 meetings,1026 rest entries. Snapshots prove zero dry-run
writes. Restored application completed all40 missing weeks. Final verification
initially overconstrained an existing six-phase edited session; corrected to
validate generated plans only. A rerun used durable markers and validated all2009
new plans. Independent cross-database comparison verified all1963 original rows
across44 tables against retained data, including the original edited session.

Retained preflight matched rehearsal; application completed with the same additions.
All1963 original rows across44 tables remain identical as PostgreSQL JSON row hashes;
non-planning tables have unchanged counts. Private values/hashes are never logged.
Accounts, staff/assignments,36 matches, published starter content, tactical pilot,
branding and old user edits are preserved. Retained replay skips410 slots, adds zero
and leaves all24413 resulting rows unchanged.

New physical sessions have8036 phases/exercises. Every new plan has four phases,
summed duration, correct exact age/CLUB scope, one day link and valid season dates;
all new academy weekday sessions satisfy the after-school rule. Final2060 physical
plans/8242 PlanDrills include the untouched six-phase edit. Final3629 DayPlans,
517 meetings,1052 rest records,410 season-relative WeekPlans;36 identical matches.

| Team | Final physical sessions | Planned minutes |
| --- | ---: | ---: |
| A Takım | 444 | 23271 |
| U8 | 121 | 7260 |
| U9 | 121 | 7260 |
| U10 | 162 | 11535 |
| U11 | 162 | 11535 |
| U12 | 162 | 11535 |
| U13 | 202 | 15340 |
| U14 | 202 | 15340 |
| U15 | 242 | 18565 |
| U16 | 242 | 18565 |

These are planned minutes, never measured completed workload/attendance.

## Verification

- Full backend61 suites/893 tests, both backend builds, typecheck and lint pass.
- Dedicated PostgreSQL HTTP8/8 pass, including new partial first/last week clipping
  and rejected out-of-season override. Initial parallel run hit the default5-second
  test budget in two ten-team cases; explicit30-second suite budget passes normally.
  Service transaction timeout unchanged. Intentional fault prints WEEK_PLANNING_FAILED.
- Operator4/4: exact target/production guards, inclusive41-week enumeration,
  stable selection-bound UUIDs and detection of altered original rows. Scoped
  Prettier passes. A later pnpm wrapper hit a Node allocation failure; direct
  local ESLint/TypeScript passed without source changes.
- Actual authenticated canonical browser verifies partial14–16 August, final
  17–23 May A Takım/Göztepe week, U8 after-school/Saturday, U16 Tuesday18:45,
  December fixture-free break and new26 October–1 November A Takım/Eyüpspor week.
  Existing121-minute edited session is retained. No frontend source changed or
  full frontend suite rerun in this extension.
- API4000 rebuilt/restarted, ignored environment/flags preserved. UI3132 remains
  on newly populated A Takım26 October week. A concurrent frontend reload required
  normal login again; the populated week and Eyüpspor fixture reopened successfully.
  Screenshot in ignored
  `output/playwright/week-planning/season-retained-week.jpg`.
- Root Windows npm/CDSK tooling remains the documented BL-061 limitation; no
  new root-gate pass claimed. Production excluded; no commit/push requested.

Operator `apps/backend/scripts/apply-spor-manage-season.js` defaults to dry-run.
Only exact loopback5433 retained/restore targets; existing active SYSTEM_ADMIN
email supplied through environment. Writes require `--apply` plus
NGCS_APPLY_SEASON_PROGRAM=true. Run backend build:check first.
[Runbook](../40-operations/RUNBOOK.md),
[ADR-0040](../50-decisions/ADR-0040-weekly-club-program.md).
