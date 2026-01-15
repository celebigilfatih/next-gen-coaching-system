import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const data = {
    players: await prisma.user.count({ where: { role: "PLAYER" } }),
    performances: await prisma.playerPerformance.count(),
    teamPerformances: await prisma.teamPerformance.count(),
    scoutingReports: await prisma.scoutingReport.count(),
    matchAnalyses: await prisma.matchAnalysis.count()
  };
  console.log(JSON.stringify(data));
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
