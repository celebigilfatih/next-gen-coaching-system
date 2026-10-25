import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  resolvePersistentSessionConfig,
  type PersistentSessionConfig,
} from './persistent-session.config';

@Injectable()
export class PersistentSessionConfiguration implements PersistentSessionConfig {
  readonly enabled: boolean;
  readonly frontendOrigin: string | null;
  readonly cookieName: string;
  readonly cookieSecure: boolean;
  readonly accessTokenTtl: '15m' | '7d';
  readonly refreshIdleTtlMs: number;
  readonly refreshAbsoluteTtlMs: number;
  readonly retentionMs: number;
  readonly maxActiveSessionFamilies: number;

  constructor(config: ConfigService) {
    const resolved = resolvePersistentSessionConfig({
      PERSISTENT_SESSIONS_ENABLED: config.get<string>(
        'PERSISTENT_SESSIONS_ENABLED',
      ),
      FRONTEND_ORIGIN: config.get<string>('FRONTEND_ORIGIN'),
      NODE_ENV: config.get<string>('NODE_ENV'),
    });
    Object.assign(this, resolved);
  }
}

@Module({
  imports: [ConfigModule],
  providers: [PersistentSessionConfiguration],
  exports: [PersistentSessionConfiguration],
})
export class PersistentSessionConfigurationModule {}
