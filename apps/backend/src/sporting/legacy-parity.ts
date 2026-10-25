import { createHash } from 'node:crypto';
import type { Prisma } from '@prisma/client';

// Aggregate-only, read-only reconciliation. No names, credentials or row contents.
export async function legacyParityReport(
  tx: Prisma.TransactionClient,
  clubId: string,
) {
  const [groups, seasons, users, members, active] = await Promise.all([
    tx.playerGroup.findMany({ where: { clubId }, include: { team: true } }),
    tx.season.findMany({
      where: { clubId },
      include: { teamSeason: { include: { clubSeason: true, team: true } } },
    }),
    tx.user.findMany({
      where: { clubId },
      select: { person: { select: { clubId: true } } },
    }),
    tx.groupMember.findMany({
      where: { group: { clubId } },
      select: {
        id: true,
        groupId: true,
        user: { select: { personId: true, clubId: true, role: true } },
      },
    }),
    tx.sportingAssignment.findMany({
      where: {
        clubId,
        assignmentType: 'LEGACY_MEMBER',
        validTo: null,
        source: { in: ['PLAYER_GROUP_BACKFILL_V1', 'PLAYER_GROUP_SYNC_V1'] },
      },
      include: {
        roleDefinition: { select: { key: true } },
        team: { select: { legacyGroupId: true } },
      },
    }),
  ]);
  const expectedIds = new Set(
    members.map((m) => `sa_${createHash('md5').update(m.id).digest('hex')}`),
  );
  const counts = {
    personMappings: users.filter((u) => u.person?.clubId !== clubId).length,
    teamMappings: groups.filter(
      (g) =>
        !g.team ||
        g.team.clubId !== clubId ||
        g.team.name !== g.name ||
        g.team.ageGroupLabel !== g.ageGroup ||
        g.team.categoryKey !== g.category,
    ).length,
    seasonMappings: seasons.filter(
      (s) =>
        !s.teamSeason ||
        s.teamSeason.clubId !== clubId ||
        s.teamSeason.team.legacyGroupId !== s.groupId ||
        s.teamSeason.clubSeason.clubId !== clubId ||
        s.teamSeason.clubSeason.name !== s.name ||
        +s.teamSeason.clubSeason.startDate !== +s.startDate ||
        +s.teamSeason.clubSeason.endDate !== +s.endDate,
    ).length,
    membershipMappings: members.filter((m) => {
      const id = `sa_${createHash('md5').update(m.id).digest('hex')}`;
      const a = active.find((item) => item.id === id);
      return (
        m.user.clubId !== clubId ||
        !a ||
        a.personId !== m.user.personId ||
        a.team?.legacyGroupId !== m.groupId ||
        a.roleDefinition.key !==
          (m.user.role === 'PLAYER' ? 'PLAYER' : 'LEGACY_STAFF')
      );
    }).length,
    orphanMemberships: active.filter((a) => !expectedIds.has(a.id)).length,
  };
  return {
    clubId,
    checkedAt: new Date(),
    status: Object.values(counts).some(Boolean) ? 'DRIFT' : 'IN_SYNC',
    discrepancies: counts,
  };
}
