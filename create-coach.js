
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function run() {
  const club = await prisma.club.findFirst();
  if (!club) {
    console.log('❌ Club not found, run seed first');
    return;
  }
  
  const hash = await bcrypt.hash('demo123', 10);
  await prisma.user.upsert({
    where: { email: 'coach@demo.com' },
    update: {},
    create: {
      name: 'Demo Antrenör',
      email: 'coach@demo.com',
      passwordHash: hash,
      role: 'COACH',
      clubId: club.id
    }
  });
  console.log('✅ Demo coach created');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
