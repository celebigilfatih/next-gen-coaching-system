# BL-043i — Synthetic Mixed-Read and Editor Payload Baseline

- Date: 2026-09-07
- Verdict: Pass for repeatable measurement; production capacity NOT established.
- Authority: approved BL-043 continuation, existing ADR-0007/0014 boundaries.
- Changes: opt-in E2E benchmark and documents only. Runtime/API/schema/index,
  migrations, dependencies, UI and authorization are unchanged.

## Method and reproducibility

The benchmark is in
[training-plan-catalog.e2e-spec.ts](../../apps/backend/test/training-plan-catalog.e2e-spec.ts).
It reuses the guarded disposable PostgreSQL fixture and runs alone with
NGCS_MIXED_BENCH=true. It is skipped by default to avoid normal-suite rate-limit
and query-event interference. From the repository root, after deploying existing
migrations to an explicitly disposable loopback database:

```bash
TEST_DATABASE_URL=<disposable-loopback-test-url> \
E2E_ALLOW_DESTRUCTIVE_RESET=true NGCS_MIXED_BENCH=true \
npm --prefix apps/backend run test:e2e -- --runInBand \
  --testPathPatterns=training-plan-catalog \
  --testNamePattern='measures mixed read batches'
```

Do not run against ngcs_local_session_dev or a production/retained database.
The fixture rejects non-loopback targets, names without test/e2e, and the retained
local name. Use the exact dedicated target provisioned for the run. Never run
this opt-in case concurrently with other suites against that database.

Three separate process runs used macOS arm64, Node 24.15.0, Prisma 6.19.3,
Docker Engine 29.4.0 and PostgreSQL 16.15. Database reached via loopback 5433;
Nest/Supertest used one ephemeral loopback HTTP listener. CPU/memory allocation
and ambient host load were not controlled: these are local observations.
Runtime request guards were not disabled; persistent-session mode is off in
this established fixture. Real session rotation cost is not represented.

Fixture: two clubs, current coach/group grants, 152 group plans (150 in the
selected season), 240 initial phases, one global drill, 30 same-season matches.
PLAYER memberships grow from 30 to 300, including the two original users. The
selected plan has PRESENT records for all current members; 28/298 added rows
produce 268/538 total fixture attendance records. Each volume gets ANALYZE on
its synthetic User/GroupMember/Attendance/Match tables; no DDL is performed.

One representative read group fans out five concurrent GET requests:

| Read | Request page size | Verified result |
| --- | --- | --- |
| Training catalog | 3 | 3 items, selected-season total 150 |
| Drill catalog | 1 | 1 item, no board JSON projection |
| Match catalog | 3 | 3 items, full total 30 |
| Group PLAYER members | 25 | 25 items, full total 30 or 300 |
| Plan attendance | 25 | 25 items, full total/PRESENT 30 or 300 |

Concurrency 1/3 means 1/3 such groups (5/15 simultaneous requests), NOT measured
human users or a sustained arrival rate. Each profile has one unmeasured warmup
batch and ten measured batches. Profiles run in fixed order: 30/1, 30/3, 300/1,
300/3. Batch wall time includes HTTP and test assertion overhead. Warm caches and
fixed ordering explain why the larger fixture may appear faster; no speedup is
inferred. p50/p95 use nearest rank; with ten samples p95 is the sample maximum,
not a reliable estimate of a production tail. Three runs do not establish an SLO.

Trusted Prisma query events count the entire batch, including authentication/
authorization. Concurrent events cannot be attributed to individual requests;
normalizing by group count is an average, not a per-request maximum. SQL and
parameter values stay in memory, never in the measurement log. Response bytes
are JSON.stringify UTF-8 body bytes of the final sample, not compressed wire
bytes, HTTP headers or browser heap. This is a read-only representative mix,
not the complete workspace/week/Player 360 workload or a read/write soak test.

## Observed results across three runs

| Players | Read groups | p50 batch range ms | p95 batch range ms | Max batch queries | Batch JSON bytes |
| --- | --- | --- | --- | --- | --- |
| 30 | 1 | 6.79–7.68 | 9.72–16.67 | 36 | 15,951 |
| 30 | 3 | 15.52–17.34 | 22.06–24.41 | 108 | 47,853 |
| 300 | 1 | 5.86–6.62 | 7.02–9.05 | 36 | 15,954 |
| 300 | 3 | 14.27–14.48 | 16.47–18.15 | 108 | 47,862 |

The five body sizes at 300 players were 888 / 304 / 1,036 / 9,531 / 4,195 bytes,
in table order. Query-event count and byte sizes repeated exactly across runs.
Stable query count does not mean stable database work: full counts and joins
still inspect underlying allowed sets. Member counts alone do not cover growth
in plans, matches, clubs, assignments, historical data or concurrent writes.

Fixture regression guards are at most 50 query events per five-read group and
less than 32 KiB per individual page response. These intentionally loose test
ceilings detect projection/N+1 regressions in this fixture; they are NOT new
public API limits, an approved performance budget or latency assertions.

### Editor growth — follow-up BL-046 / CR-017

Editor reads were measured separately at 300 members and 2/50 phases, five
samples each. Existing fixture JSON is deliberately opaque synthetic legacy
JSON, not a validated TacticalBoardDocumentV1: each drill JSON and each phase
snapshot contains 8,192 repeated payload characters. It measures stored graph
serialization only, not valid-board rendering, import or canvas performance.

| Phases | Body bytes | Max queries | p50 range ms | p95 range ms |
| --- | --- | --- | --- | --- |
| 2 | 34,394 | 6 | 2.06–2.21 | 2.93–3.07 |
| 50 | 853,304 | 6 | 6.63–6.91 | 6.68–9.48 |

The roughly 24.8× body growth persists despite a fixed query count. The editor
omits full members/attendance but still embeds all linked drill JSON and phase
snapshots. No tested HTTP failure or core-flow blocker resulted. Record as P2
payload-growth risk, not a tenant incident or a proven production failure.

Recommendation (Proposed): evaluate phase metadata plus on-demand selected-board
reads, preserving snapshot isolation, ordering, draft/undo and existing write
contracts. A new hard phase/byte limit or API/architecture change needs explicit
approval; no existing plans should be rejected or truncated silently. Target
editor budget, owner and ADR identifier were TBD at measurement delivery.
Subsequent design (2026-09-07):
[ADR-0025](../50-decisions/ADR-0025-on-demand-training-editor-boards.md)
and [BL-046 contract](../10-architecture/BL046_EDITOR_READ_DESIGN.md) now define
Option A. Subsequently accepted; backend and frontend cutover were verified.
The [BL-046c matched valid-board measurement](BL046_MATCHED_EDITOR_MEASUREMENT_2026-09-07.md)
now records three repeated comparisons. Its valid data is a separate baseline,
not a retrospective replacement of the opaque legacy results above.
Performance owner/budget remain TBD.

## Verification and limits

- Opt-in benchmark passed in three separate runs; each selected 1 test and
  intentionally skipped the other 7 catalog cases. Measurements above are from
  these runs, without concurrent quality-gate work.
- Initial fixture construction was corrected to the current Match location
  contract. Supertest's implicit listener close raced parallel requests; one
  explicitly opened ephemeral listener fixed the test harness. No application
  setting or rate-limit threshold was changed to make the benchmark pass.
- Root quality passed: 612 backend unit / 115 frontend tests, typecheck, lint,
  format, builds, Sites 4/4, CDSK, links and whitespace. Normal API suite passed
  40 tests / 5 suites in 8.939 seconds; the new opt-in case was intentionally
  skipped there and separately passed above. Browser E2E was not rerun: no UI
  or runtime source changed; h.2's 12/12 remains historical evidence.
- Disposable ngcs_bl043_mixed_e2e deployed all six migrations; status current and
  schema diff empty. Retained before/after business fingerprint passed (24
  tables / 25 rows, session/audit excluded). No retained reset/seed/migration or
  business write. After zero connections were verified, only the synthetic DB
  was dropped and absence checked; the fixture can regenerate it.
- Final documentation checks: 97 Markdown files, zero broken local links,
  CDSK and git whitespace passed. Cumulative worktree preserved: 190 entries
  before, 191 after the new report. No stage, commit or push. Rollback removes
  only the opt-in measurement/test guards and related documentation; no database
  or runtime rollback is required.

BL-043 remains open for broader mixed reads/writes, controlled hardware and longer
sampling, query-plan/row-work measurement, representative pilot volumes and
owner-approved budgets. Production owner, concurrency, SLO and hardware remain
TBD. BL-044 policy, BL-045 labels and M4 production gates remain separate.
