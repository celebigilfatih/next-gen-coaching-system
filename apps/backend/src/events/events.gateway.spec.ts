import { ForbiddenException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { EventsGateway } from './events.gateway';

describe('EventsGateway authorization', () => {
  const jwt = { verifyAsync: jest.fn() };
  const prisma = { user: { findUnique: jest.fn() } };
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

    expect(client.join).toHaveBeenCalledWith('club:club-a');
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
