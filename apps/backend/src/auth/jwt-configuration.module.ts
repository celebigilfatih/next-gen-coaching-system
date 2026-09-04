import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { resolveJwtSecret } from './jwt.config';

@Injectable()
export class JwtConfiguration {
  readonly secret: string;

  constructor(config: ConfigService) {
    this.secret = resolveJwtSecret({
      JWT_SECRET: config.get<string>('JWT_SECRET'),
      NODE_ENV: config.get<string>('NODE_ENV'),
    });
  }
}

@Module({
  imports: [ConfigModule],
  providers: [JwtConfiguration],
  exports: [JwtConfiguration],
})
export class JwtConfigurationModule {}
