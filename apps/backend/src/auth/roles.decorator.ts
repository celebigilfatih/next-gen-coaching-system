import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type Role = 'ADMIN' | 'COACH' | 'PLAYER';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
