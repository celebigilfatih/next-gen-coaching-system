import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthPrincipal } from '../auth/auth-principal';
import { TrainingPlanCatalogService } from './training-plan-catalog.service';

@Controller('training-plans/catalog')
@UseGuards(AuthGuard('jwt'))
export class TrainingPlanCatalogController {
  constructor(private readonly catalog: TrainingPlanCatalogService) {}
  @Get('page')
  page(@Req() req: { user: AuthPrincipal }, @Query() query: unknown) {
    return this.catalog.page(req.user, query);
  }
  @Get('attendance/page')
  attendancePage(@Req() req: { user: AuthPrincipal }, @Query() query: unknown) {
    return this.catalog.attendancePage(req.user, query);
  }
}
