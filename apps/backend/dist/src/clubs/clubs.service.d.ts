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
        logo: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listClubs(): Promise<{
        id: string;
        name: string;
        logo: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getClubById(clubId: string): Promise<{
        id: string;
        name: string;
        logo: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    addUserToClub(userId: string, clubId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        clubId: string | null;
    }>;
    createGroup(clubId: string, name: string, ageGroup: 'U8' | 'U10' | 'U12' | 'U14' | 'U16' | 'U18' | 'SENIOR'): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    }>;
    listGroups(clubId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    }[]>;
}
