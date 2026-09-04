import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthPrincipal } from './auth-principal';

type AccessMode = 'view' | 'manage';

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  requireRole(principal: AuthPrincipal, ...roles: UserRole[]) {
    if (!roles.includes(principal.role)) {
      throw new ForbiddenException('Insufficient role');
    }
  }

  assertClubView(principal: AuthPrincipal, clubId: string) {
    if (principal.role === 'SYSTEM_ADMIN') return;
    if (!principal.clubId || principal.clubId !== clubId) this.deny();
  }

  assertClubManage(principal: AuthPrincipal, clubId: string) {
    if (principal.role === 'SYSTEM_ADMIN') return;
    if (principal.role !== 'CLUB_ADMIN') this.deny();
    if (!principal.clubId || principal.clubId !== clubId) this.deny();
  }

  async assertGroupView(principal: AuthPrincipal, groupId: string) {
    return this.assertGroupAccess(principal, groupId, 'view');
  }

  async assertGroupManage(principal: AuthPrincipal, groupId: string) {
    return this.assertGroupAccess(principal, groupId, 'manage');
  }

  async assertCoachGroupAssignment(principal: AuthPrincipal, groupId: string) {
    const group = await this.getGroup(groupId);
    if (principal.role === 'SYSTEM_ADMIN') return group;
    if (principal.role === 'CLUB_ADMIN') {
      this.assertClubManage(principal, group.clubId);
      return group;
    }
    if (principal.role !== 'COACH' || principal.clubId !== group.clubId) {
      this.deny();
    }
    if (!(await this.isGroupMember(principal.id, groupId))) this.deny();
    return group;
  }

  async assertPlanView(principal: AuthPrincipal, planId: string) {
    return this.assertPlanAccess(principal, planId, 'view');
  }

  async assertPlanManage(principal: AuthPrincipal, planId: string) {
    return this.assertPlanAccess(principal, planId, 'manage');
  }

  async assertAttendancePlayer(
    principal: AuthPrincipal,
    plan: { clubId: string; groupId: string | null },
    playerId: string,
  ) {
    const player = await this.prisma.user.findUnique({
      where: { id: playerId },
      select: { id: true, role: true, clubId: true },
    });
    if (!player) throw new NotFoundException('Player not found');
    if (player.role !== 'PLAYER' || player.clubId !== plan.clubId) this.deny();

    if (!plan.groupId) {
      if (
        principal.role !== 'SYSTEM_ADMIN' &&
        principal.role !== 'CLUB_ADMIN'
      ) {
        this.deny();
      }
      return;
    }

    if (!(await this.isGroupMember(playerId, plan.groupId))) this.deny();
  }

  async assertSeasonView(principal: AuthPrincipal, seasonId: string) {
    return this.assertSeasonAccess(principal, seasonId, 'view');
  }

  async assertSeasonManage(principal: AuthPrincipal, seasonId: string) {
    return this.assertSeasonAccess(principal, seasonId, 'manage');
  }

  async assertWeekView(principal: AuthPrincipal, weekId: string) {
    const week = await this.prisma.weekPlan.findUnique({
      where: { id: weekId },
      select: { seasonId: true },
    });
    if (!week) throw new NotFoundException('Week not found');
    return this.assertSeasonView(principal, week.seasonId);
  }

  async assertWeekManage(principal: AuthPrincipal, weekId: string) {
    const week = await this.prisma.weekPlan.findUnique({
      where: { id: weekId },
      select: { seasonId: true },
    });
    if (!week) throw new NotFoundException('Week not found');
    return this.assertSeasonManage(principal, week.seasonId);
  }

  async assertDayManage(principal: AuthPrincipal, dayId: string) {
    const day = await this.prisma.dayPlan.findUnique({
      where: { id: dayId },
      select: { week: { select: { seasonId: true } } },
    });
    if (!day) throw new NotFoundException('Day plan not found');
    return this.assertSeasonManage(principal, day.week.seasonId);
  }

  async assertMatchView(principal: AuthPrincipal, matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: { seasonId: true },
    });
    if (!match) throw new NotFoundException('Match not found');
    return this.assertSeasonView(principal, match.seasonId);
  }

  async assertMatchManage(principal: AuthPrincipal, matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: { seasonId: true },
    });
    if (!match) throw new NotFoundException('Match not found');
    return this.assertSeasonManage(principal, match.seasonId);
  }

  async assertUserView(principal: AuthPrincipal, userId: string) {
    const target = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, clubId: true },
    });
    if (!target) throw new NotFoundException('User not found');
    if (principal.role === 'SYSTEM_ADMIN' || principal.id === target.id) return;
    if (!principal.clubId || principal.clubId !== target.clubId) this.deny();
    if (principal.role === 'CLUB_ADMIN') return;
    if (principal.role !== 'COACH') this.deny();

    const sharedGroup = await this.prisma.groupMember.findFirst({
      where: {
        userId,
        group: { members: { some: { userId: principal.id } } },
      },
      select: { id: true },
    });
    if (!sharedGroup) this.deny();
  }

  async assertCoachInClub(userId: string, clubId: string) {
    const coach = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, clubId: true },
    });
    if (!coach) throw new NotFoundException('Coach not found');
    if (coach.role !== 'COACH' || coach.clubId !== clubId) this.deny();
  }

  async assertCoachHasGroup(principal: AuthPrincipal) {
    if (principal.role !== 'COACH' || !principal.clubId) this.deny();
    const membership = await this.prisma.groupMember.findFirst({
      where: {
        userId: principal.id,
        group: { clubId: principal.clubId },
      },
      select: { id: true },
    });
    if (!membership) this.deny();
  }

  async assertUserInClub(userId: string, clubId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, clubId: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'SYSTEM_ADMIN' || user.clubId !== clubId) this.deny();
  }

  async isGroupMember(userId: string, groupId: string) {
    return Boolean(
      await this.prisma.groupMember.findFirst({
        where: { userId, groupId },
        select: { id: true },
      }),
    );
  }

  private async assertGroupAccess(
    principal: AuthPrincipal,
    groupId: string,
    mode: AccessMode,
  ) {
    const group = await this.getGroup(groupId);
    if (principal.role === 'SYSTEM_ADMIN') return group;
    if (!principal.clubId || principal.clubId !== group.clubId) this.deny();
    if (principal.role === 'CLUB_ADMIN') return group;
    if (mode === 'manage') this.deny();
    if (
      (principal.role !== 'COACH' && principal.role !== 'PLAYER') ||
      !(await this.isGroupMember(principal.id, groupId))
    ) {
      this.deny();
    }
    return group;
  }

  private async assertPlanAccess(
    principal: AuthPrincipal,
    planId: string,
    mode: AccessMode,
  ) {
    const plan = await this.prisma.trainingPlan.findUnique({
      where: { id: planId },
      select: { id: true, clubId: true, coachId: true, groupId: true },
    });
    if (!plan) throw new NotFoundException('Training plan not found');
    if (principal.role === 'SYSTEM_ADMIN') return plan;
    if (!principal.clubId || principal.clubId !== plan.clubId) this.deny();
    if (principal.role === 'CLUB_ADMIN') return plan;

    if (principal.role === 'COACH') {
      const assigned = Boolean(
        plan.groupId && (await this.isGroupMember(principal.id, plan.groupId)),
      );
      if (assigned) return plan;
      this.deny();
    }

    if (
      mode === 'view' &&
      principal.role === 'PLAYER' &&
      plan.groupId &&
      (await this.isGroupMember(principal.id, plan.groupId))
    ) {
      return plan;
    }
    this.deny();
  }

  private async assertSeasonAccess(
    principal: AuthPrincipal,
    seasonId: string,
    mode: AccessMode,
  ) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, clubId: true, groupId: true, userId: true },
    });
    if (!season) throw new NotFoundException('Season not found');
    if (principal.role === 'SYSTEM_ADMIN') return season;
    if (!season.clubId || principal.clubId !== season.clubId) this.deny();
    if (principal.role === 'CLUB_ADMIN') return season;
    const assigned = await this.isGroupMember(principal.id, season.groupId);
    if (principal.role === 'COACH' && assigned) return season;
    if (mode === 'view' && principal.role === 'PLAYER' && assigned)
      return season;
    this.deny();
  }

  private async getGroup(groupId: string) {
    const group = await this.prisma.playerGroup.findUnique({
      where: { id: groupId },
      select: { id: true, clubId: true },
    });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  private deny(): never {
    throw new ForbiddenException('Resource is outside the authorized scope');
  }
}
