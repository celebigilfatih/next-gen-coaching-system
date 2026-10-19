# Spor Manage local setup — 2026-10-19

## Authorization and boundary

The user requested Spor Manage, season 2026-2027, U8 through U16 teams, a sample
fixture and sample technical staff assignments. The latter two were explicitly
confirmed. Target is the Windows local `ngcs_local_session_dev` database in
`ngcs-postgres`, loopback port 5433. No production or other-machine restore.

This is operator maintenance on existing models. The proposed product wizard
remains [ADR-0037 Proposed](../50-decisions/ADR-0037-guided-club-setup.md).

## Sources and synthetic data

Verified on 2026-10-19:

- [TFF season planning](https://www.tff.org/Default.aspx?ftxtId=50517&pageId=200):
  opening window 14–17 August 2026; season ends 23 May 2027. The local season
  uses inclusive calendar dates 14 August 2026–23 May 2027 in Europe/Istanbul.
- [TFF fixture and clubs](https://www.tff.org/Default.aspx?pageId=198): the 18
  actual opponent names are used as readable Match.opponent values, not as
  additional internal clubs or Spor Manage academy teams.

Spor Manage's 36 fixtures are synthetic: each of those 18 opponents appears
twice, once home and once away. Sundays at 16:00 Europe/Istanbul run from
16 August 2026 to 23 May 2027, with a synthetic winter/rest calendar. These are
not the 34 official league rounds or official kickoffs. Competition and notes
explicitly say “Örnek”; no real results, formations or participation are assumed.
No academy fixture was invented from the senior league schedule.

All 30 staff names are synthetic and visibly end in “(Örnek)”. Their profile
titles also identify the example team/task. No birth date, contact, login,
invitation, access membership or capability grant is created. Each of the ten
teams gets a head coach, assistant coach and goalkeeper coach, valid for the
season. Assignment end is the exclusive next local midnight, 24 May 2027.
No player roster or drill content was added.

## Implementation and verification

- [Guarded fixture](../../apps/backend/scripts/setup-spor-manage-local.js):
  dry-run default, exact loopback/database allowlist, active SYSTEM_ADMIN
  operator, deterministic fixture IDs, shared legacy mapping helpers and
  Serializable transaction/advisory lock. Reruns preserve existing values and
  timestamps; conflicting edits cause failure rather than overwrite/reset.
- [Verification tests](../../apps/backend/scripts/setup-spor-manage-local.test.js):
  2/2 passed, including disposable PostgreSQL application, unchanged replay,
  no-write dry run and late-conflict rollback of an earlier attempted write.
  The dedicated `ngcs_spor_manage_setup_test` database was created for this run;
  retained data was not used for fault injection.
- Retained apply produced 1 club, 10 PlayerGroups/Teams, 1 ClubSeason,
  10 legacy Seasons/TeamSeasons, 3 empty-grant FunctionalRoles, 30 Persons/
  StaffProfiles/STAFF assignments, 36 matches and 40 audit events. A second
  retained run returned `created: {}`.
- Retained repeatable-read verification returns `IN_SYNC` with all five parity
  discrepancy counts zero: 10 teams, 30 staff, 36 matches/18 distinct opponents,
  zero capability grants, one unchanged login account and zero player profiles.
- Browser administrator login selects Spor Manage / 2026-2027 / A Takım.
  Dashboard shows 36 matches and zero players/training/drills; Academy shows
  all nine U8–U16 teams. U8 detail shows its three example staff assignments;
  Matches shows the 36-record total and explicit sample competition/notes.
- No Prisma schema, migration, dependency, frontend or serving API change.
  Persistent-session and tactical V2 flags remain off. Full root quality was
  not repeated for this bounded maintenance script; syntax, focused PostgreSQL
  tests, docs links and whitespace are the applicable checks.

The source script requires the current compiled backend mapping helpers and an
operator email supplied through process environment. Neither credentials nor
the operator's email are stored in this evidence file. See the
[runbook](../40-operations/RUNBOOK.md) for execution controls.
