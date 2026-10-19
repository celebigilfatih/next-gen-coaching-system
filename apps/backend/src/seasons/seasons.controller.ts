import { UseInterceptors } from '@nestjs/common';
import { LegacyTacticalReadInterceptor } from '../tactics/legacy-tactical-read.interceptor';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SeasonsService } from './seasons.service';
import { validateTacticalBoardDocument } from '../tactics/tactical-board';
import { seasonBody } from './dto/season-input';
import {
  parseCreateSeasonBody,
  parseCreateWeekBody,
  parseUpdateWeekBody,
  parseCreateDayBody,
  parseCreateMatchBody,
  parseUpdateMatchBody,
} from './dto/season.dto';

@Controller('seasons')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LegacyTacticalReadInterceptor)
export class SeasonsController {
  constructor(
    private readonly seasons: SeasonsService,
    private readonly authorization: AuthorizationService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async createSeason(
    @Request() req: { user: AuthPrincipal },
    @Body() input: unknown,
  ) {
    const requested = seasonBody(input);
    const body = parseCreateSeasonBody({
      ...requested,
      clubId:
        req.user.role === 'SYSTEM_ADMIN' ? requested.clubId : req.user.clubId,
    });
    const { clubId } = body;
    if (req.user.role === 'CLUB_ADMIN') {
      this.authorization.assertClubManage(req.user, clubId);
    }

    const group =
      req.user.role === 'COACH'
        ? await this.authorization.assertCoachGroupAssignment(
            req.user,
            body.groupId,
          )
        : await this.authorization.assertGroupView(req.user, body.groupId);
    if (group.clubId !== clubId) {
      throw new BadRequestException('Group must belong to the season club');
    }

    return this.seasons.createSeason(req.user.id, {
      name: body.name,
      clubId,
      groupId: body.groupId,
      startDate: body.startDate,
      endDate: body.endDate,
    });
  }

  @Get()
  async listSeasons(@Request() req: { user: AuthPrincipal }) {
    return this.seasons.listForPrincipal(req.user);
  }

  @Post(':id/generate-weeks')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async generateWeeks(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
  ) {
    await this.authorization.assertSeasonManage(req.user, id);
    return this.seasons.generateWeeks(id);
  }

  @Post(':seasonId/weeks')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async createWeek(
    @Request() req: { user: AuthPrincipal },
    @Param('seasonId') seasonId: string,
    @Body() input: unknown,
  ) {
    await this.authorization.assertSeasonManage(req.user, seasonId);
    return this.seasons.createWeek(seasonId, parseCreateWeekBody(input));
  }

  @Get(':seasonId/weeks/:weekNumber')
  async getWeek(
    @Request() req: { user: AuthPrincipal },
    @Param('seasonId') seasonId: string,
    @Param('weekNumber') weekNumber: string,
  ) {
    await this.authorization.assertSeasonView(req.user, seasonId);
    return this.seasons.getWeek(seasonId, Number.parseInt(weekNumber, 10));
  }

  @Put('weeks/:weekId')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async updateWeek(
    @Request() req: { user: AuthPrincipal },
    @Param('weekId') weekId: string,
    @Body() input: unknown,
  ) {
    await this.authorization.assertWeekManage(req.user, weekId);
    return this.seasons.updateWeek(weekId, parseUpdateWeekBody(input));
  }

  @Post('weeks/:weekId/days')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async createOrUpdateDay(
    @Request() req: { user: AuthPrincipal },
    @Param('weekId') weekId: string,
    @Body() input: unknown,
  ) {
    const season = await this.authorization.assertWeekManage(req.user, weekId);
    const body = parseCreateDayBody(input);
    if (body.trainingPlanId) {
      const plan = await this.authorization.assertPlanManage(
        req.user,
        body.trainingPlanId,
      );
      if (plan.clubId !== season.clubId || plan.groupId !== season.groupId) {
        throw new BadRequestException(
          'Training plan must belong to the season group',
        );
      }
    }
    return this.seasons.createOrUpdateDay(weekId, body);
  }

  @Post('days/:dayId/toggle-completed')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async toggleDayCompleted(
    @Request() req: { user: AuthPrincipal },
    @Param('dayId') dayId: string,
  ) {
    await this.authorization.assertDayManage(req.user, dayId);
    return this.seasons.toggleDayCompleted(dayId);
  }

  @Delete('days/:dayId')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async deleteDay(
    @Request() req: { user: AuthPrincipal },
    @Param('dayId') dayId: string,
  ) {
    await this.authorization.assertDayManage(req.user, dayId);
    return this.seasons.deleteDay(dayId);
  }

  @Post(':seasonId/matches')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async createMatch(
    @Request() req: { user: AuthPrincipal },
    @Param('seasonId') seasonId: string,
    @Body() input: unknown,
  ) {
    const season = await this.authorization.assertSeasonManage(
      req.user,
      seasonId,
    );
    const body = parseCreateMatchBody(input);
    if (body.groupId && body.groupId !== season.groupId) {
      throw new BadRequestException('Match must use the season group');
    }
    return this.seasons.createMatch(seasonId, {
      ...body,
      groupId: season.groupId,
      date: body.date,
    });
  }

  @Get(':seasonId/matches')
  async listMatches(
    @Request() req: { user: AuthPrincipal },
    @Param('seasonId') seasonId: string,
  ) {
    await this.authorization.assertSeasonView(req.user, seasonId);
    return this.seasons.listMatches(seasonId);
  }

  @Put('matches/:matchId')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async updateMatch(
    @Request() req: { user: AuthPrincipal },
    @Param('matchId') matchId: string,
    @Body() input: unknown,
  ) {
    await this.authorization.assertMatchManage(req.user, matchId);
    return this.seasons.updateMatch(matchId, parseUpdateMatchBody(input));
  }

  @Put('matches/:matchId/tactical-board')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async updateMatchTacticalBoard(
    @Request() req: { user: AuthPrincipal },
    @Param('matchId') matchId: string,
    @Body() input: unknown,
  ) {
    await this.authorization.assertMatchManage(req.user, matchId);
    const tacticalBoard = validateTacticalBoardDocument(
      seasonBody(input).tacticalBoard,
    );
    return this.seasons.updateMatchTacticalBoard(matchId, tacticalBoard);
  }

  @Delete('matches/:matchId')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async deleteMatch(
    @Request() req: { user: AuthPrincipal },
    @Param('matchId') matchId: string,
  ) {
    await this.authorization.assertMatchManage(req.user, matchId);
    return this.seasons.deleteMatch(matchId);
  }

  @Get(':id')
  async getSeason(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
  ) {
    await this.authorization.assertSeasonView(req.user, id);
    return this.seasons.getSeason(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async deleteSeason(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
  ) {
    await this.authorization.assertSeasonManage(req.user, id);
    return this.seasons.deleteSeason(id);
  }
}
