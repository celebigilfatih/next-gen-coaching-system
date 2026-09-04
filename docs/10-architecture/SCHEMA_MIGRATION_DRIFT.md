# Prisma Schema and Migration Drift Inventory

- **Observed:** 2026-08-31
- **Resolution:** Clean baseline completed; no retained database/data exists.
- **Verification:** Ephemeral PostgreSQL 16, Prisma migrate status and schema diff.

## Evidence

Git previously tracked three migrations:

1. `20251104133018_init`
2. `20251204120553_add_season_tables`
3. `20251204121322_make_season_clubid_optional`

The current Prisma schema was valid, but those migrations could not reconstruct it.

## Confirmed Differences

- Migration history creates the obsolete `MacroCycle`, `MesoCycle`, `MicroCycle`
  and `MatchWeekAnalysis` tables. These models are absent from the current schema.
- Current schema adds `WeekPlan`, `DayPlan`, `Match`, `PlayerPerformance`,
  `VideoAnalysis`, `AnalysisReport`, `TeamPerformance`, `ScoutingReport`,
  `MatchAnalysis`, `PlayerHealthLog`, `PlayerHealthStatus` and `PlayerCoachNote`.
  No tracked migration creates them.
- Current schema contains fields absent from tracked migrations, including
  `User.birthDate`, `User.position`, `PlayerGroup.category` and
  `TrainingPlan.notes`, together with related enums and relationships.
- `apps/backend/.gitignore` ignores `/prisma/migrations/`. Existing migration files
  remain tracked by Git, but newly generated migrations can be hidden from normal
  status checks.
- The production image executes `prisma migrate deploy` at startup. A fresh database
  built only from tracked migrations can therefore be reported as migrated while
  still lacking structures required by the current application.

## Resolution

- The repository owner confirmed no database or data must be retained.
- The old migration files were replaced by one clean migration:
  `20260831000000_clean_baseline`.
- The baseline contains every current schema model and the ADR-0005 role enum.
- `/prisma/migrations/` is no longer ignored.
- Migration execution was removed from application startup and exposed as an
  explicit deployment command.
- The baseline applied successfully to ephemeral PostgreSQL 16 and Prisma detected
  no difference against `schema.prisma`.

## Safety Boundary

For every future retained environment:

- do not run `prisma migrate dev`, `prisma db push`, reset or destructive diff SQL
  against a retained database;
- do not introduce or map legacy roles without an explicit data plan;
- compare any pre-existing database with the tracked schema/migrations before
  treating it as authoritative;
- use an isolated shadow/test database for migration rehearsal.

The accepted and completed reconciliation procedure is recorded in ADR-0006.
