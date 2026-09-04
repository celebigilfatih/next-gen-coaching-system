import { Prisma } from '@prisma/client';

export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  clubId: true,
  position: true,
  birthDate: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export const authenticationUserSelect = {
  ...publicUserSelect,
  authVersion: true,
  passwordHash: true,
} satisfies Prisma.UserSelect;

type AuthenticationUser = Prisma.UserGetPayload<{
  select: typeof authenticationUserSelect;
}>;

export function toPublicUser(user: AuthenticationUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    clubId: user.clubId,
    position: user.position,
    birthDate: user.birthDate,
    createdAt: user.createdAt,
  };
}
