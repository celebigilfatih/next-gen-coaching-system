# P0.1 Controlled Local Rollout — 2026-09-06

## Verdict and authority

**Local rollout: Pass. Production rollout: not performed.** The user requested
the next step after the explicit controlled-local-migration/parity handoff.
This applies the already accepted ADR-0020/0022/0023 migrations, not a new data
model or production decision. Application code and migration SQL were unchanged.

## Target and recovery evidence

- Exact target: `ngcs_local_session_dev` in the existing `ngcs-postgres`
  PostgreSQL 16.15 container, local port 5433. The source `ngcs_local_test` was
  not modified. No reset, seed or password change was performed.
- Before migration, ports 3001/4000 had no listening application process and the
  target had zero other database connections. Four migrations were already applied.
- A custom-format database dump was restored into the newly created isolated
  `ngcs_p01_restore_20260906` database. All 26 legacy tables / 83 rows matched
  canonical recursive JSON SHA-256 fingerprints before migration. Raw rows,
  credentials and session values were not printed or saved in repository docs.
- The private local backup is `/private/tmp/ngcs-p01-rollout-7V6GAQ/before.dump`,
  75,239 bytes, mode 0600 in a mode 0700 directory. SHA-256:
  `b4277315658e5338c55a67e3fab81913990f218ab17809df1f1b251bee5928ae`.
  A second copy remains inside the container at `/tmp/ngcs-p01-before-7V6GAQ.dump`.
  These are temporary local recovery artifacts, not a durable production backup
  or an approved retention policy. Treat them as private database backups.
- Restore rehearsal and migration succeeded before the retained target was changed.
  The temporary rehearsal database was then removed; it can be recreated from
  the retained backup. No other database was dropped.

## Migration and data preservation

Applied through `prisma migrate deploy`, in order:

1. `20260906010000_add_system_admin_recovery_audit`
2. `20260906020000_add_sporting_foundation`

Both rehearsal and local target passed legacy fingerprints after migration,
excluding only the three intentionally added nullable link columns:
`User.personId`, `Season.teamSeasonId`, `SecurityAuditEvent.targetPersonId`.
Nested JSON data was included in the comparison. Migration metadata was excluded.
There was no silent legacy-row rewrite or removal.

The local target has six successful migrations; a repeated deploy returned no
pending migrations and live Prisma schema diff returned no difference.
Backfill produced 4 Persons, 2 Teams, 1 ClubSeason, 1 TeamSeason and 4 legacy
assignments. Both clubs returned `IN_SYNC` with all five discrepancy counts zero.
Parity used the application's read-only `legacyParityReport` function through a
maintenance database connection; it was not an authenticated admin HTTP test.
Admin-only HTTP authorization remains covered by the previous disposable E2E.

## Runtime smoke

- Backend restarted on 4000 and frontend on 3001 with the existing local opt-in
  persistent-session flags and exact `http://localhost:3001` frontend origin.
  Backend watch compilation reported zero errors; both HTTP roots returned 200.
  Anonymous `/sporting/workspace` returned 401.
- The existing in-app browser session refreshed without a password change.
  Hafta, Takımlar, dated team roster, Oyuncular and Player 360 displayed retained
  records. Missing facts stayed TBD/no evidence; no readiness score was invented.
- Switching to all seasons returned a Player 360 detail to its list; the selection
  and session survived reload. The original season was restored afterward.
- The existing 75-minute training plan retained its 12/24/30/9-minute phases.
  The existing match and analysis notes opened. No save, attendance or assignment
  mutation was submitted. Business-data fingerprints after browser smoke matched:
  24 tables / 25 rows, excluding session and security-audit lifecycle tables.
- Servers and the authenticated week tab remain open for local work.

No destructive E2E suite was run on the retained database. The previous P0.1b
396 backend / 27 frontend unit, 29 API and 6 Chromium E2E evidence remains the
repository regression baseline. This operation adds migration/restore/data/runtime
evidence; it does not claim a new full test-suite run.

## Remaining boundaries

BL-043 pagination and measured scale is the next engineering item; pilot targets
and performance owner remain TBD. All-seasons mode correctly loads the scope,
but the older sidebar/week subtitle says `Sezon TBD` instead of `Tüm sezonlar`;
this is BL-045/P3, a low-risk label inconsistency, not data loss or a blocked local flow.
BL-044 privacy/minor policy and M4 provider/production decisions remain gated.
See the [compatibility/rollback contract](../10-architecture/P01B_COMPATIBILITY_CUTOVER.md).
Do not restore over the now-active database or drop additive sporting tables as
an automatic rollback; stop writers and review a forward fix first.
