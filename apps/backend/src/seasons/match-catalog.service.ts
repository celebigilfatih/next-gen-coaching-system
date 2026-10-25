import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  matchBoundary,
  matchCursor,
  parseMatchPageQuery,
  parseMatchDetailQuery,
} from './dto/match-page.dto';

@Injectable()
export class MatchCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
  ) {}

  async metadata(principal: AuthPrincipal, matchId: string, input: unknown) {
    const match = await this.detail(principal, matchId, input, false);
    const present = await this.prisma.match.count({
      where: { id: match.id, tacticalBoard: { not: Prisma.AnyNull } },
    });
    return { ...match, hasBoard: present > 0 };
  }

  async detail(
    principal: AuthPrincipal,
    matchId: string,
    input: unknown,
    includeBoard = true,
  ) {
    const query = parseMatchDetailQuery(matchId, input);
    const group = await this.authorization.assertGroupView(
      principal,
      query.groupId,
    );
    const match = await this.prisma.match.findFirst({
      where: {
        id: query.id,
        season: { groupId: group.id, clubId: group.clubId },
        ...(query.seasonId ? { seasonId: query.seasonId } : {}),
      },
      select: {
        id: true,
        seasonId: true,
        groupId: true,
        date: true,
        opponent: true,
        location: true,
        competition: true,
        opponentAnalysis: true,
        ourFormation: true,
        notes: true,
        tacticalBoard: includeBoard,
      },
    });
    if (!match)
      throw new NotFoundException('Match not found in selected scope');
    return match;
  }

  async page(principal: AuthPrincipal, input: unknown) {
    const query = parseMatchPageQuery(input);
    const group = await this.authorization.assertGroupView(
      principal,
      query.groupId,
    );
    // Match access follows the owning season, as in legacy list/context reads.
    // Optional Match.groupId is not a replacement authority or visibility filter.
    const seasonScope = { groupId: group.id, clubId: group.clubId };
    if (
      query.seasonId &&
      !(await this.prisma.season.findFirst({
        where: { id: query.seasonId, ...seasonScope },
        select: { id: true },
      }))
    )
      throw new BadRequestException(
        'Season does not belong to the selected group',
      );
    const where: Prisma.MatchWhereInput = {
      season: seasonScope,
      ...(query.seasonId ? { seasonId: query.seasonId } : {}),
      ...(query.period
        ? { date: { gte: query.period.from, lt: query.period.until } }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.match.findMany({
        where: { AND: [where, matchBoundary(query.after)] },
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
        take: query.limit + 1,
        select: {
          id: true,
          seasonId: true,
          date: true,
          opponent: true,
          location: true,
          competition: true,
          result: true,
          ourFormation: true,
          notes: true,
        },
      }),
      this.prisma.match.count({ where }),
    ]);
    const page = rows.slice(0, query.limit);
    // Determine presence for returned IDs only, without transferring JSON blobs.
    const boards = page.length
      ? await this.prisma.match.findMany({
          where: {
            AND: [
              where,
              {
                id: { in: page.map((row) => row.id) },
                tacticalBoard: { not: Prisma.AnyNull },
              },
            ],
          },
          select: { id: true },
        })
      : [];
    const boardIds = new Set(boards.map((row) => row.id));
    return {
      items: page.map((row) => ({ ...row, hasBoard: boardIds.has(row.id) })),
      total,
      limit: query.limit,
      nextCursor:
        rows.length > query.limit ? matchCursor(page[page.length - 1]) : null,
    };
  }
}
