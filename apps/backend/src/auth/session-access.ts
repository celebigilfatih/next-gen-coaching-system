import type { PrismaService } from '../prisma/prisma.service';

// A rotated credential keeps the same family id; logout/reuse kills that family.
export async function hasActiveSessionFamily(
  prisma: PrismaService,
  userId: string,
  authVersion: number,
  familyId: unknown,
) {
  if (familyId === undefined) return true;
  if (
    typeof familyId !== 'string' ||
    !familyId ||
    process.env.PERSISTENT_SESSIONS_ENABLED !== 'true'
  )
    return false;
  const now = new Date();
  return Boolean(
    await prisma.refreshSession.findFirst({
      where: {
        userId,
        authVersion,
        familyId,
        revokedAt: null,
        idleExpiresAt: { gt: now },
        absoluteExpiresAt: { gt: now },
      },
      select: { id: true },
    }),
  );
}
