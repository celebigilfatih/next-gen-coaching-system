# BL-043j — Mixed Reads/Writes and Isolated SELECT Row Work

- Date: 2026-09-07
- Verdict: Pass for the synthetic measurement slice; BL-043 pilot acceptance remains open.
- Authority: approved BL-043 continuation; ADR-0007/0014 authorization and
  ADR-0019 atomic attendance semantics are unchanged.
- Changes: one opt-in backend E2E case and documentation only. No application,
  frontend, schema/index/migration, dependency, permission or production change.

## Method

The new case in
[training-plan-catalog.e2e-spec.ts](../../apps/backend/test/training-plan-catalog.e2e-spec.ts)
runs alone with NGCS_READ_WRITE_BENCH=true and the existing guarded disposable
PostgreSQL fixture. A shared ephemeral loopback Nest listener avoids concurrent
Supertest auto-close races. Authentication, current principal/group checks and
rate limits remain enabled; persistent sessions are disabled in this API fixture.

One concurrent batch contains five GETs and two POST /attendance writes:

| Request | Selected size / purpose |
| --- | --- |
| Training catalog | limit=3, complete selected-season summary |
| Drill catalog | limit=1, no board JSON |
| Group player-membership page | default 25, full membership total |
| Plan attendance page | default 25, full current total |
| Editor metadata | all two phases, no board JSON |
| Attendance mark ×2 | different current players in the selected plan, same alternating PRESENT/ABSENT value |

The small profile has 30 players / 150 selected-season plans; the large has
300 / 1,500. Initial 152 group plans include two outside-season plans; one hidden
group plan is separate. There are 240 / 2,940 stored phase rows and 268 / 3,238
attendance rows in the fixture club. New plans each get two phases and two
attendance records; the active plan has a record for every current player.
Multiple dimensions grow together, so this is not attribution to player count alone.

Each profile uses one warmup plus ten measured batches. A batch timer includes
HTTP, JSON parsing and in-round correctness assertions; subsequent settled-read
and database uniqueness checks are excluded from time, query and byte counts.
While writes are in flight, a read may observe either committed state; the test
does not invent transactional consistency across the five separate GETs. After
completion, an authorized GET must show the exact final PRESENT total, and the
database must retain exactly one attendance record per current player.

A separate same-key contention probe issues conflicting writes concurrently,
asserts exactly one row, then issues a final explicit PRESENT write and checks
the settled total. It does not infer commit order from promise completion. PLAYER
and an unassigned-group write are rejected; hidden-plan attendance remains empty.
These probes are excluded from timed batches. This is not a multi-writer soak.

## SELECT work measurement

After each profile settles, training-catalog and attendance-page requests run
individually with query capture. Each captured trusted SELECT is replayed with
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON), binding original parameters in memory.
No INSERT/UPDATE/DELETE is replayed through EXPLAIN ANALYZE. Authentication SELECTs
are included. Only node/relation names and scalar metrics are printed; no SQL,
parameters, user identifiers, board contents or credentials enter the report/log.

`scanRowEmissions` sums Actual Rows × Actual Loops for nodes with a Relation Name;
it is an execution-plan work indicator, **not unique rows read or physical I/O**.
`filteredRowEmissions` sums rows removed by filter/join filter × loops, and may
count repeated processing. Root-level shared hit/read blocks are reported without
summing parent and child buffer counters. EXPLAIN time is instrumented, measured
once per captured SELECT/profile, not a production query latency percentile.

ANALYZE updates only synthetic-table statistics. Three comparison runs began in
separately created empty databases with the same six migrations. Two additional
exploratory reruns reused the first database; their higher buffer counts exposed
physical-page carryover after fixture deletions. Those reused-DB observations are
excluded from the clean-start ranges below. Within each run the large profile
follows the small and is warm; CPU/memory/cache/ambient load are not controlled.

Environment: macOS arm64, Node 24.15.0, Prisma 6.19.3, Docker Engine 29.4.0,
PostgreSQL 16.15, loopback 5433. No other quality/API/browser suite ran concurrently
with measurements. Shared PostgreSQL instance and host are not dedicated production
hardware. Test database isolation is not a cold-buffer or disk benchmark.

## Observed results — three clean-start runs

| Players / selected plans | Max batch SQL events | p50 batch range ms | p95 batch range ms | Max response-body bytes in request order |
| --- | --- | --- | --- | --- |
| 30 / 150 | 47 | 7.25–11.48 | 16.82–25.76 | 888 / 304 / 9,063 / 3,930 / 719 / 201 / 235 |
| 300 / 1,500 | 47 | 6.67–7.12 | 8.75–10.62 | 920 / 304 / 9,064 / 3,932 / 719 / 201 / 235 |

These are maxima per response position, not necessarily one simultaneous maximum
batch. Bytes are JSON.stringify UTF-8 bodies, excluding HTTP headers/compression.
Query capture counts the whole seven-request batch; it cannot attribute events
to individual concurrent requests. A loose 80-event fixture guard detects gross
fan-out regressions; it is not an approved SLO or API limit. There is no latency
pass threshold. Nearest-rank p95 for ten samples is the maximum; ranges are across
per-process quantiles. The larger profile appearing faster does not establish a
speedup: warmup, JIT/cache/order and host noise remain confounders.

Representative logical work was stable across clean-start runs:

| SELECT shape | Small → large scan-row emissions | Root shared hits, small → large | Interpretation |
| --- | --- | --- | --- |
| TrainingPlan count aggregate | 150 → 1,500 | 4 → 43 | Returning one counter still scans the allowed plan set |
| TrainingPlan page limit=3 | 150 → 1,500 | 4 → 43 | Four rows leave the SQL limit (one lookahead), not four rows of total work |
| TrainingPlan/Attendance summary aggregate | 418 → 4,738 | 10 → 120 | Full summary work scales with stored rows |
| GroupMember/User total aggregate | 61 → 601 | 3 → 17 | Page total is not limited to 25 users |
| PRESENT total aggregate | 91 → 901 | 8 → 47 | Membership and attendance intersection grows |

The phase-summary aggregate also changes plan shape: scan emissions 156 → 12,
but filtered emissions 237 → 2,934 and root shared hits 14 → 89. Lower emitted
rows alone therefore does not mean less work. The final attendance projection
returns 26 SQL rows at both volumes; the small sequential scan filters 242 rows,
while the large bitmap heap plan filters 274 in these clean runs. Reused-database
explorations sometimes chose a sequential scan filtering 3,212 instead. Statistics
and physical state matter; no query plan or index benefit is guaranteed here.

No core workflow failure, duplicate attendance or authorization regression was
observed. Full counts explain growing work; without approved workload/budgets this
is a measured scaling characteristic, not evidence of an SLA failure. No index,
cache, approximate counter or truncated result was introduced to hide the cost.

## Reproduction and validation

Create a fresh explicitly disposable loopback database, deploy the existing six
migrations, and run without other test workloads:

```bash
TEST_DATABASE_URL=<disposable-loopback-test-url> \
E2E_ALLOW_DESTRUCTIVE_RESET=true NGCS_READ_WRITE_BENCH=true \
npm --prefix apps/backend run test:e2e -- --runInBand \
  --testPathPatterns=training-plan-catalog \
  --testNamePattern='measures mixed attendance writes'
```

Use fresh database names for clean-start comparisons. Each benchmark run selects
one test and skips eight unrelated cases. Without the flag the new case is skipped
in the normal API suite alongside the two older opt-in benchmarks. Retained
ngcs_local_session_dev must never be used for fixtures, statistics or tests.

Final verification:

| Gate | Result |
| --- | --- |
| Opt-in benchmark | Five successful runs: three clean-start comparisons and two exploratory reused-DB runs; one selected case passed per run |
| Root npm run quality | Pass: 655 backend / 133 frontend unit tests, typecheck, lint, format, builds and repository checks |
| Normal backend API E2E | 48 passed / 3 intentional opt-in skips, six suites |
| PostgreSQL migration validation | Six migrations deployed; status current and schema diff empty in each of the three fresh databases |
| Retained business fingerprint | PASS: 24 tables / 25 rows unchanged; no retained reset, seed, migration or business writes |
| Disposable cleanup | All three test databases removed after zero active connections; database-name count verified zero |
| Runtime/frontend/schema scope | Tracked diff fingerprint unchanged before/after; no application, dependency or migration edits this slice |
| Final documentation | 103 Markdown files, zero broken local links; CDSK and git diff --check passed after documentation updates |

The removed databases held only reproducible synthetic fixtures; retained local
data and user browser were not changed. No staging, commit or push was performed.
Browser E2E was not rerun for this test-only backend change: the frontend and
runtime contracts are unchanged;
BL-046c's 12/12 remains historical evidence, not a new browser run.

## Remaining BL-043 acceptance inputs

| Input / gate | Current status | Evidence needed to close |
| --- | --- | --- |
| Named pilot/performance owner | TBD | Accountable approver for workload and acceptance |
| Representative data profile | TBD | Clubs/teams/seasons/history sizes, notes/boards distribution and tenant skew |
| Workload and contention profile | TBD | Request mix, concurrent users/arrival rate, duration, writers and hot resources |
| Environment | TBD | Fixed CPU/RAM/DB storage/pool, cache policy and monitoring |
| Service targets | TBD | Approved latency percentiles, error rate, throughput and database-work/resource budgets |
| Representative rehearsal | Pending inputs | Sustained test with sessions, sporting/team/history/Player 360 and broader mutations, followed by acceptance review |

BL-043j is delivered, but BL-043 stays open at this pilot acceptance gate. Do not
generate endless arbitrary volumes or declare production capacity from these
bursts. Further index/model/API decisions require an evidence-backed proposal and
the repository approval gates. No new ADR is necessary for this measurement-only
slice. BL-046 remains Done.

Next independent implementation: BL-045 “Tüm sezonlar” label correction. BL-044
safeguarding, BL-009 health policy and M4 production inputs remain separate open
gates. Rollback removes only the new opt-in test and its documentation; no database
or application rollback is needed. Do not revert unrelated cumulative changes.
