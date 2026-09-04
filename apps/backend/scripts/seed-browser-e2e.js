const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const databaseUrl = process.env.E2E_DATABASE_URL;
const password = process.env.E2E_COACH_PASSWORD;
const email = process.env.E2E_COACH_EMAIL || 'coach.e2e@example.test';

if (!databaseUrl || process.env.E2E_ALLOW_DESTRUCTIVE_RESET !== 'true') {
  throw new Error(
    'Browser E2E seed requires E2E_DATABASE_URL and E2E_ALLOW_DESTRUCTIVE_RESET=true',
  );
}

const parsedDatabaseUrl = new URL(databaseUrl);
const databaseName = parsedDatabaseUrl.pathname.replace(/^\//, '');
if (
  !['postgres:', 'postgresql:'].includes(parsedDatabaseUrl.protocol) ||
  !/(e2e|test)/i.test(databaseName)
) {
  throw new Error(
    'E2E_DATABASE_URL must target a PostgreSQL database whose name contains e2e or test',
  );
}

if (!password || password.length < 12) {
  throw new Error('E2E_COACH_PASSWORD must be at least 12 characters');
}

const prisma = new PrismaClient({ datasourceUrl: databaseUrl });

async function resetBrowserE2eData() {
  await prisma.$transaction([
    prisma.securityAuditEvent.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.accountInvitation.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.dayPlan.deleteMany(),
    prisma.weekPlan.deleteMany(),
    prisma.match.deleteMany(),
    prisma.season.deleteMany(),
    prisma.planDrill.deleteMany(),
    prisma.trainingPlan.deleteMany(),
    prisma.drill.deleteMany(),
    prisma.groupMember.deleteMany(),
    prisma.user.deleteMany(),
    prisma.playerGroup.deleteMany(),
    prisma.club.deleteMany(),
  ]);
}

async function main() {
  await resetBrowserE2eData();

  const passwordHash = await bcrypt.hash(password, 10);
  const club = await prisma.club.create({
    data: { name: 'NGCS Browser E2E Kulübü' },
  });
  const group = await prisma.playerGroup.create({
    data: {
      name: 'E2E U17 Takımı',
      clubId: club.id,
      ageGroup: 'U18',
      category: 'ALT_YAPI',
    },
  });
  const [coach, arda, bora] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'E2E Koçu',
        email,
        passwordHash,
        role: 'COACH',
        clubId: club.id,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Arda E2E',
        email: 'arda.e2e@example.test',
        passwordHash,
        role: 'PLAYER',
        clubId: club.id,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bora E2E',
        email: 'bora.e2e@example.test',
        passwordHash,
        role: 'PLAYER',
        clubId: club.id,
      },
    }),
  ]);

  await prisma.groupMember.createMany({
    data: [coach, arda, bora].map((user) => ({
      groupId: group.id,
      userId: user.id,
    })),
  });

  await prisma.drill.createMany({
    data: [
      {
        title: 'E2E Dinamik Isınma',
        category: 'WARM_UP',
        ageGroup: 'U18',
        durationMin: 12,
        difficulty: 'EASY',
        jsonData: { steps: [] },
      },
      {
        title: 'E2E Pas İstasyonu',
        category: 'TECHNICAL',
        ageGroup: 'U18',
        durationMin: 20,
        difficulty: 'MEDIUM',
        jsonData: { steps: [] },
      },
      {
        title: 'E2E Yön Değiştirme',
        category: 'TECHNICAL',
        ageGroup: 'U18',
        durationMin: 24,
        difficulty: 'MEDIUM',
        jsonData: { steps: [] },
      },
      {
        title: 'E2E Ön Alan Baskısı',
        category: 'TACTICAL',
        ageGroup: 'U18',
        durationMin: 30,
        difficulty: 'HARD',
        jsonData: { steps: [] },
      },
      {
        title: 'E2E Aktif Soğuma',
        category: 'COOL_DOWN',
        ageGroup: 'U18',
        durationMin: 9,
        difficulty: 'EASY',
        jsonData: { steps: [] },
      },
    ],
  });

  const season = await prisma.season.create({
    data: {
      name: '2026–27 Test Sezonu',
      clubId: club.id,
      groupId: group.id,
      userId: coach.id,
      startDate: new Date('2026-08-01T00:00:00.000Z'),
      endDate: new Date('2027-05-31T00:00:00.000Z'),
    },
  });
  await prisma.weekPlan.create({
    data: {
      seasonId: season.id,
      weekNumber: 5,
      startDate: new Date('2026-08-31T00:00:00.000Z'),
      endDate: new Date('2026-09-06T23:59:59.999Z'),
    },
  });
  await prisma.match.create({
    data: {
      seasonId: season.id,
      groupId: group.id,
      date: new Date('2026-09-06T15:00:00.000Z'),
      opponent: 'E2E Rakibi U17',
      location: 'Deplasman',
      competition: 'Hazırlık Maçı',
      opponentAnalysis: {
        summary: 'Rakip ilk bölgede daralıyor.',
        opponentFormation: '4-4-2',
        focus: 'İlk bölge baskısı',
      },
      ourFormation: '4-3-3',
      notes: 'Başlangıç E2E koç notu.',
    },
  });

  console.log('Browser E2E fixture hazır:', {
    club: club.name,
    group: group.name,
    coachEmail: email,
    playerCount: 2,
    matchCount: 1,
    drillCount: 5,
  });
}

main()
  .catch((error) => {
    console.error('Browser E2E fixture kurulamadı:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
