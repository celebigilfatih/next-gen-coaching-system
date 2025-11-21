import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3500"],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, { userId: string; name: string }>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
    this.server.emit("users:update", Array.from(this.connectedUsers.values()));
  }

  @SubscribeMessage("user:join")
  handleUserJoin(
    @MessageBody() data: { userId: string; name: string },
    @ConnectedSocket() client: Socket
  ) {
    this.connectedUsers.set(client.id, { userId: data.userId, name: data.name });
    this.server.emit("users:update", Array.from(this.connectedUsers.values()));
    return { success: true };
  }

  @SubscribeMessage("attendance:update")
  handleAttendanceUpdate(
    @MessageBody() data: { planId: string; playerId: string; status: string },
    @ConnectedSocket() client: Socket
  ) {
    // Broadcast to all clients except sender
    client.broadcast.emit("attendance:updated", data);
    return { success: true };
  }

  @SubscribeMessage("plan:update")
  handlePlanUpdate(
    @MessageBody() data: { planId: string; field: string; value: any },
    @ConnectedSocket() client: Socket
  ) {
    client.broadcast.emit("plan:updated", data);
    return { success: true };
  }

  @SubscribeMessage("drill:add")
  handleDrillAdd(
    @MessageBody() data: { planId: string; drill: any },
    @ConnectedSocket() client: Socket
  ) {
    client.broadcast.emit("drill:added", data);
    return { success: true };
  }
}
