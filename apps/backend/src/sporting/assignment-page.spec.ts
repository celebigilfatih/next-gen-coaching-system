import { BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  parseAssignmentPageQuery,
  assignmentBoundary,
  assignmentCursor,
} from './dto/assignment-page.dto';
import { SportingService } from './sporting.service';
import { AuthorizationService } from '../auth/authorization.service';
import type { AuthPrincipal } from '../auth/auth-principal';

const asOf = '2026-09-06T12:00:00.000Z';
const principal: AuthPrincipal = {
  id: 'coach',
  userId: 'coach',
  email: 'coach@example.test',
  clubId: 'club',
  role: 'COACH',
};
describe('bounded assignment queries', () => {
  it.each([
    null,
    [],
    {},
    { asOf: [] },
    { asOf: '2026-09-06' },
    { asOf: '2026-02-30T12:00:00Z' },
    { asOf: '2026-09-06T12:00:00' },
    { asOf, limit: '0' },
    { asOf, limit: '101' },
    { asOf, limit: 25 },
    { asOf, after: '' },
    { asOf, after: 'bad' },
    { asOf, after: 'a'.repeat(513) },
    { asOf, extra: true },
    { asOf, teamSeasonId: 'x' },
  ])('rejects %j', (query) => {
    expect(() => parseAssignmentPageQuery(query)).toThrow(BadRequestException);
  });
  it('round-trips equal-date ID boundaries and bounded defaults', () => {
    const date = new Date(asOf);
    const after = assignmentCursor(
      [
        { id: 'b', validFrom: date },
        { id: 'a', validFrom: date },
      ],
      1,
    )!;
    const parsed = parseAssignmentPageQuery({ asOf, after });
    expect(parsed.limit).toBe(25);
    expect(parsed.after).toEqual({ id: 'b', validFrom: date });
    expect(assignmentBoundary(parsed.after)).toEqual({
      OR: [{ validFrom: { lt: date } }, { validFrom: date, id: { lt: 'b' } }],
    });
    expect(assignmentCursor([], 25)).toBeNull();
    expect(
      parseAssignmentPageQuery({ asOf, limit: '100', teamSeasonId: 's' }, true)
        .limit,
    ).toBe(100);
  });
  it.each([
    { id: 'x', validFrom: asOf, extra: true },
    { id: '\n', validFrom: asOf },
    { id: 'x'.repeat(161), validFrom: asOf },
    { id: 'x', validFrom: 'bad' },
    null,
    [],
  ])('rejects malformed decoded cursor %j', (cursor) => {
    expect(() =>
      parseAssignmentPageQuery({
        asOf,
        after: Buffer.from(JSON.stringify(cursor)).toString('base64url'),
      }),
    ).toThrow(BadRequestException);
  });
  it('bounds roster records and obtains full filtered counts separately', async () => {
    const prisma: any = {
      team: {
        findUnique: jest.fn().mockResolvedValue({ id: 'team', clubId: 'club' }),
      },
      sportingAssignment: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'b', validFrom: new Date(asOf) },
          { id: 'a', validFrom: new Date(asOf) },
        ]),
        count: jest
          .fn()
          .mockResolvedValueOnce(100)
          .mockResolvedValueOnce(90)
          .mockResolvedValueOnce(10),
      },
    };
    const auth: any = { assertSportingCapability: jest.fn() };
    const service = new SportingService(prisma, auth);
    const response = await service.getTeamRosterPage(principal, 'team', {
      asOf,
      limit: '1',
    });
    expect(response.assignments).toHaveLength(1);
    expect(response.page).toMatchObject({
      total: 100,
      playerAssignments: 90,
      staffAssignments: 10,
    });
    expect(prisma.team.findUnique.mock.calls[0][0].select).not.toHaveProperty(
      'teamSeasons',
    );
    const read = prisma.sportingAssignment.findMany.mock.calls[0][0];
    expect(read.take).toBe(2);
    expect(read.where.AND[0]).toMatchObject({
      clubId: 'club',
      teamId: 'team',
      validFrom: { lte: new Date(asOf) },
    });
    expect(read.orderBy).toEqual([{ validFrom: 'desc' }, { id: 'desc' }]);
    auth.assertSportingCapability.mockRejectedValue(new ForbiddenException());
    prisma.sportingAssignment.findMany.mockClear();
    await expect(
      service.getTeamRosterPage(principal, 'team', { asOf }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.sportingAssignment.findMany).not.toHaveBeenCalled();
  });
  it('checks current grants through relational existence, never loading target assignment arrays', async () => {
    const prisma: any = {
      person: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'player', clubId: 'club', account: null }),
      },
      user: { findUnique: jest.fn().mockResolvedValue({ personId: 'actor' }) },
      sportingAssignment: {
        findFirst: jest.fn().mockResolvedValue({ id: 'grant' }),
      },
    };
    const auth = new AuthorizationService(prisma);
    await auth.assertPersonCapability(
      principal,
      'player',
      'PLAYER_HISTORY_VIEW',
      new Date('2020-01-01'),
    );
    expect(prisma.person.findUnique.mock.calls[0][0].select).not.toHaveProperty(
      'assignments',
    );
    const where = prisma.sportingAssignment.findFirst.mock.calls[0][0].where;
    expect(where.validFrom.lte.getFullYear()).toBeGreaterThan(2020);
    expect(where.AND[0].OR).toEqual([
      { teamId: null },
      {
        team: {
          assignments: {
            some: {
              personId: 'player',
              clubId: 'club',
              validFrom: { lte: new Date('2020-01-01') },
              OR: [
                { validTo: null },
                { validTo: { gt: new Date('2020-01-01') } },
              ],
            },
          },
        },
      },
    ]);
    prisma.sportingAssignment.findFirst.mockResolvedValue(null);
    await expect(
      auth.assertPersonCapability(principal, 'player', 'PLAYER_VIEW'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
