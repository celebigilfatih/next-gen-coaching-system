export declare const ROLES_KEY = "roles";
export type Role = 'ADMIN' | 'COACH' | 'PLAYER';
export declare const Roles: (...roles: Role[]) => import("@nestjs/common").CustomDecorator<string>;
