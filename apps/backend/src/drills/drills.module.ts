import { Module } from '@nestjs/common';
import { DrillsService } from './drills.service';
import { DrillsController } from './drills.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DrillsService],
  controllers: [DrillsController],
})
export class DrillsModule {}
