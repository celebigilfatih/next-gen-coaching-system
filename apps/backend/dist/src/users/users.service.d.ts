import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    createUser(params: {
        name: string;
        email: string;
        password: string;
        role: 'ADMIN' | 'COACH' | 'PLAYER';
        clubId?: string;
        position?: 'KALECI' | 'DEFANS' | 'ORTA_SAHA' | 'FORVET';
        birthDate?: Date;
    }): Promise<{
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
    }>;
    findByEmail(email: string): Promise<{
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
    findById(id: string): Promise<{
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
    listAll(): Promise<{
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
