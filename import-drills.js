const { PrismaClient } = require('./apps/backend/node_modules/@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ngcs'
    }
  }
});

async function importDrills() {
  try {
    const drillsPath = path.join(__dirname, 'football_drills_135.json');
    console.log('📁 Reading from:', drillsPath);
    
    const drillsData = JSON.parse(fs.readFileSync(drillsPath, 'utf-8'));
    console.log(`📥 Found ${drillsData.length} drills to import...\n`);

    let imported = 0;
    let skipped = 0;

    for (const drill of drillsData) {
      const existing = await prisma.drill.findFirst({
        where: { title: drill.name },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Map category to schema enum
      let category;
      if (drill.category === 'Isınma') category = 'WARM_UP';
      else if (drill.category === 'Teknik') category = 'TECHNICAL';
      else if (drill.category === 'Taktik') category = 'TACTICAL';
      else category = 'TECHNICAL'; // default

      // Map age group
      const ageGroup = drill.age_group.replace('U', 'U'); // U8 -> U8

      await prisma.drill.create({
        data: {
          title: drill.name,
          category: category,
          ageGroup: ageGroup,
          durationMin: drill.duration,
          difficulty: 'MEDIUM', // default
          equipment: drill.equipment,
          jsonData: {
            description: drill.description,
            purpose: drill.purpose,
          },
        },
      });

      imported++;
      if (imported % 10 === 0) {
        console.log(`✅ Progress: ${imported}/${drillsData.length}...`);
      }
    }

    console.log('\n🎉 Import completed!');
    console.log(`✅ Imported: ${imported} new drills`);
    console.log(`⏭️  Skipped: ${skipped} existing drills`);
    console.log(`📊 Total in file: ${drillsData.length} drills`);

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importDrills();
