import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountLifecycleService } from './account-lifecycle.service';
import { AccountsController } from './accounts.controller';

@Module({
  imports: [PrismaModule],
  providers: [AccountLifecycleService],
  controllers: [AccountsController],
})
export class AccountsModule {}
