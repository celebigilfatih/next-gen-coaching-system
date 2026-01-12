import { PrismaService } from '../prisma/prisma.service';
export declare class ClubsService {
    private prisma;
    constructor(prisma: PrismaService);
    createClub(data: {
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
    listClubs(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        logo: string | null;
        description: string | null;
    }[]>;
    getClubById(clubId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        logo: string | null;
        description: string | null;
    } | null>;
    addUserToClub(userId: string, clubId: string): Promise<{
        id: string;
        name: string;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        position: import(".prisma/client").$Enums.Position | null;
        birthDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        clubId: string | null;
    }>;
    createGroup(clubId: string, name: string, ageGroup: 'U8' | 'U10' | 'U12' | 'U14' | 'U16' | 'U18' | 'SENIOR'): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        category: import(".prisma/client").$Enums.TeamCategory;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    }>;
    listGroups(clubId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        category: import(".prisma/client").$Enums.TeamCategory;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    }[]>;
    updateClub(clubId: string, data: {
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
