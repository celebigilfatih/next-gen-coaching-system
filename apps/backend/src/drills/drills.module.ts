import { Module } from '@nestjs/common';
import { DrillsService } from './drills.service';
import { DrillsController } from './drills.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DrillContentService } from './drill-content.service';

@Module({
  imports: [PrismaModule],
  providers: [DrillsService, DrillContentService],
  controllers: [DrillsController],
})
export class DrillsModule {}
