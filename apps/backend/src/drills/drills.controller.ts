import { UseInterceptors } from '@nestjs/common';
import { LegacyTacticalReadInterceptor } from '../tactics/legacy-tactical-read.interceptor';
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
import { DrillsService } from './drills.service';
import { DrillContentService } from './drill-content.service';
import {
  parseDrillContentDetailQuery,
  parseDrillContentQueueQuery,
} from './drill-content.dto';

@Controller('drills')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LegacyTacticalReadInterceptor)
export class DrillsController {
  constructor(
    private readonly drills: DrillsService,
    private readonly content: DrillContentService,
  ) {}

  @Get('content/queue')
  contentQueue(@Req() req: { user: AuthPrincipal }, @Query() query: unknown) {
    return this.content.queue(
      req.user,
      parseDrillContentQueueQuery(query).status,
    );
  }

  @Post('content/drafts')
  createContentDraft(
    @Req() req: { user: AuthPrincipal },
    @Body() body: unknown,
  ) {
    return this.content.createDraft(req.user, body);
  }

  @Post('content/:versionId/submit')
  submitContent(
    @Req() req: { user: AuthPrincipal },
    @Param('versionId') versionId: string,
  ) {
    return this.content.submit(req.user, versionId);
  }

  @Post('content/:versionId/approve')
  approveContent(
    @Req() req: { user: AuthPrincipal },
    @Param('versionId') versionId: string,
    @Body() body: unknown,
  ) {
    return this.content.approve(req.user, versionId, body);
  }

  @Post('content/:versionId/reject')
  rejectContent(
    @Req() req: { user: AuthPrincipal },
    @Param('versionId') versionId: string,
    @Body() body: unknown,
  ) {
    return this.content.reject(req.user, versionId, body);
  }

  @Post('content/:versionId/publish')
  publishContent(
    @Req() req: { user: AuthPrincipal },
    @Param('versionId') versionId: string,
  ) {
    return this.content.publish(req.user, versionId);
  }

  @Post('content/:versionId/archive')
  archiveContent(
    @Req() req: { user: AuthPrincipal },
    @Param('versionId') versionId: string,
  ) {
    return this.content.archive(req.user, versionId);
  }

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

  @Get(':id/content')
  contentDetail(
    @Req() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Query() query: unknown,
  ) {
    return this.content.publishedDetail(
      req.user,
      id,
      parseDrillContentDetailQuery(query).ageGroup,
    );
  }

  @Get('catalog/page')
  page(@Req() req: { user: AuthPrincipal }, @Query() query: unknown) {
    return this.drills.page(req.user, query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async create(@Req() req: { user: AuthPrincipal }, @Body() body: unknown) {
    return this.drills.create(req.user, body);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async update(
    @Req() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body() body: unknown,
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
