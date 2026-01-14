import { GroupsService } from './groups.service';
export declare class GroupsController {
    private groups;
    constructor(groups: GroupsService);
    list(clubId: string, req: any): Promise<({
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
    create(body: {
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
    update(id: string, body: {
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
    addMember(id: string, body: {
        userId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        groupId: string;
    }>;
    removeMember(id: string, body: {
        userId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        groupId: string;
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
        userId: string;
        groupId: string;
    })[]>;
}
