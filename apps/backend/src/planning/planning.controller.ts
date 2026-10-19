import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthPrincipal } from '../auth/auth-principal';
import { PlanningService } from './planning.service';
import { PlanningCatalogService } from './planning-catalog.service';

@Controller('planning')
@UseGuards(AuthGuard('jwt'))
export class PlanningController {
  constructor(
    private readonly planning: PlanningService,
    private readonly catalog: PlanningCatalogService,
  ) {}
  @Get('events/page')
  @Header('Cache-Control', 'no-store')
  page(@Request() req: { user: AuthPrincipal }, @Query() query: unknown) {
    return this.catalog.page(req.user, query);
  }
  @Get('teams')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  @Header('Cache-Control', 'no-store')
  teams(
    @Request() req: { user: AuthPrincipal },
    @Query('clubSeasonId') id: string,
  ) {
    return this.planning.teams(req.user, id);
  }
  @Post('week/preview')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  @Header('Cache-Control', 'no-store')
  preview(@Request() req: { user: AuthPrincipal }, @Body() body: unknown) {
    return this.planning.preview(req.user, body);
  }
  @Post('week/apply')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  @Header('Cache-Control', 'no-store')
  apply(@Request() req: { user: AuthPrincipal }, @Body() body: unknown) {
    return this.planning.apply(req.user, body);
  }
  @Get('week/applications/:id')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  @Header('Cache-Control', 'no-store')
  status(@Request() req: { user: AuthPrincipal }, @Param('id') id: string) {
    return this.planning.status(req.user, id);
  }
  @Post('events')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  create(@Request() req: { user: AuthPrincipal }, @Body() body: unknown) {
    return this.planning.createEvent(req.user, body);
  }
  @Put('events/:id')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  update(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.planning.updateEvent(req.user, id, body);
  }
  @Delete('events/:id')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  remove(@Request() req: { user: AuthPrincipal }, @Param('id') id: string) {
    return this.planning.deleteEvent(req.user, id);
  }
}
