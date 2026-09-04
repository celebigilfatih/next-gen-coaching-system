-- ADR-0012: club-scoped drills and versioned tactical-board persistence.
CREATE TYPE "DrillScope" AS ENUM ('GLOBAL', 'CLUB');

ALTER TABLE "Drill"
  ADD COLUMN "scope" "DrillScope" NOT NULL DEFAULT 'GLOBAL',
  ADD COLUMN "clubId" TEXT,
  ADD COLUMN "groupId" TEXT,
  ADD COLUMN "createdById" TEXT;

ALTER TABLE "PlanDrill" ADD COLUMN "boardSnapshot" JSONB;
ALTER TABLE "Match" ADD COLUMN "tacticalBoard" JSONB;

CREATE INDEX "Drill_scope_clubId_idx" ON "Drill"("scope", "clubId");
CREATE INDEX "Drill_groupId_idx" ON "Drill"("groupId");
CREATE INDEX "Drill_createdById_idx" ON "Drill"("createdById");

ALTER TABLE "Drill"
  ADD CONSTRAINT "Drill_clubId_fkey"
  FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "Drill_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "PlayerGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "Drill_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "Drill_scope_ownership_check"
  CHECK (
    ("scope" = 'GLOBAL' AND "clubId" IS NULL AND "groupId" IS NULL)
    OR
    ("scope" = 'CLUB' AND "clubId" IS NOT NULL AND "createdById" IS NOT NULL)
  );
