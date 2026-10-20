import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DrillsService } from './drills.service';
import { parseDrillPageQuery } from './drill-page.dto';
import type { AuthPrincipal } from '../auth/auth-principal';
import { starterDrillIds } from './drill-starter-pack';
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
  it('restricts the ready collection before counting and paging without defaulting to team age', async () => {
    const result = await service.page(principal, {
      groupId: 'g',
      collection: 'ngcs-starter-v1',
    });
    expect(result.ageGroup).toBeUndefined();
    const read = prisma.drill.findMany.mock.calls[0][0];
    const where = read.where.AND[0];
    expect(where.AND[5]).toEqual({
      id: { in: starterDrillIds },
      scope: 'GLOBAL',
    });
    expect(where.AND[4].OR[0].versions.some).toMatchObject({
      status: 'PUBLISHED',
      ageVariants: { some: { ageGroup: undefined } },
    });
    expect(where.AND[4].OR[1].id).toBe('__none__');
    expect(prisma.drill.count).toHaveBeenCalledWith({ where });
    expect(prisma.drill.findMany.mock.calls[1][0].where.AND[0]).toEqual(where);
  });
  it('retains explicit age filters in the collection and normal team age outside it', async () => {
    const result = await service.page(principal, {
      groupId: 'g',
      collection: 'ngcs-starter-v1',
      ageGroup: 'U12',
    });
    expect(result.ageGroup).toBe('U12');
    const read = prisma.drill.findMany.mock.calls[0][0];
    expect(read.select.versions.select.ageVariants.where.ageGroup).toBe('U12');
    expect(read.select.versions.select.ageVariants.take).toBe(1);
  });
  it('resolves ready-picker age from the authorized plan group on the server', async () => {
    const result = await service.page(principal, {
      groupId: 'g',
      collection: 'ngcs-starter-v1',
      ageScope: 'TEAM',
    });
    expect(result.ageGroup).toBe('U18');
    const where = prisma.drill.count.mock.calls[0][0].where;
    expect(where.AND[5]).toEqual({
      id: { in: starterDrillIds },
      scope: 'GLOBAL',
    });
    expect(where.AND[4].OR[0].versions.some.ageVariants.some.ageGroup).toBe(
      'U18',
    );
    expect(where.AND[4].OR[1].id).toBe('__none__');
  });
  it('uses the original age variant for all-age scalar facts instead of the first variant', async () => {
    prisma.drill.findMany
      .mockReset()
      .mockResolvedValueOnce([
        {
          id: starterDrillIds[0],
          title: 'U12 drill',
          ageGroup: 'U12',
          scope: 'GLOBAL',
          createdAt: new Date('2026-09-01'),
          versions: [
            {
              title: 'U12 drill',
              durationMin: 10,
              equipmentItems: [],
              ageVariants: [
                { ageGroup: 'U14', durationMin: 20 },
                { ageGroup: 'U12', durationMin: 10 },
              ],
            },
          ],
        },
      ])
      .mockResolvedValue([]);
    const result = await service.page(principal, {
      groupId: 'g',
      collection: 'ngcs-starter-v1',
    });
    expect(result.items[0]).toMatchObject({ ageGroup: 'U12', durationMin: 10 });
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
    { groupId: 'g', collection: 'other' },
    { groupId: 'g', collection: ['ngcs-starter-v1'] },
    { groupId: 'g', ageScope: 'TEAM' },
    { groupId: 'g', collection: 'ngcs-starter-v1', ageScope: 'ALL' },
    { groupId: 'g', collection: 'ngcs-starter-v1', ageScope: ['TEAM'] },
    {
      groupId: 'g',
      collection: 'ngcs-starter-v1',
      ageScope: 'TEAM',
      ageGroup: 'U12',
    },
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
