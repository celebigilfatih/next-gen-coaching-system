import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { RefreshSessionService } from './refresh-session.service';

@Controller('auth')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class AuthController {
  constructor(
    private auth: AuthService,
    private refreshSessions: RefreshSessionService,
  ) {}

  @Post('login')
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() body: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.refreshSessions.assertBrowserRequest(request);
    return this.present(
      await this.auth.login(body.email, body.password),
      response,
    );
  }

  @Post('refresh')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.refreshSessions.requireEnabled();
    this.refreshSessions.assertBrowserRequest(request);
    const rawToken = this.refreshSessions.readRefreshToken(request);
    try {
      if (!rawToken)
        throw new UnauthorizedException('Refresh session is invalid');
      return this.present(await this.auth.refresh(rawToken), response);
    } catch (error) {
      if (error instanceof UnauthorizedException)
        this.clearRefreshCookie(response);
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.refreshSessions.requireEnabled();
    this.refreshSessions.assertBrowserRequest(request);
    await this.auth.logout(this.refreshSessions.readRefreshToken(request));
    this.clearRefreshCookie(response);
    return { success: true };
  }

  private present(
    result: Awaited<ReturnType<AuthService['login']>>,
    response: Response,
  ) {
    const { refreshSession, ...publicResult } = result;
    if (refreshSession)
      response.cookie(
        this.refreshSessions.cookieName,
        refreshSession.rawToken,
        this.refreshSessions.cookieOptions(
          Math.max(0, refreshSession.absoluteExpiresAt.getTime() - Date.now()),
        ),
      );
    return publicResult;
  }

  private clearRefreshCookie(response: Response) {
    response.clearCookie(
      this.refreshSessions.cookieName,
      this.refreshSessions.cookieOptions(),
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@Req() req: any) {
    return req.user;
  }
}
