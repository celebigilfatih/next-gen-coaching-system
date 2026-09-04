# ADR-0006: Prisma reconciliation and role transition

- **Status:** Accepted
- **Date:** 2026-08-31
- **Owners / approvers:** Data owner / repository owner TBD
- **Supersedes / superseded by:** N/A
- **Related:** ADR-0005, BL-003, BL-004

## Context

Tracked Prisma migrations cannot reproduce the current schema, new migrations are
ignored by a backend `.gitignore` rule, and the application image runs
`prisma migrate deploy` during startup. The existence and contents of retained
databases are not known. ADR-0005 also requires splitting the current `ADMIN` role
without guessing how existing accounts should be classified.

After acceptance, the repository owner explicitly confirmed that no database or
data must be retained and authorized a clean start.

## Decision Drivers

No data loss, repeatable fresh deployment, auditable migration history, explicit
administrator mapping and a rollback path tested before production rollout.

## Considered Options

1. Generate and deploy the current Prisma diff immediately.
2. Reset all databases and replace history with a clean baseline.
3. Reconcile actual database state in an isolated environment, then use an
   expand/migrate/contract transition for both schema drift and roles.

## Decision

Use option 3:

1. Identify every retained environment and its accountable data owner.
2. Capture backup/restore proof, applied migration status, schema-only dump and an
   inventory of existing `ADMIN` rows without copying credentials into the repo.
3. Rehearse the tracked migrations and current schema against an isolated PostgreSQL
   shadow/test database.
4. Choose the baseline branch from evidence:
   - if no retained data exists, build and verify a clean baseline from the approved
     schema;
   - if retained data exists, generate a forward-only reconciliation from its actual
     state and preserve all data.
5. Stop ignoring new migration files and require migration SQL review in Git.
6. Introduce `SYSTEM_ADMIN` and `CLUB_ADMIN` while temporarily retaining `ADMIN`.
7. Map each existing `ADMIN` explicitly; do not infer scope from a nullable
   `clubId` alone.
8. Deploy compatible authorization code, backfill roles, verify negative tenant
   tests, and remove legacy `ADMIN` only in a later contract migration.
9. Remove migration-on-start from the application process and make deployment
   migration a separately observable release step.

Accepting this process does not authorize applying schema or data changes to a
future retained environment without the environment and rollback evidence defined
above.

## Implementation Outcome

- The no-retained-data branch was selected; no legacy account mapping is required.
- The three drifted migrations were replaced by
  `20260831000000_clean_baseline`, generated from the approved current schema.
- The baseline directly defines `SYSTEM_ADMIN`, `CLUB_ADMIN`, `COACH` and `PLAYER`.
- A database check requires `SYSTEM_ADMIN.clubId` to be null and
  `CLUB_ADMIN.clubId` to be non-null.
- New migrations are visible to Git and application startup no longer runs them.
- The baseline was applied to ephemeral PostgreSQL 16; Prisma reported one applied
  migration, an up-to-date schema and no schema difference.

## Consequences

Schema reconciliation and legacy role mapping are no longer blockers. ADR-0007
implements resource-level authorization and negative cross-club tests for the core
operational endpoints.

## Rollout and Rollback

Every step is rehearsed on a restored copy or isolated test database. Rollback uses
the verified backup and application compatibility window; destructive reset and
`db push` are not rollback mechanisms. Contract migrations run only after old role
usage reaches zero and the rollback window closes.

## Open Questions

- Who approves future backups and production migration execution?
- What maintenance window and deployment platform are available?
