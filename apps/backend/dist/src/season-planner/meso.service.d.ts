import { PrismaService } from '../prisma/prisma.service';
import { CreateMesoDto } from './dto/create-meso.dto';
export declare class MesoService {
    private prisma;
    constructor(prisma: PrismaService);
    create(seasonId: string, dto: CreateMesoDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        seasonId: string;
        startWeek: number;
        endWeek: number;
        goal: string;
        intensityJson: import("@prisma/client/runtime/library").JsonValue;
        macroId: string;
    }>;
}
