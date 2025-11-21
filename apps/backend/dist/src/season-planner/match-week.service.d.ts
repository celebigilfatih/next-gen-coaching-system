import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchWeekDto } from './dto/create-match-week.dto';
export declare class MatchWeekService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateMatchWeekDto): Promise<{
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
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
    }>;
    findBySeasonId(seasonId: string): Promise<({
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
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
    })[]>;
}
