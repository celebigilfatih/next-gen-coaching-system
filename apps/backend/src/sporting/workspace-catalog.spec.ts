import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { WorkspaceCatalogService } from './workspace-catalog.service';
import { catalogPage, parseCatalogQuery } from './dto/catalog.dto';
import type { AuthPrincipal } from '../auth/auth-principal';
import type { AuthorizationService } from '../auth/authorization.service';

describe('Workspace catalogs', () => {
  const actor: AuthPrincipal = {
    id: 'coach',
    userId: 'coach',
    email: 'coach@example.test',
    role: 'COACH',
    clubId: 'club-a',
  };
  let prisma: any;
  let service: WorkspaceCatalogService;
  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ personId: 'person' }) },
      team: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'a' }, { id: 'b' }, { id: 'c' }]),
        findFirst: jest.fn(),
      },
      club: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      clubSeason: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
      },
    };
    service = new WorkspaceCatalogService(prisma, {} as AuthorizationService);
  });
  it.each([
    null,
    [],
    { limit: '0' },
    { limit: '101' },
    { limit: '2.5' },
    { limit: ['25'] },
    { after: '' },
    { q: [] },
    { q: 'a'.repeat(101) },
    { teamId: 'a' },
    { clubId: 'a\nb' },
    { categoryKey: 'ACADEMY' },
    { status: 'DELETED' },
  ])('rejects malformed page query %j', (input) => {
    expect(() => parseCatalogQuery(input)).toThrow(BadRequestException);
  });
  it('accepts bounded defaults and rejects page fields on the selection resolver', () => {
    expect(parseCatalogQuery({}).limit).toBe(25);
    expect(parseCatalogQuery({ limit: '100' }).limit).toBe(100);
    expect(() => parseCatalogQuery({ after: 'a' }, true)).toThrow(
      BadRequestException,
    );
    expect(catalogPage([{ id: 'a' }], 25).nextCursor).toBeNull();
  });
  it('pushes current team and club-wide grants into the bounded team query', async () => {
    const result = await service.catalog(actor, 'teams', {
      clubId: 'club-a',
      clubSeasonId: 'season',
      limit: '2',
      after: '0',
      q: '%',
    });
    expect(result).toEqual({
      items: [{ id: 'a' }, { id: 'b' }],
      nextCursor: 'b',
      limit: 2,
    });
    const args = prisma.team.findMany.mock.calls[0][0];
    expect(args.take).toBe(3);
    expect(args.orderBy).toEqual({ id: 'asc' });
    expect(args.select.teamSeasons.take).toBe(1);
    expect(args.select.teamSeasons.where).toEqual({ clubSeasonId: 'season' });
    const scope = args.where.AND[0].AND[0];
    expect(scope.clubId).toBe('club-a');
    expect(scope.OR[0].assignments.some.personId).toBe('person');
    expect(scope.OR[1].club.sportingAssignments.some.teamId).toBeNull();
    expect(args.where.AND[1]).toEqual({ id: { gt: '0' } });
    expect(args.where.AND[2]).toEqual({
      name: { contains: '\\%', mode: 'insensitive' },
    });
  });
  it('denies foreign-club catalog before reading it', async () => {
    await expect(
      service.catalog(actor, 'teams', { clubId: 'foreign' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.team.findMany).not.toHaveBeenCalled();
  });
  it('pushes team classification and archived state into the database query', async () => {
    await service.catalog({ ...actor, role: 'CLUB_ADMIN' }, 'teams', {
      clubId: 'club-a',
      categoryKey: 'ALT_YAPI',
      status: 'ARCHIVED',
    });
    const lifecycle = prisma.team.findMany.mock.calls[0][0].where.AND[0].AND;
    expect(lifecycle).toContainEqual({ archivedAt: { not: null } });
    expect(lifecycle).toContainEqual({ categoryKey: 'ALT_YAPI' });
  });
  it('keeps archived catalogs unavailable to operational roles', async () => {
    await expect(
      service.catalog(actor, 'teams', {
        clubId: 'club-a',
        status: 'ARCHIVED',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.team.findMany).not.toHaveBeenCalled();
  });
  it('requires a club for dependent catalog pages', async () => {
    await expect(service.catalog(actor, 'seasons', {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
  it('returns a fully empty selection when no club is visible', async () => {
    const result = await service.selection(
      { ...actor, role: 'SYSTEM_ADMIN' },
      {},
    );
    expect(result.scope).toEqual({ clubId: '', clubSeasonId: '', teamId: '' });
    expect(result.teams.items).toEqual([]);
    expect(prisma.team.findFirst).not.toHaveBeenCalled();
    expect(prisma.club.findMany.mock.calls[0][0].take).toBe(26);
  });
});
