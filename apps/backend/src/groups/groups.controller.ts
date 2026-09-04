import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { GroupsService } from './groups.service';

@Controller('groups')
@UseGuards(AuthGuard('jwt'))
export class GroupsController {
  constructor(
    private readonly groups: GroupsService,
    private readonly authorization: AuthorizationService,
  ) {}

  @Get()
  async list(
    @Query('clubId') clubId: string | undefined,
    @Request() req: { user: AuthPrincipal },
  ) {
    if (req.user.role === 'SYSTEM_ADMIN') {
      return this.groups.listByClub(clubId);
    }
    if (!req.user.clubId) return [];
    if (req.user.role === 'CLUB_ADMIN') {
      return this.groups.listByClub(req.user.clubId);
    }
    return this.groups.listForMember(req.user.clubId, req.user.id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  async create(
    @Request() req: { user: AuthPrincipal },
    @Body()
    body: {
      clubId: string;
      name: string;
      ageGroup: any;
      category?: string;
    },
  ) {
    this.authorization.assertClubManage(req.user, body.clubId);
    return this.groups.create(body);
  }

  @Get(':id')
  async findOne(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
  ) {
    await this.authorization.assertGroupView(req.user, id);
    return this.groups.findOne(id, req.user.role !== 'PLAYER');
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  async update(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body() body: { name?: string; ageGroup?: any; category?: string },
  ) {
    await this.authorization.assertGroupManage(req.user, id);
    return this.groups.update(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  async delete(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
  ) {
    await this.authorization.assertGroupManage(req.user, id);
    return this.groups.delete(id);
  }

  @Post(':id/members')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  async addMember(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body() body: { userId: string },
  ) {
    const group = await this.authorization.assertGroupManage(req.user, id);
    await this.authorization.assertUserInClub(body.userId, group.clubId);
    return this.groups.addMember(id, body.userId);
  }

  @Post(':id/members/delete')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  async removeMember(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body() body: { userId: string },
  ) {
    await this.authorization.assertGroupManage(req.user, id);
    return this.groups.removeMember(id, body.userId);
  }

  @Get(':id/members')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async getMembers(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
  ) {
    await this.authorization.assertGroupView(req.user, id);
    return this.groups.getMembers(id);
  }
}
