import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { AuthPrincipal } from '../auth/auth-principal';
import type { AuthorizationService } from '../auth/authorization.service';
import type { PrismaService } from '../prisma/prisma.service';
import { SportingTeamLifecycleService } from './team-lifecycle.service';

describe('SportingTeamLifecycleService', () => {
  const system: AuthPrincipal = {
    id: 'system',
    userId: 'system',
    email: 'system@example.test',
    role: 'SYSTEM_ADMIN',
    clubId: null,
  };
  const clubAdmin: AuthPrincipal = {
    ...system,
    id: 'club-admin',
    role: 'CLUB_ADMIN',
    clubId: 'club-a',
  };
  const clubSeason = {
    id: 'club-season-a',
    clubId: 'club-a',
    name: '2026–27',
    startDate: new Date('2026-07-01T00:00:00.000Z'),
    endDate: new Date('2027-06-30T00:00:00.000Z'),
  };
  const group = {
    id: 'team-a',
    clubId: 'club-a',
    name: 'U17',
    ageGroup: 'U17',
    category: 'ALT_YAPI',
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const projection = {
    id: 'team-a',
    clubId: 'club-a',
    name: 'U17',
    categoryKey: 'ALT_YAPI',
    categoryLabel: 'Altyapı',
    ageGroupLabel: 'U17',
    minimumAge: null,
    maximumAge: null,
    legacyGroupId: 'team-a',
    archivedAt: null,
    teamSeasons: [],
  };

  function fixture() {
    const tx: any = {
      playerGroup: {
        create: jest.fn().mockResolvedValue(group),
        findUniqueOrThrow: jest.fn().mockResolvedValue(group),
        update: jest.fn().mockResolvedValue(group),
      },
      team: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValue(projection),
        findUniqueOrThrow: jest.fn().mockResolvedValue(projection),
        upsert: jest.fn().mockResolvedValue(projection),
        update: jest.fn().mockResolvedValue(projection),
      },
      season: {
        create: jest.fn().mockResolvedValue({
          id: 'season-a',
          groupId: group.id,
          clubId: group.clubId,
          name: clubSeason.name,
          startDate: clubSeason.startDate,
          endDate: clubSeason.endDate,
          userId: system.id,
          teamSeasonId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        update: jest.fn(),
      },
      clubSeason: { upsert: jest.fn().mockResolvedValue(clubSeason) },
      teamSeason: {
        upsert: jest.fn().mockResolvedValue({ id: 'team-season-a' }),
      },
      securityAuditEvent: { create: jest.fn().mockResolvedValue({}) },
    };
    const prisma: any = {
      clubSeason: { findUnique: jest.fn().mockResolvedValue(clubSeason) },
      team: { findUnique: jest.fn() },
      $transaction: jest.fn((work: (client: unknown) => unknown) => work(tx)),
    };
    const authorization = {
      assertClubManage: jest.fn(),
    } as unknown as AuthorizationService;
    return {
      tx,
      prisma,
      authorization,
      service: new SportingTeamLifecycleService(
        prisma as PrismaService,
        authorization,
      ),
    };
  }

  it('creates academy legacy and canonical records in one serializable write', async () => {
    const { service, prisma, tx, authorization } = fixture();
    await expect(
      service.create(clubAdmin, {
        clubId: 'club-a',
        clubSeasonId: clubSeason.id,
        name: 'U17',
        ageGroupLabel: 'U17',
        classification: 'ACADEMY',
      }),
    ).resolves.toEqual(projection);
    expect(authorization.assertClubManage).toHaveBeenCalledWith(
      clubAdmin,
      'club-a',
    );
    expect(tx.playerGroup.create).toHaveBeenCalledWith({
      data: {
        clubId: 'club-a',
        name: 'U17',
        ageGroup: 'U17',
        category: 'ALT_YAPI',
      },
    });
    expect(tx.teamSeason.upsert).toHaveBeenCalled();
    expect(tx.securityAuditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'SPORTING_TEAM_CREATED',
        actorId: clubAdmin.id,
        clubId: 'club-a',
      }),
    });
    expect(prisma.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ isolationLevel: 'Serializable' }),
    );
  });

  it('allows only SYSTEM_ADMIN to create a first team', async () => {
    const { service, prisma } = fixture();
    await expect(
      service.create(clubAdmin, {
        clubId: 'club-a',
        clubSeasonId: clubSeason.id,
        name: 'A Takım',
        ageGroupLabel: 'SENIOR',
        classification: 'FIRST_TEAM',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('contains a concurrent second first-team conflict', async () => {
    const { service, prisma } = fixture();
    prisma.$transaction.mockRejectedValue({ code: 'P2002' });
    await expect(
      service.create(system, {
        clubId: 'club-a',
        clubSeasonId: clubSeason.id,
        name: 'A Takım',
        ageGroupLabel: 'SENIOR',
        classification: 'FIRST_TEAM',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updates the mapped group and canonical team together', async () => {
    const { service, prisma, tx } = fixture();
    prisma.team.findUnique.mockResolvedValue(projection);
    await service.update(clubAdmin, 'team-a', {
      name: 'U17 Gelişim',
      ageGroupLabel: 'Gelişim 1',
    });
    expect(tx.playerGroup.update).toHaveBeenCalledWith({
      where: { id: 'team-a' },
      data: { name: 'U17 Gelişim', ageGroup: 'Gelişim 1' },
    });
    expect(tx.securityAuditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'SPORTING_TEAM_UPDATED' }),
    });
  });

  it('refuses to archive the protected first team', async () => {
    const { service, prisma } = fixture();
    prisma.team.findUnique.mockResolvedValue({
      ...projection,
      categoryKey: 'A_TAKIM',
    });
    await expect(service.archive(clubAdmin, 'team-a')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('archives and restores both team projections without deleting history', async () => {
    const archived = { ...projection, archivedAt: new Date() };
    const first = fixture();
    first.prisma.team.findUnique.mockResolvedValue(projection);
    await first.service.archive(clubAdmin, 'team-a');
    expect(first.tx.team.update).toHaveBeenCalledWith({
      where: { id: 'team-a' },
      data: { archivedAt: expect.any(Date) },
    });
    expect(first.tx.playerGroup.update).toHaveBeenCalledWith({
      where: { id: 'team-a' },
      data: { archivedAt: expect.any(Date) },
    });
    expect(first.tx.groupMember).toBeUndefined();

    const second = fixture();
    second.prisma.team.findUnique.mockResolvedValue(archived);
    await second.service.restore(clubAdmin, 'team-a');
    expect(second.tx.team.update).toHaveBeenCalledWith({
      where: { id: 'team-a' },
      data: { archivedAt: null },
    });
    expect(second.tx.securityAuditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'SPORTING_TEAM_RESTORED' }),
    });
  });

  it('contains unexpected persistence details', async () => {
    const { service, prisma } = fixture();
    prisma.team.findUnique.mockResolvedValue(projection);
    prisma.$transaction.mockRejectedValue(new Error('private database query'));
    await expect(service.archive(clubAdmin, 'team-a')).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
