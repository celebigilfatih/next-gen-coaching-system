import { DrillsService } from './drills.service';
export declare class DrillsController {
    private drills;
    constructor(drills: DrillsService);
    list(query: any): Promise<{
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
    create(body: any): Promise<{
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
    update(id: string, body: any): Promise<{
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
