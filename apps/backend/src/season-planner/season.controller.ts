import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SeasonService } from './season.service';
import { MacroService } from './macro.service';
import { MesoService } from './meso.service';
import { MicroService } from './micro.service';
import { MatchWeekService } from './match-week.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { CreateMacroDto } from './dto/create-macro.dto';
import { CreateMesoDto } from './dto/create-meso.dto';
import { CreateMicroDto } from './dto/create-micro.dto';
import { CreateMatchWeekDto } from './dto/create-match-week.dto';

@Controller('seasons')
@UseGuards(AuthGuard('jwt'))
export class SeasonController {
  constructor(
    private readonly seasonService: SeasonService,
    private readonly macroService: MacroService,
    private readonly mesoService: MesoService,
    private readonly microService: MicroService,
    private readonly matchWeekService: MatchWeekService,
  ) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateSeasonDto) {
    return this.seasonService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Query('clubId') clubId?: string) {
    return this.seasonService.findAll(clubId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seasonService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSeasonDto) {
    return this.seasonService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seasonService.remove(id);
  }

  // Macro cycles
  @Post(':id/macros')
  createMacro(@Param('id') seasonId: string, @Body() dto: CreateMacroDto) {
    return this.macroService.create(seasonId, dto);
  }

  @Get(':id/macros')
  getMacros(@Param('id') seasonId: string) {
    return this.macroService.findBySeasonId(seasonId);
  }

  // Meso cycles
  @Post(':id/meso')
  createMeso(@Param('id') seasonId: string, @Body() dto: CreateMesoDto) {
    return this.mesoService.create(seasonId, dto);
  }

  // Micro cycles
  @Post(':id/micro')
  createMicro(@Param('id') seasonId: string, @Body() dto: CreateMicroDto) {
    return this.microService.create(seasonId, dto);
  }

  @Get(':id/micro/:week')
  getMicro(@Param('id') seasonId: string, @Param('week') week: string) {
    return this.microService.findBySeasonAndWeek(seasonId, parseInt(week));
  }

  // Match week analysis
  @Get(':id/matchweeks')
  getMatchWeeks(@Param('id') seasonId: string) {
    return this.matchWeekService.findBySeasonId(seasonId);
  }
}

@Controller('matchweekanalysis')
@UseGuards(AuthGuard('jwt'))
export class MatchWeekController {
  constructor(private readonly matchWeekService: MatchWeekService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateMatchWeekDto) {
    return this.matchWeekService.create(req.user.userId, dto);
  }
}
