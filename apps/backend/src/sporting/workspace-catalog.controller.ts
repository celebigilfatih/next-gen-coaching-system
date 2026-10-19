import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthPrincipal } from '../auth/auth-principal';
import { WorkspaceCatalogService } from './workspace-catalog.service';

@Controller('sporting')
@UseGuards(AuthGuard('jwt'))
export class WorkspaceCatalogController {
  constructor(private readonly catalog: WorkspaceCatalogService) {}
  @Get('workspace/legacy-metadata')
  legacyMetadata(@Req() req: { user: AuthPrincipal }, @Query() query: unknown) {
    return this.catalog.legacyMetadata(req.user, query);
  }
  @Get('workspace/legacy-context')
  legacyContext(@Req() req: { user: AuthPrincipal }, @Query() query: unknown) {
    return this.catalog.legacyContext(req.user, query);
  }
  @Get('roles/page')
  assignmentRoles(
    @Req() req: { user: AuthPrincipal },
    @Query() query: unknown,
  ) {
    return this.catalog.assignmentRoles(req.user, query);
  }
  @Get('workspace/selection')
  selection(@Req() req: { user: AuthPrincipal }, @Query() query: unknown) {
    return this.catalog.selection(req.user, query);
  }
  @Get('catalog/clubs')
  clubs(@Req() req: { user: AuthPrincipal }, @Query() query: unknown) {
    return this.catalog.catalog(req.user, 'clubs', query);
  }
  @Get('catalog/seasons')
  seasons(@Req() req: { user: AuthPrincipal }, @Query() query: unknown) {
    return this.catalog.catalog(req.user, 'seasons', query);
  }
  @Get('teams/page')
  teams(@Req() req: { user: AuthPrincipal }, @Query() query: unknown) {
    return this.catalog.catalog(req.user, 'teams', query);
  }
}
