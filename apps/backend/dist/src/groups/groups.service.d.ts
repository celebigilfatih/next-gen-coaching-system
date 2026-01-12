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
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        category: import(".prisma/client").$Enums.TeamCategory;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    }>;
    listByClub(clubId: string): Promise<({
        members: {
            id: string;
            createdAt: Date;
            groupId: string;
            userId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        category: import(".prisma/client").$Enums.TeamCategory;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    })[]>;
    update(id: string, data: {
        name?: string;
        ageGroup?: any;
        category?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        category: import(".prisma/client").$Enums.TeamCategory;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    }>;
    delete(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        category: import(".prisma/client").$Enums.TeamCategory;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    }>;
    addMember(groupId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        groupId: string;
        userId: string;
    }>;
    removeMember(groupId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        groupId: string;
        userId: string;
    }>;
    getMembers(groupId: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        groupId: string;
        userId: string;
    })[]>;
}
