import { ForbiddenException } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import type { AuthPrincipal } from './auth-principal';

describe('sporting capability authorization', () => {
  const coach: AuthPrincipal = {
    id: 'coach-a',
    userId: 'coach-a',
    email: 'coach@example.test',
    role: 'COACH',
    clubId: 'club-a',
  };

  it('accepts a current explicit capability assignment', async () => {
    const prisma: any = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ personId: 'person-c' }),
      },
      sportingAssignment: {
        findFirst: jest.fn().mockResolvedValue({ id: 'granting-assignment' }),
      },
    };
    const service = new AuthorizationService(prisma);
    await expect(
      service.assertSportingCapability(coach, 'TEAM_VIEW', 'club-a', 'team-a'),
    ).resolves.toBeUndefined();
    expect(prisma.sportingAssignment.findFirst).toHaveBeenCalledWith({
      where: expect.objectContaining({
        clubId: 'club-a',
        personId: 'person-c',
        roleDefinition: {
          capabilities: { some: { capability: 'TEAM_VIEW' } },
        },
      }),
      select: { id: true },
    });
  });

  it('fails closed without a current capability assignment', async () => {
    const prisma: any = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ personId: 'person-c' }),
      },
      sportingAssignment: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const service = new AuthorizationService(prisma);
    await expect(
      service.assertSportingCapability(
        coach,
        'ASSIGNMENT_MANAGE',
        'club-a',
        'team-a',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects cross-club access before looking up grants', async () => {
    const prisma: any = {
      user: { findUnique: jest.fn() },
      sportingAssignment: { findFirst: jest.fn() },
    };
    const service = new AuthorizationService(prisma);
    await expect(
      service.assertSportingCapability(coach, 'TEAM_VIEW', 'club-b', 'team-b'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
