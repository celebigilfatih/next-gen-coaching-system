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
