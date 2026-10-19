import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LegacyTacticalReadInterceptor } from '../tactics/legacy-tactical-read.interceptor';
import { AuthGuard } from '@nestjs/passport';
import type { AuthPrincipal } from '../auth/auth-principal';
import { MatchCatalogService } from './match-catalog.service';

@Controller('matches/catalog')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LegacyTacticalReadInterceptor)
export class MatchCatalogController {
  constructor(private readonly catalog: MatchCatalogService) {}
  @Get('page')
  page(@Req() req: { user: AuthPrincipal }, @Query() query: unknown) {
    return this.catalog.page(req.user, query);
  }
  @Get('detail/:matchId')
  detail(
    @Req() req: { user: AuthPrincipal },
    @Param('matchId') matchId: string,
    @Query() query: unknown,
  ) {
    return this.catalog.detail(req.user, matchId, query);
  }

  @Get('metadata/:matchId')
  metadata(
    @Req() req: { user: AuthPrincipal },
    @Param('matchId') matchId: string,
    @Query() query: unknown,
  ) {
    return this.catalog.metadata(req.user, matchId, query);
  }
}
