import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TrainingPlansService } from './training-plans.service';
import { validateTacticalBoardDocument } from '../tactics/tactical-board';

@Controller('training-plans')
@UseGuards(AuthGuard('jwt'))
export class TrainingPlansController {
  constructor(
    private readonly plans: TrainingPlansService,
    private readonly authorization: AuthorizationService,
  ) {}

  @Get()
  async list(
    @Req() req: { user: AuthPrincipal },
    @Query('clubId') clubId?: string,
    @Query('coachId') coachId?: string,
    @Query('groupId') groupId?: string,
  ) {
    return this.plans.listForPrincipal(req.user, {
      clubId,
      coachId,
      groupId,
    });
  }

  @Get('my')
  async my(@Req() req: { user: AuthPrincipal }) {
    return this.plans.listForPrincipal(req.user, {});
  }

  @Get(':id')
  async get(@Req() req: { user: AuthPrincipal }, @Param('id') id: string) {
    await this.authorization.assertPlanView(req.user, id);
    return this.plans.get(id, req.user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async create(
    @Req() req: { user: AuthPrincipal },
    @Body()
    body: {
      title: string;
      clubId?: string;
      coachId?: string;
      groupId?: string;
      date?: string | Date;
      notes?: string;
    },
  ) {
    const principal = req.user;
    const clubId =
      principal.role === 'SYSTEM_ADMIN' ? body.clubId : principal.clubId;
    const coachId = principal.role === 'COACH' ? principal.id : body.coachId;
    if (!clubId || !coachId) {
      throw new BadRequestException('clubId and coachId are required');
    }

    if (principal.role === 'CLUB_ADMIN') {
      this.authorization.assertClubManage(principal, clubId);
    }
    await this.authorization.assertCoachInClub(coachId, clubId);

    if (body.groupId) {
      const group =
        principal.role === 'COACH'
          ? await this.authorization.assertCoachGroupAssignment(
              principal,
              body.groupId,
            )
          : await this.authorization.assertGroupView(principal, body.groupId);
      if (group.clubId !== clubId) {
        throw new BadRequestException('Group must belong to the plan club');
      }
    } else if (principal.role === 'COACH') {
      throw new BadRequestException('COACH plans require an assigned group');
    }

    return this.plans.create({
      title: body.title,
      clubId,
      coachId,
      groupId: body.groupId,
      date: body.date,
      notes: body.notes,
    });
  }

  @Post(':id/drills')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async addDrill(
    @Req() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body()
    body: {
      drillId: string;
      phase: 'WARM_UP' | 'TECHNICAL' | 'TACTICAL' | 'COOL_DOWN';
      order: number;
      notes?: string;
    },
  ) {
    await this.authorization.assertPlanManage(req.user, id);
    await this.authorization.assertDrillView(req.user, body.drillId);
    return this.plans.addDrill(
      id,
      body.drillId,
      body.phase,
      body.order,
      body.notes,
    );
  }

  @Put(':id/drills')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async replaceDrills(
    @Req() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body()
    body: {
      drills: Array<{
        drillId: string;
        phase: 'WARM_UP' | 'TECHNICAL' | 'TACTICAL' | 'COOL_DOWN';
        order: number;
        notes?: string;
      }>;
    },
  ) {
    await this.authorization.assertPlanManage(req.user, id);
    await Promise.all(
      [...new Set(body.drills.map((entry) => entry.drillId))].map((drillId) =>
        this.authorization.assertDrillView(req.user, drillId),
      ),
    );
    return this.plans.replaceDrills(id, body.drills);
  }

  @Put(':planId/drills/:planDrillId/board')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async updateBoardSnapshot(
    @Req() req: { user: AuthPrincipal },
    @Param('planId') planId: string,
    @Param('planDrillId') planDrillId: string,
    @Body() body: { boardSnapshot: unknown },
  ) {
    await this.authorization.assertPlanManage(req.user, planId);
    await this.authorization.assertPlanDrillSourceView(
      req.user,
      planId,
      planDrillId,
    );
    const boardSnapshot = validateTacticalBoardDocument(body.boardSnapshot);
    return this.plans.updateBoardSnapshot(planId, planDrillId, boardSnapshot);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async update(
    @Req() req: { user: AuthPrincipal },
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      totalDuration?: number;
      groupId?: string;
      date?: string | Date;
      notes?: string;
    },
  ) {
    const plan = await this.authorization.assertPlanManage(req.user, id);
    if (body.groupId) {
      const group =
        req.user.role === 'COACH'
          ? await this.authorization.assertCoachGroupAssignment(
              req.user,
              body.groupId,
            )
          : await this.authorization.assertGroupView(req.user, body.groupId);
      if (group.clubId !== plan.clubId) {
        throw new BadRequestException('Group must belong to the plan club');
      }
    }
    return this.plans.update(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH')
  async remove(@Req() req: { user: AuthPrincipal }, @Param('id') id: string) {
    await this.authorization.assertPlanManage(req.user, id);
    return this.plans.remove(id);
  }
}
