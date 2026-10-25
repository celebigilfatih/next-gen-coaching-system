import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthorizationService } from '../auth/authorization.service';
import type { AuthPrincipal } from '../auth/auth-principal';
import { parseMarkAttendanceBody } from './dto/mark-attendance.dto';
import { parseAttendancePageQuery } from './dto/attendance-page.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendance: AttendanceService,
    private readonly authorization: AuthorizationService,
  ) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('COACH', 'CLUB_ADMIN', 'SYSTEM_ADMIN')
  @Post()
  async mark(@Req() req: { user: AuthPrincipal }, @Body() input: unknown) {
    const body = parseMarkAttendanceBody(input);
    const plan = await this.authorization.assertPlanManage(
      req.user,
      body.planId,
    );
    await this.authorization.assertAttendancePlayer(
      req.user,
      plan,
      body.playerId,
    );
    return this.attendance.mark(body.planId, body.playerId, body.status);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('page')
  async page(@Req() req: { user: AuthPrincipal }, @Query() input: unknown) {
    const query = parseAttendancePageQuery(input);
    const plan = await this.authorization.assertPlanView(
      req.user,
      query.planId,
    );
    return this.attendance.playerPage(
      query,
      plan.groupId,
      req.user.role === 'PLAYER' ? req.user.id : undefined,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async list(
    @Req() req: { user: AuthPrincipal },
    @Query('planId') planId: string,
  ) {
    await this.authorization.assertPlanView(req.user, planId);
    return this.attendance.listByPlan(
      planId,
      req.user.role === 'PLAYER' ? req.user.id : undefined,
    );
  }
}
