import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthPrincipal } from '../auth/auth-principal';
import { PlayerNoteService } from './player-note.service';

@Controller('sporting/players/:personId')
@UseGuards(AuthGuard('jwt'))
export class PlayerNoteController {
  constructor(private readonly notes: PlayerNoteService) {}

  @Get('notes/page')
  page(
    @Req() req: { user: AuthPrincipal },
    @Param('personId') personId: string,
    @Query() query: unknown,
  ) {
    return this.notes.page(req.user, personId, query);
  }

  @Post('notes')
  create(
    @Req() req: { user: AuthPrincipal },
    @Param('personId') personId: string,
    @Body() body: unknown,
  ) {
    return this.notes.create(req.user, personId, body);
  }

  @Patch('notes/:noteId')
  update(
    @Req() req: { user: AuthPrincipal },
    @Param('personId') personId: string,
    @Param('noteId') noteId: string,
    @Body() body: unknown,
  ) {
    return this.notes.update(req.user, personId, noteId, body);
  }

  @Post('notes/:noteId/archive')
  archive(
    @Req() req: { user: AuthPrincipal },
    @Param('personId') personId: string,
    @Param('noteId') noteId: string,
    @Body() body: unknown,
  ) {
    return this.notes.archive(req.user, personId, noteId, body);
  }

  @Post('notes/:noteId/restore')
  restore(
    @Req() req: { user: AuthPrincipal },
    @Param('personId') personId: string,
    @Param('noteId') noteId: string,
    @Body() body: unknown,
  ) {
    return this.notes.restore(req.user, personId, noteId, body);
  }

  @Get('notes/:noteId/revisions/page')
  revisions(
    @Req() req: { user: AuthPrincipal },
    @Param('personId') personId: string,
    @Param('noteId') noteId: string,
    @Query() query: unknown,
  ) {
    return this.notes.revisions(req.user, personId, noteId, query);
  }

  @Put('notes/:noteId/shares')
  shares(
    @Req() req: { user: AuthPrincipal },
    @Param('personId') personId: string,
    @Param('noteId') noteId: string,
    @Body() body: unknown,
  ) {
    return this.notes.replaceShares(req.user, personId, noteId, body);
  }

  @Get('activity/page')
  activity(
    @Req() req: { user: AuthPrincipal },
    @Param('personId') personId: string,
    @Query() query: unknown,
  ) {
    return this.notes.activity(req.user, personId, query);
  }
}
