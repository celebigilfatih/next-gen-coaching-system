import { PrismaService } from '../prisma/prisma.service';
export declare class TrainingPlansService {
    private prisma;
    constructor(prisma: PrismaService);
    list(filters: {
        clubId?: string;
        coachId?: string;
        groupId?: string;
    }): Promise<({
        attendance: {
            id: string;
            createdAt: Date;
            playerId: string;
            planId: string;
            status: import(".prisma/client").$Enums.AttendanceStatus;
        }[];
        drills: ({
            drill: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                category: import(".prisma/client").$Enums.DrillCategory;
                ageGroup: import(".prisma/client").$Enums.AgeGroup;
                durationMin: number;
                difficulty: import(".prisma/client").$Enums.Difficulty;
                equipment: string | null;
                jsonData: import("@prisma/client/runtime/library").JsonValue;
                imageUrl: string | null;
            };
        } & {
            id: string;
            notes: string | null;
            phase: import(".prisma/client").$Enums.Phase;
            order: number;
            trainingPlanId: string;
            drillId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        title: string;
        date: Date | null;
        coachId: string;
        totalDuration: number;
        groupId: string | null;
    })[]>;
    get(id: string): Promise<({
        attendance: ({
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
        })[];
        drills: ({
            drill: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                category: import(".prisma/client").$Enums.DrillCategory;
                ageGroup: import(".prisma/client").$Enums.AgeGroup;
                durationMin: number;
                difficulty: import(".prisma/client").$Enums.Difficulty;
                equipment: string | null;
                jsonData: import("@prisma/client/runtime/library").JsonValue;
                imageUrl: string | null;
            };
        } & {
            id: string;
            notes: string | null;
            phase: import(".prisma/client").$Enums.Phase;
            order: number;
            trainingPlanId: string;
            drillId: string;
        })[];
        group: ({
            members: ({
                user: {
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
                userId: string;
                groupId: string;
            })[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            clubId: string;
            ageGroup: import(".prisma/client").$Enums.AgeGroup;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        title: string;
        date: Date | null;
        coachId: string;
        totalDuration: number;
        groupId: string | null;
    }) | null>;
    create(data: {
        title: string;
        clubId: string;
        coachId: string;
        groupId?: string;
        date?: Date;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        title: string;
        date: Date | null;
        coachId: string;
        totalDuration: number;
        groupId: string | null;
    }>;
    addDrill(planId: string, drillId: string, phase: 'WARM_UP' | 'TECHNICAL' | 'TACTICAL' | 'COOL_DOWN', order: number, notes?: string): Promise<{
        id: string;
        notes: string | null;
        phase: import(".prisma/client").$Enums.Phase;
        order: number;
        trainingPlanId: string;
        drillId: string;
    }>;
    private recalculateTotalDuration;
    update(id: string, data: Partial<{
        title: string;
        totalDuration: number;
        groupId?: string;
        date?: Date;
    }>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        title: string;
        date: Date | null;
        coachId: string;
        totalDuration: number;
        groupId: string | null;
    }>;
    listForUser(userId: string): Promise<({
        attendance: {
            id: string;
            createdAt: Date;
            playerId: string;
            planId: string;
            status: import(".prisma/client").$Enums.AttendanceStatus;
        }[];
        drills: ({
            drill: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                category: import(".prisma/client").$Enums.DrillCategory;
                ageGroup: import(".prisma/client").$Enums.AgeGroup;
                durationMin: number;
                difficulty: import(".prisma/client").$Enums.Difficulty;
                equipment: string | null;
                jsonData: import("@prisma/client/runtime/library").JsonValue;
                imageUrl: string | null;
            };
        } & {
            id: string;
            notes: string | null;
            phase: import(".prisma/client").$Enums.Phase;
            order: number;
            trainingPlanId: string;
            drillId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        title: string;
        date: Date | null;
        coachId: string;
        totalDuration: number;
        groupId: string | null;
    })[]>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        title: string;
        date: Date | null;
        coachId: string;
        totalDuration: number;
        groupId: string | null;
    }>;
}
