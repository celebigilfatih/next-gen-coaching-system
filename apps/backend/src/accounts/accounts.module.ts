import { Module } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { PrismaModule } from '../prisma/prisma.module';
import {
  ACCOUNT_DELIVERY_CONFIG,
  ACCOUNT_MAIL_TRANSPORT,
  resolveAccountDeliveryConfig,
  type SmtpAccountDeliveryConfig,
} from './account-delivery.config';
import { AccountDeliveryService } from './account-delivery.service';
import { AccountLifecycleService } from './account-lifecycle.service';
import { AccountsController } from './accounts.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: ACCOUNT_DELIVERY_CONFIG,
      useFactory: resolveAccountDeliveryConfig,
    },
    {
      provide: ACCOUNT_MAIL_TRANSPORT,
      inject: [ACCOUNT_DELIVERY_CONFIG],
      useFactory: (config: ReturnType<typeof resolveAccountDeliveryConfig>) => {
        if (config.mode !== 'smtp') return null;
        const smtp = config as SmtpAccountDeliveryConfig;
        return nodemailer.createTransport({
          host: smtp.host,
          port: smtp.port,
          secure: smtp.secure,
          connectionTimeout: smtp.timeoutMs,
          greetingTimeout: smtp.timeoutMs,
          socketTimeout: smtp.timeoutMs,
          ...(smtp.user && smtp.password
            ? { auth: { user: smtp.user, pass: smtp.password } }
            : {}),
        });
      },
    },
    AccountDeliveryService,
    AccountLifecycleService,
  ],
  controllers: [AccountsController],
})
export class AccountsModule {}
