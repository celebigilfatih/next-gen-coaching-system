import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { AuthPrincipal } from '../auth/auth-principal';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AccountLifecycleService } from './account-lifecycle.service';
import {
  AcceptInvitationDto,
  ChangeAccountAccessDto,
  ChangePasswordDto,
  CompletePasswordResetDto,
  CreateInvitationDto,
} from './dto/account-lifecycle.dto';

@Controller('accounts')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class AccountsController {
  constructor(private readonly accounts: AccountLifecycleService) {}

  @Post('invitations/accept')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  acceptInvitation(@Body() body: AcceptInvitationDto) {
    return this.accounts.acceptInvitation(body.token, body.name, body.password);
  }

  @Post('password-resets/complete')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  completePasswordReset(@Body() body: CompletePasswordResetDto) {
    return this.accounts.completePasswordReset(body.token, body.newPassword);
  }

  @Post('invitations')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  createInvitation(
    @Req() req: { user: AuthPrincipal },
    @Body() body: CreateInvitationDto,
  ) {
    return this.accounts.createInvitation(req.user, body);
  }

  @Post('invitations/:id/revoke')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  revokeInvitation(
    @Req() req: { user: AuthPrincipal },
    @Param('id') id: string,
  ) {
    return this.accounts.revokeInvitation(req.user, id);
  }

  @Post('me/change-password')
  @UseGuards(AuthGuard('jwt'))
  changePassword(
    @Req() req: { user: AuthPrincipal },
    @Body() body: ChangePasswordDto,
  ) {
    return this.accounts.changePassword(
      req.user,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Post('me/revoke-sessions')
  @UseGuards(AuthGuard('jwt'))
  revokeOwnSessions(@Req() req: { user: AuthPrincipal }) {
    return this.accounts.revokeSessions(req.user, req.user.id);
  }

  @Patch(':id/access')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  changeAccess(
    @Req() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body() body: ChangeAccountAccessDto,
  ) {
    return this.accounts.changeAccess(req.user, id, body);
  }

  @Post(':id/suspend')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  suspend(@Req() req: { user: AuthPrincipal }, @Param('id') id: string) {
    return this.accounts.setStatus(req.user, id, 'SUSPENDED');
  }

  @Post(':id/reactivate')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  reactivate(@Req() req: { user: AuthPrincipal }, @Param('id') id: string) {
    return this.accounts.setStatus(req.user, id, 'ACTIVE');
  }

  @Post(':id/password-reset')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  issuePasswordReset(
    @Req() req: { user: AuthPrincipal },
    @Param('id') id: string,
  ) {
    return this.accounts.issuePasswordReset(req.user, id);
  }

  @Post(':id/revoke-sessions')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  revokeSessions(@Req() req: { user: AuthPrincipal }, @Param('id') id: string) {
    return this.accounts.revokeSessions(req.user, id);
  }

  @Get('audit')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN')
  listAudit(
    @Req() req: { user: AuthPrincipal },
    @Query('targetUserId') targetUserId?: string,
  ) {
    return this.accounts.listAudit(req.user, targetUserId);
  }
}
