import { UsersService } from './users.service';
export declare class UsersController {
    private users;
    constructor(users: UsersService);
    list(): Promise<{
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
    }[]>;
    byEmail(email: string): Promise<{
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
    } | null>;
    listPlayers(clubId?: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        position: import(".prisma/client").$Enums.Position | null;
        birthDate: Date | null;
        clubId: string | null;
    }[]>;
}
