import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthPrincipal } from '../auth/auth-principal';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DrillWriteInput, DrillsService } from './drills.service';

@Controller('drills')
@UseGuards(AuthGuard('jwt'))
export class DrillsController {
  constructor(private readonly drills: DrillsService) {}

  @Get()
  async list(
    @Req() req: { user: AuthPrincipal },
    @Query('category') category?: string,
    @Query('ageGroup') ageGroup?: string,
    @Query('difficulty') difficulty?: string,
    @Query('groupId') groupId?: string,
  ) {
    return this.drills.list(req.user, {
      category,
      ageGroup,
      difficulty,
      groupId,
    });
  }

  @Get(':id')
  async get(@Req() req: { user: AuthPrincipal }, @Param('id') id: string) {
    return this.drills.get(req.user, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async create(
    @Req() req: { user: AuthPrincipal },
    @Body()
    body: DrillWriteInput & {
      scope?: 'GLOBAL' | 'CLUB';
      clubId?: string;
      groupId?: string;
    },
  ) {
    return this.drills.create(req.user, body);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async update(
    @Req() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body() body: Partial<DrillWriteInput>,
  ) {
    return this.drills.update(req.user, id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async remove(@Req() req: { user: AuthPrincipal }, @Param('id') id: string) {
    return this.drills.remove(req.user, id);
  }
}
