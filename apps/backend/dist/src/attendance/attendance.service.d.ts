import { PrismaService } from '../prisma/prisma.service';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    mark(planId: string, playerId: string, status: 'PRESENT' | 'ABSENT'): Promise<{
        id: string;
        createdAt: Date;
        playerId: string;
        planId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
    }>;
    listByPlan(planId: string): Promise<({
        player: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
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
