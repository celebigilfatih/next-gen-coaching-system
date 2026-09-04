import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfiguration } from './jwt-configuration.module';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configuration: JwtConfiguration,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configuration.secret,
    });
  }

  async validate(payload: {
    sub: string;
    ver?: number;
    [claim: string]: unknown;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        authVersion: true,
        clubId: true,
      },
    });
    if (!user) throw new UnauthorizedException('User no longer exists');
    if (user.status !== 'ACTIVE' || payload.ver !== user.authVersion) {
      throw new UnauthorizedException('Session is no longer valid');
    }

    return {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      clubId: user.clubId,
    };
  }
}
