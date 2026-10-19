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
    prisma.playerNoteTeamGrant.deleteMany(),
    prisma.playerNoteRevision.deleteMany(),
    prisma.playerNote.deleteMany(),
    prisma.securityAuditEvent.deleteMany(),
    prisma.availabilityPeriod.deleteMany(),
    prisma.externalIdentity.deleteMany(),
    prisma.sportingAssignment.deleteMany(),
    prisma.roleCapability.deleteMany(),
    prisma.functionalRole.deleteMany(),
    prisma.teamSeason.deleteMany(),
    prisma.clubSeason.deleteMany(),
    prisma.team.deleteMany(),
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
    prisma.person.deleteMany(),
    prisma.club.deleteMany(),
  ]);
}

async function main() {
  await resetBrowserE2eData();

  const passwordHash = await bcrypt.hash(password, 10);
  const club = await prisma.club.create({
    data: { name: 'NGCS Browser E2E Kulübü' },
  });
  const secondClub = await prisma.club.create({
    data: { name: 'NGCS İkinci E2E Kulübü' },
  });
  const group = await prisma.playerGroup.create({
    data: {
      name: 'E2E U17 Takımı',
      clubId: club.id,
      ageGroup: 'U18',
      category: 'ALT_YAPI',
    },
  });
  const [coach, secondCoach, arda, bora] = await Promise.all([
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
        name: 'İkinci E2E Koçu',
        email: 'coach.second.e2e@example.test',
        passwordHash,
        role: 'COACH',
        clubId: secondClub.id,
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
  await Promise.all([
    prisma.user.create({
      data: {
        name: 'E2E Sistem Yöneticisi',
        email:
          process.env.E2E_SYSTEM_ADMIN_EMAIL ??
          'system.admin.e2e@example.test',
        passwordHash,
        role: 'SYSTEM_ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        name: 'E2E Kulüp Yöneticisi',
        email:
          process.env.E2E_CLUB_ADMIN_EMAIL ?? 'club.admin.e2e@example.test',
        passwordHash,
        role: 'CLUB_ADMIN',
        clubId: club.id,
      },
    }),
  ]);

  const [coachPerson, secondCoachPerson, ardaPerson, boraPerson] =
    await Promise.all([
      prisma.person.create({
        data: { clubId: club.id, displayName: coach.name },
      }),
      prisma.person.create({
        data: { clubId: secondClub.id, displayName: secondCoach.name },
      }),
      prisma.person.create({
        data: {
          clubId: club.id,
          displayName: arda.name,
          birthDate: new Date('2010-04-12T00:00:00.000Z'),
        },
      }),
      prisma.person.create({
        data: {
          clubId: club.id,
          displayName: bora.name,
          birthDate: new Date('2010-08-21T00:00:00.000Z'),
        },
      }),
    ]);
  await Promise.all([
    prisma.staffProfile.create({
      data: { personId: coachPerson.id, title: 'U17 Antrenörü' },
    }),
    prisma.staffProfile.create({
      data: { personId: secondCoachPerson.id, title: 'U17 Antrenörü' },
    }),
    prisma.playerProfile.create({
      data: {
        personId: ardaPerson.id,
        primaryPosition: 'ORTA_SAHA',
        preferredFoot: 'RIGHT',
      },
    }),
    prisma.playerProfile.create({
      data: {
        personId: boraPerson.id,
        primaryPosition: 'DEFANS',
        preferredFoot: 'LEFT',
      },
    }),
    prisma.user.update({
      where: { id: coach.id },
      data: { personId: coachPerson.id },
    }),
    prisma.user.update({
      where: { id: secondCoach.id },
      data: { personId: secondCoachPerson.id },
    }),
    prisma.user.update({
      where: { id: arda.id },
      data: { personId: ardaPerson.id },
    }),
    prisma.user.update({
      where: { id: bora.id },
      data: { personId: boraPerson.id },
    }),
  ]);

  await prisma.groupMember.createMany({
    data: [coach, arda, bora].map((user) => ({
      groupId: group.id,
      userId: user.id,
    })),
  });

  const secondGroup = await prisma.playerGroup.create({
    data: {
      name: 'İkinci E2E Takımı',
      clubId: secondClub.id,
      ageGroup: 'U18',
      category: 'ALT_YAPI',
    },
  });
  await prisma.groupMember.create({
    data: { groupId: secondGroup.id, userId: secondCoach.id },
  });

  const [team, secondTeam] = await Promise.all([
    prisma.team.create({
      data: {
        id: group.id,
        clubId: club.id,
        name: group.name,
        categoryKey: 'U17',
        categoryLabel: 'U17',
        ageGroupLabel: 'U17',
        legacyGroupId: group.id,
      },
    }),
    prisma.team.create({
      data: {
        id: secondGroup.id,
        clubId: secondClub.id,
        name: secondGroup.name,
        categoryKey: 'U17',
        categoryLabel: 'U17',
        ageGroupLabel: 'U17',
        legacyGroupId: secondGroup.id,
      },
    }),
  ]);

  const [playerRole, coachRole, secondCoachRole] = await Promise.all([
    prisma.functionalRole.create({
      data: {
        clubId: club.id,
        key: 'PLAYER',
        name: 'Oyuncu',
        systemKey: 'PLAYER',
      },
    }),
    prisma.functionalRole.create({
      data: {
        clubId: club.id,
        key: 'HEAD_COACH',
        name: 'Teknik direktör',
        systemKey: 'HEAD_COACH',
        capabilities: {
          create: [
            { capability: 'TEAM_VIEW' },
            { capability: 'PLAYER_VIEW' },
            { capability: 'PLAYER_HISTORY_VIEW' },
            { capability: 'ASSIGNMENT_VIEW' },
            { capability: 'ASSIGNMENT_MANAGE' },
            { capability: 'AVAILABILITY_VIEW' },
            { capability: 'PLAYER_NOTE_VIEW' },
            { capability: 'PLAYER_NOTE_MANAGE' },
          ],
        },
      },
    }),
    prisma.functionalRole.create({
      data: {
        clubId: secondClub.id,
        key: 'HEAD_COACH',
        name: 'Teknik direktör',
        systemKey: 'HEAD_COACH',
        capabilities: {
          create: [
            { capability: 'TEAM_VIEW' },
            { capability: 'PLAYER_NOTE_VIEW' },
            { capability: 'PLAYER_NOTE_MANAGE' },
          ],
        },
      },
    }),
  ]);
  await prisma.sportingAssignment.createMany({
    data: [
      {
        clubId: club.id,
        personId: coachPerson.id,
        teamId: team.id,
        roleDefinitionId: coachRole.id,
        assignmentType: 'STAFF',
        validFrom: new Date('2026-07-01T00:00:00.000Z'),
        source: 'BROWSER_E2E',
      },
      ...[ardaPerson, boraPerson].map((person) => ({
        clubId: club.id,
        personId: person.id,
        teamId: team.id,
        roleDefinitionId: playerRole.id,
        assignmentType: 'PRIMARY_REGISTERED',
        validFrom: new Date('2026-07-01T00:00:00.000Z'),
        source: 'BROWSER_E2E',
      })),
      {
        clubId: secondClub.id,
        personId: secondCoachPerson.id,
        teamId: secondTeam.id,
        roleDefinitionId: secondCoachRole.id,
        assignmentType: 'STAFF',
        validFrom: new Date('2026-07-01T00:00:00.000Z'),
        source: 'BROWSER_E2E',
      },
    ],
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
  const clubSeason = await prisma.clubSeason.create({
    data: {
      clubId: club.id,
      name: season.name,
      startDate: season.startDate,
      endDate: season.endDate,
    },
  });
  const teamSeason = await prisma.teamSeason.create({
    data: { clubId: club.id, teamId: team.id, clubSeasonId: clubSeason.id },
  });
  await prisma.season.update({
    where: { id: season.id },
    data: { teamSeasonId: teamSeason.id },
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

  if (process.env.E2E_MATCH_PAGE_FIXTURE === 'true') {
    await prisma.match.createMany({
      data: Array.from({ length: 30 }, (_, i) => ({
        id: `match-catalog-browser-${String(i).padStart(3, '0')}`,
        seasonId: season.id,
        groupId: group.id,
        date: new Date('2026-10-01T12:00:00Z'),
        opponent: `Match Catalog ${String(i).padStart(3, '0')}`,
        location: 'İç saha',
        competition: 'Sentetik test',
        ourFormation: '4-3-3',
        notes: 'Yalnız disposable test kaydı.',
        ...(i % 2 === 1
          ? {
              tacticalBoard: {
                schemaVersion: 1,
                kind: 'tactical-board',
                pitch: { type: 'full', width: 1200, height: 800 },
                elements: [],
              },
            }
          : {}),
      })),
    });
  }

  if (process.env.E2E_PLAYER_PAGE_FIXTURE === 'true') {
    // Native test-only players exercise multiple pages without changing legacy attendance fixtures.
    const ids = Array.from(
      { length: 30 },
      (_, i) => `paging-browser-${String(i).padStart(3, '0')}`,
    );
    await prisma.person.createMany({
      data: ids.map((id, i) => ({
        id,
        clubId: club.id,
        displayName: `Paging Player ${String(i).padStart(3, '0')}`,
      })),
    });
    await prisma.playerProfile.createMany({
      data: ids.map((personId) => ({ personId })),
    });
    await prisma.sportingAssignment.createMany({
      data: ids.map((personId) => ({
        clubId: club.id,
        personId,
        teamId: team.id,
        roleDefinitionId: playerRole.id,
        assignmentType: 'TRAINING_GUEST',
        validFrom: new Date('2026-01-01T00:00:00Z'),
      })),
    });
  }

  if (process.env.E2E_DRILL_PAGE_FIXTURE === 'true') {
    await prisma.drill.createMany({
      data: Array.from({ length: 30 }, (_, i) => ({
        id: `drill-catalog-browser-${String(i).padStart(3, '0')}`,
        title: `Library Catalog ${String(i).padStart(3, '0')}`,
        category: 'TACTICAL',
        ageGroup: 'U18',
        durationMin: 20,
        difficulty: 'EASY',
        createdAt: new Date('2030-01-01T00:00:00Z'),
        jsonData:
          i === 29 || process.env.E2E_TACTIC_PAGE_FIXTURE === 'true'
            ? {
                schemaVersion: 1,
                kind: 'tactical-board',
                pitch: { type: 'full', width: 1200, height: 800 },
                elements: [],
              }
            : { steps: [] },
      })),
    });
  }

  if (process.env.E2E_TRAINING_PAGE_FIXTURE === 'true') {
    await prisma.trainingPlan.createMany({
      data: Array.from({ length: 32 }, (_, i) => ({
        id: `training-catalog-browser-${String(i).padStart(3, '0')}`,
        title: `Training Catalog ${String(i).padStart(3, '0')}`,
        clubId: club.id,
        groupId: group.id,
        coachId: coach.id,
        date:
          i === 30
            ? null
            : new Date(
                i === 31 ? '2026-07-01T12:00:00Z' : '2026-09-04T12:00:00Z',
              ),
        totalDuration: i < 30 ? 60 : 10,
      })),
    });
  }

  if (process.env.E2E_HISTORY_FIXTURE === 'true') {
    await prisma.sportingAssignment.createMany({
      data: Array.from({ length: 30 }, (_, i) => ({
        id: `history-browser-${String(i).padStart(3, '0')}`,
        clubId: club.id,
        personId: ardaPerson.id,
        teamId: team.id,
        roleDefinitionId: playerRole.id,
        assignmentType: 'TRAINING_GUEST',
        validFrom: new Date('2026-05-01'),
        validTo: new Date('2026-06-01'),
        reason: `History fixture ${i}`,
      })),
    });
  }

  if (process.env.E2E_CATALOG_FIXTURE === 'true') {
    await prisma.functionalRole.createMany({
      data: Array.from({ length: 30 }, (_, i) => ({
        id: `z-catalog-browser-role-${String(i).padStart(3, '0')}`,
        clubId: club.id,
        key: `PLAYER_OPTION_${i}`,
        name: `Catalog Role ${String(i).padStart(3, '0')}`,
        systemKey: 'PLAYER',
      })),
    });
    const ids = Array.from(
      { length: 30 },
      (_, i) => `z-catalog-browser-team-${String(i).padStart(3, '0')}`,
    );
    const seasons = Array.from(
      { length: 30 },
      (_, i) => `z-catalog-browser-season-${String(i).padStart(3, '0')}`,
    );
    await prisma.team.createMany({
      data: ids.map((id, i) => ({
        id,
        clubId: club.id,
        name: `Catalog Team ${String(i).padStart(3, '0')}`,
        categoryKey: 'ACADEMY',
        categoryLabel: 'Altyapı',
      })),
    });
    await prisma.clubSeason.createMany({
      data: seasons.map((id, i) => ({
        id,
        clubId: club.id,
        name: `Catalog Season ${String(i).padStart(3, '0')}`,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
      })),
    });
    await prisma.teamSeason.createMany({
      data: [
        ...ids.map((teamId) => ({
          clubId: club.id,
          teamId,
          clubSeasonId: clubSeason.id,
        })),
        ...seasons.map((clubSeasonId) => ({
          clubId: club.id,
          teamId: team.id,
          clubSeasonId,
        })),
      ],
    });
    await prisma.sportingAssignment.createMany({
      data: ids.map((teamId) => ({
        clubId: club.id,
        personId: coachPerson.id,
        teamId,
        roleDefinitionId: coachRole.id,
        assignmentType: 'STAFF',
        validFrom: new Date('2026-01-01'),
      })),
    });
  }

  if (process.env.E2E_MEMBER_PAGE_FIXTURE === 'true') {
    if (process.env.E2E_CATALOG_FIXTURE !== 'true')
      throw new Error('Member fixture requires catalog fixture');
    const pagingGroup = await prisma.playerGroup.create({
      data: { name: 'Member Paging Group', clubId: club.id, ageGroup: 'U18' },
    });
    const pagingTeamId = 'z-catalog-browser-team-029';
    await prisma.team.update({
      where: { id: pagingTeamId },
      data: { legacyGroupId: pagingGroup.id },
    });
    const pagingTeamSeason = await prisma.teamSeason.findFirstOrThrow({
      where: { teamId: pagingTeamId, clubSeasonId: clubSeason.id },
    });
    await prisma.season.create({
      data: {
        name: 'Member Paging Season',
        clubId: club.id,
        groupId: pagingGroup.id,
        teamSeasonId: pagingTeamSeason.id,
        userId: coach.id,
        startDate: new Date('2026-07-01'),
        endDate: new Date('2027-06-30'),
      },
    });
    const userIds = Array.from(
      { length: 30 },
      (_, i) => `member-browser-user-${String(i).padStart(3, '0')}`,
    );
    await prisma.user.createMany({
      data: userIds.map((id, i) => ({
        id,
        name: `Member Player ${String(i).padStart(3, '0')}`,
        email: `${id}@example.test`,
        passwordHash: 'disabled-synthetic-login',
        role: 'PLAYER',
        clubId: club.id,
      })),
    });
    await prisma.groupMember.createMany({
      data: [
        ...userIds.map((userId, i) => ({
          id: `member-browser-row-${String(i).padStart(3, '0')}`,
          groupId: pagingGroup.id,
          userId,
        })),
        {
          id: 'member-browser-staff',
          groupId: pagingGroup.id,
          userId: coach.id,
        },
      ],
    });
    const attendancePlan = await prisma.trainingPlan.create({
      data: {
        id: 'member-browser-attendance-plan',
        title: 'Member Paging Attendance',
        clubId: club.id,
        groupId: pagingGroup.id,
        coachId: coach.id,
      },
    });
    await prisma.attendance.createMany({
      data: [userIds[0], userIds[29]].map((playerId) => ({
        planId: attendancePlan.id,
        playerId,
        status: 'PRESENT',
      })),
    });
  }

  console.log('Browser E2E fixture hazır:', {
    club: club.name,
    group: group.name,
    coachEmail: email,
    playerCount: 2,
    nativePagingPlayers:
      process.env.E2E_PLAYER_PAGE_FIXTURE === 'true' ? 30 : 0,
    nativeCatalogTeams: process.env.E2E_CATALOG_FIXTURE === 'true' ? 30 : 0,
    matchCount: process.env.E2E_MATCH_PAGE_FIXTURE === 'true' ? 31 : 1,
    drillCount: process.env.E2E_DRILL_PAGE_FIXTURE === 'true' ? 35 : 5,
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
