import { PrismaService } from '../prisma/prisma.service';
export declare class GroupsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        clubId: string;
        name: string;
        ageGroup: any;
        category?: string;
    }): Promise<{
        id: string;
        name: string;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
        createdAt: Date;
        updatedAt: Date;
        category: import(".prisma/client").$Enums.TeamCategory;
        clubId: string;
    }>;
    listByClub(clubId: string): Promise<({
        members: {
            id: string;
            createdAt: Date;
            userId: string;
            groupId: string;
        }[];
    } & {
        id: string;
        name: string;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
        createdAt: Date;
        updatedAt: Date;
        category: import(".prisma/client").$Enums.TeamCategory;
        clubId: string;
    })[]>;
    update(id: string, data: {
        name?: string;
        ageGroup?: any;
        category?: string;
    }): Promise<{
        id: string;
        name: string;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
        createdAt: Date;
        updatedAt: Date;
        category: import(".prisma/client").$Enums.TeamCategory;
        clubId: string;
    }>;
    delete(id: string): Promise<{
        id: string;
        name: string;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
        createdAt: Date;
        updatedAt: Date;
        category: import(".prisma/client").$Enums.TeamCategory;
        clubId: string;
    }>;
    addMember(groupId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        groupId: string;
    }>;
    removeMember(groupId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        groupId: string;
    }>;
    getMembers(groupId: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            position: import(".prisma/client").$Enums.Position | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        groupId: string;
    })[]>;
}
