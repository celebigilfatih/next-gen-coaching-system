# BL-043a — Player Directory Pagination and Measurement

- Date: 2026-09-06
- Verdict: player-directory slice Pass; BL-043 remains In progress.
- Authority: user's next-step request for BL-043, within ADR-0022/0023 and
  REQ-014/015. No new schema, migration, dependency, vendor or role grant.

## Delivered contract

`GET /sporting/players/page` is an additive authenticated endpoint. The old
`GET /sporting/players` array contract remains unchanged; the current Players
route uses the paged endpoint instead. No existing client is silently truncated.

| Query    | Contract                                                                                   |
| -------- | ------------------------------------------------------------------------------------------ |
| `teamId` | Required, nonempty identifier, at most 160 characters                                      |
| `clubId` | Optional consistency filter; cannot override principal or team ownership                   |
| `limit`  | Decimal integer string, 1–100; default 25; UI uses 25                                      |
| `after`  | Optional last returned Person ID, at most 160 characters                                   |
| `q`      | Optional name substring, at most 100 characters; trimmed, database case-insensitive search |

Unknown fields, repeated/array values, control characters and malformed limits
return 400. `%`, `_` and backslash are escaped as literal search characters.
Case folding follows PostgreSQL's configured collation, not a claimed Turkish
locale guarantee. Ordering is stable ascending Person ID, not alphabetical.

The response is `{ items, nextCursor, limit }`. It fetches at most limit + 1 root
records and returns at most limit; each card carries only its latest active
assignment in the requested team, with an ID tie-breaker. This card summary is
not an assertion of primary registration and does not replace Player 360 history.
Other-team assignments are not attached to the card. No global count query or
offset is performed. `nextCursor: null` means there was no extra visible record.

The ID cursor is a boundary, not a credential or lookup of the cursor's owner.
Tenant, current capability, active requested-team membership and PLAYER self
restriction are applied again on every page. A forged/deleted/foreign boundary
cannot broaden access. Changing search/team starts a new traversal. Pagination is
a live view, not a database snapshot: inserts before the cursor may require a
refresh, and deletes/revocations may shorten later pages.

The UI provides previous/next controls, loading status, server-side debounced
search, distinct empty/error states and retry. Changing club/team/season clears
the page stack, and late responses cannot replace newer scope/search results.
Existing shadcn Button/Input/Card components and visual identity are reused.

## Verification

- 20 new backend unit cases: query limits/shapes, bounded root and nested reads,
  full filters before pagination, player self + cursor intersection, empty page,
  foreign scope and revoked-grant continuation.
- Three new frontend tests: next/previous/server search, stale response after
  scope change, failure vs empty state and retry.
- Backend E2E: all 3 suites / 30 tests pass, including 1,000 synthetic players
  and 3,000 active assignments. Ten 100-item pages have no missing/duplicate IDs;
  beyond-first-page search, literal `%`, self-only results, cross-club and
  same-club-unassigned-team rejection, revoked-grant continuation and unchanged
  legacy array response are covered through HTTP and PostgreSQL.
- Chromium: 7/7 tests with opt-in persistent sessions and the optional 30-native-
  player fixture. The paging test observes 25 then 7 cards, previous-page return,
  server search for an off-page player, and controls without horizontal overflow
  at 1440/1024/390 px. Existing coach/session/dirty-board/Player 360 flows pass.
- Root quality passed: 39 backend suites / 416 tests, 9 frontend files / 30 tests,
  both typechecks, lint, format, builds, Sites 4/4, Markdown, CDSK and whitespace.
  The initial lint check rejected a control-character regex; equivalent character
  code validation replaced it before the successful gate.
- All synthetic fixture work ran only on disposable `ngcs_bl043_e2e` at loopback
  PostgreSQL 16. Six migrations deployed; schema diff is empty. No retained
  database reset, seed, migration or business mutation was performed.
  The isolated database was removed after verification; synthetic fixtures can
  be regenerated. Retained business fingerprints still match 24 tables / 25 rows
  from the controlled-rollout baseline (session/audit lifecycle tables excluded).
- The retained local UI was reloaded after a transient dev-page error during
  rebuild; the existing session recovered and its two players rendered with
  disabled first/last-page controls. The page is left open locally.

## Reproducible local measurements

The dedicated `apps/backend/test/player-page.e2e-spec.ts` creates accountless
synthetic players, three active assignments each, and an authorised coach.
It measures the default 25-item HTTP response 21 times after traversal: the first
measurement is reported separately and the remaining 20 yield nearest-rank p50
and p95. This is a warm local test, not a cold-start/load test or production SLO.
Prisma query events are counted without logging SQL, parameters or credentials.

Observed runs (the final run also includes the same-club-negative assertion):

| Run             | First measured request | p50 / p95 (20 samples) | Max SQL queries/request | Page JSON    | Legacy full JSON |
| --------------- | ---------------------- | ---------------------- | ----------------------- | ------------ | ---------------- |
| Focused         | 8.85 ms                | 8.87 / 9.83 ms         | 9                       | 11,561 bytes | 885,001 bytes    |
| Full API suite  | 9.95 ms                | 10.25 / 20.75 ms       | 9                       | 11,561 bytes | 885,001 bytes    |
| Final API suite | 14.10 ms               | 12.77 / 14.55 ms       | 9                       | 11,561 bytes | 885,001 bytes    |

The test asserts bounded cardinality and at most 10 SQL calls per page for this
locked implementation. It does not assert a latency target or a maximum byte
size for arbitrary real field contents. Query count is not rows scanned; these
results do not demonstrate scalability beyond the fixture volume. The synthetic
1,000/3,000 volume and 25/100 request bounds are engineering choices, not invented
pilot requirements. Reported timings vary with host load and cache state.

## Remaining work and rollback

BL-043b: team listing/workspace catalogue bounds and explicit navigation semantics.
Subsequently completed in the [BL-043b report](BL043_WORKSPACE_CATALOGS_2026-09-06.md);
the measurements above remain the historical player-slice evidence.
BL-043c: dated roster and Player 360 assignment-history pagination, without hiding
history or breaking current counters. Legacy compatibility list retirement,
reconciliation internals, larger/selective-name-query plans and measured pilot
concurrency remain open. Pilot capacity, latency target and performance owner are
TBD; no index migration is justified solely by this small local run.

Rollback this slice switches the UI back to the preserved legacy list method;
no data rollback is needed. That restores the old unbounded behaviour, not a
scalable production solution. Production, BL-044 privacy and the separate BL-045
all-seasons label correction remain outside this delivery.
