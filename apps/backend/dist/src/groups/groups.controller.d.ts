import { GroupsService } from './groups.service';
export declare class GroupsController {
    private groups;
    constructor(groups: GroupsService);
    list(clubId: string, req: any): Promise<({
        members: {
            id: string;
            createdAt: Date;
            groupId: string;
            userId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        clubId: string;
        category: import(".prisma/client").$Enums.TeamCategory;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    })[]>;
    create(body: {
        clubId: string;
        name: string;
        ageGroup: any;
        category?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        clubId: string;
        category: import(".prisma/client").$Enums.TeamCategory;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    }>;
    update(id: string, body: {
        name?: string;
        ageGroup?: any;
        category?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        clubId: string;
        category: import(".prisma/client").$Enums.TeamCategory;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        clubId: string;
        category: import(".prisma/client").$Enums.TeamCategory;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    }>;
    addMember(id: string, body: {
        userId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        groupId: string;
        userId: string;
    }>;
    removeMember(id: string, body: {
        userId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        groupId: string;
        userId: string;
    }>;
    getMembers(id: string): Promise<({
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
        groupId: string;
        userId: string;
    })[]>;
}
