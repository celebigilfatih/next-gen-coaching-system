import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly authorization: AuthorizationService,
  ) {}

  @Get()
  @Roles('SYSTEM_ADMIN')
  async list() {
    return this.users.listAll();
  }

  @Get('players')
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async listPlayers(
    @Req() req: { user: AuthPrincipal },
    @Query('clubId') clubId?: string,
  ) {
    return this.users.listPlayersForPrincipal(req.user, clubId);
  }

  @Get('by-email')
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  async byEmail(
    @Req() req: { user: AuthPrincipal },
    @Query('email') email: string,
  ) {
    const user = await this.users.findByEmailForPrincipal(req.user, email);
    if (!user) throw new NotFoundException('User not found');
    await this.authorization.assertUserView(req.user, user.id);
    return user;
  }

  @Get(':id')
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH', 'PLAYER')
  async findById(@Req() req: { user: AuthPrincipal }, @Param('id') id: string) {
    await this.authorization.assertUserView(req.user, id);
    return this.users.findById(id);
  }

  @Get(':playerId/health-logs')
  @Roles('SYSTEM_ADMIN')
  async getHealthLogs(@Param('playerId') playerId: string) {
    return this.users.getPlayerHealthLogs(playerId);
  }

  @Post(':playerId/health-logs')
  @Roles('SYSTEM_ADMIN')
  async addHealthLog(
    @Param('playerId') playerId: string,
    @Body()
    data: {
      status: 'SAGLIK' | 'HAREKET_SINIRLAMASI' | 'IZOLASYON' | 'YARALI';
      severity?: 'HAFIF' | 'ORTA' | 'CIDDI';
      bodyPart?: string;
      expectedReturnDate?: Date;
      notes?: string;
    },
  ) {
    return this.users.addPlayerHealthLog(playerId, data);
  }

  @Delete(':playerId/health-logs/:logId')
  @Roles('SYSTEM_ADMIN')
  async deleteHealthLog(@Param('logId') logId: string) {
    return this.users.deletePlayerHealthLog(logId);
  }

  @Get(':playerId/coach-notes')
  @Roles('SYSTEM_ADMIN')
  async getCoachNotes(@Param('playerId') playerId: string) {
    return this.users.getPlayerCoachNotes(playerId);
  }

  @Post(':playerId/coach-notes')
  @Roles('SYSTEM_ADMIN')
  async addCoachNote(
    @Param('playerId') playerId: string,
    @Body() data: { note: string },
  ) {
    return this.users.addPlayerCoachNote(playerId, data);
  }

  @Delete(':playerId/coach-notes/:noteId')
  @Roles('SYSTEM_ADMIN')
  async deleteCoachNote(@Param('noteId') noteId: string) {
    return this.users.deletePlayerCoachNote(noteId);
  }

  @Get(':playerId/health-status')
  @Roles('SYSTEM_ADMIN')
  async getHealthStatus(@Param('playerId') playerId: string) {
    return this.users.getPlayerHealthStatus(playerId);
  }

  @Post(':playerId/health-status')
  @Roles('SYSTEM_ADMIN')
  async addHealthStatus(
    @Param('playerId') playerId: string,
    @Body() data: any,
  ) {
    return this.users.addPlayerHealthStatus(playerId, data);
  }

  @Delete(':playerId/health-status/:statusId')
  @Roles('SYSTEM_ADMIN')
  async deleteHealthStatus(@Param('statusId') statusId: string) {
    return this.users.deletePlayerHealthStatus(statusId);
  }

  @Post(':playerId/health-status/:statusId')
  @Roles('SYSTEM_ADMIN')
  async updateHealthStatus(
    @Param('statusId') statusId: string,
    @Body() data: any,
  ) {
    return this.users.updatePlayerHealthStatus(statusId, data);
  }
}
