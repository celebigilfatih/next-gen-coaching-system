import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthPrincipal } from '../auth/auth-principal';
import { PrismaService } from '../prisma/prisma.service';
import { AuthorizationService } from '../auth/authorization.service';
import {
  catalogPage,
  catalogSearch,
  parseCatalogQuery,
} from './dto/catalog.dto';

const clubSelect = { id: true, name: true } as const;
const seasonSelect = {
  id: true,
  name: true,
  startDate: true,
  endDate: true,
} as const;
const teamSelect = (seasonId?: string) =>
  ({
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
      ...(seasonId && seasonId !== '*'
        ? { where: { clubSeasonId: seasonId } }
        : {}),
      take: 1,
      orderBy: [
        { clubSeason: { startDate: 'desc' as const } },
        { id: 'asc' as const },
      ],
      select: { id: true, clubSeason: { select: seasonSelect } },
    },
  }) satisfies Prisma.TeamSelect;

@Injectable()
export class WorkspaceCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
  ) {}

  async legacyMetadata(principal: AuthPrincipal, input: unknown) {
    const { group, season } = await this.legacyContext(principal, input, false);
    return { group, season };
  }

  async legacyContext(
    principal: AuthPrincipal,
    input: unknown,
    includeMatches = true,
  ) {
    const query = parseCatalogQuery(input, true);
    if (!query.teamId) throw new BadRequestException('teamId is required');
    const team = await this.prisma.team.findUnique({
      where: { id: query.teamId },
      select: { id: true, clubId: true, legacyGroupId: true, archivedAt: true },
    });
    if (!team) throw new BadRequestException('Team not found');
    if (team.archivedAt) throw new BadRequestException('Team is archived');
    if (query.clubId && query.clubId !== team.clubId)
      throw new ForbiddenException('Resource is outside the authorized scope');
    await this.authorization.assertSportingCapability(
      principal,
      'TEAM_VIEW',
      team.clubId,
      team.id,
    );
    const empty = { group: null, season: null, matches: [] };
    if (!team.legacyGroupId) return empty;
    // Sporting visibility is not a grant to legacy resources. Apply the old
    // group-list membership policy independently without loading all groups.
    const group = await this.prisma.playerGroup.findFirst({
      where: {
        id: team.legacyGroupId,
        clubId: team.clubId,
        archivedAt: null,
        ...(principal.role === 'SYSTEM_ADMIN' || principal.role === 'CLUB_ADMIN'
          ? {}
          : { members: { some: { userId: principal.id } } }),
      },
      select: {
        id: true,
        clubId: true,
        name: true,
        ageGroup: true,
        category: true,
      },
    });
    if (!group) return empty;
    if (!query.clubSeasonId) return { ...empty, group };
    const where: Prisma.SeasonWhereInput = {
      groupId: group.id,
      clubId: group.clubId,
      ...(query.clubSeasonId === '*'
        ? {}
        : {
            teamSeason: {
              teamId: team.id,
              clubId: team.clubId,
              clubSeasonId: query.clubSeasonId,
            },
          }),
    };
    const season =
      query.clubSeasonId === '*'
        ? null
        : await this.prisma.season.findFirst({
            where,
            orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
            select: {
              id: true,
              clubId: true,
              groupId: true,
              teamSeasonId: true,
              name: true,
              startDate: true,
              endDate: true,
            },
          });
    // Business match rows remain complete. Replace per-season fan-out with one
    // relational query; do not silently truncate all-seasons results.
    const matches =
      !includeMatches || (query.clubSeasonId !== '*' && !season)
        ? []
        : await this.prisma.match.findMany({
            where: {
              season: where,
              ...(season ? { seasonId: season.id } : {}),
            },
            orderBy: [{ date: 'asc' }, { id: 'asc' }],
          });
    return { group, season, matches };
  }

  async assignmentRoles(principal: AuthPrincipal, input: unknown) {
    const query = parseCatalogQuery(input);
    if (!query.clubId || query.clubSeasonId)
      throw new BadRequestException(
        'clubId is required; clubSeasonId is not supported',
      );
    this.authorization.assertClubView(principal, query.clubId);
    return catalogPage(
      await this.prisma.functionalRole.findMany({
        where: {
          clubId: query.clubId,
          systemKey: 'PLAYER',
          ...catalogSearch(query.q),
          ...(query.after ? { id: { gt: query.after } } : {}),
        },
        take: query.limit + 1,
        orderBy: { id: 'asc' },
        select: { id: true, name: true, key: true, systemKey: true },
      }),
      query.limit,
    );
  }

  private async teamScope(
    principal: AuthPrincipal,
  ): Promise<Prisma.TeamWhereInput> {
    if (principal.role === 'SYSTEM_ADMIN') return {};
    if (!principal.clubId) return { id: { in: [] } };
    if (principal.role === 'CLUB_ADMIN') return { clubId: principal.clubId };
    const actor = await this.prisma.user.findUnique({
      where: { id: principal.id },
      select: { personId: true },
    });
    if (!actor?.personId) return { id: { in: [] } };
    const now = new Date();
    const grant = {
      clubId: principal.clubId,
      personId: actor.personId,
      validFrom: { lte: now },
      OR: [{ validTo: null }, { validTo: { gt: now } }],
      roleDefinition: {
        capabilities: { some: { capability: 'TEAM_VIEW' as const } },
      },
    };
    // Relational EXISTS; never materialise an unbounded list of actor/team IDs.
    return {
      clubId: principal.clubId,
      OR: [
        { assignments: { some: grant } },
        { club: { sportingAssignments: { some: { ...grant, teamId: null } } } },
      ],
    };
  }

  private clubScope(
    principal: AuthPrincipal,
    teams: Prisma.TeamWhereInput,
  ): Prisma.ClubWhereInput {
    return principal.role === 'SYSTEM_ADMIN'
      ? { teams: { some: teams } }
      : { id: principal.clubId ?? '__unassigned__' };
  }

  private seasonScope(
    clubId: string,
    teams: Prisma.TeamWhereInput,
  ): Prisma.ClubSeasonWhereInput {
    return { clubId, teamSeasons: { some: { clubId, team: teams } } };
  }

  private teamFilter(
    clubId: string,
    seasonId: string | undefined,
    teams: Prisma.TeamWhereInput,
    lifecycle: 'ACTIVE' | 'ARCHIVED' = 'ACTIVE',
    categoryKey?: 'A_TAKIM' | 'ALT_YAPI',
  ): Prisma.TeamWhereInput {
    return {
      AND: [
        teams,
        { clubId },
        { archivedAt: lifecycle === 'ARCHIVED' ? { not: null } : null },
        ...(categoryKey ? [{ categoryKey }] : []),
        ...(seasonId && seasonId !== '*'
          ? [
              {
                teamSeasons: {
                  some: {
                    clubId,
                    clubSeasonId: seasonId,
                    clubSeason: { clubId },
                  },
                },
              },
            ]
          : []),
      ],
    };
  }

  async catalog(
    principal: AuthPrincipal,
    kind: 'clubs' | 'seasons' | 'teams',
    input: unknown,
  ) {
    const query = parseCatalogQuery(input);
    if (kind !== 'clubs' && !query.clubId)
      throw new BadRequestException('clubId is required');
    if (
      query.clubId &&
      principal.role !== 'SYSTEM_ADMIN' &&
      query.clubId !== principal.clubId
    )
      throw new ForbiddenException('Resource is outside the authorized scope');
    if (
      kind === 'teams' &&
      query.status === 'ARCHIVED' &&
      principal.role !== 'SYSTEM_ADMIN' &&
      principal.role !== 'CLUB_ADMIN'
    )
      throw new ForbiddenException('Insufficient role');
    const teams = await this.teamScope(principal);
    const boundary = query.after ? { id: { gt: query.after } } : {};
    const search = catalogSearch(query.q);
    const paging = { take: query.limit + 1, orderBy: { id: 'asc' as const } };
    if (kind === 'clubs')
      return catalogPage(
        await this.prisma.club.findMany({
          ...paging,
          where: { AND: [this.clubScope(principal, teams), boundary, search] },
          select: clubSelect,
        }),
        query.limit,
      );
    if (kind === 'seasons')
      return catalogPage(
        await this.prisma.clubSeason.findMany({
          ...paging,
          where: {
            AND: [this.seasonScope(query.clubId!, teams), boundary, search],
          },
          select: seasonSelect,
        }),
        query.limit,
      );
    return catalogPage(
      await this.prisma.team.findMany({
        ...paging,
        where: {
          AND: [
            this.teamFilter(
              query.clubId!,
              query.clubSeasonId,
              teams,
              query.status,
              query.categoryKey,
            ),
            boundary,
            search,
          ],
        },
        select: teamSelect(query.clubSeasonId),
      }),
      query.limit,
    );
  }

  async selection(principal: AuthPrincipal, input: unknown) {
    const desired = parseCatalogQuery(input, true);
    const teamsWhere = await this.teamScope(principal);
    const clubsWhere = this.clubScope(principal, teamsWhere);
    const club =
      (desired.clubId
        ? await this.prisma.club.findFirst({
            where: { AND: [clubsWhere, { id: desired.clubId }] },
            select: clubSelect,
          })
        : null) ??
      (await this.prisma.club.findFirst({
        where: clubsWhere,
        orderBy: { id: 'asc' },
        select: clubSelect,
      }));
    const clubs = catalogPage(
      await this.prisma.club.findMany({
        where: clubsWhere,
        orderBy: { id: 'asc' },
        take: 26,
        select: clubSelect,
      }),
      25,
    );
    if (!club)
      return {
        club: null,
        clubSeason: null,
        team: null,
        teamSeason: null,
        scope: { clubId: '', clubSeasonId: '', teamId: '' },
        clubs,
        seasons: catalogPage([], 25),
        teams: catalogPage([], 25),
      };
    const seasonsWhere = this.seasonScope(club.id, teamsWhere);
    const clubSeason =
      desired.clubSeasonId === '*'
        ? null
        : ((desired.clubSeasonId
            ? await this.prisma.clubSeason.findFirst({
                where: { AND: [seasonsWhere, { id: desired.clubSeasonId }] },
                select: seasonSelect,
              })
            : null) ??
          (await this.prisma.clubSeason.findFirst({
            where: seasonsWhere,
            orderBy: [{ startDate: 'desc' }, { id: 'asc' }],
            select: seasonSelect,
          })));
    const where = this.teamFilter(club.id, clubSeason?.id, teamsWhere);
    const team =
      (desired.teamId
        ? await this.prisma.team.findFirst({
            where: { AND: [where, { id: desired.teamId }] },
            select: teamSelect(clubSeason?.id),
          })
        : null) ??
      (await this.prisma.team.findFirst({
        where,
        orderBy: { id: 'asc' },
        select: teamSelect(clubSeason?.id),
      }));
    const seasons = catalogPage(
      await this.prisma.clubSeason.findMany({
        where: seasonsWhere,
        orderBy: { id: 'asc' },
        take: 26,
        select: seasonSelect,
      }),
      25,
    );
    const teams = catalogPage(
      await this.prisma.team.findMany({
        where,
        orderBy: { id: 'asc' },
        take: 26,
        select: teamSelect(clubSeason?.id),
      }),
      25,
    );
    return {
      club,
      clubSeason,
      team,
      teamSeason: clubSeason ? (team?.teamSeasons[0] ?? null) : null,
      scope: {
        clubId: club.id,
        clubSeasonId:
          desired.clubSeasonId === '*' ? '*' : (clubSeason?.id ?? ''),
        teamId: team?.id ?? '',
      },
      clubs,
      seasons,
      teams,
    };
  }
}
