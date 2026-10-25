# BL-043c — Dated Roster and Player History Pagination

- Date: 2026-09-06
- Scope: dated roster and Player 360 assignment pages; full BL-043 remains open.
- Verdict: Pass for this slice.
- Authority: user's next-step approval within Accepted ADR-0022/0023 and
  REQ-014/015. No new role grant, dependency, schema or migration decision.

## Contract and implementation

Two additive authenticated GET endpoints preserve the existing full-array APIs:

| Endpoint | Response addition | Existing array endpoint retained |
| --- | --- | --- |
| `/sporting/teams/:teamId/roster/page` | `page: { limit, nextCursor, total, playerAssignments, staffAssignments }` | `/sporting/teams/:teamId/roster` |
| `/sporting/players/:personId/assignments/page` | `assignmentPage: { limit, nextCursor, total, activeCount, historyVisible }` alongside bounded assignments and existing profile/evidence fields | `/sporting/players/:personId` |

Both require explicit `asOf` as a valid timestamp with timezone. Optional `limit`
is a decimal string 1–100, default 25; optional `after` is a base64url JSON cursor
containing only `id` and `validFrom`. Cursor input is at most 512 characters,
decoded IDs at most 160; dates must be valid offset-bearing ISO timestamps.
Unknown/repeated/array fields and malformed dates/cursors/limits return 400.
Roster also accepts `teamSeasonId` (max 160), validated against the same team and
club. Cursor boundaries are not credentials and do not expand the resource scope.

Order is newest `validFrom` first with descending ID as deterministic tie-breaker,
not roster alphabetical order. Queries fetch at most limit + 1 assignments and
return at most limit; there is no offset or full-list fetch followed by slicing.
The roster's team header omits the previously unbounded nested season catalog.
The UI uses 25-record pages, replaces rather than accumulates rows, resets on
resource/date/season changes, rejects stale responses and distinguishes failures
from empty data with retry. Previous-page navigation remains available after a
failed continuation. Date changes preserve other URL scope parameters.

The date picker retains the existing noon-UTC date interpretation. Both clients
send that explicit instant on every page; this delivery does not introduce a new
timezone policy. Roster validity is `validFrom <= asOf < validTo` (null end means
open). Authorized history includes all starts up to asOf, never future starts.
Without history capability, only assignments active at asOf are returned and the
UI explicitly labels this restricted view.

Full totals are separate database counts using the same resource/date/visibility
filters, never the length of the displayed page. Roster counts retain the former
assignment-based semantics: a person with two assignments counts twice, and a
dual-profile assignment can contribute to both player and staff counters. Labels
now explicitly say player/staff **assignments**; section badges say **this page**.
Player 360's active count covers all active assignments even when the displayed
history page contains only ended records. Counts and rows are live reads, not an
atomic snapshot or frozen traversal; concurrent writes can change totals/pages.

## Authorization and bounded reads

The existing TEAM_VIEW and PLAYER_VIEW/PLAYER_HISTORY_VIEW/AVAILABILITY_VIEW
rules remain unchanged, including administrative and own-account exceptions.
Current actor grants are checked on every request; historical asOf controls the
target's membership, never resurrects the actor's expired permission.

`assertPersonCapability` now checks common-team membership using relational
existence instead of loading every target assignment and constructing an ID
array. Club-wide grants and target membership at asOf have the same semantics.
This optimization also serves retained legacy endpoints; the full API regression
suite verifies existing behavior. Capability denial precedes page/count reads.

No clinical projection, guessed score, new grant or retained business-data write
was introduced. Player 360 availability remains a one-record permitted summary.

## Verification

- Root quality passed: 41 backend suites / 456 tests, 11 frontend files / 41
  tests, both typechecks, lint, format, builds, Sites 4/4, CDSK, Markdown and
  whitespace checks. The new unit coverage is 24 backend and 6 frontend cases.
  The final frontend regression distinguishes an empty continuation from absent
  history and verifies previous-page recovery without losing the full total.
- PostgreSQL HTTP E2E: all 4 suites / 32 tests pass. The expanded isolated
  player fixture traverses 3,001 active roster assignments and 603 visible
  history assignments without duplicates or missing records. Coverage includes
  equal-date ID ties, page-independent totals, exact start/end cutoff, future
  exclusion, team-season validation, unassigned/foreign team denial, player
  self-only access, missing history capability and current-grant revocation for
  past-date requests. Legacy Player 360 still returns all 603 rows with no page
  envelope.
- Chromium: all 9 tests passed, including dated roster pages (25/8 of 33), Player
  history pages (25/6 of 31), unchanged active count, date-reset/empty states and
  1440/1024/390 px overflow checks. Existing coach, catalog, session and dirty-board
  scenarios pass. Initial run had 8 passing tests and one existing
  cross-tenant test whose second login hit the real 5/minute throttle (429).
  Its test caller now honors bounded `Retry-After`, as the existing UI login
  helper already does. The application throttle is unchanged.
  A second run exposed the existing login helper waiting indefinitely for
  `networkidle` while the rendered login form was ready. Readiness now checks
  the usable login button instead; the final run is not overlapped with builds.
- All fixture writes ran only on disposable `ngcs_bl043_history_e2e`, loopback
  PostgreSQL 16, with explicit destructive-test opt-in. Six existing migrations
  deployed; no new migration was added. Retained business fingerprints match
  24 tables / 25 rows from the controlled-rollout baseline, excluding normal
  session/audit lifecycle tables. No retained reset/seed/migration was run.
  Migration status was current and schema diff empty. After confirming zero
  connections, the disposable database was removed; its synthetic data can be
  regenerated using the repository fixtures.
- Retained local browser: existing session recovered after a development reload;
  roster showed two player assignments and one staff assignment with 3/3 total,
  Player 360 showed one active assignment and 1/1 history. No business writes
  were performed. The Player 360 preview is left open on port 3001; backend 4000
  remains available.

## Reproducible local measurement

The new case in `apps/backend/test/player-page.e2e-spec.ts` measures 20 warm
sequential 25-assignment Player 360 requests, with 603 history records and the
existing 1,000-player fixture. Observed p50 **10.00 ms**, p95 **10.67 ms**, maximum
**23 SQL queries/request**, JSON **19,782 bytes**. Query events are counted without
logging SQL parameters or credentials; the regression ceiling is 24 queries.

This is not a concurrent load test or production SLO. Full counts may scan many
rows; bounded returned cardinality/query count does not imply constant database
work. Byte size varies with real field lengths. Pilot volume, concurrency,
performance owner, indexes justified by query plans and latency targets remain
TBD. No index migration is inferred from these synthetic measurements.

## Remaining work and rollback

BL-043d is next: remove live dependence on unbounded legacy group/season metadata
and Player 360 assignment-dialog team/role options, with explicit navigation and
compatibility semantics. Legacy array retirement, reconciliation internals,
business-resource lists, query plans and real pilot capacity remain open.
BL-045 all-seasons labels, BL-044 privacy/minor policy and M4 rollout are separate.

Rollback the two route clients and remove their additive page APIs only after
callers are reverted. The old array APIs remain available; no data rollback is
needed. The relational authorization optimization can be reverted independently
to the old implementation without changing the approved permission policy, but
would restore the unbounded intermediate assignment read.
