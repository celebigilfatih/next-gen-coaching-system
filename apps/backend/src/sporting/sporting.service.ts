import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  type SportingCapability,
  type SportingAssignmentType,
} from '@prisma/client';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  optionalAsOf,
  parseCreateAssignmentBody,
  parseEndAssignmentBody,
  parseTransitionPrimaryBody,
  sportingIdentifier,
} from './dto/sporting.dto';
import { legacyParityReport } from './legacy-parity';
import {
  decodePlayerNameCursor,
  encodePlayerNameCursor,
  parsePlayerPageQuery,
  playerPositionFilters,
} from './dto/player-page.dto';
import {
  parseAssignmentPageQuery,
  assignmentBoundary,
  assignmentCursor,
  type AssignmentPageQuery,
} from './dto/assignment-page.dto';

const assignmentInclude = {
  team: {
    select: {
      id: true,
      name: true,
      categoryLabel: true,
      ageGroupLabel: true,
      legacyGroupId: true,
    },
  },
  teamSeason: {
    select: {
      id: true,
      clubSeason: {
        select: { id: true, name: true, startDate: true, endDate: true },
      },
    },
  },
  roleDefinition: {
    select: { id: true, key: true, name: true, systemKey: true },
  },
} satisfies Prisma.SportingAssignmentInclude;

const teamSelect = {
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
    orderBy: { clubSeason: { startDate: 'desc' as const } },
    select: {
      id: true,
      clubSeason: {
        select: { id: true, name: true, startDate: true, endDate: true },
      },
    },
  },
} satisfies Prisma.TeamSelect;

@Injectable()
export class SportingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
  ) {}

  async workspace(principal: AuthPrincipal) {
    const teams = await this.listTeams(principal);
    const clubIds = [...new Set(teams.map((team) => team.clubId))];
    const clubs = await this.prisma.club.findMany({
      where:
        principal.role === 'SYSTEM_ADMIN'
          ? { id: { in: clubIds } }
          : { id: principal.clubId ?? '__unassigned__' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return { clubs, teams };
  }

  async legacyParity(principal: AuthPrincipal, clubIdInput: unknown) {
    const clubId = sportingIdentifier(clubIdInput, 'clubId');
    this.authorization.assertClubManage(principal, clubId);
    return this.prisma.$transaction((tx) => legacyParityReport(tx, clubId), {
      isolationLevel: 'RepeatableRead',
    });
  }

  async listTeams(principal: AuthPrincipal, requestedClubId?: string) {
    const clubId = this.resolveClubScope(principal, requestedClubId);
    if (principal.role === 'SYSTEM_ADMIN' || principal.role === 'CLUB_ADMIN') {
      return this.prisma.team.findMany({
        where: { ...(clubId ? { clubId } : {}), archivedAt: null },
        orderBy: [{ categoryKey: 'asc' }, { name: 'asc' }],
        select: teamSelect,
      });
    }
    const teamIds = await this.authorizedTeamIds(principal, 'TEAM_VIEW');
    return this.prisma.team.findMany({
      where: { clubId, id: { in: teamIds }, archivedAt: null },
      orderBy: [{ categoryKey: 'asc' }, { name: 'asc' }],
      select: teamSelect,
    });
  }

  async listRoles(principal: AuthPrincipal, requestedClubId?: string) {
    const clubId = this.resolveClubScope(principal, requestedClubId);
    if (!clubId) throw new BadRequestException('clubId is required');
    if (principal.role !== 'SYSTEM_ADMIN')
      this.authorization.assertClubView(principal, clubId);
    return this.prisma.functionalRole.findMany({
      where: { clubId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        key: true,
        name: true,
        systemKey: true,
        capabilities: {
          orderBy: { capability: 'asc' },
          select: { capability: true },
        },
      },
    });
  }

  async getTeamRoster(
    principal: AuthPrincipal,
    teamIdInput: unknown,
    asOfInput?: unknown,
    teamSeasonIdInput?: unknown,
    page?: AssignmentPageQuery,
  ) {
    const teamId = sportingIdentifier(teamIdInput, 'teamId');
    const asOf = optionalAsOf(asOfInput);
    const teamSeasonId =
      teamSeasonIdInput === undefined
        ? undefined
        : sportingIdentifier(teamSeasonIdInput, 'teamSeasonId');
    const team = page
      ? await this.prisma.team.findUnique({
          where: { id: teamId },
          select: {
            id: true,
            clubId: true,
            name: true,
            categoryLabel: true,
            archivedAt: true,
          },
        })
      : await this.requireTeam(teamId);
    if (!team || team.archivedAt) throw new NotFoundException('Team not found');
    await this.authorization.assertSportingCapability(
      principal,
      'TEAM_VIEW',
      team.clubId,
      team.id,
      asOf,
    );
    if (teamSeasonId) {
      const validTeamSeason = await this.prisma.teamSeason.findFirst({
        where: { id: teamSeasonId, teamId, clubId: team.clubId },
        select: { id: true },
      });
      if (!validTeamSeason)
        throw new NotFoundException('Team season not found');
    }
    const where: Prisma.SportingAssignmentWhereInput = {
      clubId: team.clubId,
      teamId,
      ...(teamSeasonId ? { teamSeasonId } : {}),
      validFrom: { lte: asOf },
      OR: [{ validTo: null }, { validTo: { gt: asOf } }],
    };
    const assignments = await this.prisma.sportingAssignment.findMany({
      where: { AND: [where, assignmentBoundary(page?.after)] },
      ...(page ? { take: page.limit + 1 } : {}),
      orderBy: page
        ? [{ validFrom: 'desc' }, { id: 'desc' }]
        : [{ person: { displayName: 'asc' } }, { validFrom: 'desc' }],
      select: {
        id: true,
        assignmentType: true,
        validFrom: true,
        validTo: true,
        reason: true,
        source: true,
        person: {
          select: {
            id: true,
            displayName: true,
            birthDate: true,
            playerProfile: {
              select: {
                preferredFoot: true,
                primaryPosition: true,
                secondaryPositions: true,
              },
            },
            staffProfile: { select: { title: true } },
          },
        },
        roleDefinition: {
          select: { id: true, key: true, name: true, systemKey: true },
        },
        teamSeason: {
          select: { id: true, clubSeason: { select: { name: true } } },
        },
      },
    });
    if (!page) return { team, asOf, assignments };
    const [total, playerAssignments, staffAssignments] = await Promise.all([
      this.prisma.sportingAssignment.count({ where }),
      this.prisma.sportingAssignment.count({
        where: { AND: [where, { person: { playerProfile: { isNot: null } } }] },
      }),
      this.prisma.sportingAssignment.count({
        where: { AND: [where, { person: { staffProfile: { isNot: null } } }] },
      }),
    ]);
    return {
      team,
      asOf,
      assignments: assignments.slice(0, page.limit),
      page: {
        limit: page.limit,
        nextCursor: assignmentCursor(assignments, page.limit),
        total,
        playerAssignments,
        staffAssignments,
      },
    };
  }

  getTeamRosterPage(principal: AuthPrincipal, teamId: unknown, input: unknown) {
    const page = parseAssignmentPageQuery(input, true);
    return this.getTeamRoster(
      principal,
      teamId,
      page.asOf,
      page.teamSeasonId,
      page,
    );
  }

  async listPlayers(
    principal: AuthPrincipal,
    requestedClubId?: string,
    teamIdInput?: unknown,
  ) {
    const clubId = this.resolveClubScope(principal, requestedClubId);
    const requestedTeamId =
      teamIdInput === undefined
        ? undefined
        : sportingIdentifier(teamIdInput, 'teamId');
    if (principal.role === 'PLAYER') {
      const personId = await this.principalPersonId(principal);
      return this.prisma.person.findMany({
        where: { id: personId, clubId, playerProfile: { isNot: null } },
        orderBy: { displayName: 'asc' },
        select: this.playerListSelect(),
      });
    }

    let teamIds: string[] | undefined;
    if (principal.role !== 'SYSTEM_ADMIN' && principal.role !== 'CLUB_ADMIN')
      teamIds = await this.authorizedTeamIds(principal, 'PLAYER_VIEW');
    if (requestedTeamId) {
      const team = await this.requireTeam(requestedTeamId);
      if (clubId && team.clubId !== clubId) this.deny();
      await this.authorization.assertSportingCapability(
        principal,
        'PLAYER_VIEW',
        team.clubId,
        team.id,
      );
      teamIds = [requestedTeamId];
    }

    return this.prisma.person.findMany({
      where: {
        ...(clubId ? { clubId } : {}),
        playerProfile: { isNot: null },
        ...(teamIds
          ? {
              assignments: {
                some: {
                  teamId: { in: teamIds },
                  validFrom: { lte: new Date() },
                  OR: [{ validTo: null }, { validTo: { gt: new Date() } }],
                },
              },
            }
          : {}),
      },
      orderBy: { displayName: 'asc' },
      select: this.playerListSelect(),
    });
  }

  async listPlayerPage(principal: AuthPrincipal, input: unknown) {
    const query = parsePlayerPageQuery(input);
    const clubId = this.resolveClubScope(principal, query.clubId);
    const team = await this.prisma.team.findUnique({
      where: { id: query.teamId },
      select: { id: true, clubId: true },
    });
    if (!team) throw new NotFoundException('Team not found');
    if (clubId && clubId !== team.clubId) this.deny();
    await this.authorization.assertSportingCapability(
      principal,
      'PLAYER_VIEW',
      team.clubId,
      team.id,
    );
    const personId =
      principal.role === 'PLAYER'
        ? await this.principalPersonId(principal)
        : undefined;
    const now = new Date();
    const activeAssignment = {
      clubId: team.clubId,
      teamId: team.id,
      validFrom: { lte: now },
      OR: [{ validTo: null }, { validTo: { gt: now } }],
    } satisfies Prisma.SportingAssignmentWhereInput;
    const playerProfileWhere: Prisma.PlayerProfileNullableScalarRelationFilter =
      query.position === 'UNASSIGNED'
        ? { is: { primaryPosition: null } }
        : query.position
          ? { is: { primaryPosition: query.position } }
          : { isNot: null };
    const actorBoundary: Prisma.PersonWhereInput[] = personId
      ? [{ id: personId }]
      : [];
    const scopeWhere: Prisma.PersonWhereInput = {
      clubId: team.clubId,
      AND: actorBoundary,
      playerProfile: { isNot: null },
      assignments: { some: activeAssignment },
    };
    const sortedCursor =
      query.sort && query.after
        ? decodePlayerNameCursor(query.after, query.sort)
        : undefined;
    const paginationBoundary: Prisma.PersonWhereInput | undefined = query.sort
      ? sortedCursor
        ? {
            OR: [
              {
                displayName: {
                  [query.sort === 'NAME_ASC' ? 'gt' : 'lt']: sortedCursor.name,
                },
              },
              {
                displayName: sortedCursor.name,
                id: {
                  [query.sort === 'NAME_ASC' ? 'gt' : 'lt']: sortedCursor.id,
                },
              },
            ],
          }
        : undefined
      : query.after
        ? { id: { gt: query.after } }
        : undefined;
    const filteredWhere: Prisma.PersonWhereInput = {
      clubId: team.clubId,
      AND: [
        ...actorBoundary,
        ...(paginationBoundary ? [paginationBoundary] : []),
      ],
      playerProfile: playerProfileWhere,
      ...(query.q
        ? {
            displayName: {
              contains: query.q.replace(/[\\%_]/g, '\\$&'),
              mode: 'insensitive',
            },
          }
        : {}),
      assignments: { some: activeAssignment },
    };
    const countWhere: Prisma.PersonWhereInput = {
      ...filteredWhere,
      AND: actorBoundary,
    };
    const select = this.playerListSelect();
    const rows = await this.prisma.person.findMany({
      where: filteredWhere,
      // Keyset pagination avoids offsets and cursor-row lookups. The legacy
      // request keeps ID ordering; name sorting uses the deterministic
      // displayName + ID tuple. Every page rechecks actor and tenant scope.
      orderBy: query.sort
        ? [
            { displayName: query.sort === 'NAME_ASC' ? 'asc' : 'desc' },
            { id: query.sort === 'NAME_ASC' ? 'asc' : 'desc' },
          ]
        : { id: 'asc' },
      take: query.limit + 1,
      select: {
        ...select,
        assignments: {
          ...select.assignments,
          where: activeAssignment,
          take: 1,
          orderBy: [{ validFrom: 'desc' }, { id: 'asc' }],
        },
      },
    });
    const hasMore = rows.length > query.limit;
    const items = rows.slice(0, query.limit);
    const needsFilteredTotal = Boolean(query.q || query.position);
    const [filteredTotal, positionGroups] = await Promise.all([
      needsFilteredTotal
        ? this.prisma.person.count({ where: countWhere })
        : Promise.resolve(undefined),
      this.prisma.playerProfile.groupBy({
        by: ['primaryPosition'],
        where: { person: scopeWhere },
        _count: { _all: true },
      }),
    ]);
    const positions = Object.fromEntries(
      playerPositionFilters.map((position) => [position, 0]),
    ) as Record<(typeof playerPositionFilters)[number], number>;
    for (const group of positionGroups) {
      positions[group.primaryPosition ?? 'UNASSIGNED'] = group._count._all;
    }
    const teamTotal = Object.values(positions).reduce(
      (sum, count) => sum + count,
      0,
    );
    const total = filteredTotal ?? teamTotal;
    return {
      items,
      nextCursor: hasMore
        ? query.sort
          ? encodePlayerNameCursor(items[items.length - 1], query.sort)
          : items[items.length - 1].id
        : null,
      limit: query.limit,
      total,
      summary: { total: teamTotal, positions },
    };
  }

  async getPlayer360(
    principal: AuthPrincipal,
    personIdInput: unknown,
    asOfInput?: unknown,
    page?: AssignmentPageQuery,
  ) {
    const personId = sportingIdentifier(personIdInput, 'personId');
    const asOf = optionalAsOf(asOfInput);
    const person = await this.prisma.person.findUnique({
      where: { id: personId },
      select: { id: true, clubId: true },
    });
    if (!person) throw new NotFoundException('Player not found');
    await this.authorization.assertPersonCapability(
      principal,
      person.id,
      'PLAYER_VIEW',
      asOf,
    );
    const canViewHistory = await this.authorization.canViewPersonCapability(
      principal,
      person.id,
      'PLAYER_HISTORY_VIEW',
      asOf,
    );
    const canViewAvailability =
      await this.authorization.canViewPersonCapability(
        principal,
        person.id,
        'AVAILABILITY_VIEW',
        asOf,
      );
    const result = await this.prisma.person.findUnique({
      where: { id: personId },
      select: {
        id: true,
        clubId: true,
        displayName: true,
        birthDate: true,
        playerProfile: {
          select: {
            preferredFoot: true,
            primaryPosition: true,
            secondaryPositions: true,
          },
        },
        account: { select: { id: true, status: true } },
        assignments: {
          where: {
            AND: [
              canViewHistory
                ? { validFrom: { lte: asOf } }
                : {
                    validFrom: { lte: asOf },
                    OR: [{ validTo: null }, { validTo: { gt: asOf } }],
                  },
              assignmentBoundary(page?.after),
            ],
          },
          ...(page ? { take: page.limit + 1 } : {}),
          orderBy: page
            ? [{ validFrom: 'desc' }, { id: 'desc' }]
            : [{ validFrom: 'desc' }, { createdAt: 'desc' }],
          include: assignmentInclude,
        },
        availabilityPeriods: canViewAvailability
          ? {
              where: {
                validFrom: { lte: asOf },
                OR: [{ validTo: null }, { validTo: { gt: asOf } }],
              },
              orderBy: { validFrom: 'desc' },
              take: 1,
              select: {
                id: true,
                status: true,
                validFrom: true,
                validTo: true,
                restrictionSummary: true,
                source: true,
              },
            }
          : false,
      },
    });
    if (!result?.playerProfile) throw new NotFoundException('Player not found');

    const accountId = result.account?.id;
    const attendanceSummary = accountId
      ? await this.prisma.attendance.groupBy({
          by: ['status'],
          where: { playerId: accountId },
          _count: { _all: true },
        })
      : [];
    const countWhere = {
      personId,
      clubId: person.clubId,
      validFrom: { lte: asOf },
    };
    const activeWhere = {
      ...countWhere,
      OR: [{ validTo: null }, { validTo: { gt: asOf } }],
    };
    const counts = page
      ? await Promise.all([
          this.prisma.sportingAssignment.count({
            where: canViewHistory ? countWhere : activeWhere,
          }),
          this.prisma.sportingAssignment.count({ where: activeWhere }),
        ])
      : undefined;
    return {
      ...result,
      ...(page && counts
        ? {
            assignments: result.assignments.slice(0, page.limit),
            assignmentPage: {
              limit: page.limit,
              nextCursor: assignmentCursor(result.assignments, page.limit),
              total: counts[0],
              activeCount: counts[1],
              historyVisible: canViewHistory,
            },
          }
        : {}),
      asOf,
      evidence: {
        attendance: Object.fromEntries(
          attendanceSummary.map((row) => [row.status, row._count._all]),
        ),
        matchParticipation: null,
      },
    };
  }

  getPlayer360Page(
    principal: AuthPrincipal,
    personId: unknown,
    input: unknown,
  ) {
    const page = parseAssignmentPageQuery(input);
    return this.getPlayer360(principal, personId, page.asOf, page);
  }

  async createAssignment(principal: AuthPrincipal, input: unknown) {
    const data = parseCreateAssignmentBody(input);
    if (data.assignmentType === 'LEGACY_MEMBER')
      throw new BadRequestException(
        'Legacy memberships are managed through groups',
      );
    const references = await this.assignmentReferences(data);
    await this.authorization.assertSportingCapability(
      principal,
      'ASSIGNMENT_MANAGE',
      references.person.clubId,
      data.teamId,
      data.validFrom,
    );
    this.validateAssignmentReferences(data, references);
    return this.prisma.$transaction(
      async (transaction) => {
        if (
          data.assignmentType === 'PRIMARY_REGISTERED' &&
          (await transaction.sportingAssignment.findFirst({
            where: {
              clubId: references.person.clubId,
              personId: data.personId,
              assignmentType: 'PRIMARY_REGISTERED',
              ...(data.validTo ? { validFrom: { lt: data.validTo } } : {}),
              OR: [{ validTo: null }, { validTo: { gt: data.validFrom } }],
            },
            select: { id: true },
          }))
        )
          throw new ConflictException(
            'Primary assignment overlaps an existing primary team period',
          );
        const assignment = await transaction.sportingAssignment.create({
          data: {
            clubId: references.person.clubId,
            personId: data.personId,
            teamId: data.teamId,
            teamSeasonId: data.teamSeasonId,
            roleDefinitionId: data.roleDefinitionId,
            assignmentType: data.assignmentType,
            validFrom: data.validFrom,
            validTo: data.validTo,
            reason: data.reason,
            source: 'NGCS_API_V1',
            createdById: principal.id,
          },
          include: assignmentInclude,
        });
        await this.writeAssignmentAudit(
          transaction,
          'SPORTING_ASSIGNMENT_CREATED',
          principal,
          assignment,
        );
        return assignment;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async endAssignment(
    principal: AuthPrincipal,
    assignmentIdInput: unknown,
    input: unknown,
  ) {
    const assignmentId = sportingIdentifier(assignmentIdInput, 'assignmentId');
    const body = parseEndAssignmentBody(input);
    const current = await this.prisma.sportingAssignment.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        clubId: true,
        teamId: true,
        validFrom: true,
        validTo: true,
        assignmentType: true,
      },
    });
    if (!current) throw new NotFoundException('Assignment not found');
    await this.authorization.assertSportingCapability(
      principal,
      'ASSIGNMENT_MANAGE',
      current.clubId,
      current.teamId ?? undefined,
      body.validTo,
    );
    if (current.assignmentType === 'LEGACY_MEMBER')
      throw new BadRequestException(
        'Legacy memberships are managed through groups',
      );
    if (current.validTo)
      throw new ConflictException('Assignment is already ended');
    if (body.validTo <= current.validFrom)
      throw new BadRequestException('validTo must be after validFrom');
    return this.prisma.$transaction(async (transaction) => {
      const assignment = await transaction.sportingAssignment.update({
        where: { id: current.id },
        data: { validTo: body.validTo, reason: body.reason },
        include: assignmentInclude,
      });
      await this.writeAssignmentAudit(
        transaction,
        'SPORTING_ASSIGNMENT_ENDED',
        principal,
        assignment,
      );
      return assignment;
    });
  }

  async transitionPrimary(principal: AuthPrincipal, input: unknown) {
    const body = parseTransitionPrimaryBody(input);
    const createData = {
      personId: body.personId,
      teamId: body.teamId,
      teamSeasonId: body.teamSeasonId,
      roleDefinitionId: body.roleDefinitionId,
      assignmentType: 'PRIMARY_REGISTERED' as SportingAssignmentType,
      validFrom: body.validAt,
      reason: body.reason,
    };
    const references = await this.assignmentReferences(createData);
    await this.authorization.assertSportingCapability(
      principal,
      'ASSIGNMENT_MANAGE',
      references.person.clubId,
      body.teamId,
      body.validAt,
    );
    this.validateAssignmentReferences(createData, references);
    return this.prisma.$transaction(
      async (transaction) => {
        const current = await transaction.sportingAssignment.findFirst({
          where: {
            clubId: references.person.clubId,
            personId: body.personId,
            assignmentType: 'PRIMARY_REGISTERED',
            validTo: null,
          },
          orderBy: { validFrom: 'desc' },
        });
        if (current && body.validAt <= current.validFrom)
          throw new BadRequestException(
            'validAt must be after the current primary assignment start',
          );
        const conflicting = await transaction.sportingAssignment.findFirst({
          where: {
            clubId: references.person.clubId,
            personId: body.personId,
            assignmentType: 'PRIMARY_REGISTERED',
            ...(current ? { id: { not: current.id } } : {}),
            OR: [{ validTo: null }, { validTo: { gt: body.validAt } }],
          },
          select: { id: true },
        });
        if (conflicting)
          throw new ConflictException(
            'Primary transition overlaps an existing primary team period',
          );
        if (current) {
          const ended = await transaction.sportingAssignment.update({
            where: { id: current.id },
            data: { validTo: body.validAt },
            include: assignmentInclude,
          });
          await this.writeAssignmentAudit(
            transaction,
            'SPORTING_ASSIGNMENT_ENDED',
            principal,
            ended,
          );
        }
        const created = await transaction.sportingAssignment.create({
          data: {
            clubId: references.person.clubId,
            personId: body.personId,
            teamId: body.teamId,
            teamSeasonId: body.teamSeasonId,
            roleDefinitionId: body.roleDefinitionId,
            assignmentType: 'PRIMARY_REGISTERED',
            validFrom: body.validAt,
            reason: body.reason,
            source: 'NGCS_TRANSITION_V1',
            createdById: principal.id,
          },
          include: assignmentInclude,
        });
        await this.writeAssignmentAudit(
          transaction,
          'SPORTING_ASSIGNMENT_CREATED',
          principal,
          created,
        );
        return { endedAssignmentId: current?.id ?? null, assignment: created };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  private async assignmentReferences(data: {
    personId: string;
    teamId?: string;
    teamSeasonId?: string;
    roleDefinitionId: string;
  }) {
    const [person, team, teamSeason, role] = await Promise.all([
      this.prisma.person.findUnique({
        where: { id: data.personId },
        select: { id: true, clubId: true },
      }),
      data.teamId
        ? this.prisma.team.findUnique({
            where: { id: data.teamId },
            select: { id: true, clubId: true, archivedAt: true },
          })
        : null,
      data.teamSeasonId
        ? this.prisma.teamSeason.findUnique({
            where: { id: data.teamSeasonId },
            select: {
              id: true,
              clubId: true,
              teamId: true,
              team: { select: { archivedAt: true } },
            },
          })
        : null,
      this.prisma.functionalRole.findUnique({
        where: { id: data.roleDefinitionId },
        select: { id: true, clubId: true, systemKey: true },
      }),
    ]);
    if (!person) throw new NotFoundException('Person not found');
    if (data.teamId && (!team || team.archivedAt))
      throw new NotFoundException('Team not found');
    if (data.teamSeasonId && (!teamSeason || teamSeason.team.archivedAt))
      throw new NotFoundException('Team season not found');
    if (!role) throw new NotFoundException('Functional role not found');
    return { person, team, teamSeason, role };
  }

  private validateAssignmentReferences(
    data: {
      teamId?: string;
      teamSeasonId?: string;
      assignmentType: SportingAssignmentType;
    },
    references: Awaited<ReturnType<SportingService['assignmentReferences']>>,
  ) {
    const clubId = references.person.clubId;
    if (
      references.team?.clubId !== undefined &&
      references.team.clubId !== clubId
    )
      this.deny();
    if (references.role.clubId !== clubId) this.deny();
    if (references.teamSeason) {
      if (
        references.teamSeason.clubId !== clubId ||
        references.teamSeason.teamId !== data.teamId
      )
        this.deny();
    }
    if (
      !data.teamId &&
      data.assignmentType !== 'STAFF' &&
      data.assignmentType !== 'LOAN_OUT' &&
      data.assignmentType !== 'INTERNATIONAL_DUTY'
    )
      throw new BadRequestException('teamId is required for this assignment');
    if (
      references.role.systemKey === 'PLAYER' &&
      data.assignmentType === 'STAFF'
    )
      throw new BadRequestException('Player role cannot be used for staff');
    if (
      references.role.systemKey !== 'PLAYER' &&
      data.assignmentType === 'PRIMARY_REGISTERED'
    )
      throw new BadRequestException(
        'Primary registration requires player role',
      );
  }

  private async writeAssignmentAudit(
    transaction: Prisma.TransactionClient,
    action: 'SPORTING_ASSIGNMENT_CREATED' | 'SPORTING_ASSIGNMENT_ENDED',
    principal: AuthPrincipal,
    assignment: {
      id: string;
      clubId: string;
      personId: string;
      teamId: string | null;
      teamSeasonId: string | null;
      assignmentType: SportingAssignmentType;
    },
  ) {
    await transaction.securityAuditEvent.create({
      data: {
        action,
        actorId: principal.id,
        targetPersonId: assignment.personId,
        clubId: assignment.clubId,
        metadata: {
          assignmentId: assignment.id,
          teamId: assignment.teamId,
          teamSeasonId: assignment.teamSeasonId,
          assignmentType: assignment.assignmentType,
        },
      },
    });
  }

  private async requireTeam(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: teamSelect,
    });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  private playerListSelect() {
    return {
      id: true,
      clubId: true,
      displayName: true,
      birthDate: true,
      playerProfile: {
        select: {
          preferredFoot: true,
          primaryPosition: true,
          secondaryPositions: true,
        },
      },
      assignments: {
        where: {
          validFrom: { lte: new Date() },
          OR: [{ validTo: null }, { validTo: { gt: new Date() } }],
        },
        orderBy: { validFrom: 'desc' as const },
        select: {
          id: true,
          assignmentType: true,
          team: {
            select: { id: true, name: true, ageGroupLabel: true },
          },
          roleDefinition: { select: { name: true, systemKey: true } },
        },
      },
    } satisfies Prisma.PersonSelect;
  }

  private async authorizedTeamIds(
    principal: AuthPrincipal,
    capability: SportingCapability,
  ) {
    const personId = await this.principalPersonId(principal);
    const now = new Date();
    const assignments = await this.prisma.sportingAssignment.findMany({
      where: {
        clubId: principal.clubId ?? '__unassigned__',
        personId,
        validFrom: { lte: now },
        OR: [{ validTo: null }, { validTo: { gt: now } }],
        roleDefinition: { capabilities: { some: { capability } } },
      },
      select: { teamId: true },
    });
    if (assignments.some(({ teamId }) => teamId === null)) {
      const teams = await this.prisma.team.findMany({
        where: { clubId: principal.clubId ?? '__unassigned__' },
        select: { id: true },
      });
      return teams.map(({ id }) => id);
    }
    return [
      ...new Set(
        assignments
          .map(({ teamId }) => teamId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
  }

  private async principalPersonId(principal: AuthPrincipal) {
    const user = await this.prisma.user.findUnique({
      where: { id: principal.id },
      select: { personId: true },
    });
    if (!user?.personId) this.deny();
    return user.personId;
  }

  private resolveClubScope(principal: AuthPrincipal, requestedClubId?: string) {
    if (principal.role === 'SYSTEM_ADMIN') return requestedClubId;
    if (!principal.clubId) this.deny();
    if (requestedClubId && requestedClubId !== principal.clubId) this.deny();
    return principal.clubId;
  }

  private deny(): never {
    throw new ForbiddenException('Resource is outside the authorized scope');
  }
}
