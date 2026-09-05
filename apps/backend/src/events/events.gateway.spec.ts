import { ForbiddenException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { EventsGateway } from './events.gateway';

describe('EventsGateway authorization', () => {
  const jwt = { verifyAsync: jest.fn() };
  const prisma = {
    refreshSession: { findFirst: jest.fn() },
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    playerGroup: { findMany: jest.fn(), findUnique: jest.fn() },
    groupMember: { findMany: jest.fn() },
  };
  const authorization = {
    assertPlanManage: jest.fn(),
    assertAttendancePlayer: jest.fn(),
  };
  const gateway = new EventsGateway(
    jwt as any,
    prisma as any,
    authorization as any,
  );
  const emit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (gateway as any).connectedUsers.clear();
    prisma.playerGroup.findMany.mockResolvedValue([]);
    prisma.playerGroup.findUnique.mockResolvedValue({ clubId: 'club-a' });
    prisma.groupMember.findMany.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([]);
    gateway.server = {
      to: jest.fn().mockReturnValue({ emit }),
    } as any;
  });

  it('rejects unauthenticated socket connections', async () => {
    const client = {
      id: 'socket-1',
      handshake: { auth: {}, headers: {} },
      data: {},
      disconnect: jest.fn(),
      join: jest.fn(),
    };

    await gateway.handleConnection(client as any);

    expect(client.disconnect).toHaveBeenCalledWith(true);
    expect(client.join).not.toHaveBeenCalled();
  });

  it('rejects revoked family reconnects and connected sender operations', async () => {
    const previous = process.env.PERSISTENT_SESSIONS_ENABLED;
    const previousOrigin = process.env.FRONTEND_ORIGIN;
    process.env.PERSISTENT_SESSIONS_ENABLED = 'true';
    process.env.FRONTEND_ORIGIN = 'http://localhost:3500';
    try {
      const user = {
        id: 'session-user',
        name: 'Coach',
        email: 'coach@example.test',
        role: 'COACH',
        status: 'ACTIVE',
        clubId: 'club-a',
        authVersion: 1,
      };
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.refreshSession.findFirst.mockResolvedValue(null);
      jwt.verifyAsync.mockResolvedValue({
        sub: user.id,
        ver: 1,
        sid: 'revoked-family',
        exp: Math.floor(Date.now() / 1000) + 900,
      });
      const client = {
        id: 'session-socket',
        handshake: {
          auth: { token: 'token' },
          headers: { origin: 'http://localhost:3500' },
        },
        data: {
          user: {
            ...user,
            userId: user.id,
            familyId: 'revoked-family',
            groupIds: ['group-a'],
          },
        },
        disconnect: jest.fn(),
        join: jest.fn(),
      };
      await gateway.handleConnection(client as any);
      expect(client.disconnect).toHaveBeenCalledWith(true);
      expect(client.join).not.toHaveBeenCalled();
      await expect(
        gateway.handleUserJoin({}, client as any),
      ).rejects.toBeInstanceOf(WsException);
    } finally {
      if (previous === undefined)
        delete process.env.PERSISTENT_SESSIONS_ENABLED;
      else process.env.PERSISTENT_SESSIONS_ENABLED = previous;
      if (previousOrigin === undefined) delete process.env.FRONTEND_ORIGIN;
      else process.env.FRONTEND_ORIGIN = previousOrigin;
    }
  });

  it('omits revoked family and expired access tokens from Socket recipients', async () => {
    const previous = process.env.PERSISTENT_SESSIONS_ENABLED;
    process.env.PERSISTENT_SESSIONS_ENABLED = 'true';
    try {
      const user = {
        id: 'session-user',
        name: 'Coach',
        role: 'COACH',
        authVersion: 1,
      };
      prisma.user.findMany.mockResolvedValue([user]);
      (gateway as any).connectedUsers.set('revoked', {
        ...user,
        familyId: 'revoked-family',
      });
      (gateway as any).connectedUsers.set('expired', {
        ...user,
        familyId: 'active-family',
        expiresAt: 1,
      });
      (gateway as any).connectedUsers.set('active', {
        ...user,
        familyId: 'active-family',
        expiresAt: Date.now() / 1000 + 900,
      });
      prisma.refreshSession.findFirst.mockImplementation(({ where }) =>
        Promise.resolve(
          where.familyId === 'active-family' ? { id: 'active-row' } : null,
        ),
      );
      const recipients = await (gateway as any).authorizedRecipientSockets(
        'group-a',
        'club-a',
      );
      expect(recipients.map((entry) => entry.socketId)).toEqual(['active']);
    } finally {
      if (previous === undefined)
        delete process.env.PERSISTENT_SESSIONS_ENABLED;
      else process.env.PERSISTENT_SESSIONS_ENABLED = previous;
    }
  });

  it('derives socket identity from JWT plus current database state', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'user-1', ver: 2 });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Current User',
      email: 'current@example.com',
      role: 'CLUB_ADMIN',
      status: 'ACTIVE',
      authVersion: 2,
      clubId: 'club-a',
    });
    prisma.playerGroup.findMany.mockResolvedValue([
      { id: 'group-a' },
      { id: 'group-b' },
    ]);
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user-1',
        name: 'Current User',
        role: 'CLUB_ADMIN',
        authVersion: 2,
      },
    ]);
    const client = {
      id: 'socket-2',
      handshake: { auth: { token: 'valid-token' }, headers: {} },
      data: {},
      disconnect: jest.fn(),
      join: jest.fn(),
    };

    await gateway.handleConnection(client as any);
    const result = await gateway.handleUserJoin(
      { userId: 'spoofed', name: 'Spoofed User' },
      client as any,
    );

    expect(client.join).toHaveBeenCalledWith('group:group-a');
    expect(client.join).toHaveBeenCalledWith('group:group-b');
    expect(client.join).not.toHaveBeenCalledWith('club:club-a');
    expect(result.user).toEqual({
      id: 'user-1',
      name: 'Current User',
      role: 'CLUB_ADMIN',
    });
  });

  it('does not broadcast a plan event outside the principal scope', async () => {
    authorization.assertPlanManage.mockRejectedValue(new ForbiddenException());
    prisma.user.findUnique.mockResolvedValue({
      id: 'coach-a',
      name: 'Coach',
      email: 'coach@example.com',
      role: 'COACH',
      status: 'ACTIVE',
      authVersion: 1,
      clubId: 'club-a',
    });
    const client = {
      disconnect: jest.fn(),
      data: {
        user: {
          id: 'coach-a',
          userId: 'coach-a',
          name: 'Coach',
          email: 'coach@example.com',
          role: 'COACH',
          clubId: 'club-a',
          authVersion: 1,
        },
      },
    };

    await expect(
      gateway.handlePlanUpdate(
        { planId: 'club-b-plan', field: 'title', value: 'spoofed' },
        client as any,
      ),
    ).rejects.toBeInstanceOf(WsException);
    expect(emit).not.toHaveBeenCalledWith('plan:updated', expect.anything());
  });

  it('broadcasts a minimized plan event only to current group recipients', async () => {
    const coachA = {
      id: 'coach-a',
      userId: 'coach-a',
      name: 'Coach A',
      email: 'coach-a@example.com',
      role: 'COACH',
      clubId: 'club-a',
      authVersion: 1,
      groupIds: ['group-a'],
    };
    const coachB = {
      id: 'coach-b',
      userId: 'coach-b',
      name: 'Coach B',
      email: 'coach-b@example.com',
      role: 'COACH',
      clubId: 'club-a',
      authVersion: 1,
      groupIds: ['group-b'],
    };
    (gateway as any).connectedUsers.set('socket-a', coachA);
    (gateway as any).connectedUsers.set('socket-b', coachB);
    prisma.user.findUnique.mockResolvedValue({
      id: coachA.id,
      name: coachA.name,
      email: coachA.email,
      role: coachA.role,
      status: 'ACTIVE',
      authVersion: coachA.authVersion,
      clubId: coachA.clubId,
    });
    prisma.user.findMany.mockResolvedValue([
      {
        id: coachA.id,
        name: coachA.name,
        role: coachA.role,
        authVersion: coachA.authVersion,
      },
    ]);
    authorization.assertPlanManage.mockResolvedValue({
      id: 'plan-a',
      clubId: 'club-a',
      groupId: 'group-a',
    });
    const client = {
      id: 'socket-a',
      disconnect: jest.fn(),
      data: { user: coachA },
    };

    await gateway.handlePlanUpdate(
      { planId: 'plan-a', field: 'notes', value: 'private raw value' },
      client as any,
    );

    expect(gateway.server.to).toHaveBeenCalledWith(['socket-a']);
    expect(emit).toHaveBeenCalledWith('plan:updated', { planId: 'plan-a' });
    expect(emit).not.toHaveBeenCalledWith(
      'plan:updated',
      expect.objectContaining({ value: expect.anything() }),
    );
  });

  it('disconnects a socket after its session version is revoked', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'coach-a',
      name: 'Coach',
      email: 'coach@example.com',
      role: 'COACH',
      status: 'ACTIVE',
      authVersion: 2,
      clubId: 'club-a',
    });
    const client = {
      disconnect: jest.fn(),
      data: {
        user: {
          id: 'coach-a',
          userId: 'coach-a',
          name: 'Coach',
          email: 'coach@example.com',
          role: 'COACH',
          clubId: 'club-a',
          authVersion: 1,
        },
      },
    };

    await expect(
      gateway.handlePlanUpdate(
        { planId: 'plan-a', field: 'title', value: 'stale' },
        client as any,
      ),
    ).rejects.toBeInstanceOf(WsException);
    expect(client.disconnect).toHaveBeenCalledWith(true);
    expect(authorization.assertPlanManage).not.toHaveBeenCalled();
  });
});
