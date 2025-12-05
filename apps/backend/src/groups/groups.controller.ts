import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('groups')
export class GroupsController {
  constructor(private groups: GroupsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async list(@Query('clubId') clubId: string, @Request() req) {
    const user = req.user;
    
    // ADMIN: belirtilen kulübün gruplarını veya tüm grupları görebilir
    if (user.role === 'ADMIN') {
      return this.groups.listByClub(clubId);
    }
    
    // COACH/PLAYER: sadece kendi kulübündeki grupları görebilir
    if (!user.clubId) {
      return [];
    }
    
    // Eğer clubId parametresi verilmişse ve kullanıcının kulübü değilse, boş dön
    if (clubId && clubId !== user.clubId) {
      return [];
    }
    
    return this.groups.listByClub(user.clubId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async create(@Body() body: { clubId: string; name: string; ageGroup: any; category?: string }) {
    return this.groups.create(body);
  }

  @Post(':id/members')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'COACH')
  async addMember(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.groups.addMember(id, body.userId);
  }

  @Post(':id/members/delete')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'COACH')
  async removeMember(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.groups.removeMember(id, body.userId);
  }

  @Get(':id/members')
  @UseGuards(AuthGuard('jwt'))
  async getMembers(@Param('id') id: string) {
    return this.groups.getMembers(id);
  }
}
