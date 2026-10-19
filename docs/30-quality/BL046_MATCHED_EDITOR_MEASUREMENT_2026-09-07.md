# BL-046c — Matched Training Editor Measurement

- Date: 2026-09-07
- Measurement verdict: Pass in three separate process runs.
- Final delivery verdict: Pass; BL-046 a/b/c and CR-017 implementation complete.
- Authority: [Accepted ADR-0025 Option A](../50-decisions/ADR-0025-on-demand-training-editor-boards.md), approved CR-017.
- Change scope: opt-in backend measurement, existing browser regression and docs
  only. No runtime/API/schema/index/dependency or authorization changes.

## Matched comparison

The new opt-in case in
[training-editor.e2e-spec.ts](../../apps/backend/test/training-editor.e2e-spec.ts)
compares legacy editor, metadata and selected effective-board GETs against the
same plan in the same process, first at 2 and then 50 phases. All phases reference
one shared global source; each has a distinct valid snapshot. Source and snapshot
each have 40 text elements and serialize to 9,656 UTF-8 JSON bytes. Every document
passes the existing strict validator before insertion. No invalid padding fields
or changes to document limits are used. All phase titles/notes/IDs stay complete.

The existing guarded fixture supplies two clubs, four role accounts, three groups,
four plans and two sources; the benchmark replaces only its own selected plan's
phase list. Measurement requests use the actual COACH JWT/current group grant,
normal authentication/authorization and existing throttler. Persistent sessions
are disabled in this API fixture; browser verification separately enables them.

Each endpoint/volume has one warmup and twelve measured requests. Within each
sample, endpoint order rotates; volume order remains 2 then 50. The three full
measurements ran in separate processes without concurrent quality/API/browser
test work. ANALYZE updates statistics in the disposable database before each
volume. Caches, CPU allocation and ambient host load are not controlled; there is
no cold-cache, sustained concurrency or production-volume claim.

Environment: macOS arm64, Node 24.15.0, Prisma 6.19.3, Docker Engine 29.4.0,
PostgreSQL 16.15, loopback port 5433 and one explicit ephemeral Nest HTTP listener.
Database rows are synthetic. No tokens, parameters, SQL text or board contents
are written to measurement output; captured query strings remain in memory.

## Results

Body sizes and query counts were identical across all three process runs.

| Phases | Read | JSON body bytes | All SQL events | JSON-content SQL events | p50 range ms | p95 range ms |
| --- | --- | --- | --- | --- | --- | --- |
| 2 | Legacy editor | 40,257 | 6 | 2 | 2.76–3.30 | 3.09–7.01 |
| 2 | Metadata | 769 | 6 | 0 | 2.43–2.78 | 5.24–6.88 |
| 2 | Selected snapshot | 9,895 | 6 | 1 | 2.61–3.04 | 3.16–10.44 |
| 50 | Legacy editor | 996,545 | 6 | 2 | 15.09–15.95 | 17.42–18.30 |
| 50 | Metadata | 14,145 | 6 | 0 | 4.81–6.41 | 6.61–10.50 |
| 50 | Selected snapshot | 9,895 | 6 | 1 | 5.03–5.52 | 7.56–8.75 |

At 50 phases, metadata + one opened board totals **24,040 bytes versus 996,545**,
a **97.59% reduction in these uncompressed JSON bodies**. At 2 phases the totals
are 10,664 versus 40,257 bytes (73.51%). Initial flow/attendance needs metadata
only; a later explicit board-open adds the selected response. These totals exclude
independent picker/attendance/workspace reads, HTTP headers, compression and
browser heap. They are not whole-page or first-paint measurements.

The two new requests together cause **12 SQL events versus 6** for the old single
request in this fixture. This deliberately trades another authorized request for
removing repeated board payloads. Do not describe this as a query-count reduction.
Metadata selects no JSON, and the selected request has exactly one effective-JSON
projection. Counts do not grow with phases (no measured phase N+1), but fixed
counts are not bounded row work. Selected latency varies despite fixed bytes;
these timings do not prove database work is constant.

Latency uses monotonic time around each HTTP/status check, including transport
and JSON parsing, but not the subsequent deep projection assertions. Quantiles
use nearest rank; with twelve samples p95 is the sample maximum. Reported ranges
are the min/max of per-process quantiles, not a pooled p95. No latency assertion,
combined-path percentile, user concurrency, SLO or production speedup is inferred.

## Regression assertions

- Both volumes retain all phases and exact metadata key allowlists. Captured
  metadata SQL never includes boardSnapshot/jsonData/Attendance.
- Legacy reads still carry source and each distinct snapshot without truncation.
- Selected reads return the exact identity and snapshot, with one COALESCE
  effective-document projection. The selected body is identical at 2/50 phases.
- Every measured response has stable bytes and query counts; counts match across
  volumes. The combined new response must be smaller than the matched 50-phase
  legacy response. These fixture comparisons are not new public limits.
- Replacing all 49 unselected snapshots with 200,000-character invalid legacy
  values changes neither metadata nor selected response. Those correctness probes
  are excluded from the valid-board timings.
- Selected SQL NULL and JSON null fall back to the source; false/legacy non-null
  snapshots remain invalid with no fallback; both null yields absent/document=null.
- Existing eight HTTP tests still cover role/tenant/source revocation, source
  changes, snapshot isolation, additive writes, malformed data and byte/element
  boundaries. They run in the normal API suite, separately from this benchmark.

The [browser regression](../../apps/frontend/tests/e2e/coach-flow.spec.ts) now
edits the original source drill after saving a plan snapshot, reopens the exact
PlanDrill board through its explicit action and asserts the snapshot is unchanged.
Existing first-save undo/redo, dirty-transition cancellation, second-phase
attachment, match-board save and negative tenant assertions remain intact.

## Reproduction

Create a fresh explicitly disposable loopback PostgreSQL database, deploy the
existing six migrations, and run alone:

```bash
TEST_DATABASE_URL=<disposable-loopback-test-url> \
E2E_ALLOW_DESTRUCTIVE_RESET=true NGCS_EDITOR_BENCH=true \
npm --prefix apps/backend run test:e2e -- --runInBand \
  --testPathPatterns=training-editor \
  --testNamePattern='measures matched valid-board'
```

Repeat in separate processes. Without NGCS_EDITOR_BENCH=true this case is skipped;
normal API runs therefore skip two intentional opt-in benchmarks (BL-043i and
BL-046c). The new case prints only BL046_MATCHED_EDITOR_MEASUREMENT scalar
metrics. Keep BL-043i's opaque legacy fixture and numbers as historical evidence;
they are not the valid-board baseline above.

## Final gates and cleanup

API: six suites / 48 passed, two opt-in cases skipped. New measurement: three
passes, each selects one case and skips the eight normal cases. The first attempt
failed test compilation because the fixture assumed a GroupMember compound unique
key that the existing model does not have. Fixture setup now checks/creates its
own membership using current schema; no model or runtime behavior changed.

| Final gate | Evidence |
| --- | --- |
| Root quality | Passed: 655 backend / 133 frontend unit tests, typecheck/lint/format, backend/frontend builds, Sites 4/4, CDSK/links/whitespace |
| Browser | Complete Chromium suite 12/12, all eight catalog/page/history fixture flags and persistent sessions enabled; isolated ports 13001/14000 |
| Viewports | Fresh 1440/1024/390 px screenshots inspected at output/playwright/bl046c-board-{width}.png; picker/controls/page-width checks pass |
| Disposable DB | Six migrations deployed to fresh ngcs_bl046c_measure_e2e; final status current, schema diff empty |
| Retained fingerprint | Before/after business PASS: 24 tables / 25 rows; session/audit excluded by the existing manifest |
| Runtime/schema/package scope | Before/after tracked diff fingerprint unchanged: 0310b8cc0f5da06fd3138e25343c73a27d3c3e8ce4a3aeaabd6e448ed6a83f0b |

Desktop/tablet retain the board/inspector layout. Mobile retains the existing
horizontal inner board scroll (620px minimum canvas column), so the full board
and inspector do not fit simultaneously. No mobile redesign or formal WCAG claim.
The user's already-open retained tab was not manipulated; no demo JSON was repaired.

Only this turn's disposable database was removed after all suites closed and zero
connections were verified; absence confirmed. Its synthetic data can be regenerated
from migrations and fixtures. No retained reset/seed/migration/business write,
stage/commit/push or local server interruption. Cumulative worktree preserved;
short-status entries 200 → 201 (new report). After closure updates: 102 Markdown
files / zero broken links, CDSK and git diff --check passed separately from the
full quality run.

## Remaining scope and next step

BL-043 still needs broader read/write workloads, controlled database row-work
analysis and owner-approved pilot hardware/volume/budgets. These remain TBD and
are not implied by passing BL-046. Metadata remains O(phases/title/note volume);
large invalid selected documents may still cost database/validation work. Legacy
endpoints and write responses/duration recomputation remain heavy. No conflict
version, phase cap, source-content repair or production rollout was added.

BL-046/CR-017 implementation is closed after final gates; continue BL-043 with an
explicit reproducible read/write and row-work measurement plan, without inventing
production targets. BL-045 labels, BL-044 safeguarding, BL-009 health policy and
M4 production inputs stay separate. Rollback of this slice removes only the
benchmark/browser assertion and its documentation; no data rollback is needed.
