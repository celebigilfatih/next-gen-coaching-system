import { PrismaService } from '../prisma/prisma.service';
import { CreateMacroDto } from './dto/create-macro.dto';
export declare class MacroService {
    private prisma;
    constructor(prisma: PrismaService);
    create(seasonId: string, dto: CreateMacroDto): Promise<{
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
    }>;
    findBySeasonId(seasonId: string): Promise<({
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
    } & {
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
    })[]>;
}
