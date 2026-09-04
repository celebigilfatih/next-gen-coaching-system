import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthPrincipal } from '../auth/auth-principal';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  async getDashboardStats(
    @Req() req: { user: AuthPrincipal },
    @Query('clubId') clubId?: string,
  ) {
    const authorizedClubId =
      req.user.role === 'SYSTEM_ADMIN' ? clubId : req.user.clubId;
    return this.statsService.getDashboardStats(authorizedClubId ?? undefined);
  }
}
