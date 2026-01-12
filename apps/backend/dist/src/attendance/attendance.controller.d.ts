import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private attendance;
    constructor(attendance: AttendanceService);
    mark(body: {
        planId: string;
        playerId: string;
        status: 'PRESENT' | 'ABSENT';
    }): Promise<{
        id: string;
        createdAt: Date;
        playerId: string;
        planId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
    }>;
    list(planId: string): Promise<({
        player: {
            id: string;
            name: string;
            email: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            position: import(".prisma/client").$Enums.Position | null;
            birthDate: Date | null;
            createdAt: Date;
            updatedAt: Date;
            clubId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        playerId: string;
        planId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
    })[]>;
}
