import { UsersService } from './users.service';
export declare class UsersController {
    private users;
    constructor(users: UsersService);
    list(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        birthDate: Date | null;
        position: import(".prisma/client").$Enums.Position | null;
        clubId: string | null;
    }[]>;
    byEmail(email: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        birthDate: Date | null;
        position: import(".prisma/client").$Enums.Position | null;
        clubId: string | null;
    } | null>;
    listPlayers(clubId?: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        birthDate: Date | null;
        position: import(".prisma/client").$Enums.Position | null;
        clubId: string | null;
    }[]>;
}
