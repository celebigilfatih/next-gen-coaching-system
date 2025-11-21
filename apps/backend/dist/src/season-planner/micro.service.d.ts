import { PrismaService } from '../prisma/prisma.service';
import { CreateMicroDto } from './dto/create-micro.dto';
export declare class MicroService {
    private prisma;
    constructor(prisma: PrismaService);
    create(seasonId: string, dto: CreateMicroDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        seasonId: string;
        weekNumber: number;
        dayPlans: import("@prisma/client/runtime/library").JsonValue;
    }>;
    update(id: string, dayPlans: any[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        seasonId: string;
        weekNumber: number;
        dayPlans: import("@prisma/client/runtime/library").JsonValue;
    }>;
    findBySeasonAndWeek(seasonId: string, weekNumber: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        seasonId: string;
        weekNumber: number;
        dayPlans: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
}
