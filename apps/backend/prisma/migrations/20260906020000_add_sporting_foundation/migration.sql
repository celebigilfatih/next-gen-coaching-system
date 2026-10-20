-- P0.1 Sporting Foundation and Pathway Proof
-- Additive only: legacy User/PlayerGroup/GroupMember/Season records remain canonical
-- for existing MVP routes until the compatibility cutover is separately approved.

CREATE TYPE "PreferredFoot" AS ENUM ('LEFT', 'RIGHT', 'BOTH', 'UNKNOWN');
CREATE TYPE "FunctionalRoleSystemKey" AS ENUM (
  'PLAYER', 'HEAD_COACH', 'ASSISTANT_COACH', 'GOALKEEPER_COACH',
  'FITNESS_COACH', 'PERFORMANCE_COACH', 'ANALYST', 'SCOUT',
  'SPORTING_DIRECTOR', 'ACADEMY_DIRECTOR', 'MEDICAL_STAFF',
  'TEAM_MANAGER', 'OTHER'
);
CREATE TYPE "SportingCapability" AS ENUM (
  'TEAM_VIEW', 'TEAM_MANAGE', 'PLAYER_VIEW', 'PLAYER_MANAGE',
  'PLAYER_HISTORY_VIEW', 'ASSIGNMENT_VIEW', 'ASSIGNMENT_MANAGE',
  'AVAILABILITY_VIEW'
);
CREATE TYPE "SportingAssignmentType" AS ENUM (
  'LEGACY_MEMBER', 'PRIMARY_REGISTERED', 'TRAINING_GUEST',
  'MATCH_ELIGIBLE', 'LOAN_IN', 'LOAN_OUT', 'INTERNATIONAL_DUTY', 'STAFF'
);
CREATE TYPE "SportingAvailabilityStatus" AS ENUM (
  'AVAILABLE', 'MODIFIED', 'UNAVAILABLE', 'RETURNING', 'SUSPENDED',
  'INTERNATIONAL_DUTY', 'OTHER'
);

ALTER TYPE "SecurityAuditAction" ADD VALUE 'SPORTING_ASSIGNMENT_CREATED';
ALTER TYPE "SecurityAuditAction" ADD VALUE 'SPORTING_ASSIGNMENT_ENDED';
ALTER TYPE "SecurityAuditAction" ADD VALUE 'SPORTING_CAPABILITY_GRANTED';

ALTER TABLE "User" ADD COLUMN "personId" TEXT;
ALTER TABLE "Season" ADD COLUMN "teamSeasonId" TEXT;
ALTER TABLE "SecurityAuditEvent" ADD COLUMN "targetPersonId" TEXT;

CREATE TABLE "Person" (
  "id" TEXT NOT NULL,
  "clubId" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "birthDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlayerProfile" (
  "personId" TEXT NOT NULL,
  "preferredFoot" "PreferredFoot",
  "primaryPosition" "Position",
  "secondaryPositions" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlayerProfile_pkey" PRIMARY KEY ("personId")
);

CREATE TABLE "StaffProfile" (
  "personId" TEXT NOT NULL,
  "title" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StaffProfile_pkey" PRIMARY KEY ("personId")
);

CREATE TABLE "Team" (
  "id" TEXT NOT NULL,
  "clubId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "categoryKey" TEXT NOT NULL,
  "categoryLabel" TEXT NOT NULL,
  "ageGroupLabel" TEXT,
  "minimumAge" INTEGER,
  "maximumAge" INTEGER,
  "legacyGroupId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Team_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Team_age_range_check" CHECK (
    ("minimumAge" IS NULL OR "minimumAge" >= 0) AND
    ("maximumAge" IS NULL OR "maximumAge" >= 0) AND
    ("minimumAge" IS NULL OR "maximumAge" IS NULL OR "minimumAge" <= "maximumAge")
  )
);

CREATE TABLE "ClubSeason" (
  "id" TEXT NOT NULL,
  "clubId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClubSeason_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ClubSeason_date_range_check" CHECK ("startDate" <= "endDate")
);

CREATE TABLE "TeamSeason" (
  "id" TEXT NOT NULL,
  "clubId" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "clubSeasonId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeamSeason_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FunctionalRole" (
  "id" TEXT NOT NULL,
  "clubId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "systemKey" "FunctionalRoleSystemKey",
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FunctionalRole_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoleCapability" (
  "id" TEXT NOT NULL,
  "roleDefinitionId" TEXT NOT NULL,
  "capability" "SportingCapability" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RoleCapability_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SportingAssignment" (
  "id" TEXT NOT NULL,
  "clubId" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "teamId" TEXT,
  "teamSeasonId" TEXT,
  "roleDefinitionId" TEXT NOT NULL,
  "assignmentType" "SportingAssignmentType" NOT NULL,
  "validFrom" TIMESTAMP(3) NOT NULL,
  "validTo" TIMESTAMP(3),
  "reason" TEXT,
  "source" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SportingAssignment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SportingAssignment_date_range_check" CHECK (
    "validTo" IS NULL OR "validTo" > "validFrom"
  ),
  CONSTRAINT "SportingAssignment_team_target_check" CHECK (
    "assignmentType" IN ('LOAN_OUT', 'INTERNATIONAL_DUTY', 'STAFF') OR
    "teamId" IS NOT NULL
  )
);

CREATE TABLE "ExternalIdentity" (
  "id" TEXT NOT NULL,
  "clubId" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "source" TEXT,
  "validFrom" TIMESTAMP(3),
  "validTo" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ExternalIdentity_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ExternalIdentity_date_range_check" CHECK (
    "validFrom" IS NULL OR "validTo" IS NULL OR "validTo" > "validFrom"
  )
);

CREATE TABLE "AvailabilityPeriod" (
  "id" TEXT NOT NULL,
  "clubId" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "status" "SportingAvailabilityStatus" NOT NULL,
  "validFrom" TIMESTAMP(3) NOT NULL,
  "validTo" TIMESTAMP(3),
  "restrictionSummary" TEXT,
  "source" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AvailabilityPeriod_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AvailabilityPeriod_date_range_check" CHECK (
    "validTo" IS NULL OR "validTo" > "validFrom"
  )
);

CREATE UNIQUE INDEX "User_personId_key" ON "User"("personId");
CREATE INDEX "User_personId_idx" ON "User"("personId");
CREATE INDEX "Season_teamSeasonId_idx" ON "Season"("teamSeasonId");
CREATE INDEX "SecurityAuditEvent_targetPersonId_idx" ON "SecurityAuditEvent"("targetPersonId");
CREATE INDEX "Person_clubId_displayName_idx" ON "Person"("clubId", "displayName");
CREATE UNIQUE INDEX "Team_legacyGroupId_key" ON "Team"("legacyGroupId");
CREATE INDEX "Team_clubId_name_idx" ON "Team"("clubId", "name");
CREATE UNIQUE INDEX "ClubSeason_clubId_name_startDate_endDate_key"
  ON "ClubSeason"("clubId", "name", "startDate", "endDate");
CREATE INDEX "ClubSeason_clubId_startDate_endDate_idx"
  ON "ClubSeason"("clubId", "startDate", "endDate");
CREATE UNIQUE INDEX "TeamSeason_teamId_clubSeasonId_key"
  ON "TeamSeason"("teamId", "clubSeasonId");
CREATE INDEX "TeamSeason_clubId_clubSeasonId_idx"
  ON "TeamSeason"("clubId", "clubSeasonId");
CREATE UNIQUE INDEX "FunctionalRole_clubId_key_key" ON "FunctionalRole"("clubId", "key");
CREATE INDEX "FunctionalRole_clubId_systemKey_idx" ON "FunctionalRole"("clubId", "systemKey");
CREATE UNIQUE INDEX "RoleCapability_roleDefinitionId_capability_key"
  ON "RoleCapability"("roleDefinitionId", "capability");
CREATE INDEX "RoleCapability_capability_idx" ON "RoleCapability"("capability");
CREATE INDEX "SportingAssignment_clubId_personId_validFrom_validTo_idx"
  ON "SportingAssignment"("clubId", "personId", "validFrom", "validTo");
CREATE INDEX "SportingAssignment_teamId_validFrom_validTo_idx"
  ON "SportingAssignment"("teamId", "validFrom", "validTo");
CREATE INDEX "SportingAssignment_teamSeasonId_validFrom_validTo_idx"
  ON "SportingAssignment"("teamSeasonId", "validFrom", "validTo");
CREATE INDEX "SportingAssignment_roleDefinitionId_idx"
  ON "SportingAssignment"("roleDefinitionId");
CREATE UNIQUE INDEX "SportingAssignment_current_primary_key"
  ON "SportingAssignment"("clubId", "personId")
  WHERE "assignmentType" = 'PRIMARY_REGISTERED' AND "validTo" IS NULL;
CREATE UNIQUE INDEX "ExternalIdentity_clubId_provider_externalId_key"
  ON "ExternalIdentity"("clubId", "provider", "externalId");
CREATE INDEX "ExternalIdentity_personId_provider_idx"
  ON "ExternalIdentity"("personId", "provider");
CREATE INDEX "AvailabilityPeriod_clubId_personId_validFrom_validTo_idx"
  ON "AvailabilityPeriod"("clubId", "personId", "validFrom", "validTo");

ALTER TABLE "User" ADD CONSTRAINT "User_personId_fkey"
  FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Season" ADD CONSTRAINT "Season_teamSeasonId_fkey"
  FOREIGN KEY ("teamSeasonId") REFERENCES "TeamSeason"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SecurityAuditEvent" ADD CONSTRAINT "SecurityAuditEvent_targetPersonId_fkey"
  FOREIGN KEY ("targetPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Person" ADD CONSTRAINT "Person_clubId_fkey"
  FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_personId_fkey"
  FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffProfile" ADD CONSTRAINT "StaffProfile_personId_fkey"
  FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_clubId_fkey"
  FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_legacyGroupId_fkey"
  FOREIGN KEY ("legacyGroupId") REFERENCES "PlayerGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClubSeason" ADD CONSTRAINT "ClubSeason_clubId_fkey"
  FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamSeason" ADD CONSTRAINT "TeamSeason_clubId_fkey"
  FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamSeason" ADD CONSTRAINT "TeamSeason_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamSeason" ADD CONSTRAINT "TeamSeason_clubSeasonId_fkey"
  FOREIGN KEY ("clubSeasonId") REFERENCES "ClubSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FunctionalRole" ADD CONSTRAINT "FunctionalRole_clubId_fkey"
  FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoleCapability" ADD CONSTRAINT "RoleCapability_roleDefinitionId_fkey"
  FOREIGN KEY ("roleDefinitionId") REFERENCES "FunctionalRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SportingAssignment" ADD CONSTRAINT "SportingAssignment_clubId_fkey"
  FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SportingAssignment" ADD CONSTRAINT "SportingAssignment_personId_fkey"
  FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SportingAssignment" ADD CONSTRAINT "SportingAssignment_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SportingAssignment" ADD CONSTRAINT "SportingAssignment_teamSeasonId_fkey"
  FOREIGN KEY ("teamSeasonId") REFERENCES "TeamSeason"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SportingAssignment" ADD CONSTRAINT "SportingAssignment_roleDefinitionId_fkey"
  FOREIGN KEY ("roleDefinitionId") REFERENCES "FunctionalRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SportingAssignment" ADD CONSTRAINT "SportingAssignment_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExternalIdentity" ADD CONSTRAINT "ExternalIdentity_clubId_fkey"
  FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExternalIdentity" ADD CONSTRAINT "ExternalIdentity_personId_fkey"
  FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AvailabilityPeriod" ADD CONSTRAINT "AvailabilityPeriod_clubId_fkey"
  FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AvailabilityPeriod" ADD CONSTRAINT "AvailabilityPeriod_personId_fkey"
  FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill only evidence available in the legacy schema. Group membership is not
-- promoted to PRIMARY_REGISTERED because the old model does not prove primacy.
INSERT INTO "Person" ("id", "clubId", "displayName", "birthDate", "createdAt", "updatedAt")
SELECT "id", "clubId", "name", "birthDate", "createdAt", "updatedAt"
FROM "User"
WHERE "clubId" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;

UPDATE "User" SET "personId" = "id"
WHERE "clubId" IS NOT NULL AND "personId" IS NULL;

INSERT INTO "PlayerProfile" (
  "personId", "primaryPosition", "createdAt", "updatedAt"
)
SELECT "id", "position", "createdAt", "updatedAt"
FROM "User"
WHERE "clubId" IS NOT NULL AND "role" = 'PLAYER'
ON CONFLICT ("personId") DO NOTHING;

INSERT INTO "StaffProfile" ("personId", "createdAt", "updatedAt")
SELECT "id", "createdAt", "updatedAt"
FROM "User"
WHERE "clubId" IS NOT NULL AND "role" <> 'PLAYER'
ON CONFLICT ("personId") DO NOTHING;

INSERT INTO "Team" (
  "id", "clubId", "name", "categoryKey", "categoryLabel", "ageGroupLabel",
  "legacyGroupId", "createdAt", "updatedAt"
)
SELECT
  "id", "clubId", "name", "category"::TEXT,
  CASE WHEN "category" = 'A_TAKIM' THEN 'A Takım' ELSE 'Altyapı' END,
  "ageGroup"::TEXT, "id", "createdAt", "updatedAt"
FROM "PlayerGroup"
ON CONFLICT ("legacyGroupId") DO NOTHING;

INSERT INTO "ClubSeason" (
  "id", "clubId", "name", "startDate", "endDate", "createdAt", "updatedAt"
)
SELECT DISTINCT
  'cs_' || md5("clubId" || ':' || "name" || ':' || "startDate"::TEXT || ':' || "endDate"::TEXT),
  "clubId", "name", "startDate", "endDate", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Season"
ON CONFLICT ("clubId", "name", "startDate", "endDate") DO NOTHING;

INSERT INTO "TeamSeason" (
  "id", "clubId", "teamId", "clubSeasonId", "createdAt", "updatedAt"
)
SELECT DISTINCT
  'ts_' || md5(s."groupId" || ':' || cs."id"),
  s."clubId", s."groupId", cs."id", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Season" s
JOIN "ClubSeason" cs
  ON cs."clubId" = s."clubId"
 AND cs."name" = s."name"
 AND cs."startDate" = s."startDate"
 AND cs."endDate" = s."endDate"
JOIN "Team" t ON t."id" = s."groupId" AND t."clubId" = s."clubId"
ON CONFLICT ("teamId", "clubSeasonId") DO NOTHING;

UPDATE "Season" s
SET "teamSeasonId" = ts."id"
FROM "ClubSeason" cs, "TeamSeason" ts
WHERE cs."clubId" = s."clubId"
  AND cs."name" = s."name"
  AND cs."startDate" = s."startDate"
  AND cs."endDate" = s."endDate"
  AND ts."clubSeasonId" = cs."id"
  AND ts."teamId" = s."groupId"
  AND s."teamSeasonId" IS NULL;

INSERT INTO "FunctionalRole" (
  "id", "clubId", "key", "name", "systemKey", "createdAt", "updatedAt"
)
SELECT
  'fr_' || md5(c."id" || ':' || r.role_key), c."id", r.role_key, r.role_name,
  r.system_key::"FunctionalRoleSystemKey", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Club" c
CROSS JOIN (VALUES
  ('PLAYER', 'Oyuncu', 'PLAYER'),
  ('LEGACY_STAFF', 'Legacy staff üyeliği', 'OTHER'),
  ('HEAD_COACH', 'Teknik direktör', 'HEAD_COACH'),
  ('ASSISTANT_COACH', 'Yardımcı antrenör', 'ASSISTANT_COACH'),
  ('GOALKEEPER_COACH', 'Kaleci antrenörü', 'GOALKEEPER_COACH'),
  ('FITNESS_COACH', 'Fitness antrenörü', 'FITNESS_COACH'),
  ('PERFORMANCE_COACH', 'Performans antrenörü', 'PERFORMANCE_COACH'),
  ('ANALYST', 'Analist', 'ANALYST'),
  ('SCOUT', 'Scout', 'SCOUT'),
  ('SPORTING_DIRECTOR', 'Sportif direktör', 'SPORTING_DIRECTOR'),
  ('ACADEMY_DIRECTOR', 'Akademi direktörü', 'ACADEMY_DIRECTOR'),
  ('MEDICAL_STAFF', 'Sağlık staffı', 'MEDICAL_STAFF'),
  ('TEAM_MANAGER', 'Takım yöneticisi', 'TEAM_MANAGER')
) AS r(role_key, role_name, system_key)
ON CONFLICT ("clubId", "key") DO NOTHING;

INSERT INTO "RoleCapability" (
  "id", "roleDefinitionId", "capability", "createdAt"
)
SELECT
  'rc_' || md5(fr."id" || ':' || grants.capability_key),
  fr."id", grants.capability_key::"SportingCapability", CURRENT_TIMESTAMP
FROM "FunctionalRole" fr
JOIN (VALUES
  ('PLAYER', 'TEAM_VIEW'), ('PLAYER', 'PLAYER_VIEW'),
  ('LEGACY_STAFF', 'TEAM_VIEW'), ('LEGACY_STAFF', 'PLAYER_VIEW'),
  ('LEGACY_STAFF', 'PLAYER_HISTORY_VIEW'), ('LEGACY_STAFF', 'ASSIGNMENT_VIEW'),
  ('LEGACY_STAFF', 'AVAILABILITY_VIEW'),
  ('HEAD_COACH', 'TEAM_VIEW'), ('HEAD_COACH', 'PLAYER_VIEW'),
  ('HEAD_COACH', 'PLAYER_HISTORY_VIEW'), ('HEAD_COACH', 'ASSIGNMENT_VIEW'),
  ('HEAD_COACH', 'AVAILABILITY_VIEW'),
  ('ASSISTANT_COACH', 'TEAM_VIEW'), ('ASSISTANT_COACH', 'PLAYER_VIEW'),
  ('ASSISTANT_COACH', 'PLAYER_HISTORY_VIEW'), ('ASSISTANT_COACH', 'ASSIGNMENT_VIEW'),
  ('ASSISTANT_COACH', 'AVAILABILITY_VIEW'),
  ('GOALKEEPER_COACH', 'TEAM_VIEW'), ('GOALKEEPER_COACH', 'PLAYER_VIEW'),
  ('GOALKEEPER_COACH', 'PLAYER_HISTORY_VIEW'), ('GOALKEEPER_COACH', 'ASSIGNMENT_VIEW'),
  ('GOALKEEPER_COACH', 'AVAILABILITY_VIEW'),
  ('FITNESS_COACH', 'TEAM_VIEW'), ('FITNESS_COACH', 'PLAYER_VIEW'),
  ('FITNESS_COACH', 'PLAYER_HISTORY_VIEW'), ('FITNESS_COACH', 'ASSIGNMENT_VIEW'),
  ('FITNESS_COACH', 'AVAILABILITY_VIEW'),
  ('PERFORMANCE_COACH', 'TEAM_VIEW'), ('PERFORMANCE_COACH', 'PLAYER_VIEW'),
  ('PERFORMANCE_COACH', 'PLAYER_HISTORY_VIEW'), ('PERFORMANCE_COACH', 'ASSIGNMENT_VIEW'),
  ('PERFORMANCE_COACH', 'AVAILABILITY_VIEW'),
  ('ANALYST', 'TEAM_VIEW'), ('ANALYST', 'PLAYER_VIEW'),
  ('ANALYST', 'PLAYER_HISTORY_VIEW'), ('ANALYST', 'ASSIGNMENT_VIEW'),
  ('SCOUT', 'PLAYER_VIEW'),
  ('SPORTING_DIRECTOR', 'TEAM_VIEW'), ('SPORTING_DIRECTOR', 'TEAM_MANAGE'),
  ('SPORTING_DIRECTOR', 'PLAYER_VIEW'), ('SPORTING_DIRECTOR', 'PLAYER_MANAGE'),
  ('SPORTING_DIRECTOR', 'PLAYER_HISTORY_VIEW'), ('SPORTING_DIRECTOR', 'ASSIGNMENT_VIEW'),
  ('SPORTING_DIRECTOR', 'ASSIGNMENT_MANAGE'), ('SPORTING_DIRECTOR', 'AVAILABILITY_VIEW'),
  ('ACADEMY_DIRECTOR', 'TEAM_VIEW'), ('ACADEMY_DIRECTOR', 'TEAM_MANAGE'),
  ('ACADEMY_DIRECTOR', 'PLAYER_VIEW'), ('ACADEMY_DIRECTOR', 'PLAYER_MANAGE'),
  ('ACADEMY_DIRECTOR', 'PLAYER_HISTORY_VIEW'), ('ACADEMY_DIRECTOR', 'ASSIGNMENT_VIEW'),
  ('ACADEMY_DIRECTOR', 'ASSIGNMENT_MANAGE'), ('ACADEMY_DIRECTOR', 'AVAILABILITY_VIEW'),
  ('MEDICAL_STAFF', 'TEAM_VIEW'), ('MEDICAL_STAFF', 'PLAYER_VIEW'),
  ('MEDICAL_STAFF', 'PLAYER_HISTORY_VIEW'), ('MEDICAL_STAFF', 'ASSIGNMENT_VIEW'),
  ('MEDICAL_STAFF', 'AVAILABILITY_VIEW'),
  ('TEAM_MANAGER', 'TEAM_VIEW'), ('TEAM_MANAGER', 'PLAYER_VIEW'),
  ('TEAM_MANAGER', 'PLAYER_HISTORY_VIEW'), ('TEAM_MANAGER', 'ASSIGNMENT_VIEW'),
  ('TEAM_MANAGER', 'AVAILABILITY_VIEW')
) AS grants(role_key, capability_key) ON grants.role_key = fr."key"
ON CONFLICT ("roleDefinitionId", "capability") DO NOTHING;

INSERT INTO "SportingAssignment" (
  "id", "clubId", "personId", "teamId", "roleDefinitionId",
  "assignmentType", "validFrom", "source", "createdAt", "updatedAt"
)
SELECT
  'sa_' || md5(gm."id"), g."clubId", u."personId", g."id", fr."id",
  'LEGACY_MEMBER', gm."createdAt", 'PLAYER_GROUP_BACKFILL_V1',
  gm."createdAt", CURRENT_TIMESTAMP
FROM "GroupMember" gm
JOIN "PlayerGroup" g ON g."id" = gm."groupId"
JOIN "User" u ON u."id" = gm."userId" AND u."clubId" = g."clubId"
JOIN "FunctionalRole" fr
  ON fr."clubId" = g."clubId"
 AND fr."key" = CASE WHEN u."role" = 'PLAYER' THEN 'PLAYER' ELSE 'LEGACY_STAFF' END
WHERE u."personId" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;
