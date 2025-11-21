import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private connectedUsers;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleUserJoin(data: {
        userId: string;
        name: string;
    }, client: Socket): {
        success: boolean;
    };
    handleAttendanceUpdate(data: {
        planId: string;
        playerId: string;
        status: string;
    }, client: Socket): {
        success: boolean;
    };
    handlePlanUpdate(data: {
        planId: string;
        field: string;
        value: any;
    }, client: Socket): {
        success: boolean;
    };
    handleDrillAdd(data: {
        planId: string;
        drill: any;
    }, client: Socket): {
        success: boolean;
    };
}
