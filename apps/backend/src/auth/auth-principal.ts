import type { UserRole } from '@prisma/client';

export interface AuthPrincipal {
  id: string;
  userId: string;
  email: string;
  role: UserRole;
  clubId: string | null;
}
