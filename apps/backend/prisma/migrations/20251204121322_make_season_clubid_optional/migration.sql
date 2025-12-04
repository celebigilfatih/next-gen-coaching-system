-- DropForeignKey
ALTER TABLE "public"."Season" DROP CONSTRAINT "Season_clubId_fkey";

-- AlterTable
ALTER TABLE "Season" ALTER COLUMN "clubId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;
