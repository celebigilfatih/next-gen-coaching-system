const { createHash } = require('node:crypto');
const { PrismaClient, Prisma } = require('@prisma/client');

const databaseUrl = process.env.DATABASE_URL;
const clubName = process.env.NGCS_DEMO_CLUB_NAME;
const seasonName = process.env.NGCS_DEMO_SEASON_NAME;
const apply = process.env.NGCS_ALLOW_LOCAL_ROSTER_WRITE === 'true';
const source = 'LOCAL_DEMO_ROSTER_2026_09_09';

if (!databaseUrl || !clubName || !seasonName) {
  throw new Error(
    'DATABASE_URL, NGCS_DEMO_CLUB_NAME and NGCS_DEMO_SEASON_NAME are required',
  );
}

const parsed = new URL(databaseUrl);
const databaseName = parsed.pathname.replace(/^\//, '');
if (
  !['postgres:', 'postgresql:'].includes(parsed.protocol) ||
  !/(local|demo|test|e2e)/i.test(databaseName)
) {
  throw new Error(
    'Roster population is restricted to a local/demo/test database',
  );
}

const prisma = new PrismaClient({ datasourceUrl: databaseUrl });
const squadSize = 18;
const positions = [
  'KALECI',
  'KALECI',
  'DEFANS',
  'DEFANS',
  'DEFANS',
  'DEFANS',
  'DEFANS',
  'DEFANS',
  'ORTA_SAHA',
  'ORTA_SAHA',
  'ORTA_SAHA',
  'ORTA_SAHA',
  'ORTA_SAHA',
  'ORTA_SAHA',
  'FORVET',
  'FORVET',
  'FORVET',
  'FORVET',
];
const feet = ['RIGHT', 'LEFT', 'BOTH'];
const givenNames = [
  'Ahmet',
  'Mehmet',
  'Emir',
  'Kerem',
  'Mert',
  'Eren',
  'Arda',
  'Bora',
  'Can',
  'Deniz',
  'Yiğit',
  'Kaan',
  'Ozan',
  'Baran',
  'Berk',
  'Doruk',
  'Kuzey',
  'Atlas',
  'Demir',
  'Efe',
  'Ali',
  'Mustafa',
  'Emre',
  'Burak',
  'Onur',
  'Tolga',
  'Selim',
  'Umut',
  'Batuhan',
  'Furkan',
];
const familyNames = [
  'Yılmaz',
  'Kaya',
  'Demir',
  'Şahin',
  'Çelik',
  'Yıldız',
  'Aydın',
  'Arslan',
  'Doğan',
  'Kılıç',
  'Aslan',
  'Koç',
  'Kurt',
  'Özdemir',
  'Aksoy',
  'Polat',
  'Erdem',
  'Güneş',
  'Karaca',
  'Acar',
  'Tekin',
  'Ekinci',
  'Keskin',
  'Tunç',
  'Öztürk',
  'Kaplan',
  'Bulut',
  'Taş',
  'Avcı',
  'Işık',
];
const specifications = [
  {
    key: 'first-team',
    name: 'A Takım',
    label: 'SENIOR',
    category: 'A_TAKIM',
    nameOffset: 0,
  },
  {
    key: 'u12',
    name: 'U12 Takımı',
    label: 'U12',
    category: 'ALT_YAPI',
    nameOffset: 18,
  },
  {
    key: 'u14',
    name: 'U14 Takımı',
    label: 'U14',
    category: 'ALT_YAPI',
    nameOffset: 36,
  },
  {
    key: 'u16',
    name: 'U16 Takımı',
    label: 'U16',
    category: 'ALT_YAPI',
    nameOffset: 54,
  },
  {
    key: 'u18',
    name: 'U18 Takımı',
    label: 'U18',
    category: 'ALT_YAPI',
    nameOffset: 72,
  },
];

function stableId(prefix, ...parts) {
  const digest = createHash('sha256').update(parts.join(':')).digest('hex');
  return `${prefix}_${digest.slice(0, 28)}`;
}

function rosterName(specification, index) {
  const globalIndex = specification.nameOffset + index;
  const givenName = givenNames[globalIndex % givenNames.length];
  const familyIndex =
    (globalIndex * 7 + Math.floor(globalIndex / givenNames.length) * 11) %
    familyNames.length;
  return `${givenName} ${familyNames[familyIndex]}`;
}

async function context() {
  const clubs = await prisma.club.findMany({
    where: { name: clubName },
    select: { id: true, name: true },
  });
  if (clubs.length !== 1)
    throw new Error(
      `Expected one club named ${clubName}; found ${clubs.length}`,
    );
  const seasons = await prisma.clubSeason.findMany({
    where: { clubId: clubs[0].id, name: seasonName },
    select: {
      id: true,
      clubId: true,
      name: true,
      startDate: true,
      endDate: true,
    },
  });
  if (seasons.length !== 1)
    throw new Error(
      `Expected one club season named ${seasonName}; found ${seasons.length}`,
    );
  const actor = await prisma.user.findFirst({
    where: { role: 'SYSTEM_ADMIN', status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  if (!actor) throw new Error('An active SYSTEM_ADMIN is required');
  const playerRole = await prisma.functionalRole.findUnique({
    where: { clubId_key: { clubId: clubs[0].id, key: 'PLAYER' } },
    select: { id: true },
  });
  if (!playerRole)
    throw new Error('The club PLAYER functional role is required');
  return { club: clubs[0], season: seasons[0], actor, playerRole };
}

async function findExistingTeam(tx, clubId, specification) {
  if (specification.category === 'A_TAKIM') {
    return tx.team.findMany({
      where: { clubId, categoryKey: 'A_TAKIM', archivedAt: null },
    });
  }
  return tx.team.findMany({
    where: {
      clubId,
      categoryKey: 'ALT_YAPI',
      archivedAt: null,
      OR: [
        { ageGroupLabel: specification.label },
        ...(specification.label === 'U18' ? [{ name: 'E2E U17 Takımı' }] : []),
      ],
    },
  });
}

async function ensureTeam(tx, club, season, actor, specification) {
  const matches = await findExistingTeam(tx, club.id, specification);
  if (matches.length > 1)
    throw new Error(`Multiple active teams match ${specification.label}`);

  const created = matches.length === 0;
  let team = matches[0];
  let groupId = team?.legacyGroupId;
  if (!groupId) {
    groupId = team?.id ?? stableId('demo_team', club.id, specification.key);
    await tx.playerGroup.create({
      data: {
        id: groupId,
        clubId: club.id,
        name: specification.name,
        ageGroup: specification.label,
        category: specification.category,
      },
    });
  } else {
    await tx.playerGroup.update({
      where: { id: groupId },
      data: {
        name: specification.name,
        ageGroup: specification.label,
        category: specification.category,
        archivedAt: null,
      },
    });
  }

  const teamData = {
    clubId: club.id,
    name: specification.name,
    categoryKey: specification.category,
    categoryLabel: specification.category === 'A_TAKIM' ? 'A Takım' : 'Altyapı',
    ageGroupLabel: specification.label,
    legacyGroupId: groupId,
    archivedAt: null,
  };
  team = team
    ? await tx.team.update({ where: { id: team.id }, data: teamData })
    : await tx.team.create({ data: { id: groupId, ...teamData } });

  const teamSeason = await tx.teamSeason.upsert({
    where: {
      teamId_clubSeasonId: {
        teamId: team.id,
        clubSeasonId: season.id,
      },
    },
    update: { clubId: club.id },
    create: {
      id: stableId('demo_ts', team.id, season.id),
      clubId: club.id,
      teamId: team.id,
      clubSeasonId: season.id,
    },
  });

  const legacySeason = await tx.season.findFirst({
    where: { clubId: club.id, groupId },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  if (legacySeason) {
    await tx.season.update({
      where: { id: legacySeason.id },
      data: {
        name: season.name,
        startDate: season.startDate,
        endDate: season.endDate,
        teamSeasonId: teamSeason.id,
      },
    });
  } else {
    await tx.season.create({
      data: {
        id: stableId('demo_season', team.id, season.id),
        clubId: club.id,
        groupId,
        name: season.name,
        startDate: season.startDate,
        endDate: season.endDate,
        userId: actor.id,
        teamSeasonId: teamSeason.id,
      },
    });
  }

  if (created || matches[0]?.name !== specification.name) {
    await tx.securityAuditEvent.create({
      data: {
        action: created ? 'SPORTING_TEAM_CREATED' : 'SPORTING_TEAM_UPDATED',
        actorId: actor.id,
        clubId: club.id,
        metadata: {
          teamId: team.id,
          fixture: source,
          classification:
            specification.category === 'A_TAKIM' ? 'FIRST_TEAM' : 'ACADEMY',
        },
      },
    });
  }
  return { team, teamSeason, specification, created };
}

async function ensureSquad(tx, teamContext, club, season, actor, playerRole) {
  const asOf = new Date();
  const active = await tx.sportingAssignment.findMany({
    where: {
      clubId: club.id,
      teamId: teamContext.team.id,
      validFrom: { lte: asOf },
      OR: [{ validTo: null }, { validTo: { gt: asOf } }],
      person: { playerProfile: { isNot: null } },
    },
    distinct: ['personId'],
    select: { personId: true },
  });
  let needed = Math.max(0, squadSize - active.length);
  let created = 0;
  for (let slot = 1; needed > 0 && slot <= squadSize; slot += 1) {
    const personId = stableId(
      'demo_person',
      club.id,
      teamContext.specification.key,
      String(slot),
    );
    if (active.some((item) => item.personId === personId)) continue;
    const position = positions[slot - 1];
    const label = teamContext.specification.label;
    await tx.person.upsert({
      where: { id: personId },
      update: {},
      create: {
        id: personId,
        clubId: club.id,
        displayName: `${label} Demo Oyuncu ${String(slot).padStart(2, '0')}`,
      },
    });
    await tx.playerProfile.upsert({
      where: { personId },
      update: {},
      create: {
        personId,
        primaryPosition: position,
        preferredFoot: feet[(slot - 1) % feet.length],
      },
    });
    const assignmentId = stableId(
      'demo_assignment',
      teamContext.team.id,
      personId,
    );
    const existingAssignment = await tx.sportingAssignment.findUnique({
      where: { id: assignmentId },
      select: { id: true },
    });
    if (!existingAssignment) {
      await tx.sportingAssignment.create({
        data: {
          id: assignmentId,
          clubId: club.id,
          personId,
          teamId: teamContext.team.id,
          teamSeasonId: teamContext.teamSeason.id,
          roleDefinitionId: playerRole.id,
          assignmentType: 'PRIMARY_REGISTERED',
          validFrom: season.startDate,
          reason: 'Yerel demo kadro kurulumu',
          source,
          createdById: actor.id,
        },
      });
      await tx.securityAuditEvent.create({
        data: {
          action: 'SPORTING_ASSIGNMENT_CREATED',
          actorId: actor.id,
          targetPersonId: personId,
          clubId: club.id,
          metadata: {
            assignmentId,
            teamId: teamContext.team.id,
            fixture: source,
          },
        },
      });
      created += 1;
      needed -= 1;
    }
  }
  if (needed > 0)
    throw new Error(
      `${teamContext.specification.label} squad could not reach ${squadSize}`,
    );

  const finalRoster = await tx.sportingAssignment.findMany({
    where: {
      clubId: club.id,
      teamId: teamContext.team.id,
      validFrom: { lte: asOf },
      OR: [{ validTo: null }, { validTo: { gt: asOf } }],
      person: { playerProfile: { isNot: null } },
    },
    distinct: ['personId'],
    orderBy: { personId: 'asc' },
    select: {
      personId: true,
      person: { select: { displayName: true } },
    },
  });
  let renamed = 0;
  for (const [index, assignment] of finalRoster.entries()) {
    const displayName = rosterName(teamContext.specification, index);
    if (assignment.person.displayName === displayName) continue;
    await tx.person.update({
      where: { id: assignment.personId },
      data: { displayName },
    });
    await tx.user.updateMany({
      where: { personId: assignment.personId },
      data: { name: displayName },
    });
    renamed += 1;
  }
  return {
    previousPlayers: active.length,
    createdPlayers: created,
    renamedPlayers: renamed,
  };
}

async function main() {
  const resolved = await context();
  if (!apply) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          database: databaseName,
          club: resolved.club.name,
          season: resolved.season.name,
          squads: specifications.map((item) => ({
            team: item.name,
            ageGroupLabel: item.label,
            targetPlayers: squadSize,
          })),
        },
        null,
        2,
      ),
    );
    return;
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const summaries = [];
      for (const specification of specifications) {
        const teamContext = await ensureTeam(
          tx,
          resolved.club,
          resolved.season,
          resolved.actor,
          specification,
        );
        const roster = await ensureSquad(
          tx,
          teamContext,
          resolved.club,
          resolved.season,
          resolved.actor,
          resolved.playerRole,
        );
        summaries.push({
          teamId: teamContext.team.id,
          team: teamContext.team.name,
          ageGroupLabel: specification.label,
          createdTeam: teamContext.created,
          ...roster,
        });
      }
      return summaries;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 30_000,
    },
  );
  console.log(JSON.stringify({ mode: 'applied', squads: result }, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
