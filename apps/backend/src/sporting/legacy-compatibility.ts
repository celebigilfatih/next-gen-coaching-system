import { ConflictException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { GroupMember, PlayerGroup, Prisma, Season } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

type Transaction = Prisma.TransactionClient;
const membershipId = (id: string) =>
  `sa_${createHash('md5').update(id).digest('hex')}`;
const legacySources = ['PLAYER_GROUP_BACKFILL_V1', 'PLAYER_GROUP_SYNC_V1'];

export async function assertSportingAccountChange(
  tx: Transaction,
  userId: string,
  nextRole: string,
  nextClubId: string | null,
) {
  const user = await tx.user.findUniqueOrThrow({
    where: { id: userId },
    select: { role: true, clubId: true, personId: true },
  });
  if (!user.personId || (user.role === nextRole && user.clubId === nextClubId))
    return;
  // Moving a linked Person between clubs or rewriting granted functional roles
  // is a separate transfer operation, not a login-account PATCH side effect.
  if (
    user.clubId !== nextClubId ||
    (await tx.sportingAssignment.findFirst({
      where: {
        personId: user.personId,
        OR: [{ validTo: null }, { validTo: { gt: new Date() } }],
      },
      select: { id: true },
    }))
  )
    throw new ConflictException(
      'Sporting identity and assignments must be reconciled before changing account access',
    );
}

// The old API remains the writer for mapped facts. Both projections commit or
// roll back together; serializable retries also cover concurrent member adds.
export async function legacyWrite<T>(
  prisma: PrismaService,
  work: (tx: Transaction) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(work, {
        isolationLevel: 'Serializable',
        timeout: 15_000,
      });
    } catch (error) {
      if (
        attempt < 2 &&
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2034'
      )
        continue;
      throw error;
    }
  }
}

export async function syncLegacyGroup(tx: Transaction, group: PlayerGroup) {
  const existing = await tx.team.findUnique({
    where: { legacyGroupId: group.id },
  });
  if (existing && existing.clubId !== group.clubId)
    throw new ConflictException('Legacy team mapping is outside the club');
  const data = {
    name: group.name,
    categoryKey: group.category,
    categoryLabel: group.category === 'A_TAKIM' ? 'A Takım' : 'Altyapı',
    ageGroupLabel: group.ageGroup,
  };
  return tx.team.upsert({
    where: { legacyGroupId: group.id },
    create: {
      id: group.id,
      clubId: group.clubId,
      legacyGroupId: group.id,
      ...data,
    },
    update: data,
  });
}

export async function syncLegacyPerson(tx: Transaction, userId: string) {
  const user = await tx.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      personId: true,
      name: true,
      birthDate: true,
      position: true,
      clubId: true,
      role: true,
    },
  });
  if (!user.clubId) return null;
  const personId = user.personId ?? user.id;
  const existing = await tx.person.findUnique({ where: { id: personId } });
  if (existing && existing.clubId !== user.clubId)
    throw new ConflictException(
      'Person transfer requires an explicit sporting transfer',
    );
  // Existing Person/profile facts are independent of login-account metadata.
  await tx.person.upsert({
    where: { id: personId },
    update: {},
    create: {
      id: personId,
      clubId: user.clubId,
      displayName: user.name,
      birthDate: user.birthDate,
    },
  });
  if (!user.personId)
    await tx.user.update({ where: { id: user.id }, data: { personId } });
  if (user.role === 'PLAYER')
    await tx.playerProfile.upsert({
      where: { personId },
      update: {},
      create: { personId, primaryPosition: user.position },
    });
  else
    await tx.staffProfile.upsert({
      where: { personId },
      update: {},
      create: { personId },
    });
  return { ...user, personId };
}

export async function syncLegacyMember(
  tx: Transaction,
  member: GroupMember,
  actorId?: string,
) {
  const group = await tx.playerGroup.findUniqueOrThrow({
    where: { id: member.groupId },
  });
  const person = await syncLegacyPerson(tx, member.userId);
  if (!person || person.clubId !== group.clubId)
    throw new ConflictException('Membership must belong to the person club');
  const team = await syncLegacyGroup(tx, group);
  const isPlayer = person.role === 'PLAYER';
  const key = isPlayer ? 'PLAYER' : 'LEGACY_STAFF';
  const previousRole = await tx.functionalRole.findUnique({
    where: { clubId_key: { clubId: group.clubId, key } },
    select: { id: true },
  });
  // Create defaults only on new roles. Never restore an explicitly revoked grant.
  const role = await tx.functionalRole.upsert({
    where: { clubId_key: { clubId: group.clubId, key } },
    update: {},
    create: {
      clubId: group.clubId,
      key,
      name: isPlayer ? 'Oyuncu' : 'Legacy staff üyeliği',
      systemKey: isPlayer ? 'PLAYER' : 'OTHER',
      capabilities: {
        create: (isPlayer
          ? (['TEAM_VIEW', 'PLAYER_VIEW'] as const)
          : ([
              'TEAM_VIEW',
              'PLAYER_VIEW',
              'PLAYER_HISTORY_VIEW',
              'ASSIGNMENT_VIEW',
              'AVAILABILITY_VIEW',
            ] as const)
        ).map((capability) => ({ capability })),
      },
    },
  });
  const id = membershipId(member.id);
  if (!previousRole)
    await tx.securityAuditEvent.create({
      data: {
        action: 'SPORTING_CAPABILITY_GRANTED',
        actorId,
        clubId: group.clubId,
        metadata: {
          roleDefinitionId: role.id,
          preset: key,
          source: 'PLAYER_GROUP_SYNC_V1',
        },
      },
    });
  const existing = await tx.sportingAssignment.findUnique({ where: { id } });
  if (existing) {
    if (
      existing.validTo ||
      existing.personId !== person.personId ||
      existing.teamId !== team.id ||
      existing.roleDefinitionId !== role.id
    )
      throw new ConflictException(
        'Legacy membership history requires reconciliation',
      );
    return existing;
  }
  const assignment = await tx.sportingAssignment.create({
    data: {
      id,
      clubId: group.clubId,
      personId: person.personId,
      teamId: team.id,
      roleDefinitionId: role.id,
      assignmentType: 'LEGACY_MEMBER',
      validFrom: member.createdAt,
      source: 'PLAYER_GROUP_SYNC_V1',
      createdById: actorId,
    },
  });
  await tx.securityAuditEvent.create({
    data: {
      action: 'SPORTING_ASSIGNMENT_CREATED',
      actorId,
      clubId: group.clubId,
      targetPersonId: person.personId,
      metadata: { assignmentId: id, source: 'PLAYER_GROUP_SYNC_V1' },
    },
  });
  return assignment;
}

export async function endLegacyMembers(
  tx: Transaction,
  groupId: string,
  userId?: string,
  actorId?: string,
) {
  const members = await tx.groupMember.findMany({
    where: { groupId, userId },
    select: { id: true },
  });
  const assignments = await tx.sportingAssignment.findMany({
    where: {
      id: { in: members.map((member) => membershipId(member.id)) },
      assignmentType: 'LEGACY_MEMBER',
      source: { in: legacySources },
      validTo: null,
    },
  });
  for (const assignment of assignments) {
    // PostgreSQL timestamps can be created in the same millisecond as removal.
    const validTo = new Date(
      Math.max(Date.now(), assignment.validFrom.getTime() + 1),
    );
    await tx.sportingAssignment.update({
      where: { id: assignment.id },
      data: { validTo },
    });
    await tx.securityAuditEvent.create({
      data: {
        action: 'SPORTING_ASSIGNMENT_ENDED',
        actorId,
        clubId: assignment.clubId,
        targetPersonId: assignment.personId,
        metadata: {
          assignmentId: assignment.id,
          source: 'PLAYER_GROUP_SYNC_V1',
        },
      },
    });
  }
}

export async function syncLegacySeason(tx: Transaction, season: Season) {
  const group = await tx.playerGroup.findUniqueOrThrow({
    where: { id: season.groupId },
  });
  if (season.clubId !== group.clubId)
    throw new ConflictException('Season must belong to its team club');
  const team = await syncLegacyGroup(tx, group);
  const context = {
    clubId: season.clubId,
    name: season.name,
    startDate: season.startDate,
    endDate: season.endDate,
  };
  const clubSeason = await tx.clubSeason.upsert({
    where: { clubId_name_startDate_endDate: context },
    update: {},
    create: context,
  });
  const teamSeason = await tx.teamSeason.upsert({
    where: {
      teamId_clubSeasonId: { teamId: team.id, clubSeasonId: clubSeason.id },
    },
    update: {},
    create: {
      clubId: season.clubId,
      teamId: team.id,
      clubSeasonId: clubSeason.id,
    },
  });
  await tx.season.update({
    where: { id: season.id },
    data: { teamSeasonId: teamSeason.id },
  });
  return teamSeason.id;
}
