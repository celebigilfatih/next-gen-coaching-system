CREATE TYPE "DrillContentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "DrillSourceKind" AS ENUM ('NGCS_ORIGINAL', 'OPEN_LICENSE', 'LEGACY');
CREATE TYPE "DrillLicenseType" AS ENUM ('NGCS_PROPRIETARY', 'CC0', 'CC_BY_4_0', 'LEGACY_UNVERIFIED');

CREATE TABLE "DrillSource" (
  "id" TEXT NOT NULL,
  "kind" "DrillSourceKind" NOT NULL,
  "title" TEXT NOT NULL,
  "sourceUrl" TEXT,
  "author" TEXT,
  "license" "DrillLicenseType" NOT NULL,
  "attribution" TEXT,
  "changes" TEXT,
  "licenseVerifiedAt" TIMESTAMP(3),
  "verifiedById" TEXT,
  "contentHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DrillSource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DrillVersion" (
  "id" TEXT NOT NULL,
  "drillId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "status" "DrillContentStatus" NOT NULL DEFAULT 'DRAFT',
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "category" "DrillCategory" NOT NULL,
  "difficulty" "Difficulty" NOT NULL,
  "objectiveKey" TEXT NOT NULL,
  "objectiveLabel" TEXT NOT NULL,
  "themes" TEXT[] NOT NULL,
  "durationMin" INTEGER NOT NULL,
  "playerMin" INTEGER,
  "playerMax" INTEGER,
  "areaLengthM" INTEGER,
  "areaWidthM" INTEGER,
  "equipmentItems" TEXT[] NOT NULL,
  "organization" TEXT NOT NULL,
  "steps" JSONB NOT NULL,
  "coachingPoints" JSONB NOT NULL,
  "progressions" JSONB NOT NULL,
  "regressions" JSONB NOT NULL,
  "constraints" JSONB NOT NULL,
  "safetyNotes" TEXT,
  "boardDocument" JSONB,
  "searchText" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "createdById" TEXT,
  "reviewedById" TEXT,
  "publishedById" TEXT,
  "reviewComment" TEXT,
  "submittedAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DrillVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DrillAgeVariant" (
  "id" TEXT NOT NULL,
  "drillVersionId" TEXT NOT NULL,
  "ageGroup" TEXT NOT NULL,
  "durationMin" INTEGER NOT NULL,
  "playerMin" INTEGER,
  "playerMax" INTEGER,
  "areaLengthM" INTEGER,
  "areaWidthM" INTEGER,
  "rules" JSONB NOT NULL,
  "coachingPoints" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DrillAgeVariant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DrillVersion_drillId_version_key" ON "DrillVersion"("drillId", "version");
CREATE INDEX "DrillVersion_status_publishedAt_idx" ON "DrillVersion"("status", "publishedAt");
CREATE INDEX "DrillVersion_objectiveKey_category_difficulty_idx" ON "DrillVersion"("objectiveKey", "category", "difficulty");
CREATE INDEX "DrillVersion_sourceId_idx" ON "DrillVersion"("sourceId");
CREATE UNIQUE INDEX "DrillVersion_one_published_per_drill_idx"
  ON "DrillVersion"("drillId") WHERE "status" = 'PUBLISHED';
CREATE UNIQUE INDEX "DrillAgeVariant_drillVersionId_ageGroup_key" ON "DrillAgeVariant"("drillVersionId", "ageGroup");
CREATE INDEX "DrillAgeVariant_ageGroup_durationMin_playerMin_playerMax_idx" ON "DrillAgeVariant"("ageGroup", "durationMin", "playerMin", "playerMax");
CREATE INDEX "DrillSource_kind_license_idx" ON "DrillSource"("kind", "license");
CREATE UNIQUE INDEX "DrillSource_contentHash_key" ON "DrillSource"("contentHash");

ALTER TABLE "DrillSource" ADD CONSTRAINT "DrillSource_verifiedById_fkey"
  FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DrillVersion" ADD CONSTRAINT "DrillVersion_drillId_fkey"
  FOREIGN KEY ("drillId") REFERENCES "Drill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DrillVersion" ADD CONSTRAINT "DrillVersion_sourceId_fkey"
  FOREIGN KEY ("sourceId") REFERENCES "DrillSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DrillVersion" ADD CONSTRAINT "DrillVersion_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DrillVersion" ADD CONSTRAINT "DrillVersion_reviewedById_fkey"
  FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DrillVersion" ADD CONSTRAINT "DrillVersion_publishedById_fkey"
  FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DrillAgeVariant" ADD CONSTRAINT "DrillAgeVariant_drillVersionId_fkey"
  FOREIGN KEY ("drillVersionId") REFERENCES "DrillVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "DrillSource" (
  "id", "kind", "title", "license", "createdAt", "updatedAt"
) VALUES (
  'ngcs-legacy-unverified', 'LEGACY', 'Mevcut NGCS egzersiz kayıtları',
  'LEGACY_UNVERIFIED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO "DrillVersion" (
  "id", "drillId", "version", "status", "title", "summary", "category",
  "difficulty", "objectiveKey", "objectiveLabel", "themes", "durationMin",
  "equipmentItems", "organization", "steps", "coachingPoints", "progressions",
  "regressions", "constraints", "safetyNotes", "boardDocument", "searchText",
  "sourceId", "publishedAt", "createdAt", "updatedAt"
)
SELECT
  'legacy-version-' || md5(d."id"), d."id", 1, 'PUBLISHED', d."title",
  'Mevcut kayıt; içerik kaynağı ve uzman onayı doğrulanmadı.', d."category",
  d."difficulty", 'legacy-unverified', 'Kaynağı doğrulanmamış egzersiz',
  ARRAY[]::TEXT[], d."durationMin", ARRAY[]::TEXT[], '', '[]'::JSONB,
  '[]'::JSONB, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB, NULL,
  CASE WHEN d."jsonData"->>'kind' = 'tactical-board' THEN d."jsonData" ELSE NULL END,
  lower(d."title" || ' ' || COALESCE(d."equipment", '')),
  'ngcs-legacy-unverified', d."createdAt", d."createdAt", CURRENT_TIMESTAMP
FROM "Drill" d;

INSERT INTO "DrillAgeVariant" (
  "id", "drillVersionId", "ageGroup", "durationMin", "playerMin", "playerMax",
  "rules", "coachingPoints", "createdAt", "updatedAt"
)
SELECT
  'legacy-variant-' || md5(d."id"), 'legacy-version-' || md5(d."id"),
  d."ageGroup", d."durationMin", NULL, NULL, '[]'::JSONB, '[]'::JSONB,
  d."createdAt", CURRENT_TIMESTAMP
FROM "Drill" d;

INSERT INTO "RoleCapability" ("id", "roleDefinitionId", "capability", "createdAt")
SELECT
  'drill-author-' || md5(fr."id"), fr."id", 'DRILL_CONTENT_AUTHOR', CURRENT_TIMESTAMP
FROM "FunctionalRole" fr
WHERE fr."systemKey" IN ('HEAD_COACH', 'ASSISTANT_COACH')
ON CONFLICT ("roleDefinitionId", "capability") DO NOTHING;

INSERT INTO "RoleCapability" ("id", "roleDefinitionId", "capability", "createdAt")
SELECT
  'drill-review-' || md5(fr."id"), fr."id", 'DRILL_CONTENT_REVIEW', CURRENT_TIMESTAMP
FROM "FunctionalRole" fr
WHERE fr."systemKey" IN ('SPORTING_DIRECTOR', 'ACADEMY_DIRECTOR')
ON CONFLICT ("roleDefinitionId", "capability") DO NOTHING;
