import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TrainingPlansService } from './training-plans.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('training-plans')
export class TrainingPlansController {
  constructor(private plans: TrainingPlansService) {}

  @Get()
  async list(
    @Query('clubId') clubId: string,
    @Query('coachId') coachId: string,
    @Query('groupId') groupId: string,
  ) {
    return this.plans.list({ clubId, coachId, groupId });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  async my(@Req() req: any) {
    return this.plans.listForUser(req.user.userId);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.plans.get(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() body: any) {
    return this.plans.create(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/drills')
  async addDrill(
    @Param('id') id: string,
    @Body()
    body: {
      drillId: string;
      phase: 'WARM_UP' | 'TECHNICAL' | 'TACTICAL' | 'COOL_DOWN';
      order: number;
      notes?: string;
    },
  ) {
    return this.plans.addDrill(
      id,
      body.drillId,
      body.phase,
      body.order,
      body.notes,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.plans.update(id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.plans.remove(id);
  }
}
