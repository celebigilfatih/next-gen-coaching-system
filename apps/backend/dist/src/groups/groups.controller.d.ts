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
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        ageGroup: import(".prisma/client").$Enums.AgeGroup;
    })[]>;
    create(body: {
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
    addMember(id: string, body: {
        userId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        groupId: string;
    }>;
}
