import { ConflictException, ForbiddenException } from '@nestjs/common';
import { SportingService } from './sporting.service';
import type { AuthPrincipal } from '../auth/auth-principal';

describe('SportingService assignment boundary', () => {
  const principal: AuthPrincipal = {
    id: 'admin-a',
    userId: 'admin-a',
    email: 'admin@example.test',
    role: 'CLUB_ADMIN',
    clubId: 'club-a',
  };
  let prisma: any;
  let authorization: any;
  let transaction: any;
  let service: SportingService;

  beforeEach(() => {
    transaction = {
      sportingAssignment: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: 'assignment-new',
            ...data,
            teamSeasonId: data.teamSeasonId ?? null,
            teamId: data.teamId ?? null,
          }),
        ),
        update: jest.fn().mockImplementation(({ where, data }) =>
          Promise.resolve({
            id: where.id,
            clubId: 'club-a',
            personId: 'person-a',
            teamId: 'u17',
            teamSeasonId: null,
            assignmentType: 'PRIMARY_REGISTERED',
            ...data,
          }),
        ),
      },
      securityAuditEvent: { create: jest.fn().mockResolvedValue({}) },
    };
    prisma = {
      person: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'person-a', clubId: 'club-a' }),
      },
      team: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'u19', clubId: 'club-a' }),
      },
      teamSeason: { findUnique: jest.fn().mockResolvedValue(null) },
      functionalRole: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'player-role',
          clubId: 'club-a',
          systemKey: 'PLAYER',
        }),
      },
      $transaction: jest
        .fn()
        .mockImplementation((callback) =>
          typeof callback === 'function'
            ? callback(transaction)
            : Promise.resolve(callback),
        ),
    };
    authorization = {
      assertSportingCapability: jest.fn().mockResolvedValue(undefined),
    };
    service = new SportingService(prisma, authorization);
  });

  it('derives ownership and audit fields instead of accepting mass assignment', async () => {
    const result = await service.createAssignment(principal, {
      personId: 'person-a',
      teamId: 'u19',
      roleDefinitionId: 'player-role',
      assignmentType: 'TRAINING_GUEST',
      validFrom: '2026-09-06T10:00:00.000Z',
      clubId: 'club-b',
      createdById: 'attacker',
      source: 'attacker',
    });

    expect(transaction.sportingAssignment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clubId: 'club-a',
          createdById: 'admin-a',
          source: 'NGCS_API_V1',
        }),
      }),
    );
    expect(
      transaction.sportingAssignment.create.mock.calls[0][0].data,
    ).not.toHaveProperty('unknown');
    expect(transaction.securityAuditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'SPORTING_ASSIGNMENT_CREATED',
        actorId: 'admin-a',
        targetPersonId: 'person-a',
        clubId: 'club-a',
      }),
    });
    expect(result).toEqual(expect.objectContaining({ id: 'assignment-new' }));
  });

  it('rejects a cross-club team before starting a mutation', async () => {
    prisma.team.findUnique.mockResolvedValue({ id: 'u19', clubId: 'club-b' });
    await expect(
      service.createAssignment(principal, {
        personId: 'person-a',
        teamId: 'u19',
        roleDefinitionId: 'player-role',
        assignmentType: 'TRAINING_GUEST',
        validFrom: '2026-09-06T10:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a second open primary registration', async () => {
    transaction.sportingAssignment.findFirst.mockResolvedValue({
      id: 'current-primary',
    });
    await expect(
      service.createAssignment(principal, {
        personId: 'person-a',
        teamId: 'u19',
        roleDefinitionId: 'player-role',
        assignmentType: 'PRIMARY_REGISTERED',
        validFrom: '2026-09-06T10:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(transaction.sportingAssignment.create).not.toHaveBeenCalled();
  });

  it('rejects a bounded primary period that overlaps an existing period', async () => {
    transaction.sportingAssignment.findFirst.mockResolvedValue({
      id: 'bounded-primary',
    });
    await expect(
      service.createAssignment(principal, {
        personId: 'person-a',
        teamId: 'u19',
        roleDefinitionId: 'player-role',
        assignmentType: 'PRIMARY_REGISTERED',
        validFrom: '2026-02-01T10:00:00.000Z',
        validTo: '2026-05-01T10:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(transaction.sportingAssignment.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          validFrom: { lt: new Date('2026-05-01T10:00:00.000Z') },
          OR: [
            { validTo: null },
            { validTo: { gt: new Date('2026-02-01T10:00:00.000Z') } },
          ],
        }),
      }),
    );
    expect(transaction.sportingAssignment.create).not.toHaveBeenCalled();
  });

  it('closes and creates a primary assignment atomically during transition', async () => {
    transaction.sportingAssignment.findFirst
      .mockResolvedValueOnce({
        id: 'current-primary',
        clubId: 'club-a',
        personId: 'person-a',
        teamId: 'u17',
        teamSeasonId: null,
        assignmentType: 'PRIMARY_REGISTERED',
        validFrom: new Date('2026-01-01T00:00:00.000Z'),
      })
      .mockResolvedValueOnce(null);

    const result = await service.transitionPrimary(principal, {
      personId: 'person-a',
      teamId: 'u19',
      roleDefinitionId: 'player-role',
      validAt: '2026-09-06T10:00:00.000Z',
      reason: 'Approved progression review',
    });

    expect(transaction.sportingAssignment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'current-primary' },
        data: { validTo: new Date('2026-09-06T10:00:00.000Z') },
      }),
    );
    expect(transaction.sportingAssignment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          teamId: 'u19',
          assignmentType: 'PRIMARY_REGISTERED',
          source: 'NGCS_TRANSITION_V1',
        }),
      }),
    );
    expect(result.endedAssignmentId).toBe('current-primary');
    expect(transaction.securityAuditEvent.create).toHaveBeenCalledTimes(2);
  });

  it('rejects a primary transition that overlaps a future bounded period', async () => {
    transaction.sportingAssignment.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'future-primary' });

    await expect(
      service.transitionPrimary(principal, {
        personId: 'person-a',
        teamId: 'u19',
        roleDefinitionId: 'player-role',
        validAt: '2026-09-06T10:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(transaction.sportingAssignment.create).not.toHaveBeenCalled();
  });
});
