import { BadRequestException, ForbiddenException } from '@nestjs/common';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { WorkspaceCatalogService } from './workspace-catalog.service';

describe('Selected legacy context and assignment role catalogs', () => {
  const actor: AuthPrincipal = {
    id: 'coach',
    userId: 'coach',
    email: 'coach@example.test',
    role: 'COACH',
    clubId: 'club',
  };
  const scope = { clubId: 'club', teamId: 'team', clubSeasonId: 'season' };
  let prisma: any;
  let auth: AuthorizationService;
  let service: WorkspaceCatalogService;
  beforeEach(() => {
    prisma = {
      team: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'team',
          clubId: 'club',
          legacyGroupId: 'group',
        }),
      },
      playerGroup: {
        findFirst: jest.fn().mockResolvedValue({ id: 'group', clubId: 'club' }),
      },
      season: {
        findFirst: jest.fn().mockResolvedValue({ id: 'legacy-season' }),
      },
      match: { findMany: jest.fn().mockResolvedValue([{ id: 'match' }]) },
      functionalRole: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'a' }, { id: 'b' }, { id: 'c' }]),
      },
    };
    auth = new AuthorizationService(prisma);
    jest.spyOn(auth, 'assertSportingCapability').mockResolvedValue(undefined);
    service = new WorkspaceCatalogService(prisma, auth);
  });
  it('loads only the selected group and season, checking current capability plus independent legacy membership', async () => {
    expect(await service.legacyContext(actor, scope)).toEqual({
      group: { id: 'group', clubId: 'club' },
      season: { id: 'legacy-season' },
      matches: [{ id: 'match' }],
    });
    expect(auth.assertSportingCapability).toHaveBeenCalledWith(
      actor,
      'TEAM_VIEW',
      'club',
      'team',
    );
    expect(prisma.playerGroup.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'group',
        clubId: 'club',
        archivedAt: null,
        members: { some: { userId: 'coach' } },
      },
      select: {
        id: true,
        clubId: true,
        name: true,
        ageGroup: true,
        category: true,
      },
    });
    const where = {
      groupId: 'group',
      clubId: 'club',
      teamSeason: { teamId: 'team', clubId: 'club', clubSeasonId: 'season' },
    };
    expect(prisma.season.findFirst.mock.calls[0][0].where).toEqual(where);
    expect(prisma.match.findMany.mock.calls[0][0].where).toEqual({
      season: where,
      seasonId: 'legacy-season',
    });
  });
  it.each(['season', '*'])(
    'omits match reads and fields from metadata for %s',
    async (clubSeasonId) => {
      const result = await service.legacyMetadata(actor, {
        ...scope,
        clubSeasonId,
      });
      expect(result.group?.id).toBe('group');
      expect(result).not.toHaveProperty('matches');
      expect(prisma.match.findMany).not.toHaveBeenCalled();
      expect(auth.assertSportingCapability).toHaveBeenCalled();
    },
  );
  it('keeps metadata closed for denied legacy membership and tenant', async () => {
    prisma.playerGroup.findFirst.mockResolvedValue(null);
    expect(await service.legacyMetadata(actor, scope)).toEqual({
      group: null,
      season: null,
    });
    await expect(
      service.legacyMetadata(actor, { ...scope, clubId: 'foreign' }),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.match.findMany).not.toHaveBeenCalled();
  });
  it('keeps all-seasons match rows complete in a single relational read without loading season arrays', async () => {
    prisma.match.findMany.mockResolvedValue(
      Array.from({ length: 40 }, (_, id) => ({ id })),
    );
    const result = await service.legacyContext(actor, {
      ...scope,
      clubSeasonId: '*',
    });
    expect(result.season).toBeNull();
    expect(result.matches).toHaveLength(40);
    expect(prisma.season.findFirst).not.toHaveBeenCalled();
    expect(prisma.match.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.match.findMany.mock.calls[0][0].where).toEqual({
      season: { groupId: 'group', clubId: 'club' },
    });
  });
  it.each(['SYSTEM_ADMIN', 'CLUB_ADMIN'] as const)(
    'preserves %s legacy group access without requiring membership',
    async (role) => {
      await service.legacyContext({ ...actor, role }, scope);
      expect(prisma.playerGroup.findFirst.mock.calls[0][0].where).toEqual({
        id: 'group',
        clubId: 'club',
        archivedAt: null,
      });
    },
  );
  it('does not let a sporting-only grant disclose legacy records', async () => {
    prisma.playerGroup.findFirst.mockResolvedValue(null);
    expect(await service.legacyContext(actor, scope)).toEqual({
      group: null,
      season: null,
      matches: [],
    });
    expect(prisma.match.findMany).not.toHaveBeenCalled();
  });
  it('returns empty context for native teams and no matches when no season is selected', async () => {
    await service.legacyContext(actor, { clubId: 'club', teamId: 'team' });
    expect(prisma.match.findMany).not.toHaveBeenCalled();
    prisma.team.findUnique.mockResolvedValue({
      id: 'team',
      clubId: 'club',
      legacyGroupId: null,
    });
    expect(await service.legacyContext(actor, scope)).toEqual({
      group: null,
      season: null,
      matches: [],
    });
  });
  it('denies mismatched tenant and revoked capability before reading legacy resources', async () => {
    await expect(
      service.legacyContext(actor, { ...scope, clubId: 'foreign' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    jest
      .mocked(auth.assertSportingCapability)
      .mockRejectedValue(new ForbiddenException());
    await expect(service.legacyContext(actor, scope)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.playerGroup.findFirst).not.toHaveBeenCalled();
    expect(prisma.match.findMany).not.toHaveBeenCalled();
  });
  it.each([{}, { ...scope, limit: '25' }, { teamId: ['team'] }])(
    'rejects invalid context query %j',
    async (input) => {
      await expect(service.legacyContext(actor, input)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.team.findUnique).not.toHaveBeenCalled();
    },
  );
  it('bounds player-role options and excludes capabilities from the projection', async () => {
    expect(
      await service.assignmentRoles(actor, {
        clubId: 'club',
        limit: '2',
        after: '0',
        q: '%',
      }),
    ).toEqual({ items: [{ id: 'a' }, { id: 'b' }], nextCursor: 'b', limit: 2 });
    expect(prisma.functionalRole.findMany).toHaveBeenCalledWith({
      where: {
        clubId: 'club',
        systemKey: 'PLAYER',
        name: { contains: '\\%', mode: 'insensitive' },
        id: { gt: '0' },
      },
      take: 3,
      orderBy: { id: 'asc' },
      select: { id: true, name: true, key: true, systemKey: true },
    });
  });
  it('rejects foreign club roles and unknown query fields', async () => {
    await expect(
      service.assignmentRoles(actor, { clubId: 'foreign' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.assignmentRoles(actor, { clubId: 'club', capabilities: 'ALL' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.assignmentRoles(actor, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.functionalRole.findMany).not.toHaveBeenCalled();
  });
});
