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

  private readonly connectedUsers = new Map<string, SocketPrincipal>();

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
      client.data.user = principal;
      this.connectedUsers.set(client.id, principal);
      if (principal.clubId) {
        await client.join(this.clubRoom(principal.clubId));
        this.emitUsers(principal.clubId);
      }
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const principal = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);
    if (principal?.clubId) this.emitUsers(principal.clubId);
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
      this.server
        .to(this.clubRoom(plan.clubId))
        .emit('attendance:updated', data);
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
      this.server.to(this.clubRoom(plan.clubId)).emit('plan:updated', data);
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
      this.server.to(this.clubRoom(plan.clubId)).emit('drill:added', data);
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
    const connected = client.data.user as SocketPrincipal | undefined;
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
    return {
      id: user.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      clubId: user.clubId,
      authVersion: user.authVersion,
    };
  }

  private emitUsers(clubId: string) {
    const users = Array.from(this.connectedUsers.values())
      .filter((user) => user.clubId === clubId)
      .map((user) => ({ id: user.id, name: user.name, role: user.role }));
    this.server.to(this.clubRoom(clubId)).emit('users:update', users);
  }

  private clubRoom(clubId: string) {
    return `club:${clubId}`;
  }
}
