import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthPrincipal } from '../auth/auth-principal';
import { SportingService } from './sporting.service';

@Controller('sporting')
@UseGuards(AuthGuard('jwt'))
export class SportingController {
  constructor(private readonly sporting: SportingService) {}

  @Get('workspace')
  workspace(@Req() req: { user: AuthPrincipal }) {
    return this.sporting.workspace(req.user);
  }

  @Get('legacy-parity')
  legacyParity(
    @Req() req: { user: AuthPrincipal },
    @Query('clubId') clubId: string,
  ) {
    return this.sporting.legacyParity(req.user, clubId);
  }

  @Get('teams')
  listTeams(
    @Req() req: { user: AuthPrincipal },
    @Query('clubId') clubId?: string,
  ) {
    return this.sporting.listTeams(req.user, clubId);
  }

  @Get('teams/:teamId/roster')
  getTeamRoster(
    @Req() req: { user: AuthPrincipal },
    @Param('teamId') teamId: string,
    @Query('asOf') asOf?: string,
    @Query('teamSeasonId') teamSeasonId?: string,
  ) {
    return this.sporting.getTeamRoster(req.user, teamId, asOf, teamSeasonId);
  }

  @Get('players')
  listPlayers(
    @Req() req: { user: AuthPrincipal },
    @Query('clubId') clubId?: string,
    @Query('teamId') teamId?: string,
  ) {
    return this.sporting.listPlayers(req.user, clubId, teamId);
  }

  @Get('teams/:teamId/roster/page')
  rosterPage(
    @Req() req: { user: AuthPrincipal },
    @Param('teamId') teamId: string,
    @Query() query: unknown,
  ) {
    return this.sporting.getTeamRosterPage(req.user, teamId, query);
  }

  @Get('players/:personId/assignments/page')
  playerPage(
    @Req() req: { user: AuthPrincipal },
    @Param('personId') personId: string,
    @Query() query: unknown,
  ) {
    return this.sporting.getPlayer360Page(req.user, personId, query);
  }

  @Get('players/page')
  listPlayerPage(@Req() req: { user: AuthPrincipal }, @Query() query: unknown) {
    return this.sporting.listPlayerPage(req.user, query);
  }

  @Get('players/:personId')
  getPlayer360(
    @Req() req: { user: AuthPrincipal },
    @Param('personId') personId: string,
    @Query('asOf') asOf?: string,
  ) {
    return this.sporting.getPlayer360(req.user, personId, asOf);
  }

  @Get('roles')
  listRoles(
    @Req() req: { user: AuthPrincipal },
    @Query('clubId') clubId?: string,
  ) {
    return this.sporting.listRoles(req.user, clubId);
  }

  @Post('assignments/transition-primary')
  transitionPrimary(
    @Req() req: { user: AuthPrincipal },
    @Body() input: unknown,
  ) {
    return this.sporting.transitionPrimary(req.user, input);
  }

  @Post('assignments')
  createAssignment(
    @Req() req: { user: AuthPrincipal },
    @Body() input: unknown,
  ) {
    return this.sporting.createAssignment(req.user, input);
  }

  @Post('assignments/:assignmentId/end')
  endAssignment(
    @Req() req: { user: AuthPrincipal },
    @Param('assignmentId') assignmentId: string,
    @Body() input: unknown,
  ) {
    return this.sporting.endAssignment(req.user, assignmentId, input);
  }
}
