import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  assertLegacyTacticalWrite,
  rethrowTacticalConflict,
} from '../tactics/tactical-persistence';
import { publicUserSelect } from '../users/user.select';
import type { AuthPrincipal } from '../auth/auth-principal';
import {
  PlanDrillInput,
  validatePlanDrillEntries,
} from './dto/replace-plan-drills.dto';
import {
  CreateTrainingPlanDto,
  UpdateTrainingPlanDto,
  parseCreateTrainingPlanBody,
  parseUpdateTrainingPlanBody,
} from './dto/training-plan.dto';

@Injectable()
export class TrainingPlansService {
  private readonly logger = new Logger(TrainingPlansService.name);

  constructor(private prisma: PrismaService) {}

  async listForPrincipal(
    principal: AuthPrincipal,
    filters: { clubId?: string; coachId?: string; groupId?: string },
  ) {
    const requested: any = {};
    if (filters.clubId) requested.clubId = filters.clubId;
    if (filters.coachId) requested.coachId = filters.coachId;
    if (filters.groupId) requested.groupId = filters.groupId;

    let scope: any = {};
    if (principal.role === 'CLUB_ADMIN') {
      scope = { clubId: principal.clubId ?? '__unassigned__' };
    } else if (principal.role === 'COACH') {
      scope = {
        clubId: principal.clubId ?? '__unassigned__',
        OR: [
          { coachId: principal.id },
          { group: { members: { some: { userId: principal.id } } } },
        ],
      };
    } else if (principal.role === 'PLAYER') {
      scope = {
        clubId: principal.clubId ?? '__unassigned__',
        group: { members: { some: { userId: principal.id } } },
      };
    }

    return this.prisma.trainingPlan.findMany({
      where: { AND: [scope, requested] },
      include: {
        attendance:
          principal.role === 'PLAYER'
            ? { where: { playerId: principal.id } }
            : true,
        drills: { include: { drill: true } },
      },
    });
  }

  async getEditor(id: string) {
    return this.prisma.trainingPlan.findUnique({
      where: { id },
      include: { drills: { include: { drill: true } } },
    });
  }

  async get(id: string, principal: AuthPrincipal) {
    return this.prisma.trainingPlan.findUnique({
      where: { id },
      include: {
        drills: { include: { drill: true } },
        attendance: {
          where:
            principal.role === 'PLAYER'
              ? { playerId: principal.id }
              : undefined,
          include: { player: { select: publicUserSelect } },
        },
        group:
          principal.role === 'PLAYER'
            ? true
            : {
                include: {
                  members: {
                    include: { user: { select: publicUserSelect } },
                  },
                },
              },
      },
    });
  }

  async create(input: CreateTrainingPlanDto) {
    const data = parseCreateTrainingPlanBody(input);
    let plan;
    try {
      plan = await this.prisma.trainingPlan.create({
        data: {
          title: data.title,
          clubId: data.clubId,
          coachId: data.coachId,
          groupId: data.groupId,
          date: data.date,
          notes: data.notes,
        },
      });
    } catch {
      this.persistenceFailure('TRAINING_PLAN_CREATE_FAILED');
    }

    // If date is provided, try to link it to a season day plan
    if (data.date && plan.groupId) {
      await this.linkPlanToSeasonDay(
        plan.id,
        plan.clubId,
        plan.groupId,
        data.date,
      );
    }

    return plan;
  }

  private async linkPlanToSeasonDay(
    planId: string,
    clubId: string,
    groupId: string,
    date: Date | string,
  ) {
    try {
      // Ensure date is a Date object
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (Number.isNaN(dateObj.getTime())) {
        this.logger.error('PLAN_SEASON_LINK_FAILED');
        return;
      }

      // Find active season for this club that contains this date
      const seasons = await this.prisma.season.findMany({
        where: {
          clubId,
          groupId,
          startDate: { lte: dateObj },
          endDate: { gte: dateObj },
        },
        include: {
          weeks: {
            where: {
              startDate: { lte: dateObj },
              endDate: { gte: dateObj },
            },
          },
        },
      });

      if (seasons.length === 0) {
        this.logger.warn('PLAN_SEASON_LINK_SKIPPED_NO_SEASON');
        return;
      }

      // Access the weeks using the correct relation name
      const seasonWeeks = seasons[0].weeks || [];
      if (seasonWeeks.length === 0) {
        this.logger.warn('PLAN_SEASON_LINK_SKIPPED_NO_WEEK');
        return;
      }

      const week = seasonWeeks[0];
      const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay();

      // Get training plan details
      const trainingPlan = await this.prisma.trainingPlan.findUnique({
        where: { id: planId },
        include: {
          drills: { include: { drill: true } },
        },
      });

      if (!trainingPlan) {
        this.logger.error('PLAN_SEASON_LINK_SKIPPED_PLAN_MISSING');
        return;
      }

      // Create a day plan linked to this training plan
      await this.prisma.dayPlan.create({
        data: {
          weekId: week.id,
          dayOfWeek,
          date: dateObj,
          type: 'TRAINING',
          title: trainingPlan.title,
          trainingPlanId: planId,
          duration: trainingPlan.totalDuration,
          notes:
            trainingPlan.notes ||
            `Kayıtlı Antrenman: ${trainingPlan.drills.length} drill`,
        },
      });
    } catch {
      // Never attach raw errors, request fields or resource metadata to this event.
      this.logger.error('PLAN_SEASON_LINK_FAILED');
      // Don't throw - this is optional functionality
    }
  }

  async addDrill(
    planId: string,
    drillId: string,
    phase: 'WARM_UP' | 'TECHNICAL' | 'TACTICAL' | 'COOL_DOWN',
    order: number,
    notes?: string,
  ) {
    validatePlanDrillEntries([{ drillId, phase, order, notes }]);
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const [plan, drill] = await Promise.all([
            transaction.trainingPlan.findUnique({
              where: { id: planId },
              select: { id: true, clubId: true, groupId: true },
            }),
            transaction.drill.findUnique({
              where: { id: drillId },
              select: {
                id: true,
                durationMin: true,
                scope: true,
                clubId: true,
                groupId: true,
              },
            }),
          ]);
          if (!plan)
            throw new BadRequestException('Training plan does not exist');
          if (!drill) throw new BadRequestException('Drill does not exist');
          this.assertDrillFitsPlan(plan, drill);

          const planDrill = await transaction.planDrill.create({
            data: {
              trainingPlanId: planId,
              drillId,
              phase: phase as any,
              order,
              notes,
            },
          });
          const planDrills = await transaction.planDrill.findMany({
            where: { trainingPlanId: planId },
            include: { drill: true },
          });
          const totalDuration = planDrills.reduce(
            (sum, entry) => sum + entry.drill.durationMin,
            0,
          );
          await Promise.all([
            transaction.trainingPlan.update({
              where: { id: planId },
              data: { totalDuration },
            }),
            transaction.dayPlan.updateMany({
              where: { trainingPlanId: planId },
              data: { duration: totalDuration },
            }),
          ]);
          return planDrill;
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.persistenceFailure('TRAINING_PLAN_DRILL_ADD_FAILED');
    }
  }

  async replaceDrills(planId: string, entries: PlanDrillInput[]) {
    validatePlanDrillEntries(entries);

    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const drillIds = [...new Set(entries.map((entry) => entry.drillId))];
          const [plan, drills] = await Promise.all([
            transaction.trainingPlan.findUnique({
              where: { id: planId },
              select: { id: true, clubId: true, groupId: true },
            }),
            transaction.drill.findMany({
              where: { id: { in: drillIds } },
              select: {
                id: true,
                durationMin: true,
                scope: true,
                clubId: true,
                groupId: true,
              },
            }),
          ]);
          if (!plan)
            throw new BadRequestException('Training plan does not exist');
          if (drills.length !== drillIds.length) {
            throw new BadRequestException('One or more drills do not exist');
          }
          drills.forEach((drill) => this.assertDrillFitsPlan(plan, drill));

          const durationByDrill = new Map(
            drills.map((drill) => [drill.id, drill.durationMin]),
          );
          const totalDuration = entries.reduce(
            (total, entry) => total + (durationByDrill.get(entry.drillId) ?? 0),
            0,
          );

          const currentPhases = await transaction.planDrill.findMany({
            where: { trainingPlanId: planId },
            select: {
              boardSnapshot: true,
              drill: { select: { jsonData: true } },
            },
          });
          for (const phase of currentPhases) {
            assertLegacyTacticalWrite(
              phase.boardSnapshot ?? phase.drill.jsonData,
            );
          }
          await transaction.planDrill.deleteMany({
            where: { trainingPlanId: planId },
          });
          if (entries.length > 0) {
            await transaction.planDrill.createMany({
              data: entries.map((entry) => ({
                trainingPlanId: planId,
                drillId: entry.drillId,
                phase: entry.phase,
                order: entry.order,
                notes: entry.notes,
              })),
            });
          }
          await transaction.dayPlan.updateMany({
            where: { trainingPlanId: planId },
            data: { duration: totalDuration },
          });
          return transaction.trainingPlan.update({
            where: { id: planId },
            data: { totalDuration },
            include: {
              attendance: true,
              drills: {
                include: { drill: true },
                orderBy: [{ phase: 'asc' }, { order: 'asc' }],
              },
            },
          });
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      rethrowTacticalConflict(error);
      this.persistenceFailure('TRAINING_PLAN_DRILLS_REPLACE_FAILED');
    }
  }

  async updateBoardSnapshot(
    planId: string,
    planDrillId: string,
    boardSnapshot: Record<string, unknown>,
  ) {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const planDrill = await tx.planDrill.findFirst({
            where: { id: planDrillId, trainingPlanId: planId },
            select: {
              id: true,
              boardSnapshot: true,
              drill: { select: { jsonData: true } },
            },
          });
          if (!planDrill) {
            throw new BadRequestException(
              'Plan drill does not belong to the training plan',
            );
          }
          assertLegacyTacticalWrite(
            planDrill.boardSnapshot ?? planDrill.drill.jsonData,
          );
          return await tx.planDrill.update({
            where: { id: planDrillId },
            data: { boardSnapshot } as never,
            include: { drill: true },
          });
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      rethrowTacticalConflict(error);
      this.persistenceFailure('TRAINING_PLAN_BOARD_UPDATE_FAILED');
    }
  }

  async update(id: string, input: UpdateTrainingPlanDto) {
    const data = parseUpdateTrainingPlanBody(input);
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const needsProjection =
            data.groupId !== undefined ||
            data.title !== undefined ||
            data.date !== undefined ||
            data.notes !== undefined;
          const plan = needsProjection
            ? await transaction.trainingPlan.findUnique({
                where: { id },
                select: {
                  id: true,
                  clubId: true,
                  groupId: true,
                  drills: {
                    select: {
                      drill: {
                        select: {
                          id: true,
                          scope: true,
                          clubId: true,
                          groupId: true,
                        },
                      },
                    },
                  },
                  dayPlans: {
                    select: {
                      id: true,
                      week: {
                        select: {
                          season: {
                            select: { id: true, clubId: true, groupId: true },
                          },
                        },
                      },
                    },
                  },
                },
              })
            : null;
          if (needsProjection && !plan) {
            throw new BadRequestException('Training plan does not exist');
          }

          if (data.groupId !== undefined && plan) {
            plan.drills.forEach(({ drill }) =>
              this.assertDrillFitsPlan(
                {
                  id: plan.id,
                  clubId: plan.clubId,
                  groupId: data.groupId ?? null,
                },
                drill,
              ),
            );
            if (
              plan.dayPlans.some(
                ({ week }) =>
                  week.season.clubId !== plan.clubId ||
                  week.season.groupId !== data.groupId,
              )
            ) {
              throw new BadRequestException(
                'Training plan group must match every linked season day',
              );
            }
          }

          const date =
            data.date === undefined || data.date === null
              ? data.date
              : data.date instanceof Date
                ? data.date
                : new Date(data.date);
          if (data.date === null && plan?.dayPlans.length) {
            throw new BadRequestException(
              'Linked training plan date cannot be cleared',
            );
          }

          const dayPlanTargets = new Map<
            string,
            { weekId: string; dayOfWeek: number; date: Date }
          >();
          if (date instanceof Date && plan?.dayPlans.length) {
            for (const dayPlan of plan.dayPlans) {
              const week = await transaction.weekPlan.findFirst({
                where: {
                  seasonId: dayPlan.week.season.id,
                  startDate: { lte: date },
                  endDate: { gte: date },
                },
                select: { id: true },
              });
              if (!week) {
                throw new BadRequestException(
                  'Training plan date must belong to every linked season week',
                );
              }
              dayPlanTargets.set(dayPlan.id, {
                weekId: week.id,
                dayOfWeek: date.getDay() === 0 ? 7 : date.getDay(),
                date,
              });
            }
          }

          const updated = await transaction.trainingPlan.update({
            where: { id },
            data: {
              title: data.title,
              totalDuration: data.totalDuration,
              groupId: data.groupId,
              date,
              notes: data.notes,
            },
          });

          if (
            plan?.dayPlans.length &&
            (data.title !== undefined ||
              data.notes !== undefined ||
              data.date !== undefined)
          ) {
            await Promise.all(
              plan.dayPlans.map((dayPlan) => {
                const target = dayPlanTargets.get(dayPlan.id);
                return transaction.dayPlan.update({
                  where: { id: dayPlan.id },
                  data: {
                    title: data.title,
                    notes: data.notes,
                    ...(target
                      ? {
                          weekId: target.weekId,
                          dayOfWeek: target.dayOfWeek,
                          date: target.date,
                        }
                      : {}),
                  },
                });
              }),
            );
          }
          return updated;
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.persistenceFailure('TRAINING_PLAN_UPDATE_FAILED');
    }
  }

  private assertDrillFitsPlan(
    plan: { id: string; clubId: string; groupId: string | null },
    drill: {
      id: string;
      scope: 'GLOBAL' | 'CLUB';
      clubId: string | null;
      groupId: string | null;
    },
  ) {
    if (drill.scope === 'GLOBAL') return;
    if (drill.clubId !== plan.clubId) {
      throw new BadRequestException(
        'Club drill must belong to the training plan club',
      );
    }
    if (drill.groupId && drill.groupId !== plan.groupId) {
      throw new BadRequestException(
        'Group-scoped drill must use the training plan group',
      );
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          await transaction.dayPlan.deleteMany({
            where: { trainingPlanId: id },
          });
          await transaction.attendance.deleteMany({ where: { planId: id } });
          await transaction.planDrill.deleteMany({
            where: { trainingPlanId: id },
          });
          return transaction.trainingPlan.delete({ where: { id } });
        },
        { isolationLevel: 'Serializable' },
      );
    } catch {
      this.persistenceFailure('TRAINING_PLAN_DELETE_FAILED');
    }
  }

  private persistenceFailure(event: string): never {
    this.logger.error(event);
    throw new InternalServerErrorException({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
