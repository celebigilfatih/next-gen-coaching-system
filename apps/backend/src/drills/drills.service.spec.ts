import { BadRequestException, ForbiddenException } from '@nestjs/common';
import type { AuthPrincipal } from '../auth/auth-principal';
import { DrillsService } from './drills.service';

const principal = (
  role: AuthPrincipal['role'],
  clubId: string | null,
  id = 'actor-1',
): AuthPrincipal => ({
  id,
  userId: id,
  email: `${id}@example.com`,
  role,
  clubId,
});

const board = {
  schemaVersion: 1,
  kind: 'tactical-board',
  pitch: { type: 'full', width: 1200, height: 800 },
  elements: [],
};

const input = {
  title: 'Geçiş oyunu',
  category: 'TACTICAL',
  ageGroup: 'U16',
  durationMin: 20,
  difficulty: 'MEDIUM',
  jsonData: board,
};

describe('DrillsService scope and ownership', () => {
  const prisma = {
    drill: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const authorization = {
    assertGroupView: jest.fn(),
    assertCoachGroupAssignment: jest.fn(),
    assertClubManage: jest.fn(),
    isGroupMember: jest.fn(),
  };
  const service = new DrillsService(prisma as any, authorization as any);

  beforeEach(() => jest.clearAllMocks());

  it('forces a coach drill into their club and assigned group', async () => {
    authorization.assertCoachGroupAssignment.mockResolvedValue({
      id: 'group-a',
      clubId: 'club-a',
    });
    prisma.drill.create.mockImplementation(({ data }) => data);

    const result = await service.create(
      principal('COACH', 'club-a', 'coach-a'),
      { ...input, groupId: 'group-a' },
    );

    expect(result).toMatchObject({
      scope: 'CLUB',
      clubId: 'club-a',
      groupId: 'group-a',
      createdById: 'coach-a',
    });
  });

  it('rejects a coach creating a global or ungrouped drill', async () => {
    await expect(
      service.create(principal('COACH', 'club-a'), {
        ...input,
        scope: 'GLOBAL',
        groupId: 'group-a',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.create(principal('COACH', 'club-a'), input),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not accept mass-assigned ownership fields during update', async () => {
    prisma.drill.findUnique.mockResolvedValue({
      id: 'drill-a',
      ...input,
      scope: 'CLUB',
      clubId: 'club-a',
      groupId: 'group-a',
      createdById: 'coach-a',
      equipment: null,
      imageUrl: null,
    });
    authorization.isGroupMember.mockResolvedValue(true);
    prisma.drill.update.mockImplementation(({ data }) => data);

    const result = await service.update(
      principal('COACH', 'club-a', 'coach-a'),
      'drill-a',
      {
        title: 'Yeni başlık',
        clubId: 'club-b',
        createdById: 'coach-b',
      } as never,
    );

    expect(result).not.toHaveProperty('clubId');
    expect(result).not.toHaveProperty('createdById');
  });

  it('rejects another coach and a cross-club admin managing the drill', async () => {
    prisma.drill.findUnique.mockResolvedValue({
      id: 'drill-a',
      ...input,
      scope: 'CLUB',
      clubId: 'club-a',
      groupId: 'group-a',
      createdById: 'coach-a',
      equipment: null,
      imageUrl: null,
    });

    await expect(
      service.remove(principal('COACH', 'club-a', 'coach-b'), 'drill-a'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.remove(principal('CLUB_ADMIN', 'club-b'), 'drill-a'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('limits player visibility to global, club-wide, and assigned-group drills', async () => {
    prisma.drill.findMany.mockResolvedValue([]);
    await service.list(principal('PLAYER', 'club-a', 'player-a'), {});

    expect(prisma.drill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                { scope: 'GLOBAL' },
                expect.objectContaining({ scope: 'CLUB', clubId: 'club-a' }),
              ]),
            }),
          ]),
        }),
      }),
    );
  });
});
