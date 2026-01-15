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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            email: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            birthDate: Date | null;
            position: import(".prisma/client").$Enums.Position | null;
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
