import { PrismaService } from '../prisma/prisma.service';
export declare class GroupsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        clubId: string;
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
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    })[]>;
    addMember(groupId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        groupId: string;
    }>;
}
