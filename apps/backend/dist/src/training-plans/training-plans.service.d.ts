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
            trainingPlanId: string;
            drillId: string;
            phase: import(".prisma/client").$Enums.Phase;
            order: number;
        })[];
    } & {
        id: string;
        date: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        groupId: string | null;
        clubId: string;
        title: string;
        coachId: string;
        totalDuration: number;
    })[]>;
    get(id: string): Promise<({
        group: ({
            members: ({
                user: {
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
                groupId: string;
                userId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            clubId: string;
            category: import(".prisma/client").$Enums.TeamCategory;
            ageGroup: import(".prisma/client").$Enums.AgeGroup;
        }) | null;
        attendance: ({
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
            trainingPlanId: string;
            drillId: string;
            phase: import(".prisma/client").$Enums.Phase;
            order: number;
        })[];
    } & {
        id: string;
        date: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        groupId: string | null;
        clubId: string;
        title: string;
        coachId: string;
        totalDuration: number;
    }) | null>;
    create(data: {
        title: string;
        clubId: string;
        coachId: string;
        groupId?: string;
        date?: Date;
        notes?: string;
    }): Promise<{
        id: string;
        date: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        groupId: string | null;
        clubId: string;
        title: string;
        coachId: string;
        totalDuration: number;
    }>;
    private linkPlanToSeasonDay;
    addDrill(planId: string, drillId: string, phase: 'WARM_UP' | 'TECHNICAL' | 'TACTICAL' | 'COOL_DOWN', order: number, notes?: string): Promise<{
        id: string;
        notes: string | null;
        trainingPlanId: string;
        drillId: string;
        phase: import(".prisma/client").$Enums.Phase;
        order: number;
    }>;
    private recalculateTotalDuration;
    update(id: string, data: Partial<{
        title: string;
        totalDuration: number;
        groupId?: string;
        date?: Date;
        notes?: string;
    }>): Promise<{
        id: string;
        date: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        groupId: string | null;
        clubId: string;
        title: string;
        coachId: string;
        totalDuration: number;
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
            trainingPlanId: string;
            drillId: string;
            phase: import(".prisma/client").$Enums.Phase;
            order: number;
        })[];
    } & {
        id: string;
        date: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        groupId: string | null;
        clubId: string;
        title: string;
        coachId: string;
        totalDuration: number;
    })[]>;
    remove(id: string): Promise<{
        id: string;
        date: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        groupId: string | null;
        clubId: string;
        title: string;
        coachId: string;
        totalDuration: number;
    }>;
}
