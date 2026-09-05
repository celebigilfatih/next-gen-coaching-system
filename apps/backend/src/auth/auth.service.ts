import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { toPublicUser } from '../users/user.select';
import { RefreshSessionService } from './refresh-session.service';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private refreshSessions: RefreshSessionService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmailWithPassword(email);
    if (!user || user.status !== 'ACTIVE') return null;
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return null;
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const refreshSession = this.refreshSessions.enabled
      ? await this.refreshSessions.issue(user)
      : null;
    return {
      access_token: await this.signAccessToken(user, refreshSession?.familyId),
      user: toPublicUser(user),
      persistent_session: this.refreshSessions.enabled,
      refreshSession,
    };
  }

  async refresh(rawToken: string) {
    const { user, refreshSession } =
      await this.refreshSessions.rotate(rawToken);
    return {
      access_token: await this.signAccessToken(user, refreshSession.familyId),
      user: toPublicUser(user),
      persistent_session: true,
      refreshSession,
    };
  }

  logout(rawToken: string | null) {
    return this.refreshSessions.logout(rawToken);
  }

  private signAccessToken(
    user: { id: string; email: string; role: string; authVersion: number },
    familyId?: string,
  ) {
    return this.jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        ver: user.authVersion,
        ...(familyId ? { sid: familyId } : {}),
      },
      { expiresIn: this.refreshSessions.configuration.accessTokenTtl },
    );
  }
}
