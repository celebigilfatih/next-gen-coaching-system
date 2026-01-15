import { TrainingPlansService } from './training-plans.service';
export declare class TrainingPlansController {
    private plans;
    constructor(plans: TrainingPlansService);
    list(clubId: string, coachId: string, groupId: string): Promise<({
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
    my(req: any): Promise<({
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
    create(body: any): Promise<{
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
    addDrill(id: string, body: {
        drillId: string;
        phase: 'WARM_UP' | 'TECHNICAL' | 'TACTICAL' | 'COOL_DOWN';
        order: number;
        notes?: string;
    }): Promise<{
        id: string;
        notes: string | null;
        trainingPlanId: string;
        drillId: string;
        phase: import(".prisma/client").$Enums.Phase;
        order: number;
    }>;
    update(id: string, body: any): Promise<{
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
