import {
  Injectable,
  NotFoundException,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  UnauthorizedException,
} from '@nestjs/common';
import type { CookieOptions, Request } from 'express';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../users/user.select';
import { PersistentSessionConfiguration } from './persistent-session-configuration.module';

const csrfHeaderName = 'x-ngcs-csrf';
const csrfHeaderValue = '1';

const refreshUserSelect = {
  ...publicUserSelect,
  authVersion: true,
} satisfies Prisma.UserSelect;

type RefreshUser = Prisma.UserGetPayload<{
  select: typeof refreshUserSelect;
}>;

type IssuedRefreshSession = {
  familyId: string;
  rawToken: string;
  absoluteExpiresAt: Date;
};

@Injectable()
export class RefreshSessionService implements OnModuleInit, OnModuleDestroy {
  private cleanupTimer?: ReturnType<typeof setInterval>;
  private readonly logger = new Logger(RefreshSessionService.name);
  onModuleInit() {
    if (!this.enabled) return;
    const cleanup = () => {
      void this.pruneRetainedSessions().catch(() =>
        this.logger.error('Session retention cleanup failed'),
      );
    };
    cleanup();
    this.cleanupTimer = setInterval(cleanup, 60 * 60 * 1000);
    this.cleanupTimer.unref();
  }
  onModuleDestroy() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
  }
  constructor(
    private readonly prisma: PrismaService,
    readonly configuration: PersistentSessionConfiguration,
  ) {}

  get enabled() {
    return this.configuration.enabled;
  }

  get cookieName() {
    return this.configuration.cookieName;
  }

  cookieOptions(maxAge?: number): CookieOptions {
    return {
      httpOnly: true,
      secure: this.configuration.cookieSecure,
      sameSite: 'lax',
      path: '/',
      ...(maxAge === undefined ? {} : { maxAge }),
    };
  }

  assertBrowserRequest(request: Request) {
    if (!this.enabled) return;
    if (
      request.get('origin') !== this.configuration.frontendOrigin ||
      request.get(csrfHeaderName) !== csrfHeaderValue
    ) {
      throw new UnauthorizedException('Browser session request was rejected');
    }
  }

  requireEnabled() {
    if (!this.enabled) throw new NotFoundException();
  }

  readRefreshToken(request: Request) {
    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) return null;
    const values: string[] = [];
    for (const part of cookieHeader.split(';')) {
      const separator = part.indexOf('=');
      if (separator < 0) continue;
      const name = part.slice(0, separator).trim();
      if (name !== this.cookieName) continue;
      const value = part.slice(separator + 1).trim();
      values.push(value);
    }
    return values.length === 1 && /^[A-Za-z0-9_-]{43}$/.test(values[0])
      ? values[0]
      : null;
  }

  async issue(user: {
    id: string;
    authVersion: number;
    clubId: string | null;
  }) {
    this.requireEnabled();
    await this.pruneRetainedSessions();
    const now = new Date();
    const absoluteExpiresAt = new Date(
      now.getTime() + this.configuration.refreshAbsoluteTtlMs,
    );
    const { rawToken, tokenHash } = this.createToken();
    const familyId: string = randomUUID();

    await this.prisma.$transaction(async (transaction) => {
      await this.lockUser(transaction, user.id);
      const currentUser = await transaction.user.findUnique({
        where: { id: user.id },
        select: { status: true, authVersion: true },
      });
      if (
        !currentUser ||
        currentUser.status !== 'ACTIVE' ||
        currentUser.authVersion !== user.authVersion
      )
        this.rejectRefresh();
      await transaction.refreshSession.updateMany({
        where: {
          userId: user.id,
          revokedAt: null,
          OR: [
            { idleExpiresAt: { lte: now } },
            { absoluteExpiresAt: { lte: now } },
          ],
        },
        data: { revokedAt: now, revocationReason: 'EXPIRED' },
      });
      const active = await transaction.refreshSession.findMany({
        where: {
          userId: user.id,
          revokedAt: null,
          idleExpiresAt: { gt: now },
          absoluteExpiresAt: { gt: now },
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });
      const overflow = active.slice(
        this.configuration.maxActiveSessionFamilies - 1,
      );
      if (overflow.length) {
        await transaction.refreshSession.updateMany({
          where: { id: { in: overflow.map(({ id }) => id) } },
          data: { revokedAt: now, revocationReason: 'SESSION_LIMIT' },
        });
      }

      const created = await transaction.refreshSession.create({
        data: {
          userId: user.id,
          familyId,
          tokenHash,
          authVersion: user.authVersion,
          idleExpiresAt: new Date(
            now.getTime() + this.configuration.refreshIdleTtlMs,
          ),
          absoluteExpiresAt,
          lastUsedAt: now,
        },
        select: { id: true },
      });
      await transaction.securityAuditEvent.create({
        data: {
          action: 'SESSION_CREATED',
          targetUserId: user.id,
          clubId: user.clubId,
          metadata: { sessionId: created.id },
        },
      });
    });

    return {
      rawToken,
      absoluteExpiresAt,
      familyId,
    } satisfies IssuedRefreshSession;
  }

  async rotate(rawToken: string): Promise<{
    user: RefreshUser;
    refreshSession: IssuedRefreshSession;
  }> {
    this.requireEnabled();
    if (!/^[A-Za-z0-9_-]{43}$/.test(rawToken)) this.rejectRefresh();
    const tokenHash = this.hashToken(rawToken);
    const candidate = await this.prisma.refreshSession.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true },
    });
    if (!candidate) this.rejectRefresh();

    const now = new Date();
    const rotated = await this.prisma.$transaction(async (transaction) => {
      await this.lockUser(transaction, candidate.userId);
      const current = await transaction.refreshSession.findUnique({
        where: { id: candidate.id },
        include: { user: { select: refreshUserSelect } },
      });
      if (!current) return null;

      const replay =
        current.revokedAt !== null && current.revocationReason === 'ROTATED';
      const invalid =
        current.revokedAt !== null ||
        current.idleExpiresAt <= now ||
        current.absoluteExpiresAt <= now ||
        current.user.status !== 'ACTIVE' ||
        current.authVersion !== current.user.authVersion;
      if (invalid) {
        await transaction.refreshSession.updateMany({
          where: { familyId: current.familyId, revokedAt: null },
          data: {
            revokedAt: now,
            revocationReason: replay ? 'REUSE_DETECTED' : 'INVALIDATED',
          },
        });
        if (replay) {
          await transaction.securityAuditEvent.create({
            data: {
              action: 'SESSION_REUSE_DETECTED',
              targetUserId: current.userId,
              clubId: current.user.clubId,
              metadata: { sessionId: current.id },
            },
          });
        }
        return null;
      }

      const claim = await transaction.refreshSession.updateMany({
        where: {
          id: current.id,
          revokedAt: null,
          idleExpiresAt: { gt: now },
          absoluteExpiresAt: { gt: now },
        },
        data: {
          revokedAt: now,
          revocationReason: 'ROTATED',
          lastUsedAt: now,
        },
      });
      if (claim.count !== 1) return null;

      const nextToken = this.createToken();
      const idleExpiresAt = new Date(
        Math.min(
          now.getTime() + this.configuration.refreshIdleTtlMs,
          current.absoluteExpiresAt.getTime(),
        ),
      );
      const created = await transaction.refreshSession.create({
        data: {
          userId: current.userId,
          familyId: current.familyId,
          tokenHash: nextToken.tokenHash,
          authVersion: current.user.authVersion,
          idleExpiresAt,
          absoluteExpiresAt: current.absoluteExpiresAt,
          lastUsedAt: now,
        },
        select: { id: true },
      });
      await transaction.securityAuditEvent.create({
        data: {
          action: 'SESSION_REFRESHED',
          targetUserId: current.userId,
          clubId: current.user.clubId,
          metadata: { sessionId: created.id },
        },
      });
      return {
        user: current.user,
        refreshSession: {
          familyId: current.familyId,
          rawToken: nextToken.rawToken,
          absoluteExpiresAt: current.absoluteExpiresAt,
        },
      };
    });

    if (!rotated) this.rejectRefresh();
    return rotated;
  }

  async logout(rawToken: string | null) {
    if (!this.enabled || !rawToken) return;
    const candidate = await this.prisma.refreshSession.findUnique({
      where: { tokenHash: this.hashToken(rawToken) },
      select: { id: true, userId: true, familyId: true },
    });
    if (!candidate) return;

    const now = new Date();
    await this.prisma.$transaction(async (transaction) => {
      await this.lockUser(transaction, candidate.userId);
      const revoked = await transaction.refreshSession.updateMany({
        where: { familyId: candidate.familyId, revokedAt: null },
        data: { revokedAt: now, revocationReason: 'LOGOUT' },
      });
      if (!revoked.count) return;
      const user = await transaction.user.findUnique({
        where: { id: candidate.userId },
        select: { clubId: true },
      });
      await transaction.securityAuditEvent.create({
        data: {
          action: 'SESSION_LOGGED_OUT',
          targetUserId: candidate.userId,
          clubId: user?.clubId ?? null,
          metadata: { sessionId: candidate.id },
        },
      });
    });
  }

  private async pruneRetainedSessions() {
    const cutoff = new Date(Date.now() - this.configuration.retentionMs);
    await this.prisma.refreshSession.deleteMany({
      where: {
        OR: [
          { revokedAt: { lt: cutoff } },
          { absoluteExpiresAt: { lt: cutoff } },
          { idleExpiresAt: { lt: cutoff } },
        ],
      },
    });
  }

  private createToken() {
    const rawToken = randomBytes(32).toString('base64url');
    return { rawToken, tokenHash: this.hashToken(rawToken) };
  }

  private hashToken(rawToken: string) {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private lockUser(transaction: Prisma.TransactionClient, userId: string) {
    return transaction.$queryRaw`
      SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE
    `;
  }

  private rejectRefresh(): never {
    throw new UnauthorizedException('Refresh session is invalid');
  }
}
