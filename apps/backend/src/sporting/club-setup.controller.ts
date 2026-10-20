import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthPrincipal } from '../auth/auth-principal';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ClubSetupService } from './club-setup.service';

@Controller('sporting/club-setup')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('SYSTEM_ADMIN')
export class ClubSetupController {
  constructor(private readonly setup: ClubSetupService) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  create(@Req() req: { user: AuthPrincipal }, @Body() body: unknown) {
    return this.setup.create(req.user, body);
  }

  @Get(':requestId')
  @Header('Cache-Control', 'no-store')
  status(
    @Req() req: { user: AuthPrincipal },
    @Param('requestId') requestId: string,
  ) {
    return this.setup.status(req.user, requestId);
  }
}
