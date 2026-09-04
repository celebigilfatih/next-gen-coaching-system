const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const performances = await prisma.playerPerformance.findMany({
      orderBy: { date: 'desc' },
      take: 10
    });
    
    console.log('Last 10 PlayerPerformances:');
    performances.forEach(p => {
      console.log(`ID: ${p.id}, Type: ${p.analysisType}, Name: ${p.externalPlayerName || 'N/A'}, PlayerID: ${p.playerId}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
