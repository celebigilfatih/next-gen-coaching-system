import { Module } from '@nestjs/common';
import { SeasonService } from './season.service';
import { MacroService } from './macro.service';
import { MesoService } from './meso.service';
import { MicroService } from './micro.service';
import { MatchWeekService } from './match-week.service';
import { SeasonController, MatchWeekController } from './season.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SeasonController, MatchWeekController],
  providers: [
    SeasonService,
    MacroService,
    MesoService,
    MicroService,
    MatchWeekService,
  ],
  exports: [SeasonService],
})
export class SeasonPlannerModule {}
