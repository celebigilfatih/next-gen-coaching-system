import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PlanningService } from './planning.service';
import { PlanningCatalogService } from './planning-catalog.service';
import { PlanningController } from './planning.controller';
@Module({
  imports: [PrismaModule],
  controllers: [PlanningController],
  providers: [PlanningService, PlanningCatalogService],
  exports: [PlanningService],
})
export class PlanningModule {}
