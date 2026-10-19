import {
  Body,
  Controller,
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
import { TacticalDocumentService } from './tactical-document.service';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class TacticalDocumentController {
  constructor(private readonly documents: TacticalDocumentService) {}

  @Get('drills/:id/tactical-editor')
  drillMetadata(
    @Req() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Query() query: unknown,
  ) {
    return this.documents.drillMetadata(req.user, id, query);
  }

  @Put('drills/:id/tactical-editor')
  saveDrillEditor(
    @Req() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body() body: unknown,
    @Query() query: unknown,
  ) {
    return this.documents.saveDrill(req.user, id, body, query);
  }

  @Post('drills/tactical-editor')
  createDrillEditor(
    @Req() req: { user: AuthPrincipal },
    @Body() body: unknown,
    @Query() query: unknown,
  ) {
    return this.documents.createDrill(req.user, body, query);
  }

  @Get('drills/:id/tactical-document')
  drill(
    @Req() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Query() query: unknown,
  ) {
    return this.documents.read(req.user, { kind: 'drill', id }, query);
  }
  @Put('drills/:id/tactical-document')
  saveDrill(
    @Req() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body() body: unknown,
    @Query() query: unknown,
  ) {
    return this.documents.write(req.user, { kind: 'drill', id }, body, query);
  }
  @Get('training-plans/:planId/drills/:id/tactical-document')
  plan(
    @Req() req: { user: AuthPrincipal },
    @Param('planId') planId: string,
    @Param('id') id: string,
    @Query() query: unknown,
  ) {
    return this.documents.read(req.user, { kind: 'plan', planId, id }, query);
  }
  @Put('training-plans/:planId/drills/:id/tactical-document')
  savePlan(
    @Req() req: { user: AuthPrincipal },
    @Param('planId') planId: string,
    @Param('id') id: string,
    @Body() body: unknown,
    @Query() query: unknown,
  ) {
    return this.documents.write(
      req.user,
      { kind: 'plan', planId, id },
      body,
      query,
    );
  }
  @Get('seasons/matches/:id/tactical-document')
  match(
    @Req() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Query() query: unknown,
  ) {
    return this.documents.read(req.user, { kind: 'match', id }, query);
  }
  @Put('seasons/matches/:id/tactical-document')
  saveMatch(
    @Req() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body() body: unknown,
    @Query() query: unknown,
  ) {
    return this.documents.write(req.user, { kind: 'match', id }, body, query);
  }
}
