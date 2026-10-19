# BL-043e.1 — Training Catalog Read Foundation

- Date: 2026-09-06
- Verdict: Pass for the additive backend slice; UI cutover is not delivered.
- Authority: user's next-step instruction within BL-043, ADR-0007/0014 and
  ADR-0022/0023 compatibility boundaries. No new technology, grant, index,
  schema/migration, clinical data or production decision.

## Why the shared arrays cannot simply be paged

The live shell still loads full plans/drills/members and complete matches. This
slice intentionally does not replace those inputs with the first page.

| Shared input | Verified consumers | Cutover requirement |
| --- | --- | --- |
| Plans | `routes/trainings.tsx:39`, `dashboard.tsx:39`, `week.tsx:113`, `attendance.tsx:40` | Catalog pages plus full-scope totals, period/day schedule reads and per-plan attendance counts; preserve undated drafts |
| Drills | `routes/library.tsx:34`, `tactics.tsx:22`, `training-detail.tsx:116`, `dashboard.tsx:87` | Server category/board filters and totals; paged picker with selected-item resolution; load document only for detail/editor |
| Matches | `routes/matches.tsx:24`, `match-detail.tsx:48`, `week.tsx:116`, dashboard and shell | Independent detail lookup must replace `matches.find`; period reads and full counters before removing complete array |
| Members | `routes/squad.tsx:18`, `attendance.tsx:15`, `training-detail.tsx:53`, dashboard | Distinct list/picker pages and full current-player counts; do not change existing assignment/attendance semantics |

These are repository-relative source references, not claims about a new runtime
UI. The existing `workspace-context.tsx` full reads remain; no frontend source was
modified. README's stale claim that BL-043d metadata/dialog work remained open
was reconciled with Project Boot and the verified BL-043d delivery.

## Implemented contract

`GET /training-plans/catalog/page` is additive, authenticated and read-only.
The two-segment catalog path does not collide with `GET /training-plans/:id`.

- Required `groupId`; optional exact legacy `seasonId`, `limit` and `after` only.
  IDs are 1–160 characters without surrounding whitespace/control characters.
  Limit is a decimal string 1–100, default 25. Unknown/repeated/array fields,
  invalid limits and malformed cursors return 400.
- Cursor is bounded to 512 base64url characters, decoding only `{ id, date }`.
  Date is null or a strict valid offset-bearing ISO timestamp. Order is date
  descending, null dates last, then ID descending. Boundary filtering includes
  equal-date ID ties and the dated-to-undated transition, without offset or
  loading the referenced record. Cursor values never establish authority.
- Shared `assertGroupView` enforces current legacy group membership or the
  existing SYSTEM_ADMIN/own CLUB_ADMIN exception before any plan/counter read.
  The selected group's club ID is server-derived and applied to every read.
  Sporting assignments alone are not legacy membership. A creator without
  current group membership cannot use this **group workspace** catalog even
  though the retained legacy list may expose that actor's own plans.
- Supplied season must belong to that exact club/group; mismatch returns 400
  before reading plans. Selected-season filtering preserves the shell's current
  start instant, inclusive UTC end-of-day and inclusion of all undated drafts.
  Omit seasonId for all group plans; `*` is not a special season ID here.
- Response: `{ items, nextCursor, limit, summary }`. Each item contains only
  id/title/groupId/date/notes/totalDuration/phaseCount. No drill documents,
  board snapshots, attendance arrays or user projections are loaded.
- `summary` contains total, scheduled, undated, totalDuration and
  presentAttendance across the **full authorized season filter**, independent
  of cursor/page. Duration is the existing stored plan duration, not a newly
  inferred calculation. PLAYER attendance counts include only that principal's
  PRESENT records, while coach/admin counts cover the allowed plans.
- Empty continuation can have nonzero summary; empty scope returns zeros. Rows
  and aggregate calls are live reads, not snapshot-isolated traversal. Concurrent
  writes may change counts/order; clients must not promise a frozen export.

The query fetches at most limit + 1 plan rows. Phase counts are grouped only for
the returned IDs (at most limit), with the same resource/date filter re-applied;
the extra look-ahead row is not counted. Empty pages skip phase aggregation.
Old full list/my/detail endpoints and all mutation contracts remain unchanged.

## Evidence and query-plan refinement

- New unit coverage: 24 tests, including query validation, null/equal-date
  cursors, no nested payloads, bounded phase IDs, full totals, inclusive dates,
  draft preservation, empty continuation, PLAYER self-attendance and early denial.
- API E2E: all 5 suites / 35 tests passed. New cases traverse 150 season-visible
  plans in six 25-record pages, including 30 drafts, with no duplicates/missing
  IDs. Two outside-season records appear only in the all-seasons total (152).
  Full duration remains 7,500 minutes; coach PRESENT total 240, PLAYER total 120.
  Coverage includes both season endpoint instants, phase counts, auth absence,
  cross-club/unassigned group, own admin/system behavior, mismatched season,
  malformed queries and group membership revocation. Legacy list still returns
  all 152 plans and nested phases.
- Root quality: 43 backend suites / 492 tests, 12 frontend files / 44 tests,
  both typechecks/lint/format/builds, Sites 4/4, CDSK, Markdown and whitespace
  gates passed. Frontend source is unchanged; Chromium suite was not rerun for
  this backend-only slice. BL-043d's prior 10-test evidence remains historical.
- Fresh disposable PostgreSQL 16 target: `ngcs_bl043_training_e2e`. Six existing
  migrations deployed. No retained reset, seed, migration or business write.
  Migration status current and schema diff empty. Retained before/after business
  fingerprints match the controlled-rollout baseline (24 tables / 25 rows,
  excluding normal session/audit lifecycle tables). After verifying zero active
  connections, the disposable DB was removed and its absence checked; synthetic
  fixtures can regenerate it. Local frontend still answers HTTP 200 on port 3001.

The isolated fixture contains 152 scoped plans, 240 phases and 240 attendance
records. Deliberately large **synthetic opaque legacy JSON** (8 KiB per document)
tests projection cost; it is not presented as a valid tactical-board document.
The E2E helper captures trusted generated SELECT SQL/parameters in memory, replays
EXPLAIN ANALYZE/BUFFERS with timestamp types restored, and logs only node types,
relation names, qualifying rows, loops, buffers and timings. No credentials,
record identifiers, SQL parameter payloads or retained data are persisted.

Initial nested `_count.drills` made PostgreSQL aggregate broader phase groups
before applying the parent LIMIT. It was replaced with a second, bounded-ID
phase query. Final observed plans:

| Read | Observed plan | Execution time (ms) |
| --- | --- | --- |
| Full plan summary | Aggregate over 150 qualifying TrainingPlan rows | 0.028 |
| Full PRESENT summary | Hash join of allowed plans and attendance, then aggregate | 0.092 |
| Page | Sequential scan/filter, top sort, LIMIT 26; no pre-limit phase join | 0.115 |
| Page phase counts | Filter to 50 phase records, group into 25 returned plan IDs | 0.068 |

Final 20 warm sequential HTTP samples: p50 **3.29 ms**, p95 **3.71 ms**, max
**8 SQL queries/request**, page JSON **5,416 bytes**. The old full all-seasons
152-plan response was **4,189,055 bytes**. These are different response scopes
and projections, not an equal-payload speedup benchmark or measured browser
improvement. Initial implementation used seven queries; the bounded phase read
trades an extra round trip for constrained aggregation cardinality.

Sequential scans still visit underlying tables; 50 qualifying phase rows does
not mean only 50 physical records were scanned. Full aggregates inherently inspect
the allowed set. Small synthetic data, local hardware and parallel quality work
do not establish production capacity. No latency assertion or index migration is
inferred. Pilot volume/concurrency, performance owner and SLO remain TBD.

## Next steps and rollback

1. Connect training catalog pagination with independent page state and full
   summary fields. Keep previous/next, loading/error/empty, stale-scope handling
   and selected season/draft semantics covered in frontend tests.
2. Complete the other plan consumers before removing the shared full read:
   dashboard aggregates/recent plans, weekly period/day schedule data, and
   attendance page/per-plan counters with full player-count semantics.
3. Apply equivalent list/aggregate/detail separation to drills, matches and
   members. A single first page must never become the source of global totals,
   a drill picker or a match-detail existence check.
4. Re-measure representative pilot query plans; any new index/migration requires
   its explicit approval gate. Legacy API retirement remains separate.

BL-043 stays In progress; BL-044/045 and M4 gates are unchanged. Reverting this
slice removes only the catalog controller/service/parser and module registration;
there is no database rollback and current UI callers remain unaffected.
