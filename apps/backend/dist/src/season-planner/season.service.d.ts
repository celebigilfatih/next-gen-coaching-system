import { PrismaService } from '../prisma/prisma.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
export declare class SeasonService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateSeasonDto): Promise<{
        club: {
            id: string;
            name: string;
            logo: string | null;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        startDate: Date;
        endDate: Date;
        userId: string;
    }>;
    findAll(clubId?: string): Promise<({
        club: {
            id: string;
            name: string;
            logo: string | null;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        _count: {
            macros: number;
            micros: number;
        };
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        startDate: Date;
        endDate: Date;
        userId: string;
    })[]>;
    findOne(id: string): Promise<{
        club: {
            id: string;
            name: string;
            logo: string | null;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
        macros: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            title: string;
            type: string;
            intensity: number;
            notes: string | null;
            seasonId: string;
        }[];
        mesos: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            seasonId: string;
            startWeek: number;
            endWeek: number;
            goal: string;
            intensityJson: import("@prisma/client/runtime/library").JsonValue;
            macroId: string;
        }[];
        micros: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            seasonId: string;
            weekNumber: number;
            dayPlans: import("@prisma/client/runtime/library").JsonValue;
        }[];
        matchWeeks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            seasonId: string;
            weekNumber: number;
            opponentName: string;
            opponentAnalysis: import("@prisma/client/runtime/library").JsonValue | null;
            setPieces: import("@prisma/client/runtime/library").JsonValue | null;
            videoLinks: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        startDate: Date;
        endDate: Date;
        userId: string;
    }>;
    update(id: string, dto: UpdateSeasonDto): Promise<{
        club: {
            id: string;
            name: string;
            logo: string | null;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        startDate: Date;
        endDate: Date;
        userId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        startDate: Date;
        endDate: Date;
        userId: string;
    }>;
}
