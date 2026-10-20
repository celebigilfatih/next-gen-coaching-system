import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { AuthPrincipal } from '../auth/auth-principal';
import { MatchCatalogService } from './match-catalog.service';
import {
  matchBoundary,
  matchCursor,
  parseMatchPageQuery,
} from './dto/match-page.dto';

const cursor = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');
describe('Bounded match catalog', () => {
  const principal = {
    id: 'coach',
    clubId: 'club',
    role: 'COACH',
  } as AuthPrincipal;
  const date = new Date('2026-09-01T00:00:00Z');
  let prisma: any;
  let auth: any;
  let service: MatchCatalogService;
  beforeEach(() => {
    prisma = {
      match: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: 'a', opponentAnalysis: 'notes' }),
        findMany: jest
          .fn()
          .mockResolvedValueOnce([
            { id: 'a', date },
            { id: 'b', date },
          ])
          .mockResolvedValueOnce([{ id: 'a' }]),
        count: jest.fn().mockResolvedValue(130),
      },
      season: { findFirst: jest.fn().mockResolvedValue({ id: 'season' }) },
    };
    auth = {
      assertGroupView: jest
        .fn()
        .mockResolvedValue({ id: 'group', clubId: 'club' }),
    };
    service = new MatchCatalogService(prisma, auth);
  });
  it('reads one detail only within the authorized season ownership scope', async () => {
    expect(
      await service.detail(principal, 'a', {
        groupId: 'group',
        seasonId: 'season',
      }),
    ).toEqual({ id: 'a', opponentAnalysis: 'notes' });
    const read = prisma.match.findFirst.mock.calls[0][0];
    expect(auth.assertGroupView).toHaveBeenCalledWith(principal, 'group');
    expect(read.where).toEqual({
      id: 'a',
      seasonId: 'season',
      season: { groupId: 'group', clubId: 'club' },
    });
    expect(read.select.tacticalBoard).toBe(true);
    expect(read.select.opponentAnalysis).toBe(true);
    expect(read.select.videoLinks).toBeUndefined();
    expect(read.select.season).toBeUndefined();
    expect(prisma.match.findMany).not.toHaveBeenCalled();
  });
  it('reads V2-safe metadata without transferring the board JSON', async () => {
    prisma.match.count.mockResolvedValue(1);
    expect(
      await service.metadata(principal, 'a', {
        groupId: 'group',
        seasonId: 'season',
      }),
    ).toEqual({ id: 'a', opponentAnalysis: 'notes', hasBoard: true });
    expect(prisma.match.findFirst.mock.calls[0][0]).toMatchObject({
      where: {
        id: 'a',
        seasonId: 'season',
        season: { groupId: 'group', clubId: 'club' },
      },
      select: { tacticalBoard: false, opponentAnalysis: true },
    });
    expect(prisma.match.count).toHaveBeenCalledTimes(1);
  });
  it('does not read a board presence marker after denied or missing metadata', async () => {
    prisma.match.findFirst.mockResolvedValue(null);
    await expect(
      service.metadata(principal, 'missing', { groupId: 'group' }),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.match.count).not.toHaveBeenCalled();
    auth.assertGroupView.mockRejectedValue(new ForbiddenException());
    await expect(
      service.metadata(principal, 'a', { groupId: 'group' }),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.match.count).not.toHaveBeenCalled();
  });
  it('metadata rejects unknown query fields before reading the database', async () => {
    await expect(
      service.metadata(principal, 'a', {
        groupId: 'group',
        includeBoard: 'true',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.match.findFirst).not.toHaveBeenCalled();
    expect(prisma.match.count).not.toHaveBeenCalled();
  });
  it('does not disclose a missing or foreign detail and fails before a denied-group read', async () => {
    prisma.match.findFirst.mockResolvedValue(null);
    await expect(
      service.detail(principal, 'foreign', { groupId: 'group' }),
    ).rejects.toThrow(NotFoundException);
    prisma.match.findFirst.mockClear();
    auth.assertGroupView.mockRejectedValue(new ForbiddenException());
    await expect(
      service.detail(principal, 'a', { groupId: 'group' }),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.match.findFirst).not.toHaveBeenCalled();
  });
  it.each([
    { groupId: 'group', limit: '1' },
    { groupId: 'group', from: 'bad' },
    {},
    { groupId: ['group'] },
    { groupId: 'group', createdById: 'coach' },
  ])('rejects unsupported detail query %j', async (query) => {
    await expect(service.detail(principal, 'a', query)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.match.findFirst).not.toHaveBeenCalled();
  });
  it('bounds scalar rows, orders equal dates by ID and counts before the cursor', async () => {
    const after = matchCursor({ id: '0', date });
    const result = await service.page(principal, {
      groupId: 'group',
      seasonId: 'season',
      limit: '1',
      after,
    });
    expect(auth.assertGroupView).toHaveBeenCalledWith(principal, 'group');
    expect(result).toEqual({
      items: [{ id: 'a', date, hasBoard: true }],
      total: 130,
      limit: 1,
      nextCursor: matchCursor({ id: 'a', date }),
    });
    const read = prisma.match.findMany.mock.calls[0][0];
    expect(read.take).toBe(2);
    expect(read.orderBy).toEqual([{ date: 'asc' }, { id: 'asc' }]);
    expect(read.where.AND[0]).toEqual({
      season: { clubId: 'club', groupId: 'group' },
      seasonId: 'season',
    });
    expect(read.where.AND[1]).toEqual({
      OR: [{ date: { gt: date } }, { date, id: { gt: '0' } }],
    });
    expect(prisma.match.count).toHaveBeenCalledWith({
      where: read.where.AND[0],
    });
    for (const key of [
      'tacticalBoard',
      'opponentAnalysis',
      'videoLinks',
      'season',
      'group',
    ])
      expect(read.select[key]).toBeUndefined();
    const marker = prisma.match.findMany.mock.calls[1][0];
    expect(marker.where.AND[0]).toEqual(read.where.AND[0]);
    expect(marker.where.AND[1].id).toEqual({ in: ['a'] });
    expect(marker.select).toEqual({ id: true });
  });
  it('intersects the half-open local period with season scope', async () => {
    await service.page(principal, {
      groupId: 'group',
      seasonId: 'season',
      from: '2026-09-01T00:00:00+03:00',
      until: '2026-09-02T00:00:00+03:00',
    });
    expect(prisma.match.count.mock.calls[0][0].where).toEqual({
      season: { clubId: 'club', groupId: 'group' },
      seasonId: 'season',
      date: {
        gte: new Date('2026-08-31T21:00:00Z'),
        lt: new Date('2026-09-01T21:00:00Z'),
      },
    });
  });
  it('retains season-owned records without a direct match group filter', async () => {
    const result = await service.page(principal, { groupId: 'group' });
    expect(prisma.season.findFirst).not.toHaveBeenCalled();
    expect(prisma.match.count).toHaveBeenCalledWith({
      where: { season: { groupId: 'group', clubId: 'club' } },
    });
    expect(result.items[1].hasBoard).toBe(false);
    expect(result.nextCursor).toBeNull();
  });
  it('keeps full totals on an empty continuation and skips the marker query', async () => {
    prisma.match.findMany.mockReset().mockResolvedValue([]);
    const result = await service.page(principal, { groupId: 'group' });
    expect(result).toEqual({
      items: [],
      total: 130,
      limit: 25,
      nextCursor: null,
    });
    expect(prisma.match.findMany).toHaveBeenCalledTimes(1);
  });
  it('rejects mismatched season before reading matches', async () => {
    prisma.season.findFirst.mockResolvedValue(null);
    await expect(
      service.page(principal, { groupId: 'group', seasonId: 'foreign' }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.match.findMany).not.toHaveBeenCalled();
    expect(prisma.match.count).not.toHaveBeenCalled();
  });
  it('fails closed for denied group without executing match or season reads', async () => {
    auth.assertGroupView.mockRejectedValue(new ForbiddenException());
    await expect(
      service.page(principal, {
        groupId: 'foreign',
        seasonId: 'foreign',
        after: matchCursor({ id: 'a', date }),
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.match.findMany).not.toHaveBeenCalled();
    expect(prisma.season.findFirst).not.toHaveBeenCalled();
  });
  it('accepts defaults, maximum limit and round-trips the cursor', () => {
    expect(parseMatchPageQuery({ groupId: 'g' }).limit).toBe(25);
    expect(
      parseMatchPageQuery({
        groupId: 'g',
        limit: '100',
        after: matchCursor({ id: 'a', date }),
      }),
    ).toMatchObject({ limit: 100, after: { id: 'a', date } });
    expect(matchBoundary(undefined)).toEqual({});
  });
  it.each([
    null,
    [],
    {},
    { groupId: [] },
    { groupId: ' g' },
    { groupId: 'g\n' },
    { groupId: 'g', clubId: 'c' },
    { groupId: 'g', seasonId: null },
    ...['0', '01', '101', '1.5', '-1', '', 1, null, []].map((limit) => ({
      groupId: 'g',
      limit,
    })),
    ...[
      '!',
      '',
      cursor({ id: 'a', date: null }),
      cursor({ id: 'a', date: '2026-02-30T00:00:00Z' }),
      cursor({ id: 'a', date: '2026-01-01' }),
      cursor({ id: 'a', date: date.toISOString(), extra: 1 }),
    ].map((after) => ({ groupId: 'g', after })),
    { groupId: 'g', from: date.toISOString() },
    { groupId: 'g', from: date.toISOString(), until: date.toISOString() },
    { groupId: 'g', from: date.toISOString(), until: '2026-10-01T00:00:00Z' },
  ])('rejects malformed or unsupported query %j', (input) => {
    expect(() => parseMatchPageQuery(input)).toThrow(BadRequestException);
  });
});
