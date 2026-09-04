const { PrismaClient } = require('./apps/backend/node_modules/@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ngcs'
    }
  }
});

async function deleteDrills() {
  try {
    console.log('🗑️  Deleting all drills from database...\n');

    // First, delete all PlanDrill relations (foreign key constraint)
    const planDrillsDeleted = await prisma.planDrill.deleteMany({});
    console.log(`✅ Deleted ${planDrillsDeleted.count} plan-drill relations`);

    // Now delete all drills
    const drillsDeleted = await prisma.drill.deleteMany({});
    console.log(`✅ Deleted ${drillsDeleted.count} drills`);

    console.log('\n🎉 All drills successfully deleted!');

  } catch (error) {
    console.error('❌ Delete failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteDrills();
