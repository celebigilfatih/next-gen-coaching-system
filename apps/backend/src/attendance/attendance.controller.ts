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

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendance: AttendanceService,
    private readonly authorization: AuthorizationService,
  ) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('COACH', 'CLUB_ADMIN', 'SYSTEM_ADMIN')
  @Post()
  async mark(
    @Req() req: { user: AuthPrincipal },
    @Body()
    body: {
      planId: string;
      playerId: string;
      status: 'PRESENT' | 'ABSENT';
    },
  ) {
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
