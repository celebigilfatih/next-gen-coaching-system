import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ClubsService } from './clubs.service';

@Controller('clubs')
@UseGuards(AuthGuard('jwt'))
export class ClubsController {
  constructor(
    private readonly clubs: ClubsService,
    private readonly authorization: AuthorizationService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async create(
    @Body() body: { name: string; logo?: string; description?: string },
  ) {
    return this.clubs.createClub(body);
  }

  @Get()
  async list(@Request() req: { user: AuthPrincipal }) {
    if (req.user.role === 'SYSTEM_ADMIN') return this.clubs.listClubs();
    if (!req.user.clubId) return [];
    const club = await this.clubs.getClubById(req.user.clubId);
    return club ? [club] : [];
  }

  @Post(':id/groups')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  async createGroup(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body() body: { name: string; ageGroup: any },
  ) {
    this.authorization.assertClubManage(req.user, id);
    return this.clubs.createGroup(id, body.name, body.ageGroup);
  }

  @Get(':id/groups')
  async listGroups(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
  ) {
    this.authorization.assertClubView(req.user, id);
    if (req.user.role === 'SYSTEM_ADMIN' || req.user.role === 'CLUB_ADMIN') {
      return this.clubs.listGroups(id);
    }
    return this.clubs.listGroupsForUser(id, req.user.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  async update(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body() body: { name?: string; logo?: string; description?: string },
  ) {
    this.authorization.assertClubManage(req.user, id);
    return this.clubs.updateClub(id, body);
  }
}
