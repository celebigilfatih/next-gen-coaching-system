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
        logo: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    list(req: any): Promise<{
        id: string;
        name: string;
        logo: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    assign(id: string, body: {
        userId: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
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
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    }>;
    listGroups(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    }[]>;
}
