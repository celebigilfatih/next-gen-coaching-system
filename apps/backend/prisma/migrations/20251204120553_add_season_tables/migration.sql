-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MacroCycle" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL DEFAULT 5,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MacroCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesoCycle" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "macroId" TEXT NOT NULL,
    "startWeek" INTEGER NOT NULL,
    "endWeek" INTEGER NOT NULL,
    "goal" TEXT NOT NULL,
    "intensityJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MesoCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MicroCycle" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "dayPlans" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MicroCycle_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "MatchWeekAnalysis" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "opponentName" TEXT NOT NULL,
    "opponentAnalysis" JSONB,
    "setPieces" JSONB,
    "videoLinks" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchWeekAnalysis_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MacroCycle" ADD CONSTRAINT "MacroCycle_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesoCycle" ADD CONSTRAINT "MesoCycle_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesoCycle" ADD CONSTRAINT "MesoCycle_macroId_fkey" FOREIGN KEY ("macroId") REFERENCES "MacroCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroCycle" ADD CONSTRAINT "MicroCycle_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLoad" ADD CONSTRAINT "PlayerLoad_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchWeekAnalysis" ADD CONSTRAINT "MatchWeekAnalysis_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchWeekAnalysis" ADD CONSTRAINT "MatchWeekAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
