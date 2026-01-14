import { ClubsService } from './clubs.service';
export declare class ClubsController {
    private clubs;
    constructor(clubs: ClubsService);
    create(body: {
        name: string;
        logo?: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        logo: string | null;
        description: string | null;
    }>;
    list(req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        logo: string | null;
        description: string | null;
    }[]>;
    assign(id: string, body: {
        userId: string;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
        birthDate: Date | null;
        position: import(".prisma/client").$Enums.Position | null;
        clubId: string | null;
    }>;
    createGroup(id: string, body: {
        name: string;
        ageGroup: any;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        category: import(".prisma/client").$Enums.TeamCategory;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    }>;
    listGroups(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        category: import(".prisma/client").$Enums.TeamCategory;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    }[]>;
    update(id: string, body: {
        name?: string;
        logo?: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        logo: string | null;
        description: string | null;
    }>;
}
