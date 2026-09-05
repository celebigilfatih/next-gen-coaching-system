import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { PrismaService } from '../prisma/prisma.service';

type SocketPrincipal = AuthPrincipal & { name: string; authVersion: number };
type ConnectedUser = SocketPrincipal & { groupIds: string[] };

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3500',
    ],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly connectedUsers = new Map<string, ConnectedUser>();

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      const payload = await this.jwt.verifyAsync<{ sub: string; ver?: number }>(
        token,
      );
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          authVersion: true,
          clubId: true,
        },
      });
      if (
        !user ||
        user.status !== 'ACTIVE' ||
        payload.ver !== user.authVersion
      ) {
        throw new WsException('Session is no longer valid');
      }

      const principal: SocketPrincipal = {
        id: user.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clubId: user.clubId,
        authVersion: user.authVersion,
      };
      const groupIds = await this.groupIdsForPrincipal(principal);
      const connected = { ...principal, groupIds };
      client.data.user = connected;
      this.connectedUsers.set(client.id, connected);
      await Promise.all(
        groupIds.map((groupId) => client.join(this.groupRoom(groupId))),
      );
      await Promise.all(groupIds.map((groupId) => this.emitUsers(groupId)));
    } catch {
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    const principal = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);
    if (principal) {
      await Promise.all(
        principal.groupIds.map((groupId) => this.emitUsers(groupId)),
      );
    }
  }

  @SubscribeMessage('user:join')
  async handleUserJoin(
    @MessageBody() _data: { userId?: string; name?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const principal = await this.requirePrincipal(client);
    return {
      success: true,
      user: { id: principal.id, name: principal.name, role: principal.role },
    };
  }

  @SubscribeMessage('attendance:update')
  async handleAttendanceUpdate(
    @MessageBody()
    data: { planId: string; playerId: string; status: string },
    @ConnectedSocket() client: Socket,
  ) {
    const principal = await this.requirePrincipal(client);
    try {
      const plan = await this.authorization.assertPlanManage(
        principal,
        data.planId,
      );
      await this.authorization.assertAttendancePlayer(
        principal,
        plan,
        data.playerId,
      );
      if (!['PRESENT', 'ABSENT'].includes(data.status)) {
        throw new WsException('Invalid attendance status');
      }
      await this.emitToGroup(plan.groupId, plan.clubId, 'attendance:updated', {
        planId: data.planId,
        playerId: data.playerId,
        status: data.status,
      });
      return { success: true };
    } catch {
      throw new WsException('Not authorized for this training plan');
    }
  }

  @SubscribeMessage('plan:update')
  async handlePlanUpdate(
    @MessageBody() data: { planId: string; field: string; value: unknown },
    @ConnectedSocket() client: Socket,
  ) {
    const principal = await this.requirePrincipal(client);
    try {
      const plan = await this.authorization.assertPlanManage(
        principal,
        data.planId,
      );
      await this.emitToGroup(plan.groupId, plan.clubId, 'plan:updated', {
        planId: data.planId,
      });
      return { success: true };
    } catch {
      throw new WsException('Not authorized for this training plan');
    }
  }

  @SubscribeMessage('drill:add')
  async handleDrillAdd(
    @MessageBody() data: { planId: string; drill: unknown },
    @ConnectedSocket() client: Socket,
  ) {
    const principal = await this.requirePrincipal(client);
    try {
      const plan = await this.authorization.assertPlanManage(
        principal,
        data.planId,
      );
      await this.emitToGroup(plan.groupId, plan.clubId, 'drill:added', {
        planId: data.planId,
      });
      return { success: true };
    } catch {
      throw new WsException('Not authorized for this training plan');
    }
  }

  private extractToken(client: Socket) {
    const authToken = client.handshake.auth?.token;
    const authorization = client.handshake.headers.authorization;
    const raw =
      typeof authToken === 'string'
        ? authToken
        : typeof authorization === 'string'
          ? authorization
          : '';
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
    if (!token) throw new WsException('Authentication token is required');
    return token;
  }

  private async requirePrincipal(client: Socket): Promise<SocketPrincipal> {
    const connected = client.data.user as ConnectedUser | undefined;
    if (!connected) throw new WsException('Socket is not authenticated');
    const user = await this.prisma.user.findUnique({
      where: { id: connected.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        authVersion: true,
        clubId: true,
      },
    });
    if (
      !user ||
      user.status !== 'ACTIVE' ||
      user.authVersion !== connected.authVersion
    ) {
      client.disconnect(true);
      throw new WsException('Socket session is no longer valid');
    }
    const current = {
      id: user.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      clubId: user.clubId,
      authVersion: user.authVersion,
    };
    this.connectedUsers.set(client.id, {
      ...current,
      groupIds: connected.groupIds,
    });
    return current;
  }

  private async groupIdsForPrincipal(principal: SocketPrincipal) {
    if (!principal.clubId || principal.role === 'SYSTEM_ADMIN') return [];
    if (principal.role === 'CLUB_ADMIN') {
      const groups = await this.prisma.playerGroup.findMany({
        where: { clubId: principal.clubId },
        select: { id: true },
      });
      return groups.map((group) => group.id);
    }
    const memberships = await this.prisma.groupMember.findMany({
      where: {
        userId: principal.id,
        group: { clubId: principal.clubId },
      },
      select: { groupId: true },
    });
    return memberships.map((membership) => membership.groupId);
  }

  private async emitUsers(groupId: string) {
    const group = await this.prisma.playerGroup.findUnique({
      where: { id: groupId },
      select: { clubId: true },
    });
    if (!group) return;
    const recipients = await this.authorizedRecipientSockets(
      groupId,
      group.clubId,
    );
    if (!recipients.length) return;
    const users = Array.from(
      new Map(
        recipients.map(({ user }) => [
          user.id,
          { id: user.id, name: user.name, role: user.role },
        ]),
      ).values(),
    );
    this.server
      .to(recipients.map((entry) => entry.socketId))
      .emit('users:update', users);
  }

  private async emitToGroup(
    groupId: string | null,
    clubId: string,
    event: string,
    payload: Record<string, unknown>,
  ) {
    if (!groupId) return;
    const recipients = await this.authorizedRecipientSockets(groupId, clubId);
    if (!recipients.length) return;
    this.server
      .to(recipients.map((entry) => entry.socketId))
      .emit(event, payload);
  }

  private async authorizedRecipientSockets(groupId: string, clubId: string) {
    const connected = Array.from(this.connectedUsers.entries());
    if (!connected.length) return [];
    const currentUsers = await this.prisma.user.findMany({
      where: {
        id: { in: connected.map(([, user]) => user.id) },
        status: 'ACTIVE',
        OR: [
          { role: 'SYSTEM_ADMIN' },
          { role: 'CLUB_ADMIN', clubId },
          { clubId, groups: { some: { groupId } } },
        ],
      },
      select: { id: true, name: true, role: true, authVersion: true },
    });
    const currentById = new Map(currentUsers.map((user) => [user.id, user]));
    return connected.flatMap(([socketId, user]) => {
      const current = currentById.get(user.id);
      return current && current.authVersion === user.authVersion
        ? [{ socketId, user: current }]
        : [];
    });
  }

  private groupRoom(groupId: string) {
    return `group:${groupId}`;
  }
}
