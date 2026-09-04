import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';
import { Reflector } from '@nestjs/core';
import {
  JwtConfiguration,
  JwtConfigurationModule,
} from './jwt-configuration.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PassportModule,
    JwtConfigurationModule,
    JwtModule.registerAsync({
      global: true,
      imports: [JwtConfigurationModule],
      inject: [JwtConfiguration],
      useFactory: (configuration: JwtConfiguration) => ({
        secret: configuration.secret,
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    Reflector,
    // RolesGuard global olarak devre dışı - manuel @UseGuards(RolesGuard) ile kullanılacak
    // { provide: APP_GUARD, useClass: RolesGuard },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
