import { Module } from '@nestjs/common';
import { SeasonsController } from './seasons.controller';
import { SeasonsService } from './seasons.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MatchCatalogService } from './match-catalog.service';
import { MatchCatalogController } from './match-catalog.controller';
import { PlanningModule } from '../planning/planning.module';

@Module({
  imports: [PrismaModule, PlanningModule],
  controllers: [SeasonsController, MatchCatalogController],
  providers: [SeasonsService, MatchCatalogService],
  exports: [SeasonsService],
})
export class SeasonsModule {}
