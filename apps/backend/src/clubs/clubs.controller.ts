import { Body, Controller, Get, Param, Post, Put, UseGuards, Request } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('clubs')
export class ClubsController {
  constructor(private clubs: ClubsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async create(
    @Body() body: { name: string; logo?: string; description?: string },
  ) {
    return this.clubs.createClub(body);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async list(@Request() req) {
    const user = req.user;
    
    // ADMIN: tüm kulüpleri görebilir
    if (user.role === 'ADMIN') {
      return this.clubs.listClubs();
    }
    
    // COACH/PLAYER: sadece kendi kulübünü görebilir
    if (user.clubId) {
      const userClub = await this.clubs.getClubById(user.clubId);
      return userClub ? [userClub] : [];
    }
    
    return [];
  }

  @Post(':id/assign')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async assign(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.clubs.addUserToClub(body.userId, id);
  }

  @Post(':id/groups')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async createGroup(
    @Param('id') id: string,
    @Body() body: { name: string; ageGroup: any },
  ) {
    return this.clubs.createGroup(id, body.name, body.ageGroup);
  }

  @Get(':id/groups')
  @UseGuards(AuthGuard('jwt'))
  async listGroups(@Param('id') id: string) {
    return this.clubs.listGroups(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; logo?: string; description?: string },
  ) {
    return this.clubs.updateClub(id, body);
  }
}
