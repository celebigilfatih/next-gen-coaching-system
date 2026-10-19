import { BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  decodePlayerNameCursor,
  encodePlayerNameCursor,
  parsePlayerPageQuery,
} from './dto/player-page.dto';
import { SportingService } from './sporting.service';
import type { AuthPrincipal } from '../auth/auth-principal';

describe('Sporting player page', () => {
  const principal: AuthPrincipal = {
    id: 'coach',
    userId: 'coach',
    email: 'coach@example.test',
    role: 'COACH',
    clubId: 'club-a',
  };
  let prisma: any;
  let authorization: any;
  let service: SportingService;
  beforeEach(() => {
    prisma = {
      team: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'team-a', clubId: 'club-a' }),
      },
      user: { findUnique: jest.fn().mockResolvedValue({ personId: 'self' }) },
      person: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'a' }, { id: 'b' }, { id: 'c' }]),
        count: jest.fn().mockResolvedValue(3),
      },
      playerProfile: {
        groupBy: jest
          .fn()
          .mockResolvedValue([{ primaryPosition: null, _count: { _all: 3 } }]),
      },
    };
    authorization = {
      assertSportingCapability: jest.fn().mockResolvedValue(undefined),
    };
    service = new SportingService(prisma, authorization);
  });

  it.each([
    null,
    [],
    {},
    { teamId: [] },
    { teamId: 't', limit: '0' },
    { teamId: 't', limit: '101' },
    { teamId: 't', limit: '1.5' },
    { teamId: 't', limit: ['25', '25'] },
    { teamId: 't', limit: 25 },
    { teamId: 't', after: 'x'.repeat(161) },
    { teamId: 't', after: '' },
    { teamId: 't', q: [] },
    { teamId: 't', q: 'x'.repeat(101) },
    { teamId: 't', after: 'x'.repeat(513) },
    { teamId: 't', position: 'STOPER' },
    { teamId: 't', sort: 'POSITION_ASC' },
    { teamId: 't', scope: 'GLOBAL' },
  ])('rejects malformed/bounded query %j', (query) => {
    expect(() => parsePlayerPageQuery(query)).toThrow(BadRequestException);
  });

  it('defaults to 25 and accepts the maximum of 100', () => {
    expect(parsePlayerPageQuery({ teamId: 't' }).limit).toBe(25);
    expect(
      parsePlayerPageQuery({ teamId: 't', limit: '100', q: ' Arda ' }).q,
    ).toBe('Arda');
    expect(
      parsePlayerPageQuery({
        teamId: 't',
        position: 'KALECI',
        sort: 'NAME_DESC',
      }),
    ).toMatchObject({ position: 'KALECI', sort: 'NAME_DESC' });
  });

  it('round-trips versioned name cursors and rejects a cursor for another sort', () => {
    const cursor = encodePlayerNameCursor(
      { id: 'person-2', displayName: 'Aynı Ad' },
      'NAME_ASC',
    );
    expect(decodePlayerNameCursor(cursor, 'NAME_ASC')).toEqual({
      v: 1,
      sort: 'NAME_ASC',
      name: 'Aynı Ad',
      id: 'person-2',
    });
    expect(() => decodePlayerNameCursor(cursor, 'NAME_DESC')).toThrow(
      BadRequestException,
    );
    expect(() => decodePlayerNameCursor('not-a-cursor', 'NAME_ASC')).toThrow(
      BadRequestException,
    );
  });

  it('bounds root and nested reads; applies search, keyset and current team before pagination', async () => {
    const result = await service.listPlayerPage(principal, {
      teamId: 'team-a',
      limit: '2',
      after: '0',
      q: 'Arda',
    });
    expect(result).toEqual({
      items: [{ id: 'a' }, { id: 'b' }],
      nextCursor: 'b',
      limit: 2,
      total: 3,
      summary: {
        total: 3,
        positions: {
          KALECI: 0,
          DEFANS: 0,
          ORTA_SAHA: 0,
          FORVET: 0,
          UNASSIGNED: 3,
        },
      },
    });
    expect(authorization.assertSportingCapability).toHaveBeenCalledWith(
      principal,
      'PLAYER_VIEW',
      'club-a',
      'team-a',
    );
    const args = prisma.person.findMany.mock.calls[0][0];
    expect(args.take).toBe(3);
    expect(args.orderBy).toEqual({ id: 'asc' });
    expect(args.where).toMatchObject({
      clubId: 'club-a',
      AND: [{ id: { gt: '0' } }],
      displayName: { contains: 'Arda', mode: 'insensitive' },
      assignments: { some: { teamId: 'team-a', clubId: 'club-a' } },
    });
    expect(args.select.assignments.take).toBe(1);
    expect(args.select.assignments.where).toEqual(args.where.assignments.some);
    expect(args).not.toHaveProperty('skip');
    expect(args).not.toHaveProperty('cursor');
  });

  it('returns a null cursor on the last page, including empty results', async () => {
    prisma.person.findMany.mockResolvedValue([]);
    expect(
      await service.listPlayerPage(principal, { teamId: 'team-a' }),
    ).toEqual({
      items: [],
      nextCursor: null,
      limit: 25,
      total: 3,
      summary: {
        total: 3,
        positions: {
          KALECI: 0,
          DEFANS: 0,
          ORTA_SAHA: 0,
          FORVET: 0,
          UNASSIGNED: 3,
        },
      },
    });
  });

  it('applies position and stable name sorting before pagination', async () => {
    prisma.person.findMany.mockResolvedValue([
      { id: 'b', displayName: 'Bora' },
      { id: 'a', displayName: 'Bora' },
      { id: 'z', displayName: 'Zeki' },
    ]);
    const result = await service.listPlayerPage(principal, {
      teamId: 'team-a',
      limit: '2',
      position: 'DEFANS',
      sort: 'NAME_DESC',
    });
    expect(result.nextCursor).toEqual(expect.any(String));
    expect(
      decodePlayerNameCursor(result.nextCursor!, 'NAME_DESC'),
    ).toMatchObject({ name: 'Bora', id: 'a' });
    const args = prisma.person.findMany.mock.calls[0][0];
    expect(args.orderBy).toEqual([{ displayName: 'desc' }, { id: 'desc' }]);
    expect(args.where.playerProfile).toEqual({
      is: { primaryPosition: 'DEFANS' },
    });
  });

  it('uses the opaque name cursor as a deterministic tuple boundary', async () => {
    const after = encodePlayerNameCursor(
      { id: 'person-2', displayName: 'Deniz Kaya' },
      'NAME_ASC',
    );
    await service.listPlayerPage(principal, {
      teamId: 'team-a',
      after,
      sort: 'NAME_ASC',
    });
    expect(prisma.person.findMany.mock.calls[0][0].where.AND).toContainEqual({
      OR: [
        { displayName: { gt: 'Deniz Kaya' } },
        { displayName: 'Deniz Kaya', id: { gt: 'person-2' } },
      ],
    });
  });

  it('does not replace player self restriction with the cursor', async () => {
    await service.listPlayerPage(
      { ...principal, role: 'PLAYER' },
      { teamId: 'team-a', after: 'cursor' },
    );
    expect(prisma.person.findMany.mock.calls[0][0].where.AND).toEqual([
      { id: 'self' },
      { id: { gt: 'cursor' } },
    ]);
  });

  it('rejects foreign club/team before fetching players', async () => {
    prisma.team.findUnique.mockResolvedValue({
      id: 'team-b',
      clubId: 'club-b',
    });
    await expect(
      service.listPlayerPage(principal, { teamId: 'team-b' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.person.findMany).not.toHaveBeenCalled();
  });

  it('rechecks a revoked grant on a continuation request', async () => {
    authorization.assertSportingCapability.mockRejectedValue(
      new ForbiddenException(),
    );
    await expect(
      service.listPlayerPage(principal, { teamId: 'team-a', after: 'a' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.person.findMany).not.toHaveBeenCalled();
  });
});
