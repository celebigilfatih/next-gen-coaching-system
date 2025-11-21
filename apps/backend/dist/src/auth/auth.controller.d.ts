import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
export declare class AuthController {
    private auth;
    private users;
    constructor(auth: AuthService, users: UsersService);
    register(body: {
        name: string;
        email: string;
        password: string;
        role?: 'ADMIN' | 'COACH' | 'PLAYER';
        clubId?: string;
    }): Promise<{
        user: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            clubId: string | null;
        };
    }>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            clubId: string | null;
        };
    }>;
    me(req: any): Promise<any>;
}
