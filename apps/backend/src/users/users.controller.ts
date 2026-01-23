import { Controller, Get, Post, Delete, Query, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async list() {
    return this.users.listAll();
  }

  @Get('by-email')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async byEmail(@Query('email') email: string) {
    return this.users.findByEmail(email);
  }

  @Get('players')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'COACH')
  async listPlayers(@Query('clubId') clubId?: string) {
    return this.users.listPlayers(clubId);
  }

  // Health Logs
  @Get(':playerId/health-logs')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'COACH')
  async getHealthLogs(@Param('playerId') playerId: string) {
    return this.users.getPlayerHealthLogs(playerId);
  }

  @Post(':playerId/health-logs')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'COACH')
  async addHealthLog(
    @Param('playerId') playerId: string,
    @Body() data: {
      status: 'SAGLIK' | 'HAREKET_SINIRLAMASI' | 'IZOLASYON' | 'YARALI';
      severity?: 'HAFIF' | 'ORTA' | 'CIDDI';
      bodyPart?: string;
      expectedReturnDate?: Date;
      notes?: string;
    }
  ) {
    return this.users.addPlayerHealthLog(playerId, data);
  }

  @Delete(':playerId/health-logs/:logId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'COACH')
  async deleteHealthLog(
    @Param('playerId') playerId: string,
    @Param('logId') logId: string
  ) {
    return this.users.deletePlayerHealthLog(logId);
  }

  // Coach Notes
  @Get(':playerId/coach-notes')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'COACH')
  async getCoachNotes(@Param('playerId') playerId: string) {
    return this.users.getPlayerCoachNotes(playerId);
  }

  @Post(':playerId/coach-notes')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'COACH')
  async addCoachNote(
    @Param('playerId') playerId: string,
    @Body() data: { note: string }
  ) {
    return this.users.addPlayerCoachNote(playerId, data);
  }

  @Delete(':playerId/coach-notes/:noteId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'COACH')
  async deleteCoachNote(
    @Param('playerId') playerId: string,
    @Param('noteId') noteId: string
  ) {
    return this.users.deletePlayerCoachNote(noteId);
  }

  // Comprehensive Health Status
  @Get(':playerId/health-status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'COACH')
  async getHealthStatus(@Param('playerId') playerId: string) {
    return this.users.getPlayerHealthStatus(playerId);
  }

  @Post(':playerId/health-status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'COACH')
  async addHealthStatus(
    @Param('playerId') playerId: string,
    @Body() data: any
  ) {
    return this.users.addPlayerHealthStatus(playerId, data);
  }

  @Delete(':playerId/health-status/:statusId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'COACH')
  async deleteHealthStatus(
    @Param('playerId') playerId: string,
    @Param('statusId') statusId: string
  ) {
    return this.users.deletePlayerHealthStatus(statusId);
  }

  @Post(':playerId/health-status/:statusId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'COACH')
  async updateHealthStatus(
    @Param('playerId') playerId: string,
    @Param('statusId') statusId: string,
    @Body() data: any
  ) {
    return this.users.updatePlayerHealthStatus(statusId, data);
  }
}
