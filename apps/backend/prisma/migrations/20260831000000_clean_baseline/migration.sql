-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AnalysisType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH', 'PLAYER');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SecurityAuditAction" AS ENUM ('SYSTEM_ADMIN_BOOTSTRAPPED', 'INVITATION_CREATED', 'INVITATION_REVOKED', 'INVITATION_ACCEPTED', 'ACCOUNT_SUSPENDED', 'ACCOUNT_REACTIVATED', 'ACCESS_CHANGED', 'PASSWORD_CHANGED', 'PASSWORD_RESET_ISSUED', 'PASSWORD_RESET_COMPLETED', 'SESSIONS_REVOKED');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('KALECI', 'DEFANS', 'ORTA_SAHA', 'FORVET');

-- CreateEnum
CREATE TYPE "DrillCategory" AS ENUM ('WARM_UP', 'TECHNICAL', 'TACTICAL', 'COOL_DOWN');

-- CreateEnum
CREATE TYPE "Phase" AS ENUM ('WARM_UP', 'TECHNICAL', 'TACTICAL', 'COOL_DOWN');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'SENIOR');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "TeamCategory" AS ENUM ('ALT_YAPI', 'A_TAKIM');

-- CreateEnum
CREATE TYPE "DayType" AS ENUM ('TRAINING', 'MATCH', 'REST', 'RECOVERY', 'TACTICAL', 'TOPLANTI', 'GORUSME');

-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('SAGLIK', 'HAREKET_SINIRLAMASI', 'IZOLASYON', 'YARALI');

-- CreateEnum
CREATE TYPE "HealthSeverity" AS ENUM ('HAFIF', 'ORTA', 'CIDDI');

-- CreateEnum
CREATE TYPE "PrimaryHealthStatus" AS ENUM ('SAGLIKLI', 'YUK_KONTROLLU', 'HAFIF_SAKATILIK', 'ORTA_SAKATILIK', 'CIDDI_SAKATILIK', 'REHABILITASYON', 'TEDAVI_ALTINDA', 'MAC_ANTRENMAN_DISI', 'KARANTINA_IZOLASYON');

-- CreateEnum
CREATE TYPE "InjuryType" AS ENUM ('MUSCLE', 'LIGAMENT', 'TENDON', 'BONE', 'OTHER');

-- CreateEnum
CREATE TYPE "MuscleInjuryType" AS ENUM ('ADALE_ZORLENMASI', 'KAS_YIRTIGI_GRADE1', 'KAS_YIRTIGI_GRADE2', 'KAS_YIRTIGI_GRADE3', 'KAS_SERTLIGI_SPAZM');

-- CreateEnum
CREATE TYPE "LigamentInjuryType" AS ENUM ('ACL', 'PCL', 'MCL', 'LCL', 'MENISKUS', 'AYAK_BILEGI_BURKULMASI');

-- CreateEnum
CREATE TYPE "TendonInjuryType" AS ENUM ('ASIL_TENDONU', 'PATELLAR_TENDONU', 'HAMSTRING_TENDONU');

-- CreateEnum
CREATE TYPE "BoneInjuryType" AS ENUM ('KIRIK', 'CATLAK', 'DARBE_KONTUZYONU');

-- CreateEnum
CREATE TYPE "BodyPart" AS ENUM ('AYAK_AYAK_BILEGI', 'DIZ', 'BALDIR', 'HAMSTRING', 'QUADRICEPS', 'KALCA', 'KASIK', 'BEL_SIRT', 'OMUZ', 'BOYUN');

-- CreateEnum
CREATE TYPE "RehabPhase" AS ENUM ('AKUT_DONEM', 'HAFIF_AKTIVITE', 'KUVVET_MOBILITE', 'TOPLA_CALISMA', 'MAC_ONCESI_HAZIRLIGI', 'TAM_KATILIM_ONAY');

-- CreateEnum
CREATE TYPE "TrainingParticipation" AS ENUM ('ANTRENMANA_KATILAMAZ', 'KISITLI_KATILIM', 'TAKIMDAN_AYRI', 'TAM_KATILIM', 'MAC_HAZIR');

-- CreateEnum
CREATE TYPE "EstimatedReturnDays" AS ENUM ('DAYS_3_5', 'DAYS_7', 'DAYS_14', 'DAYS_21_28', 'DAYS_30_90', 'DAYS_90_PLUS', 'BELIRSIZ');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "authVersion" INTEGER NOT NULL DEFAULT 0,
    "clubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "birthDate" TIMESTAMP(3),
    "position" "Position",

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" "TeamCategory" NOT NULL DEFAULT 'ALT_YAPI',

    CONSTRAINT "PlayerGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "clubId" TEXT,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "acceptedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityAuditEvent" (
    "id" TEXT NOT NULL,
    "action" "SecurityAuditAction" NOT NULL,
    "actorId" TEXT,
    "targetUserId" TEXT,
    "clubId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drill" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "DrillCategory" NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "equipment" TEXT,
    "jsonData" JSONB NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPlan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "groupId" TEXT,
    "date" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanDrill" (
    "id" TEXT NOT NULL,
    "trainingPlanId" TEXT NOT NULL,
    "drillId" TEXT NOT NULL,
    "phase" "Phase" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "PlanDrill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekPlan" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "totalLoad" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeekPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayPlan" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "DayType" NOT NULL DEFAULT 'TRAINING',
    "title" TEXT,
    "trainingPlanId" TEXT,
    "drillIds" JSONB,
    "duration" INTEGER,
    "intensity" INTEGER,
    "notes" TEXT,
    "location" TEXT,
    "topic" TEXT,
    "opponent" TEXT,
    "competition" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DayPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "opponent" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "competition" TEXT,
    "result" TEXT,
    "opponentAnalysis" JSONB,
    "ourFormation" TEXT,
    "notes" TEXT,
    "videoLinks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerLoad" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalDistance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hsr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sprintDistance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accelerations" INTEGER NOT NULL DEFAULT 0,
    "wellness" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerLoad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerPerformance" (
    "id" TEXT NOT NULL,
    "playerId" TEXT,
    "externalPlayerName" TEXT,
    "externalPlayerTeam" TEXT,
    "externalPlayerPosition" TEXT,
    "analysisType" "AnalysisType" NOT NULL DEFAULT 'INTERNAL',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "speed" INTEGER NOT NULL DEFAULT 0,
    "technique" INTEGER NOT NULL DEFAULT 0,
    "endurance" INTEGER NOT NULL DEFAULT 0,
    "tactical" INTEGER NOT NULL DEFAULT 0,
    "form" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "developmentPotential" JSONB,
    "formConsistency" JSONB,
    "healthStats" JSONB,
    "matchImpactStats" JSONB,
    "mentalStats" JSONB,
    "physicalStats" JSONB,
    "roleAnalysis" JSONB,
    "summaryDetails" JSONB,
    "tacticalStats" JSONB,
    "technicalStats" JSONB,

    CONSTRAINT "PlayerPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoAnalysis" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "duration" TEXT,
    "clipsCount" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT,
    "tags" JSONB,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisReport" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "parameters" JSONB,
    "fileUrl" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalysisReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamPerformance" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formation" TEXT,
    "passAccuracy" INTEGER,
    "possession" INTEGER,
    "shotsOnTarget" INTEGER,
    "goalsScored" INTEGER,
    "goalsConceded" INTEGER,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoutingReport" (
    "id" TEXT NOT NULL,
    "opponent" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formation" TEXT,
    "strengths" JSONB,
    "weaknesses" JSONB,
    "keyPlayers" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoutingReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchAnalysis" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opponent" TEXT NOT NULL,
    "location" TEXT,
    "competition" TEXT,
    "result" TEXT,
    "ourFormation" TEXT,
    "opponentFormation" TEXT,
    "possession" INTEGER,
    "passAccuracy" INTEGER,
    "shotsOnTarget" INTEGER,
    "goalsScored" INTEGER,
    "goalsConceded" INTEGER,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerHealthLog" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "status" "HealthStatus" NOT NULL,
    "severity" "HealthSeverity",
    "bodyPart" TEXT,
    "expectedReturnDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerHealthLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerHealthStatus" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "primaryStatus" "PrimaryHealthStatus" NOT NULL,
    "injuryType" "InjuryType",
    "muscleInjurySubtype" "MuscleInjuryType",
    "ligamentInjurySubtype" "LigamentInjuryType",
    "tendonInjurySubtype" "TendonInjuryType",
    "boneInjurySubtype" "BoneInjuryType",
    "bodyPart" "BodyPart",
    "rehabPhase" "RehabPhase",
    "trainingParticipation" "TrainingParticipation",
    "estimatedReturnDays" "EstimatedReturnDays",
    "clinicalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerHealthStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerCoachNote" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerCoachNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Enforce the approved global-versus-club administrator boundary.
ALTER TABLE "User" ADD CONSTRAINT "User_role_club_scope_check" CHECK (
    ("role" = 'SYSTEM_ADMIN' AND "clubId" IS NULL)
    OR ("role" <> 'SYSTEM_ADMIN' AND "clubId" IS NOT NULL)
);

-- Enforce invitation scope before an account can be accepted.
ALTER TABLE "AccountInvitation" ADD CONSTRAINT "AccountInvitation_role_club_scope_check" CHECK (
    ("role" = 'SYSTEM_ADMIN' AND "clubId" IS NULL)
    OR ("role" <> 'SYSTEM_ADMIN' AND "clubId" IS NOT NULL)
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountInvitation_tokenHash_key" ON "AccountInvitation"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "AccountInvitation_acceptedUserId_key" ON "AccountInvitation"("acceptedUserId");

-- CreateIndex
CREATE INDEX "AccountInvitation_email_idx" ON "AccountInvitation"("email");

-- CreateIndex
CREATE INDEX "AccountInvitation_expiresAt_idx" ON "AccountInvitation"("expiresAt");

-- CreateIndex
CREATE INDEX "AccountInvitation_clubId_idx" ON "AccountInvitation"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "SecurityAuditEvent_actorId_idx" ON "SecurityAuditEvent"("actorId");

-- CreateIndex
CREATE INDEX "SecurityAuditEvent_targetUserId_idx" ON "SecurityAuditEvent"("targetUserId");

-- CreateIndex
CREATE INDEX "SecurityAuditEvent_clubId_idx" ON "SecurityAuditEvent"("clubId");

-- CreateIndex
CREATE INDEX "SecurityAuditEvent_createdAt_idx" ON "SecurityAuditEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WeekPlan_seasonId_weekNumber_key" ON "WeekPlan"("seasonId", "weekNumber");

-- CreateIndex
CREATE INDEX "PlayerHealthLog_playerId_idx" ON "PlayerHealthLog"("playerId");

-- CreateIndex
CREATE INDEX "PlayerHealthLog_createdAt_idx" ON "PlayerHealthLog"("createdAt");

-- CreateIndex
CREATE INDEX "PlayerHealthStatus_playerId_idx" ON "PlayerHealthStatus"("playerId");

-- CreateIndex
CREATE INDEX "PlayerHealthStatus_createdAt_idx" ON "PlayerHealthStatus"("createdAt");

-- CreateIndex
CREATE INDEX "PlayerCoachNote_playerId_idx" ON "PlayerCoachNote"("playerId");

-- CreateIndex
CREATE INDEX "PlayerCoachNote_createdAt_idx" ON "PlayerCoachNote"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGroup" ADD CONSTRAINT "PlayerGroup_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PlayerGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountInvitation" ADD CONSTRAINT "AccountInvitation_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountInvitation" ADD CONSTRAINT "AccountInvitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountInvitation" ADD CONSTRAINT "AccountInvitation_acceptedUserId_fkey" FOREIGN KEY ("acceptedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAuditEvent" ADD CONSTRAINT "SecurityAuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAuditEvent" ADD CONSTRAINT "SecurityAuditEvent_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAuditEvent" ADD CONSTRAINT "SecurityAuditEvent_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlan" ADD CONSTRAINT "TrainingPlan_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlan" ADD CONSTRAINT "TrainingPlan_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlan" ADD CONSTRAINT "TrainingPlan_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PlayerGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanDrill" ADD CONSTRAINT "PlanDrill_drillId_fkey" FOREIGN KEY ("drillId") REFERENCES "Drill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanDrill" ADD CONSTRAINT "PlanDrill_trainingPlanId_fkey" FOREIGN KEY ("trainingPlanId") REFERENCES "TrainingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PlayerGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekPlan" ADD CONSTRAINT "WeekPlan_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayPlan" ADD CONSTRAINT "DayPlan_trainingPlanId_fkey" FOREIGN KEY ("trainingPlanId") REFERENCES "TrainingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayPlan" ADD CONSTRAINT "DayPlan_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "WeekPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PlayerGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLoad" ADD CONSTRAINT "PlayerLoad_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerPerformance" ADD CONSTRAINT "PlayerPerformance_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerHealthLog" ADD CONSTRAINT "PlayerHealthLog_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerHealthStatus" ADD CONSTRAINT "PlayerHealthStatus_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCoachNote" ADD CONSTRAINT "PlayerCoachNote_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
