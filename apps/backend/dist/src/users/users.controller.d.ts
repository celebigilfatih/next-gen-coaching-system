import { UsersService } from './users.service';
export declare class UsersController {
    private users;
    constructor(users: UsersService);
    list(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        clubId: string | null;
    }[]>;
    byEmail(email: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        clubId: string | null;
    } | null>;
}
