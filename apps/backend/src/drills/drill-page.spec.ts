import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DrillsService } from './drills.service';
import { parseDrillPageQuery } from './drill-page.dto';
import type { AuthPrincipal } from '../auth/auth-principal';
const cursor = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');
describe('bounded drill library', () => {
  const principal = {
    id: 'coach',
    clubId: 'club',
    role: 'COACH',
  } as AuthPrincipal;
  let prisma: any;
  let auth: any;
  let service: DrillsService;
  beforeEach(() => {
    prisma = {
      playerGroup: {
        findFirst: jest.fn().mockResolvedValue({ ageGroup: 'U18' }),
      },
      drill: {
        findMany: jest
          .fn()
          .mockResolvedValueOnce([
            {
              id: 'b',
              title: 'B',
              category: 'TACTICAL',
              ageGroup: 'U18',
              durationMin: 20,
              difficulty: 'EASY',
              equipment: null,
              scope: 'GLOBAL',
              createdAt: new Date('2026-09-01'),
              versions: [],
            },
            {
              id: 'a',
              title: 'A',
              category: 'TACTICAL',
              ageGroup: 'U18',
              durationMin: 20,
              difficulty: 'EASY',
              equipment: null,
              scope: 'GLOBAL',
              createdAt: new Date('2026-09-01'),
              versions: [],
            },
          ])
          .mockResolvedValue([{ id: 'b' }]),
        count: jest.fn().mockResolvedValue(31),
      },
    };
    auth = {
      assertGroupView: jest.fn().mockResolvedValue({ id: 'g', clubId: 'club' }),
    };
    service = new DrillsService(prisma, auth);
  });
  it('returns bounded scalar cards, stable date/ID cursor and full filtered total', async () => {
    const result = await service.page(principal, {
      groupId: 'g',
      category: 'TACTICAL',
      limit: '1',
      after: cursor({ id: 'z', createdAt: '2026-09-02T00:00:00Z' }),
    });
    expect(result.total).toBe(31);
    expect(result.items).toEqual([
      expect.objectContaining({
        id: 'b',
        title: 'B',
        ageGroup: 'U18',
        createdAt: new Date('2026-09-01'),
        isBoard: true,
        contentVersion: null,
        source: expect.objectContaining({ license: 'LEGACY_UNVERIFIED' }),
      }),
    ]);
    expect(result.nextCursor).toBe(
      cursor({ v: 1, id: 'b', createdAt: '2026-09-01T00:00:00.000Z' }),
    );
    const read = prisma.drill.findMany.mock.calls[0][0];
    expect(read.take).toBe(2);
    expect(read.select.jsonData).toBeUndefined();
    expect(read.where.AND[0].AND[4].OR[0].versions.some).toEqual(
      expect.objectContaining({
        status: 'PUBLISHED',
        category: 'TACTICAL',
        ageVariants: {
          some: expect.objectContaining({ ageGroup: 'U18' }),
        },
      }),
    );
    expect(read.where.AND[0].AND[4].OR[1]).toEqual(
      expect.objectContaining({
        versions: { none: {} },
        ageGroup: 'U18',
        category: 'TACTICAL',
      }),
    );
    expect(prisma.drill.count.mock.calls[0][0].where).toEqual(
      read.where.AND[0],
    );
    const board = prisma.drill.findMany.mock.calls[1][0];
    expect(board.select).toEqual({ id: true });
    expect(board.where.AND[0]).toEqual(read.where.AND[0]);
    expect(board.where.AND[1].id).toEqual({ in: ['b'] });
    expect(read.where.AND[1].OR[1]).toEqual({
      createdAt: new Date('2026-09-02'),
      id: { lt: 'z' },
    });
  });
  it('preserves role visibility rather than inferring authority from the cursor', async () => {
    await service.page(principal, { groupId: 'g' });
    const visibility = prisma.drill.count.mock.calls[0][0].where.AND[0];
    expect(visibility).toEqual({
      OR: [
        { scope: 'GLOBAL' },
        {
          scope: 'CLUB',
          clubId: 'club',
          OR: [{ groupId: null }, { groupId: 'g' }],
        },
      ],
    });
  });
  it('intersects board kind before pagination and counting, independently of category', async () => {
    await service.page(principal, {
      groupId: 'g',
      kind: 'tactical-board',
      category: 'WARM_UP',
    });
    const read = prisma.drill.findMany.mock.calls[0][0];
    const where = read.where.AND[0];
    expect(where.AND[4].OR[0].versions.some).toEqual(
      expect.objectContaining({ category: 'WARM_UP' }),
    );
    expect(where.AND[5].OR[1]).toEqual({
      versions: { none: {} },
      jsonData: { path: ['kind'], equals: 'tactical-board' },
    });
    expect(prisma.drill.count).toHaveBeenCalledWith({ where });
    expect(read.take).toBe(26);
    expect(read.select.jsonData).toBeUndefined();
  });
  it('rejects denied group access before metadata or catalog queries', async () => {
    auth.assertGroupView.mockRejectedValue(new ForbiddenException());
    await expect(
      service.page(principal, { groupId: 'foreign' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.playerGroup.findFirst).not.toHaveBeenCalled();
    expect(prisma.drill.findMany).not.toHaveBeenCalled();
  });
  it('keeps totals on empty continuation and does not classify absent page rows', async () => {
    prisma.drill.findMany.mockReset().mockResolvedValue([]);
    const result = await service.page(principal, { groupId: 'g' });
    expect(result).toEqual({
      items: [],
      nextCursor: null,
      total: 31,
      limit: 25,
      ageGroup: 'U18',
    });
    expect(prisma.drill.findMany).toHaveBeenCalledTimes(1);
  });
  it.each([
    null,
    [],
    {},
    { groupId: ['g'] },
    { groupId: ' g' },
    { groupId: 'g', category: 'ALL' },
    { groupId: 'g', category: ['TACTICAL'] },
    { groupId: 'g', kind: 'TACTICAL' },
    { groupId: 'g', kind: '' },
    { groupId: 'g', kind: true },
    { groupId: 'g', kind: null },
    { groupId: 'g', kind: ['tactical-board'] },
    { groupId: 'g', limit: '0' },
    { groupId: 'g', limit: '101' },
    { groupId: 'g', limit: 25 },
    { groupId: 'g', clubId: 'other' },
    { groupId: 'g', ageGroup: 'A'.repeat(33) },
    { groupId: 'g', after: '!' },
    { groupId: 'g', after: 'a'.repeat(513) },
    ...[
      {},
      [],
      { id: 'x', createdAt: '2026-09-01' },
      { id: 'x', createdAt: '2026-02-30T00:00:00Z' },
      { id: 'x', createdAt: null },
      { id: 'x', createdAt: '2026-09-01T00:00:00Z', extra: true },
    ].map((value) => ({ groupId: 'g', after: cursor(value) })),
  ])('rejects malformed query %j', (query) => {
    expect(() => parseDrillPageQuery(query)).toThrow(BadRequestException);
  });
});
