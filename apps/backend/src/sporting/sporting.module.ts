import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SportingController } from './sporting.controller';
import { SportingService } from './sporting.service';
import { WorkspaceCatalogService } from './workspace-catalog.service';
import { WorkspaceCatalogController } from './workspace-catalog.controller';
import { SportingTeamLifecycleService } from './team-lifecycle.service';
import { TeamLifecycleController } from './team-lifecycle.controller';
import { PlayerNoteController } from './player-note.controller';
import { PlayerNoteService } from './player-note.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    SportingController,
    WorkspaceCatalogController,
    TeamLifecycleController,
    PlayerNoteController,
  ],
  providers: [
    SportingService,
    WorkspaceCatalogService,
    SportingTeamLifecycleService,
    PlayerNoteService,
  ],
  exports: [SportingService],
})
export class SportingModule {}
