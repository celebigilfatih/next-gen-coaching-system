# BL-043b — Bounded Team and Workspace Catalogs

- Date: 2026-09-06
- Scope: team-directory and workspace-catalog slice; BL-043 remains In progress.
- Verdict: Pass for this slice; full BL-043 is not closed.
- Authority: user's next-step request; within Accepted ADR-0022/0023 and
  REQ-014/015. No new schema, migration, dependency, vendor or role grant.

## Delivered behavior

The live shell now uses `GET /sporting/workspace/selection`. The optional three
requested scope IDs are individually checked against current permitted records,
not looked up in the first page. Response fields are selected `club`,
`clubSeason`, `team`, `teamSeason`, resolved `scope`, and three 25-record catalog
pages. Selected records are separate and nullable. The default season is latest
start date with ID tie-breaker; fallback club/team is ascending ID. Missing or
revoked requested IDs fall back only to visible records. `*` includes season-less
teams; an exact season only includes teams linked to that season in that club.

`/sporting/catalog/clubs`, `/sporting/catalog/seasons` and `/sporting/teams/page`
use ascending-ID keysets and `{ items, nextCursor, limit }`. Root reads take at
most limit + 1; responses contain at most limit (default 25, max 100). Teams carry
at most one season summary: the requested season or latest season, not complete
history. Name search is server-side case-insensitive substring search, with
literal `%`, `_` and backslash escaping. PostgreSQL collation applies; Turkish
case-folding is not guaranteed. No offset/global-count query is introduced.

Queries reject unknown fields, arrays, control characters, malformed limits,
IDs over 160 characters and search over 100. Season/team catalogs require
`clubId`; non-system foreign-club catalogs return 403. Tenant, current active
TEAM_VIEW team/club-wide grants and existing administrative bypasses are applied
inside each query. Actor team IDs are not materialised into an unbounded array.
The cursor is only an ID boundary, not an access credential. JWT/current account
state is checked by the existing guard. Catalogs are a live view, not a snapshot
transaction: concurrent writes/revocations can change subsequent results.

The shell replaces each option page rather than accumulating the entire catalog.
An off-page selected record is pinned separately, giving at most 26 record options
per select (season also has its synthetic all-seasons option). Next/previous
catalog navigation alone does not change workspace scope, reload business
resources or persist a new selection. Explicit selection still passes through
router dirty-navigation guards and is persisted only after revalidation.
Scope changes/reloads reset catalog page controls; stale responses are ignored.
Catalog errors preserve the prior page and can be retried with the page button.

The Teams route uses its own bounded 25-record page with debounced server search,
previous/next, distinct loading/error/empty states and retry. Club/season changes
reset traversal. A separate labelled button explicitly selects an off-page team
as the working team; opening its card still opens the existing dated roster.
Existing shadcn Button/Input/Card and navy/blue visual identity are retained.

## Verification evidence

- Root quality: 40 backend suites / 432 tests; 10 frontend files / 35 tests;
  typechecks, lint, format, backend/frontend builds, Sites 4/4, CDSK, Markdown
  links and whitespace passed again after the card-layout correction.
- New backend unit: 16 query/selection/bounded-projection/scope cases.
- New frontend coverage: two provider cases for pinned selection, unchanged
  resource requests/storage and stale catalog response after scope change; three
  Teams cases for paging/search, explicit selection, stale results and retry.
- Backend E2E: 4 suites / 31 tests pass. The new HTTP/PostgreSQL fixture has
  30 clubs, 149 teams, 40 seasons and 4,800 team-season links. It verifies
  off-first-page selected club/season/team, complete 119-team authorized traversal,
  season/club page boundaries, literal search, foreign scope, unassigned team,
  grant revocation, club-wide grant and season-less team semantics.
- Chromium: 8/8 passed with opt-in persistent sessions, 30 additional native teams,
  30 historical seasons and the existing 30-player paging fixture. The new case
  verifies 25/6 team pages, remote search, explicit second-page selection, pinned
  team/season options, unchanged scope during catalog paging and no horizontal
  overflow at 1440/1024/390 px. Existing coach, Player 360, session reload/logout
  and dirty-navigation flows remain green. The first run passed 7 existing cases
  but exposed a real card-height overlap preventing the
  new team-selection button from receiving a pointer click. The card link and
  selection button were placed in separate grid rows; the test retains a normal
  click (no forced click/workaround).
- All migration/fixture work targeted disposable `ngcs_bl043_catalog_e2e` on
  loopback PostgreSQL 16. Six migrations are current; schema diff is empty.
  The retained `ngcs_local_session_dev` had no reset, seed, migration or business
  write. Its baseline business fingerprints match 24 tables / 25 rows;
  session/audit lifecycle tables are excluded from this comparison.
  After confirming zero active connections, the disposable test database was
  removed. Its synthetic records are reproducible with the repository test/seed
  scripts; no retained data was deleted.
- The retained local app was refreshed after an intermediate hot-reload error;
  its existing session recovered. Its one visible team, bounded controls and
  mobile card were inspected without business writes. `/app/teams` is left open
  on port 3001; the retained backend remains on 4000.

## Local measurement, not a pilot SLO

The dedicated `test/workspace-catalog.e2e-spec.ts` measures the selected
off-page coach workspace over 20 warm sequential HTTP calls and counts Prisma
query events without logging SQL, parameters or credentials.

| Run | p50 | p95 | Max SQL queries/request | Selection JSON |
| --- | --- | --- | --- | --- |
| Focused | 9.56 ms | 11.30 ms | 12 | 18,621 bytes |
| Full API suite | 11.14 ms | 14.68 ms | 12 | 18,621 bytes |

The test asserts bounded cardinality and a 20-query ceiling for this locked
implementation. Query count is not rows scanned; these measurements are not
cold-start, concurrent-load, index-plan or production capacity evidence. Payload
bytes depend on actual field lengths. This synthetic volume and 25/100 bounds
are engineering choices, not invented pilot requirements. Pilot volume,
concurrency, latency target, performance owner and production SLO remain TBD.

## Remaining work and rollback

BL-043c is next: dated roster and Player 360 assignment-history pagination without
silently truncating history or breaking counters. The preserved compatibility
array APIs (`/sporting/workspace`, `/sporting/teams`, `/sporting/players`), legacy
groups/seasons metadata, the Player 360 assignment-dialog team list, reconciliation
internals and business-resource lists are not all bounded by this delivery.
Do not mark BL-043 complete or claim the entire workspace has constant cost.

Subsequent delivery: BL-043c is now completed in the
[dated roster/history report](BL043_ASSIGNMENT_PAGINATION_2026-09-06.md).
The measurements above remain this catalog slice's historical evidence.

No new data rollback is necessary. Revert this slice's UI/provider together to
the preserved workspace/team array clients and remove the additive endpoints
only after their callers are reverted. That restores previous unbounded behavior,
not production scalability. Retained DB and earlier accepted migrations remain
untouched. BL-044 privacy/minor policy, BL-045 all-seasons labels and M4 rollout
remain separate work/approval gates.
