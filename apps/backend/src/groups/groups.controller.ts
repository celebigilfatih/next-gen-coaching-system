import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import {
  parseCreateGroupBody,
  parseCreateGroupClubId,
  parseGroupMemberBody,
  parseUpdateGroupBody,
} from './dto/group.dto';

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
    @Body() input: unknown,
  ) {
    const clubId = parseCreateGroupClubId(input);
    this.authorization.assertClubManage(req.user, clubId);
    const body = parseCreateGroupBody(input);
    if (body.category === 'A_TAKIM')
      throw new ForbiddenException(
        'Create the protected first team through the sporting team lifecycle',
      );
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
    @Body() input: unknown,
  ) {
    await this.authorization.assertGroupManage(req.user, id);
    return this.groups.update(id, parseUpdateGroupBody(input));
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  async delete(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
  ) {
    await this.authorization.assertGroupManage(req.user, id);
    return this.groups.delete(id, req.user.id);
  }

  @Post(':id/members')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  async addMember(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body() input: unknown,
  ) {
    const group = await this.authorization.assertGroupManage(req.user, id);
    const body = parseGroupMemberBody(input);
    await this.authorization.assertUserInClub(body.userId, group.clubId);
    return this.groups.addMember(id, body.userId, req.user.id);
  }

  @Post(':id/members/delete')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  async removeMember(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body() input: unknown,
  ) {
    await this.authorization.assertGroupManage(req.user, id);
    const body = parseGroupMemberBody(input);
    return this.groups.removeMember(id, body.userId, req.user.id);
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
  @Get(':id/members/players/page')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async playerMemberPage(
    @Request() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Query() query: unknown,
  ) {
    await this.authorization.assertGroupView(req.user, id);
    return this.groups.getPlayerMemberPage(id, query);
  }
}
