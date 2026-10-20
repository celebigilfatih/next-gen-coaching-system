import { Module } from '@nestjs/common';
import { TrainingPlansService } from './training-plans.service';
import { TrainingPlansController } from './training-plans.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TrainingPlanCatalogService } from './training-plan-catalog.service';
import { TrainingPlanCatalogController } from './training-plan-catalog.controller';
import { TrainingEditorController } from './training-editor.controller';
import { TrainingEditorService } from './training-editor.service';

@Module({
  imports: [PrismaModule],
  providers: [
    TrainingPlansService,
    TrainingPlanCatalogService,
    TrainingEditorService,
  ],
  controllers: [
    TrainingPlansController,
    TrainingPlanCatalogController,
    TrainingEditorController,
  ],
})
export class TrainingPlansModule {}
