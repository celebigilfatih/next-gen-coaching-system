import { PrismaService } from '../prisma/prisma.service';
export declare class DrillsService {
    private prisma;
    constructor(prisma: PrismaService);
    list(filters: {
        category?: string;
        ageGroup?: string;
        difficulty?: string;
    }): Promise<{
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
    }[]>;
    create(data: {
        title: string;
        category: string;
        ageGroup: string;
        durationMin: number;
        difficulty: string;
        equipment?: string;
        jsonData: any;
        imageUrl?: string;
    }): Promise<{
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
    }>;
    get(id: string): Promise<{
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
    } | null>;
    update(id: string, data: Partial<{
        title: string;
        category: string;
        ageGroup: string;
        durationMin: number;
        difficulty: string;
        equipment?: string;
        jsonData: any;
        imageUrl?: string;
    }>): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
