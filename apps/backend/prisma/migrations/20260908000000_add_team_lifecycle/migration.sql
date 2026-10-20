-- ADR-0028: configurable age labels and reversible team lifecycle.
-- Existing enum values are preserved byte-for-byte while the two operational
-- columns become configurable text.
ALTER TABLE "PlayerGroup"
  ALTER COLUMN "ageGroup" TYPE TEXT USING "ageGroup"::TEXT;

ALTER TABLE "Drill"
  ALTER COLUMN "ageGroup" TYPE TEXT USING "ageGroup"::TEXT;

DROP TYPE "AgeGroup";

ALTER TABLE "Team" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "PlayerGroup" ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "Team_clubId_archivedAt_idx"
  ON "Team"("clubId", "archivedAt");

-- A first team is a protected, singular club resource. Academy teams remain
-- unrestricted. Archived first teams are forbidden by the service, while the
-- predicate keeps rollback/repair tooling deterministic.
CREATE UNIQUE INDEX "Team_one_active_first_team_per_club_key"
  ON "Team"("clubId")
  WHERE "categoryKey" = 'A_TAKIM' AND "archivedAt" IS NULL;

ALTER TYPE "SecurityAuditAction" ADD VALUE 'SPORTING_TEAM_CREATED';
ALTER TYPE "SecurityAuditAction" ADD VALUE 'SPORTING_TEAM_UPDATED';
ALTER TYPE "SecurityAuditAction" ADD VALUE 'SPORTING_TEAM_ARCHIVED';
ALTER TYPE "SecurityAuditAction" ADD VALUE 'SPORTING_TEAM_RESTORED';
