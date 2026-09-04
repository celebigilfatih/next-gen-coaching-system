import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AccountLifecycleService } from './account-lifecycle.service';

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

describe('AccountLifecycleService authorization', () => {
  it('does not allow a club admin to invite a privileged role', async () => {
    const service = new AccountLifecycleService({} as any);

    await expect(
      service.createInvitation(principal('CLUB_ADMIN', 'club-a'), {
        email: 'admin@example.com',
        role: 'SYSTEM_ADMIN',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('requires a club for every non-system invitation', async () => {
    const service = new AccountLifecycleService({} as any);

    await expect(
      service.createInvitation(principal('SYSTEM_ADMIN', null), {
        email: 'coach@example.com',
        role: 'COACH',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('stores only the invitation token hash', async () => {
    const invitationCreate = jest.fn().mockResolvedValue({
      id: 'invite-1',
      email: 'player@example.com',
      role: 'PLAYER',
      clubId: 'club-a',
      expiresAt: new Date(),
      createdAt: new Date(),
    });
    const transaction = {
      accountInvitation: {
        updateMany: jest.fn(),
        create: invitationCreate,
      },
      securityAuditEvent: { create: jest.fn() },
    };
    const prisma = {
      club: { findUnique: jest.fn().mockResolvedValue({ id: 'club-a' }) },
      user: { findUnique: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn((callback) => callback(transaction)),
    };
    const service = new AccountLifecycleService(prisma as any);

    const result = await service.createInvitation(
      principal('SYSTEM_ADMIN', null),
      {
        email: 'player@example.com',
        role: 'PLAYER',
        clubId: 'club-a',
      },
    );

    const persisted = invitationCreate.mock.calls[0][0].data;
    expect(result.token).toHaveLength(43);
    expect(persisted.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(persisted.tokenHash).not.toBe(result.token);
    expect(persisted).not.toHaveProperty('token');
  });

  it('blocks a club admin from suspending another club account', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'player-b',
          role: 'PLAYER',
          clubId: 'club-b',
          status: 'ACTIVE',
        }),
      },
    };
    const service = new AccountLifecycleService(prisma as any);

    await expect(
      service.setStatus(
        principal('CLUB_ADMIN', 'club-a'),
        'player-b',
        'SUSPENDED',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('keeps the last active system admin active', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'system-1',
          role: 'SYSTEM_ADMIN',
          clubId: null,
          status: 'ACTIVE',
        }),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const service = new AccountLifecycleService(prisma as any);

    await expect(
      service.setStatus(
        principal('SYSTEM_ADMIN', null, 'system-2'),
        'system-1',
        'SUSPENDED',
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('requires coach-owned plans and seasons to be reassigned before demotion', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'coach-a',
          role: 'COACH',
          clubId: 'club-a',
          status: 'ACTIVE',
          _count: {
            groups: 0,
            attendances: 0,
            playerLoads: 0,
            performances: 0,
            seasonsCreated: 1,
            coachedPlans: 1,
            healthLogs: 0,
            healthStatus: 0,
            coachNotes: 0,
          },
        }),
      },
      club: { findUnique: jest.fn().mockResolvedValue({ id: 'club-a' }) },
    };
    const service = new AccountLifecycleService(prisma as any);

    await expect(
      service.changeAccess(principal('CLUB_ADMIN', 'club-a'), 'coach-a', {
        role: 'PLAYER',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
