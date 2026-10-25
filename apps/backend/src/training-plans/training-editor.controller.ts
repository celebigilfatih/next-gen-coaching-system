import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthPrincipal } from '../auth/auth-principal';
import { TrainingEditorService } from './training-editor.service';

@Controller('training-plans')
@UseGuards(AuthGuard('jwt'))
export class TrainingEditorController {
  constructor(private readonly editor: TrainingEditorService) {}

  @Get(':planId/editor-metadata')
  metadata(
    @Req() req: { user: AuthPrincipal },
    @Param('planId') planId: string,
    @Query() query: unknown,
  ) {
    return this.editor.metadata(req.user, planId, query);
  }

  @Get(':planId/drills/:planDrillId/board')
  board(
    @Req() req: { user: AuthPrincipal },
    @Param('planId') planId: string,
    @Param('planDrillId') planDrillId: string,
    @Query() query: unknown,
  ) {
    return this.editor.board(req.user, planId, planDrillId, query);
  }
}
