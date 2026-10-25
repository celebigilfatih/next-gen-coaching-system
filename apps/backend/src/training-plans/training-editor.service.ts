import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import { validateTacticalBoardDocument } from '../tactics/tactical-board';
import { assertLegacyTacticalWrite } from '../tactics/tactical-persistence';
import {
  assertEditorReadQuery,
  editorReadIdentifier,
} from './dto/editor-read.dto';
import { projectPlanContent } from './plan-drill-content';

type BoardIdentity = {
  planId: string;
  planDrillId: string;
  drillId: string;
};
export type TrainingPhaseBoard = BoardIdentity &
  (
    | {
        origin: 'snapshot' | 'drill';
        status: 'ready';
        document: ReturnType<typeof validateTacticalBoardDocument>;
      }
    | {
        origin: 'snapshot' | 'drill';
        status: 'invalid';
        document: null;
      }
    | { origin: null; status: 'absent'; document: null }
  );

type EffectiveBoardRow = BoardIdentity & {
  origin: 'snapshot' | 'drill' | null;
  document: unknown;
};

@Injectable()
export class TrainingEditorService {
  private readonly logger = new Logger(TrainingEditorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
  ) {}

  async metadata(principal: AuthPrincipal, id: string, input: unknown) {
    const planId = editorReadIdentifier(id);
    assertEditorReadQuery(input);
    return this.read('TRAINING_EDITOR_METADATA_READ_FAILED', async () => {
      await this.authorization.assertPlanView(principal, planId);
      const plan = await this.prisma.trainingPlan.findUnique({
        where: { id: planId },
        select: {
          id: true,
          title: true,
          groupId: true,
          date: true,
          notes: true,
          totalDuration: true,
          drills: {
            // PostgreSQL Phase enum order is WARM_UP/TECHNICAL/TACTICAL/COOL_DOWN.
            orderBy: [{ phase: 'asc' }, { order: 'asc' }, { id: 'asc' }],
            select: {
              id: true,
              drillId: true,
              phase: true,
              order: true,
              notes: true,
              contentSnapshot: true,
              drill: { select: { id: true, title: true, durationMin: true } },
            },
          },
        },
      });
      if (!plan) throw new NotFoundException('Training plan not found');
      return projectPlanContent(plan);
    });
  }

  async board(
    principal: AuthPrincipal,
    id: string,
    phaseId: string,
    input: unknown,
  ): Promise<TrainingPhaseBoard> {
    const planId = editorReadIdentifier(id);
    const planDrillId = editorReadIdentifier(phaseId);
    assertEditorReadQuery(input);
    return this.read('TRAINING_EDITOR_BOARD_READ_FAILED', async () => {
      await this.authorization.assertPlanView(principal, planId);
      const source = await this.authorization.assertPlanDrillSourceView(
        principal,
        planId,
        planDrillId,
      );
      // NULLIF covers JSON null as well as SQL NULL. Invalid non-null snapshots
      // win deliberately: do not replace a saved snapshot with source content.
      const [row] = await this.prisma.$queryRaw<EffectiveBoardRow[]>(Prisma.sql`
        SELECT pd."trainingPlanId" AS "planId", pd.id AS "planDrillId",
          pd."drillId",
          CASE
            WHEN NULLIF(pd."boardSnapshot", 'null'::jsonb) IS NOT NULL THEN 'snapshot'
            WHEN NULLIF(pd."contentSnapshot", 'null'::jsonb) IS NULL
              AND NULLIF(d."jsonData", 'null'::jsonb) IS NOT NULL THEN 'drill'
            ELSE NULL
          END AS origin,
          COALESCE(NULLIF(pd."boardSnapshot", 'null'::jsonb),
                   CASE WHEN NULLIF(pd."contentSnapshot", 'null'::jsonb) IS NULL
                     THEN NULLIF(d."jsonData", 'null'::jsonb) END) AS document
        FROM "PlanDrill" pd JOIN "Drill" d ON d.id = pd."drillId"
        WHERE pd."trainingPlanId" = ${planId} AND pd.id = ${planDrillId}
          AND pd."drillId" = ${source.drill.id}
      `);
      if (!row) throw new NotFoundException('Plan drill not found');
      const identity: BoardIdentity = {
        planId: row.planId,
        planDrillId: row.planDrillId,
        drillId: row.drillId,
      };
      if (row.origin === null)
        return { ...identity, origin: null, status: 'absent', document: null };
      assertLegacyTacticalWrite(row.document);
      try {
        return {
          ...identity,
          origin: row.origin,
          status: 'ready',
          document: validateTacticalBoardDocument(row.document),
        };
      } catch (error) {
        if (!(error instanceof BadRequestException)) throw error;
        // Legacy payloads stay in storage; never echo their validation details.
        return {
          ...identity,
          origin: row.origin,
          status: 'invalid',
          document: null,
        };
      }
    });
  }

  private async read<T>(
    event: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(event);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
