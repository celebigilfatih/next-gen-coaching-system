import { ConflictException, ForbiddenException } from '@nestjs/common';
import type { AuthPrincipal } from '../auth/auth-principal';
import { encodeNoteCursor } from './dto/player-note.dto';
import { PlayerNoteService } from './player-note.service';

describe('PlayerNoteService', () => {
  const admin: AuthPrincipal = {
    id: 'admin-1',
    userId: 'admin-1',
    email: 'admin@example.test',
    role: 'SYSTEM_ADMIN',
    clubId: null,
  };
  const note = {
    id: 'note-1',
    clubId: 'club-1',
    personId: 'person-1',
    originTeamId: 'team-1',
    authorId: 'admin-1',
    category: 'TACTICAL',
    body: 'Savunma çizgisinde vücut açısını takip et.',
    observedAt: new Date('2026-09-09T09:00:00.000Z'),
    followUpAt: null,
    followUpStatus: null,
    version: 1,
    archivedAt: null,
    createdAt: new Date('2026-09-09T09:00:00.000Z'),
    updatedAt: new Date('2026-09-09T09:00:00.000Z'),
    originTeam: { id: 'team-1', name: 'U18' },
    author: { id: 'admin-1', name: 'System Admin' },
    teamGrants: [],
  };
  let prisma: any;
  let service: PlayerNoteService;

  beforeEach(() => {
    prisma = {
      person: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'person-1',
          clubId: 'club-1',
          playerProfile: { personId: 'person-1' },
        }),
      },
      team: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'team-1', clubId: 'club-1' }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      user: { findUnique: jest.fn() },
      sportingAssignment: {
        findFirst: jest.fn().mockResolvedValue({ id: 'assignment-1' }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      attendance: { findMany: jest.fn().mockResolvedValue([]) },
      playerNote: {
        findMany: jest.fn().mockResolvedValue([note]),
        findFirst: jest.fn().mockResolvedValue(note),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(note),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      playerNoteRevision: {
        create: jest.fn().mockResolvedValue({ id: 'revision-1' }),
      },
      playerNoteTeamGrant: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      securityAuditEvent: { create: jest.fn().mockResolvedValue({ id: 'a' }) },
    };
    prisma.$transaction = jest.fn((callback) => callback(prisma));
    service = new PlayerNoteService(prisma, {
      assertPersonCapability: jest.fn().mockResolvedValue(undefined),
    } as any);
  });

  it('creates a note for a Person without requiring a login account and keeps its body out of audit metadata', async () => {
    await service.create(admin, 'person-1', {
      originTeamId: 'team-1',
      category: 'TACTICAL',
      body: note.body,
      observedAt: note.observedAt.toISOString(),
    });

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.securityAuditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'PLAYER_NOTE_CREATED',
        targetPersonId: 'person-1',
        metadata: {
          noteId: 'note-1',
          category: 'TACTICAL',
        },
      }),
    });
    expect(
      JSON.stringify(prisma.securityAuditEvent.create.mock.calls),
    ).not.toContain(note.body);
  });

  it('does not let the page total shrink at an opaque cursor boundary', async () => {
    const after = encodeNoteCursor({
      id: 'note-2',
      observedAt: note.observedAt,
    });
    await service.page(admin, 'person-1', { after, limit: '20' });

    const totalWhere = prisma.playerNote.count.mock.calls[0][0].where;
    expect(JSON.stringify(totalWhere)).not.toContain('note-2');
    expect(prisma.playerNote.findMany.mock.calls[0][0].where).toEqual(
      expect.objectContaining({ AND: expect.any(Array) }),
    );
  });

  it('denies PLAYER note reads before querying note contents', async () => {
    await expect(
      service.page(
        { ...admin, role: 'PLAYER', clubId: 'club-1' },
        'person-1',
        {},
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.playerNote.findMany).not.toHaveBeenCalled();
  });

  it('returns 409 for a stale expectedVersion without opening a transaction', async () => {
    await expect(
      service.update(admin, 'person-1', 'note-1', {
        expectedVersion: 2,
        category: 'TACTICAL',
        body: note.body,
        observedAt: note.observedAt.toISOString(),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a redundant grant to the source team', async () => {
    await expect(
      service.replaceShares(admin, 'person-1', 'note-1', {
        expectedVersion: 1,
        teamIds: ['team-1'],
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.team.findMany).not.toHaveBeenCalled();
  });
});
