import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { AccountStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import type { AuthPrincipal } from '../auth/auth-principal';
import { PrismaService } from '../prisma/prisma.service';
import {
  authenticationUserSelect,
  publicUserSelect,
} from '../users/user.select';

const INVITATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

type CreateInvitationInput = {
  email: string;
  role: UserRole;
  clubId?: string;
};

type ChangeAccessInput = {
  role?: UserRole;
  clubId?: string | null;
};

@Injectable()
export class AccountLifecycleService {
  constructor(private readonly prisma: PrismaService) {}

  async createInvitation(
    principal: AuthPrincipal,
    input: CreateInvitationInput,
  ) {
    const email = input.email.trim();
    let clubId = input.clubId ?? null;

    if (principal.role === 'CLUB_ADMIN') {
      if (!['COACH', 'PLAYER'].includes(input.role) || !principal.clubId) {
        this.deny();
      }
      clubId = principal.clubId;
    } else if (principal.role === 'SYSTEM_ADMIN') {
      if (input.role === 'SYSTEM_ADMIN') {
        clubId = null;
      } else if (!clubId) {
        throw new BadRequestException(
          'clubId is required for non-system roles',
        );
      }
    } else {
      this.deny();
    }

    if (clubId) await this.requireClub(clubId);
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException('An account already exists for this email');
    }

    const { rawToken, tokenHash } = this.createToken();
    const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);
    const now = new Date();

    const invitation = await this.prisma.$transaction(async (transaction) => {
      await transaction.accountInvitation.updateMany({
        where: { email, consumedAt: null, revokedAt: null },
        data: { revokedAt: now },
      });
      const created = await transaction.accountInvitation.create({
        data: {
          email,
          role: input.role,
          clubId,
          tokenHash,
          expiresAt,
          createdById: principal.id,
        },
        select: {
          id: true,
          email: true,
          role: true,
          clubId: true,
          expiresAt: true,
          createdAt: true,
        },
      });
      await transaction.securityAuditEvent.create({
        data: {
          action: 'INVITATION_CREATED',
          actorId: principal.id,
          clubId,
          metadata: { invitationId: created.id, role: input.role },
        },
      });
      return created;
    });

    return { invitation, token: rawToken };
  }

  async revokeInvitation(principal: AuthPrincipal, invitationId: string) {
    const invitation = await this.prisma.accountInvitation.findUnique({
      where: { id: invitationId },
      select: {
        id: true,
        role: true,
        clubId: true,
        consumedAt: true,
        revokedAt: true,
      },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');
    this.assertInvitationScope(principal, invitation);
    if (invitation.consumedAt) {
      throw new BadRequestException('Invitation has already been consumed');
    }
    if (invitation.revokedAt) return { success: true };

    await this.prisma.$transaction([
      this.prisma.accountInvitation.update({
        where: { id: invitation.id },
        data: { revokedAt: new Date() },
      }),
      this.prisma.securityAuditEvent.create({
        data: {
          action: 'INVITATION_REVOKED',
          actorId: principal.id,
          clubId: invitation.clubId,
          metadata: { invitationId: invitation.id, role: invitation.role },
        },
      }),
    ]);
    return { success: true };
  }

  async acceptInvitation(token: string, name: string, password: string) {
    const tokenHash = this.hashToken(token);
    const invitation = await this.prisma.accountInvitation.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        email: true,
        role: true,
        clubId: true,
        expiresAt: true,
        consumedAt: true,
        revokedAt: true,
      },
    });
    this.assertUsableToken(invitation, 'invitation');

    if (
      await this.prisma.user.findUnique({ where: { email: invitation.email } })
    ) {
      throw new ConflictException(
        'An account already exists for this invitation',
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.accountInvitation.findUnique({
        where: { id: invitation.id },
        select: { consumedAt: true, revokedAt: true, expiresAt: true },
      });
      this.assertUsableToken(current, 'invitation');

      const user = await transaction.user.create({
        data: {
          name: name.trim(),
          email: invitation.email,
          passwordHash,
          role: invitation.role,
          clubId: invitation.clubId,
        },
        select: publicUserSelect,
      });
      await transaction.accountInvitation.update({
        where: { id: invitation.id },
        data: { consumedAt: new Date(), acceptedUserId: user.id },
      });
      await transaction.securityAuditEvent.create({
        data: {
          action: 'INVITATION_ACCEPTED',
          targetUserId: user.id,
          clubId: invitation.clubId,
          metadata: { invitationId: invitation.id, role: invitation.role },
        },
      });
      return user;
    });
  }

  async changePassword(
    principal: AuthPrincipal,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: principal.id },
      select: authenticationUserSelect,
    });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is invalid');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: principal.id },
        data: { passwordHash, authVersion: { increment: 1 } },
      }),
      this.prisma.passwordResetToken.updateMany({
        where: { userId: principal.id, consumedAt: null, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      this.prisma.securityAuditEvent.create({
        data: {
          action: 'PASSWORD_CHANGED',
          actorId: principal.id,
          targetUserId: principal.id,
          clubId: principal.clubId,
        },
      }),
    ]);
    return { success: true, reauthenticationRequired: true };
  }

  async issuePasswordReset(principal: AuthPrincipal, userId: string) {
    const target = await this.getManagedTarget(principal, userId);
    const { rawToken, tokenHash } = this.createToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    const now = new Date();

    const reset = await this.prisma.$transaction(async (transaction) => {
      await transaction.passwordResetToken.updateMany({
        where: { userId, consumedAt: null, revokedAt: null },
        data: { revokedAt: now },
      });
      const created = await transaction.passwordResetToken.create({
        data: {
          userId,
          createdById: principal.id,
          tokenHash,
          expiresAt,
        },
        select: { id: true, userId: true, expiresAt: true, createdAt: true },
      });
      await transaction.securityAuditEvent.create({
        data: {
          action: 'PASSWORD_RESET_ISSUED',
          actorId: principal.id,
          targetUserId: userId,
          clubId: target.clubId,
          metadata: { resetId: created.id },
        },
      });
      return created;
    });

    return { passwordReset: reset, token: rawToken };
  }

  async completePasswordReset(token: string, newPassword: string) {
    const tokenHash = this.hashToken(token);
    const reset = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        consumedAt: true,
        revokedAt: true,
        user: { select: { clubId: true } },
      },
    });
    this.assertUsableToken(reset, 'password reset');
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction(async (transaction) => {
      const current = await transaction.passwordResetToken.findUnique({
        where: { id: reset.id },
        select: { consumedAt: true, revokedAt: true, expiresAt: true },
      });
      this.assertUsableToken(current, 'password reset');
      await transaction.user.update({
        where: { id: reset.userId },
        data: { passwordHash, authVersion: { increment: 1 } },
      });
      await transaction.passwordResetToken.update({
        where: { id: reset.id },
        data: { consumedAt: new Date() },
      });
      await transaction.securityAuditEvent.create({
        data: {
          action: 'PASSWORD_RESET_COMPLETED',
          targetUserId: reset.userId,
          clubId: reset.user.clubId,
          metadata: { resetId: reset.id },
        },
      });
    });
    return { success: true };
  }

  async changeAccess(
    principal: AuthPrincipal,
    userId: string,
    input: ChangeAccessInput,
  ) {
    if (input.role === undefined && input.clubId === undefined) {
      throw new BadRequestException('role or clubId is required');
    }
    if (principal.id === userId) {
      throw new ForbiddenException('Self role or club changes are not allowed');
    }

    const target = await this.getTargetWithCounts(userId);
    const nextRole = input.role ?? target.role;
    let nextClubId =
      input.clubId === undefined ? target.clubId : (input.clubId ?? null);

    if (principal.role === 'CLUB_ADMIN') {
      if (
        !principal.clubId ||
        target.clubId !== principal.clubId ||
        !['COACH', 'PLAYER'].includes(target.role) ||
        !['COACH', 'PLAYER'].includes(nextRole) ||
        nextClubId !== target.clubId
      ) {
        this.deny();
      }
    } else if (principal.role !== 'SYSTEM_ADMIN') {
      this.deny();
    }

    if (nextRole === 'SYSTEM_ADMIN') nextClubId = null;
    if (nextRole !== 'SYSTEM_ADMIN' && !nextClubId) {
      throw new BadRequestException('A club is required for non-system roles');
    }
    if (nextClubId) await this.requireClub(nextClubId);

    if (
      target.role === 'SYSTEM_ADMIN' &&
      nextRole !== 'SYSTEM_ADMIN' &&
      target.status === 'ACTIVE'
    ) {
      await this.assertAnotherActiveSystemAdmin(target.id);
    }
    if (
      target.role === 'COACH' &&
      nextRole !== 'COACH' &&
      (target._count.coachedPlans > 0 || target._count.seasonsCreated > 0)
    ) {
      throw new ConflictException(
        'Coach plans and seasons must be reassigned before changing the role',
      );
    }
    if (
      (nextClubId !== target.clubId ||
        (nextRole === 'SYSTEM_ADMIN' && target.role !== 'SYSTEM_ADMIN')) &&
      this.hasTenantData(target._count)
    ) {
      throw new ConflictException(
        'Tenant-linked data must be transferred before changing the club scope',
      );
    }

    const user = await this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.user.update({
        where: { id: userId },
        data: {
          role: nextRole,
          clubId: nextClubId,
          authVersion: { increment: 1 },
        },
        select: publicUserSelect,
      });
      await transaction.securityAuditEvent.create({
        data: {
          action: 'ACCESS_CHANGED',
          actorId: principal.id,
          targetUserId: userId,
          clubId: nextClubId,
          metadata: {
            previousRole: target.role,
            nextRole,
            previousClubId: target.clubId,
            nextClubId,
          },
        },
      });
      return updated;
    });
    return user;
  }

  async setStatus(
    principal: AuthPrincipal,
    userId: string,
    status: AccountStatus,
  ) {
    if (principal.id === userId) {
      throw new ForbiddenException('Self suspension is not allowed');
    }
    const target = await this.getManagedTarget(principal, userId);
    if (target.status === status) return this.publicUser(userId);
    if (target.role === 'SYSTEM_ADMIN' && status === 'SUSPENDED') {
      await this.assertAnotherActiveSystemAdmin(target.id);
    }

    const action =
      status === 'SUSPENDED' ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_REACTIVATED';
    return this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.update({
        where: { id: userId },
        data: { status, authVersion: { increment: 1 } },
        select: publicUserSelect,
      });
      await transaction.securityAuditEvent.create({
        data: {
          action,
          actorId: principal.id,
          targetUserId: userId,
          clubId: target.clubId,
        },
      });
      return user;
    });
  }

  async revokeSessions(principal: AuthPrincipal, userId: string) {
    const target =
      principal.id === userId
        ? await this.requireUser(userId)
        : await this.getManagedTarget(principal, userId);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { authVersion: { increment: 1 } },
      }),
      this.prisma.securityAuditEvent.create({
        data: {
          action: 'SESSIONS_REVOKED',
          actorId: principal.id,
          targetUserId: userId,
          clubId: target.clubId,
        },
      }),
    ]);
    return { success: true, reauthenticationRequired: principal.id === userId };
  }

  async listAudit(principal: AuthPrincipal, targetUserId?: string) {
    if (principal.role !== 'SYSTEM_ADMIN' && principal.role !== 'CLUB_ADMIN') {
      this.deny();
    }
    return this.prisma.securityAuditEvent.findMany({
      where: {
        targetUserId,
        clubId:
          principal.role === 'SYSTEM_ADMIN'
            ? undefined
            : (principal.clubId ?? '__unassigned__'),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        action: true,
        actorId: true,
        targetUserId: true,
        clubId: true,
        metadata: true,
        createdAt: true,
      },
    });
  }

  private async getManagedTarget(principal: AuthPrincipal, userId: string) {
    const target = await this.requireUser(userId);
    if (principal.role === 'SYSTEM_ADMIN') return target;
    if (
      principal.role !== 'CLUB_ADMIN' ||
      !principal.clubId ||
      target.clubId !== principal.clubId ||
      !['COACH', 'PLAYER'].includes(target.role)
    ) {
      this.deny();
    }
    return target;
  }

  private async requireUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, clubId: true, status: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async publicUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async getTargetWithCounts(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        clubId: true,
        status: true,
        _count: {
          select: {
            groups: true,
            attendances: true,
            playerLoads: true,
            performances: true,
            seasonsCreated: true,
            coachedPlans: true,
            healthLogs: true,
            healthStatus: true,
            coachNotes: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private hasTenantData(counts: Record<string, number>) {
    return Object.values(counts).some((count) => count > 0);
  }

  private assertInvitationScope(
    principal: AuthPrincipal,
    invitation: { role: UserRole; clubId: string | null },
  ) {
    if (principal.role === 'SYSTEM_ADMIN') return;
    if (
      principal.role !== 'CLUB_ADMIN' ||
      !principal.clubId ||
      invitation.clubId !== principal.clubId ||
      !['COACH', 'PLAYER'].includes(invitation.role)
    ) {
      this.deny();
    }
  }

  private async assertAnotherActiveSystemAdmin(excludedUserId: string) {
    const count = await this.prisma.user.count({
      where: {
        role: 'SYSTEM_ADMIN',
        status: 'ACTIVE',
        id: { not: excludedUserId },
      },
    });
    if (count === 0) {
      throw new ConflictException(
        'The last active system admin must remain active',
      );
    }
  }

  private async requireClub(clubId: string) {
    if (!(await this.prisma.club.findUnique({ where: { id: clubId } }))) {
      throw new NotFoundException('Club not found');
    }
  }

  private assertUsableToken<
    T extends {
      consumedAt: Date | null;
      revokedAt: Date | null;
      expiresAt: Date;
    },
  >(token: T | null, label: string): asserts token is T {
    if (
      !token ||
      token.consumedAt ||
      token.revokedAt ||
      token.expiresAt.getTime() <= Date.now()
    ) {
      throw new BadRequestException(`Invalid or expired ${label} token`);
    }
  }

  private createToken() {
    const rawToken = randomBytes(32).toString('base64url');
    return { rawToken, tokenHash: this.hashToken(rawToken) };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private deny(): never {
    throw new ForbiddenException('Account is outside the authorized scope');
  }
}
