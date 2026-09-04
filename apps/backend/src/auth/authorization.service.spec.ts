import { ForbiddenException } from '@nestjs/common';
import type { AuthPrincipal } from './auth-principal';
import { AuthorizationService } from './authorization.service';

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

describe('AuthorizationService tenant boundaries', () => {
  const prisma = {
    trainingPlan: { findUnique: jest.fn() },
    playerGroup: { findUnique: jest.fn() },
    groupMember: { findFirst: jest.fn() },
    season: { findUnique: jest.fn() },
    weekPlan: { findUnique: jest.fn() },
    dayPlan: { findUnique: jest.fn() },
    match: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
  };
  const service = new AuthorizationService(prisma as any);

  beforeEach(() => jest.clearAllMocks());

  it('rejects a CLUB_ADMIN managing a plan in another club', async () => {
    prisma.trainingPlan.findUnique.mockResolvedValue({
      id: 'plan-b',
      clubId: 'club-b',
      coachId: 'coach-b',
      groupId: 'group-b',
    });

    await expect(
      service.assertPlanManage(principal('CLUB_ADMIN', 'club-a'), 'plan-b'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a CLUB_ADMIN to manage a plan in its own club', async () => {
    prisma.trainingPlan.findUnique.mockResolvedValue({
      id: 'plan-a',
      clubId: 'club-a',
      coachId: 'coach-a',
      groupId: 'group-a',
    });

    await expect(
      service.assertPlanManage(principal('CLUB_ADMIN', 'club-a'), 'plan-a'),
    ).resolves.toMatchObject({ id: 'plan-a' });
  });

  it('allows an assigned COACH and rejects an unassigned COACH', async () => {
    prisma.trainingPlan.findUnique.mockResolvedValue({
      id: 'plan-a',
      clubId: 'club-a',
      coachId: 'another-coach',
      groupId: 'group-a',
    });
    prisma.groupMember.findFirst.mockResolvedValueOnce({ id: 'membership' });

    await expect(
      service.assertPlanManage(
        principal('COACH', 'club-a', 'coach-a'),
        'plan-a',
      ),
    ).resolves.toMatchObject({ id: 'plan-a' });

    prisma.groupMember.findFirst.mockResolvedValueOnce(null);
    await expect(
      service.assertPlanManage(
        principal('COACH', 'club-a', 'coach-a'),
        'plan-a',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a PLAYER to view but never manage its group plan', async () => {
    prisma.trainingPlan.findUnique.mockResolvedValue({
      id: 'plan-a',
      clubId: 'club-a',
      coachId: 'coach-a',
      groupId: 'group-a',
    });
    prisma.groupMember.findFirst.mockResolvedValue({ id: 'membership' });
    const player = principal('PLAYER', 'club-a', 'player-a');

    await expect(
      service.assertPlanView(player, 'plan-a'),
    ).resolves.toBeDefined();
    await expect(
      service.assertPlanManage(player, 'plan-a'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('does not let coachId bypass the required group assignment', async () => {
    prisma.trainingPlan.findUnique.mockResolvedValue({
      id: 'ungrouped-plan',
      clubId: 'club-a',
      coachId: 'coach-a',
      groupId: null,
    });

    await expect(
      service.assertPlanManage(
        principal('COACH', 'club-a', 'coach-a'),
        'ungrouped-plan',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('scopes season access through current group membership', async () => {
    prisma.season.findUnique.mockResolvedValue({
      id: 'season-a',
      clubId: 'club-a',
      groupId: 'group-a',
      userId: 'coach-a',
    });
    prisma.groupMember.findFirst.mockResolvedValueOnce(null);

    await expect(
      service.assertSeasonView(
        principal('PLAYER', 'club-a', 'player-a'),
        'season-a',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    prisma.groupMember.findFirst.mockResolvedValueOnce({ id: 'membership' });
    await expect(
      service.assertSeasonView(
        principal('PLAYER', 'club-a', 'player-a'),
        'season-a',
      ),
    ).resolves.toMatchObject({ id: 'season-a' });
  });

  it('rejects attendance for a player outside the plan group', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'player-b',
      role: 'PLAYER',
      clubId: 'club-a',
    });
    prisma.groupMember.findFirst.mockResolvedValue(null);

    await expect(
      service.assertAttendancePlayer(
        principal('COACH', 'club-a', 'coach-a'),
        { clubId: 'club-a', groupId: 'group-a' },
        'player-b',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
