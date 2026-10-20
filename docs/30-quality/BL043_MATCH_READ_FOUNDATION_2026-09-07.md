# BL-043g.1 — Bounded Match Read Foundation

- Date: 2026-09-07
- Verdict: Pass for the API foundation; BL-043 remains in progress.
- Authority: approved BL-043 continuation; ADR-0007/0012/0014 access boundaries.
- No schema, migration, dependency, write or permission-policy change.
- Frontend consumers and retained business data are unchanged.

## Contract and implementation

GET /matches/catalog/page requires JWT authentication and groupId. It accepts
optional seasonId, limit (default 25, maximum 100), after and paired from/until.
Unknown keys, arrays, invalid IDs, invalid limits and malformed cursors fail
with 400. Cursor fields are exactly id/date; the timestamp must be real,
timezone-qualified and non-null. Ordering is date ASC, id ASC, matching the
legacy context's chronological ordering with stable equal-date tie breaking.

The service checks current group access before reading matches. Season relation
filters include the authorized group's ID and club ID; optional seasonId must
belong to both. Omitting seasonId includes that group's seasons, not another
group's seasons. This preserves legacy season ownership, including Match rows
whose optional groupId is null. Direct Match.groupId is not a new authority.
Sporting grants do not bypass legacy group/tenant access.

The optional period is half-open [from, until), at most eight elapsed days so
local day/week ranges and DST boundaries fit. It intersects ownership/season
filters. Explicit season selection is relational, not a training-plan-style
inferred date range. No period means no implicit date filtering.

The response is {items, total, limit, nextCursor}. Items contain id, seasonId,
date, opponent, location, competition, result, ourFormation, notes and hasBoard.
No tacticalBoard, opponentAnalysis, videoLinks or nested resources are selected.
A second page-ID-bounded query returns only IDs whose board is neither SQL NULL
nor JSON null; hasBoard indicates presence, not valid-document certification.
The extra lookahead record is not included in this marker query. Empty pages
skip it. Count uses the complete filter, never the cursor; pages/count/markers
are independent live reads, not a frozen snapshot under concurrent changes.

## Verification

- 33 new unit tests: scalar projection/lookahead, stable cursor and ordering,
  total independence, period intersection, missing/mismatched scope, denied
  access before data reads, empty continuation and malformed input rejection.
- Root quality passed: 45 backend suites / 571 tests, 19 frontend files / 84
  tests, Sites 4/4, typechecks, lint, format, builds, CDSK and local links.
- API E2E: 5 suites / 39 tests passed, including the added match catalog flow.
  A synthetic 58-match fixture includes 55 selected-season matches, another
  season in the same group, an unassigned group and a foreign club. Traversal
  verifies 25+25+5 with no duplicates, 55/56 season/all-season totals, equal-date
  ordering, both null board variants, retained null-group ownership and absent
  JSON payloads. Local date bounds yield 54/55 scoped totals. PLAYER, COACH,
  CLUB_ADMIN and SYSTEM_ADMIN parity, anonymous 401, foreign/unassigned denial,
  mismatched-season 400 and current membership revocation are covered.
- Legacy season list still returns all 55 records and complete board documents;
  no existing list/detail/write contract was silently truncated.
- Latest synthetic measurement: 10 requests, p50 2.80 ms, max 2.96 ms, seven
  queries including authentication/authorization; first 25-item page 7,627 bytes
  versus legacy 55-item season response 914,061 bytes. This compares different
  item counts plus projections; it is not an equal-record benchmark or SLO.
  Exact scalar page/count SQL EXPLAIN shows 26 lookahead rows / 0.097 ms and
  one aggregate row / 0.067 ms. These are small local synthetic observations.
  The initial measurement replay of the marker predicate lost Prisma's typed
  JSON-null parameter and explained a different SQL-null predicate; that
  misleading replay was excluded. Marker behavior is covered by real requests,
  not claimed as an EXPLAIN measurement. All 39 tests passed again after this
  instrumentation-only correction (7.019 seconds).
- Six existing migrations deployed to disposable PostgreSQL 16 database
  ngcs_bl043_match_catalog_e2e; status current and schema diff empty. After zero
  active connections, only this synthetic database was dropped and its absence
  verified. Retained ngcs_local_session_dev fingerprint stayed 24 tables / 25
  rows (session/audit lifecycle excluded). No retained reset/seed/migration.
- Browser E2E was not rerun: no frontend files or existing runtime contracts
  changed. Previous 11-browser-test evidence remains historical, not a new run.
- Final CDSK/link checks pass (90 Markdown documents, zero broken local links)
  and git diff --check passes. Cumulative user worktree preserved; no commit/push.

## Next slices and limitations

1. BL-043g.2: move Maçlar to independent pages, totals, loading/error/retry and
   scope reset, preserving its shadcn cards and detail links.
2. Move Genel Bakış and Hafta to their appropriate bounded reads; supply a
   separately authorized detail read before removing the shared match array.
3. Only then remove matches from legacyContext/provider. Today all four match
   consumers still depend on it; this foundation alone does not reduce browser
   workspace traffic.
4. Member reads, pilot volume/owner/SLO and possible measured indexing work
   remain open. LIMIT bounds transfer, not total database scan/sort/count work.
   No index migration was introduced without a separate evidence/approval gate.

BL-044/045/M4 policy and production gates remain separate; unknown inputs TBD.
