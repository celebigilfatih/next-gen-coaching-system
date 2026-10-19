// Operator-only fixture for the explicitly approved Windows local setup.
// This is not the proposed product onboarding wizard or a production importer.
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');

const source = 'LOCAL_SPOR_MANAGE_EXAMPLE_2026_10_19';
const seasonName = '2026-2027';
const startDate = new Date('2026-08-14T00:00:00+03:00');
const endDate = new Date('2027-05-23T00:00:00+03:00');
const assignmentEnd = new Date('2027-05-24T00:00:00+03:00');
const sources = {
  season: 'https://www.tff.org/Default.aspx?ftxtId=50517&pageId=200',
  opponents: 'https://www.tff.org/Default.aspx?pageId=198',
  checkedOn: '2026-10-19',
};
const opponents = [
  'Galatasaray',
  'Arca Çorum FK',
  'Gaziantep FK',
  'Corendon Alanyaspor',
  'Gençlerbirliği',
  'Fenerbahçe',
  'Kasımpaşa',
  'Trabzonspor',
  'Tümosan Konyaspor',
  'Çaykur Rizespor',
  'Beşiktaş',
  'Eyüpspor',
  'İstanbul Başakşehir',
  'Kocaelispor',
  'Amed Sportif Faaliyetler',
  'Erzurumspor FK',
  'Samsunspor',
  'Göztepe',
];
const teams = [
  { key: 'first-team', name: 'A Takım', age: 'SENIOR', category: 'A_TAKIM' },
  ...Array.from({ length: 9 }, (_, index) => {
    const age = `U${index + 8}`;
    return {
      key: age.toLowerCase(),
      name: `${age} Takımı`,
      age,
      category: 'ALT_YAPI',
    };
  }),
];
const roles = [
  { key: 'HEAD_COACH', name: 'Başantrenör' },
  { key: 'ASSISTANT_COACH', name: 'Yardımcı antrenör' },
  { key: 'GOALKEEPER_COACH', name: 'Kaleci antrenörü' },
];
const givenNames = [
  'Emre',
  'Barış',
  'Onur',
  'Mert',
  'Eren',
  'Can',
  'Deniz',
  'Kaan',
  'Ozan',
  'Umut',
  'Selim',
  'Tolga',
  'Arda',
  'Bora',
  'Kerem',
  'Berk',
  'Yiğit',
  'Ali',
  'Ahmet',
  'Mehmet',
  'Burak',
  'Furkan',
  'Erhan',
  'Serkan',
  'Hakan',
  'Cem',
  'Murat',
  'Engin',
  'Levent',
  'Taylan',
];
const surnames = [
  'Yalçın',
  'Demir',
  'Kaya',
  'Aydın',
  'Şahin',
  'Arslan',
  'Aksoy',
  'Erdem',
  'Çelik',
  'Güneş',
];
const clubId = stableId('club', 'spor-manage');

function stableId(kind, key) {
  return `sm_${kind}_${createHash('sha256').update(`${source}:${key}`).digest('hex').slice(0, 24)}`;
}

function fixture() {
  const dates = [];
  // Synthetic Sundays, not official matchdays/kickoffs. Keep a winter break
  // and two additional rest weekends; finish inside the sourced season range.
  const breaks = new Set([
    '2026-12-27',
    '2027-01-03',
    '2027-01-10',
    '2026-11-15',
    '2027-03-28',
  ]);
  for (
    let time = Date.parse('2026-08-16T13:00:00Z');
    time <= Date.parse('2027-05-23T13:00:00Z');
    time += 7 * 86_400_000
  ) {
    const date = new Date(time);
    if (!breaks.has(date.toISOString().slice(0, 10))) dates.push(date);
  }
  assert.equal(dates.length, 36);
  return dates.map((date, index) => {
    const reverse = index >= opponents.length;
    const opponentIndex = index % opponents.length;
    const home = (opponentIndex % 2 === 0) !== reverse;
    return {
      id: stableId('match', String(index + 1)),
      date,
      opponent: opponents[opponentIndex],
      location: home ? 'İç saha (örnek saha)' : 'Deplasman (örnek saha)',
      competition: 'Örnek fikstür · Süper Lig rakipleri',
      notes: `ÖRNEK: Spor Manage için üretilmiş ${index + 1}. maç. Resmi TFF fikstürü, sonuç veya kulüp katılımı değildir. Tarih/saat ve saha örnektir; saat 16:00 Europe/Istanbul. Rakip adları: ${sources.opponents}; sezon tarihleri: ${sources.season}; kontrol: ${sources.checkedOn}.`,
    };
  });
}

function validateTarget(databaseUrl) {
  const target = new URL(databaseUrl);
  assert.ok(
    ['postgres:', 'postgresql:'].includes(target.protocol),
    'PostgreSQL is required',
  );
  assert.ok(
    ['localhost', '127.0.0.1'].includes(target.hostname),
    'Loopback database only',
  );
  assert.ok(
    ['/ngcs_local_session_dev', '/ngcs_spor_manage_setup_test'].includes(
      target.pathname,
    ),
    'Only the approved local database or dedicated verification database is allowed',
  );
  assert.notEqual(
    process.env.NODE_ENV,
    'production',
    'Production execution is prohibited',
  );
}

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  assert.ok(databaseUrl, 'DATABASE_URL is required');
  validateTarget(databaseUrl);
  assert.ok(
    process.env.NGCS_SETUP_ACTOR_EMAIL,
    'NGCS_SETUP_ACTOR_EMAIL is required',
  );
  const apply = process.env.NGCS_ALLOW_LOCAL_CLUB_SETUP === 'true';
  const { PrismaClient } = require('@prisma/client');
  const {
    legacyWrite,
    syncLegacyGroup,
    syncLegacySeason,
  } = require('../dist/sporting/legacy-compatibility');
  const prisma = new PrismaClient({ datasourceUrl: databaseUrl });
  try {
    const actor = await prisma.user.findUnique({
      where: { email: process.env.NGCS_SETUP_ACTOR_EMAIL },
      select: { id: true, role: true, status: true },
    });
    assert.ok(
      actor?.role === 'SYSTEM_ADMIN' && actor.status === 'ACTIVE',
      'Active SYSTEM_ADMIN operator required',
    );
    const existing = await prisma.club.findMany({
      where: { OR: [{ id: clubId }, { name: 'Spor Manage' }] },
      select: { id: true },
    });
    assert.ok(
      existing.every((club) => club.id === clubId),
      'A different Spor Manage club exists; refusing to merge or overwrite it',
    );
    const plan = {
      mode: apply ? 'apply' : 'dry-run',
      club: 'Spor Manage',
      season: seasonName,
      teams: teams.length,
      staff: teams.length * roles.length,
      matches: fixture().length,
      sources,
    };
    if (!apply) {
      console.log(JSON.stringify(plan));
      return;
    }
    const created = {};
    // Existing fixture rows must still match; reruns never overwrite edited data.
    const ensure = async (tx, model, data, ignore = []) => {
      const row = await tx[model].findUnique({ where: { id: data.id } });
      if (row) {
        for (const [field, expected] of Object.entries(data)) {
          if (ignore.includes(field)) continue;
          assert.deepEqual(
            row[field],
            expected,
            `Existing ${model}.${field} differs; refusing to overwrite`,
          );
        }
        return row;
      }
      created[model] = (created[model] ?? 0) + 1;
      return tx[model].create({ data });
    };
    await legacyWrite(prisma, async (tx) => {
      // Serialize repeated runs of this exact operator fixture.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(20261019, 1)`;
      for (const key of Object.keys(created)) delete created[key];
      const currentActor = await tx.user.findUnique({
        where: { id: actor.id },
        select: { role: true, status: true },
      });
      assert.ok(
        currentActor?.role === 'SYSTEM_ADMIN' &&
          currentActor.status === 'ACTIVE',
      );
      await ensure(tx, 'club', {
        id: clubId,
        name: 'Spor Manage',
        description:
          'Yerel çalışma kulübü. Teknik kadro ve Spor Manage maçları açıkça örnektir; resmi lig katılımı veya gerçek kişi görevlendirmesi değildir.',
      });
      // Operator fixture mirrors the approved local-roster maintenance pattern;
      // shared adapters preserve legacy/canonical parity. No schema is changed.
      for (const [teamIndex, specification] of teams.entries()) {
        const groupId = stableId('team', specification.key);
        if (
          !(await tx.playerGroup.findUnique({
            where: { id: groupId },
            select: { id: true },
          }))
        ) {
          assert.equal(
            await tx.team.count({
              where: {
                clubId,
                OR: [
                  { name: specification.name },
                  ...(specification.category === 'A_TAKIM'
                    ? [{ categoryKey: 'A_TAKIM' }]
                    : []),
                ],
              },
            }),
            0,
            'A conflicting team exists',
          );
        }
        const group = await ensure(tx, 'playerGroup', {
          id: groupId,
          clubId,
          name: specification.name,
          ageGroup: specification.age,
          category: specification.category,
        });
        assert.equal(
          group.archivedAt,
          null,
          'An archived group cannot be reused',
        );
        const mappedTeam = await tx.team.findUnique({
          where: { legacyGroupId: groupId },
        });
        if (mappedTeam) {
          assert.equal(mappedTeam.id, groupId);
          assert.equal(mappedTeam.clubId, clubId);
          assert.equal(mappedTeam.name, specification.name);
          assert.equal(mappedTeam.categoryKey, specification.category);
          assert.equal(mappedTeam.ageGroupLabel, specification.age);
          assert.equal(mappedTeam.archivedAt, null);
        } else await syncLegacyGroup(tx, group);
        const seasonId = stableId('season', specification.key);
        const season = await ensure(tx, 'season', {
          id: seasonId,
          clubId,
          groupId,
          name: seasonName,
          startDate,
          endDate,
          userId: actor.id,
        });
        const teamSeasonId =
          season.teamSeasonId ?? (await syncLegacySeason(tx, season));
        const context = await tx.teamSeason.findUniqueOrThrow({
          where: { id: teamSeasonId },
          include: { clubSeason: true },
        });
        assert.equal(context.clubId, clubId);
        assert.equal(context.teamId, groupId);
        assert.equal(context.clubSeason.clubId, clubId);
        assert.equal(context.clubSeason.name, seasonName);
        assert.deepEqual(context.clubSeason.startDate, startDate);
        assert.deepEqual(context.clubSeason.endDate, endDate);
        if (
          created.playerGroup &&
          !(await tx.securityAuditEvent.findUnique({
            where: { id: stableId('audit_team', specification.key) },
          }))
        ) {
          await ensure(tx, 'securityAuditEvent', {
            id: stableId('audit_team', specification.key),
            action: 'SPORTING_TEAM_CREATED',
            actorId: actor.id,
            clubId,
            metadata: {
              teamId: groupId,
              classification:
                specification.category === 'A_TAKIM' ? 'FIRST_TEAM' : 'ACADEMY',
              source,
            },
          });
        }
        for (const [roleIndex, role] of roles.entries()) {
          const roleId = stableId('role', role.key);
          await ensure(tx, 'functionalRole', {
            id: roleId,
            clubId,
            key: `EXAMPLE_${role.key}`,
            name: role.name,
            systemKey: role.key,
            description:
              'Örnek sportif görev; hesap erişimi veya capability grant içermez.',
          });
          assert.equal(
            await tx.roleCapability.count({
              where: { roleDefinitionId: roleId },
            }),
            0,
            'Example roles must have no access grants',
          );
          const personId = stableId(
            'staff',
            `${specification.key}:${role.key}`,
          );
          const nameIndex = teamIndex * roles.length + roleIndex;
          await ensure(tx, 'person', {
            id: personId,
            clubId,
            displayName: `${givenNames[nameIndex]} ${surnames[nameIndex % surnames.length]} (Örnek)`,
          });
          const staff = await tx.staffProfile.findUnique({
            where: { personId },
          });
          const title = `${specification.name} · ${role.name} (Örnek)`;
          if (staff)
            assert.equal(staff.title, title, 'Existing staff title differs');
          else {
            await tx.staffProfile.create({ data: { personId, title } });
            created.staffProfile = (created.staffProfile ?? 0) + 1;
          }
          const assignmentId = stableId(
            'assignment',
            `${specification.key}:${role.key}`,
          );
          const alreadyAssigned = await tx.sportingAssignment.findUnique({
            where: { id: assignmentId },
            select: { id: true },
          });
          await ensure(tx, 'sportingAssignment', {
            id: assignmentId,
            clubId,
            personId,
            teamId: groupId,
            teamSeasonId,
            roleDefinitionId: roleId,
            assignmentType: 'STAFF',
            validFrom: startDate,
            validTo: assignmentEnd,
            reason:
              'Kullanıcının onayladığı örnek teknik kadro; gerçek kişi ataması değildir.',
            source,
            createdById: actor.id,
          });
          if (!alreadyAssigned)
            await ensure(tx, 'securityAuditEvent', {
              id: stableId('audit_assignment', assignmentId),
              action: 'SPORTING_ASSIGNMENT_CREATED',
              actorId: actor.id,
              clubId,
              targetPersonId: personId,
              metadata: { assignmentId, source },
            });
        }
        if (specification.category === 'A_TAKIM') {
          for (const match of fixture())
            await ensure(tx, 'match', { ...match, seasonId, groupId }, [
              'notes',
            ]);
        }
      }
    });
    console.log(JSON.stringify({ ...plan, created }));
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module)
  run().catch(() => {
    // Do not print database URLs, operator identifiers or raw persistence errors.
    console.error(
      'Local club setup failed; no automatic overwrite/reset was attempted.',
    );
    process.exitCode = 1;
  });

module.exports = { fixture, teams, roles, validateTarget };
