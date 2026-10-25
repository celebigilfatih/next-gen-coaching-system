import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthPrincipal } from '../auth/auth-principal';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SportingTeamLifecycleService } from './team-lifecycle.service';

@Controller('sporting/teams')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
export class TeamLifecycleController {
  constructor(private readonly teams: SportingTeamLifecycleService) {}

  @Post()
  create(@Req() req: { user: AuthPrincipal }, @Body() input: unknown) {
    return this.teams.create(req.user, input);
  }

  @Patch(':teamId')
  update(
    @Req() req: { user: AuthPrincipal },
    @Param('teamId') teamId: string,
    @Body() input: unknown,
  ) {
    return this.teams.update(req.user, teamId, input);
  }

  @Post(':teamId/archive')
  archive(
    @Req() req: { user: AuthPrincipal },
    @Param('teamId') teamId: string,
  ) {
    return this.teams.archive(req.user, teamId);
  }

  @Post(':teamId/restore')
  restore(
    @Req() req: { user: AuthPrincipal },
    @Param('teamId') teamId: string,
  ) {
    return this.teams.restore(req.user, teamId);
  }
}
