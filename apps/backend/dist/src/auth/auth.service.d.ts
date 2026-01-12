import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private users;
    private jwt;
    constructor(users: UsersService, jwt: JwtService);
    validateUser(email: string, password: string): Promise<{
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
    login(email: string, password: string): Promise<{
        access_token: string;
        user: {
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
        };
    }>;
}
