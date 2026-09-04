import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export type Role = UserRole;
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
