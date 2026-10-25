import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  legacyWrite,
  syncLegacyGroup,
  syncLegacySeason,
} from './legacy-compatibility';
import {
  parseCreateSportingTeamBody,
  parseUpdateSportingTeamBody,
} from './dto/team-lifecycle.dto';
import { sportingIdentifier } from './dto/sporting.dto';

const lifecycleTeamSelect = {
  id: true,
  clubId: true,
  name: true,
  categoryKey: true,
  categoryLabel: true,
  ageGroupLabel: true,
  minimumAge: true,
  maximumAge: true,
  legacyGroupId: true,
  archivedAt: true,
  teamSeasons: {
    take: 1,
    orderBy: [
      { clubSeason: { startDate: 'desc' as const } },
      { id: 'asc' as const },
    ],
    select: {
      id: true,
      clubSeason: {
        select: { id: true, name: true, startDate: true, endDate: true },
      },
    },
  },
} satisfies Prisma.TeamSelect;

@Injectable()
export class SportingTeamLifecycleService {
  private readonly logger = new Logger(SportingTeamLifecycleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
  ) {}

  async create(principal: AuthPrincipal, input: unknown) {
    const data = parseCreateSportingTeamBody(input);
    this.authorization.assertClubManage(principal, data.clubId);
    if (
      data.classification === 'FIRST_TEAM' &&
      principal.role !== 'SYSTEM_ADMIN'
    )
      throw new ForbiddenException('Only SYSTEM_ADMIN can create a first team');

    const clubSeason = await this.prisma.clubSeason.findUnique({
      where: { id: data.clubSeasonId },
      select: {
        id: true,
        clubId: true,
        name: true,
        startDate: true,
        endDate: true,
      },
    });
    if (!clubSeason) throw new NotFoundException('Club season not found');
    if (clubSeason.clubId !== data.clubId)
      throw new ForbiddenException('Resource is outside the authorized scope');

    const category =
      data.classification === 'FIRST_TEAM' ? 'A_TAKIM' : 'ALT_YAPI';
    try {
      return await legacyWrite(this.prisma, async (tx) => {
        const group = await tx.playerGroup.create({
          data: {
            clubId: data.clubId,
            name: data.name,
            ageGroup: data.ageGroupLabel,
            category,
          },
        });
        const team = await syncLegacyGroup(tx, group);
        const season = await tx.season.create({
          data: {
            clubId: data.clubId,
            groupId: group.id,
            name: clubSeason.name,
            startDate: clubSeason.startDate,
            endDate: clubSeason.endDate,
            userId: principal.id,
          },
        });
        await syncLegacySeason(tx, season);
        await tx.securityAuditEvent.create({
          data: {
            action: 'SPORTING_TEAM_CREATED',
            actorId: principal.id,
            clubId: data.clubId,
            metadata: { teamId: team.id, classification: data.classification },
          },
        });
        return tx.team.findUniqueOrThrow({
          where: { id: team.id },
          select: lifecycleTeamSelect,
        });
      });
    } catch (error) {
      if (
        data.classification === 'FIRST_TEAM' &&
        this.prismaCode(error) === 'P2002'
      )
        throw new ConflictException(
          'The club already has an active first team',
        );
      this.persistenceFailure('SPORTING_TEAM_CREATE_FAILED');
    }
  }

  async update(principal: AuthPrincipal, teamId: string, input: unknown) {
    teamId = sportingIdentifier(teamId, 'teamId');
    const data = parseUpdateSportingTeamBody(input);
    const team = await this.requireTeam(teamId);
    this.authorization.assertClubManage(principal, team.clubId);
    if (team.archivedAt)
      throw new ConflictException('Restore the team before editing it');
    try {
      return await legacyWrite(this.prisma, async (tx) => {
        if (team.legacyGroupId) {
          const group = await tx.playerGroup.update({
            where: { id: team.legacyGroupId },
            data: { name: data.name, ageGroup: data.ageGroupLabel },
          });
          await syncLegacyGroup(tx, group);
        } else {
          await tx.team.update({
            where: { id: team.id },
            data: { name: data.name, ageGroupLabel: data.ageGroupLabel },
          });
        }
        await tx.securityAuditEvent.create({
          data: {
            action: 'SPORTING_TEAM_UPDATED',
            actorId: principal.id,
            clubId: team.clubId,
            metadata: { teamId: team.id },
          },
        });
        return tx.team.findUniqueOrThrow({
          where: { id: team.id },
          select: lifecycleTeamSelect,
        });
      });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.persistenceFailure('SPORTING_TEAM_UPDATE_FAILED');
    }
  }

  archive(principal: AuthPrincipal, teamId: string) {
    return this.changeArchiveState(principal, teamId, true);
  }

  restore(principal: AuthPrincipal, teamId: string) {
    return this.changeArchiveState(principal, teamId, false);
  }

  private async changeArchiveState(
    principal: AuthPrincipal,
    teamId: string,
    archive: boolean,
  ) {
    teamId = sportingIdentifier(teamId, 'teamId');
    const team = await this.requireTeam(teamId);
    this.authorization.assertClubManage(principal, team.clubId);
    if (team.categoryKey === 'A_TAKIM')
      throw new ConflictException('The first team is protected');
    if (archive === Boolean(team.archivedAt))
      throw new ConflictException(
        archive ? 'Team is already archived' : 'Team is already active',
      );
    const archivedAt = archive ? new Date() : null;
    try {
      return await legacyWrite(this.prisma, async (tx) => {
        await tx.team.update({ where: { id: team.id }, data: { archivedAt } });
        if (team.legacyGroupId)
          await tx.playerGroup.update({
            where: { id: team.legacyGroupId },
            data: { archivedAt },
          });
        await tx.securityAuditEvent.create({
          data: {
            action: archive
              ? 'SPORTING_TEAM_ARCHIVED'
              : 'SPORTING_TEAM_RESTORED',
            actorId: principal.id,
            clubId: team.clubId,
            metadata: { teamId: team.id },
          },
        });
        return tx.team.findUniqueOrThrow({
          where: { id: team.id },
          select: lifecycleTeamSelect,
        });
      });
    } catch {
      this.persistenceFailure(
        archive
          ? 'SPORTING_TEAM_ARCHIVE_FAILED'
          : 'SPORTING_TEAM_RESTORE_FAILED',
      );
    }
  }

  private async requireTeam(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        clubId: true,
        categoryKey: true,
        legacyGroupId: true,
        archivedAt: true,
      },
    });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  private prismaCode(error: unknown) {
    return error && typeof error === 'object' && 'code' in error
      ? String(error.code)
      : '';
  }

  private persistenceFailure(event: string): never {
    this.logger.error(event);
    throw new InternalServerErrorException({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
