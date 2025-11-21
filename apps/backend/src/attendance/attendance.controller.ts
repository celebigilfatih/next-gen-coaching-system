import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';

@Controller('attendance')
export class AttendanceController {
  constructor(private attendance: AttendanceService) {}

  @UseGuards(AuthGuard('jwt'))
  @Roles('COACH', 'ADMIN')
  @Post()
  async mark(
    @Body()
    body: {
      planId: string;
      playerId: string;
      status: 'PRESENT' | 'ABSENT';
    },
  ) {
    return this.attendance.mark(body.planId, body.playerId, body.status);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async list(@Query('planId') planId: string) {
    return this.attendance.listByPlan(planId);
  }
}
