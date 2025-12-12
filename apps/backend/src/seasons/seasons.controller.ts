import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SeasonsService } from './seasons.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('seasons')
@UseGuards(AuthGuard('jwt'))
export class SeasonsController {
  constructor(private seasons: SeasonsService) {}

  @Post()
  async createSeason(
    @Request() req,
    @Body()
    body: {
      name: string;
      startDate: string;
      endDate: string;
      clubId?: string;
    },
  ) {
    console.log('Creating season, user:', req.user);
    console.log('Body:', body);
    
    if (!req.user || !req.user.id) {
      throw new Error('User not authenticated or user ID missing');
    }
    
    return this.seasons.createSeason(req.user.id, {
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    });
  }

  @Get()
  async listSeasons(@Request() req) {
    return this.seasons.listSeasons(req.user.id, req.user.clubId);
  }

  // Generate weeks for a season - MUST be before :id route
  @Post(':id/generate-weeks')
  async generateWeeks(@Param('id') id: string) {
    return this.seasons.generateWeeks(id);
  }

  // Week Plans - MUST be before :id route
  @Post(':seasonId/weeks')
  async createWeek(
    @Param('seasonId') seasonId: string,
    @Body()
    body: {
      weekNumber: number;
      startDate: string;
      endDate: string;
      notes?: string;
    },
  ) {
    return this.seasons.createWeek(seasonId, {
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    });
  }

  @Get(':seasonId/weeks/:weekNumber')
  async getWeek(
    @Param('seasonId') seasonId: string,
    @Param('weekNumber') weekNumber: string,
  ) {
    return this.seasons.getWeek(seasonId, parseInt(weekNumber));
  }

  @Put('weeks/:weekId')
  async updateWeek(
    @Param('weekId') weekId: string,
    @Body() body: { notes?: string; totalLoad?: number },
  ) {
    return this.seasons.updateWeek(weekId, body);
  }

  // Day Plans
  @Post('weeks/:weekId/days')
  async createOrUpdateDay(
    @Param('weekId') weekId: string,
    @Body()
    body: {
      dayOfWeek: number;
      date: string;
      type: 'TRAINING' | 'MATCH' | 'REST' | 'RECOVERY' | 'TACTICAL';
      title?: string;
      drillIds?: string[];
      duration?: number;
      intensity?: number;
      notes?: string;
    },
  ) {
    return this.seasons.createOrUpdateDay(weekId, {
      ...body,
      date: new Date(body.date),
    });
  }

  @Post('days/:dayId/toggle-completed')
  async toggleDayCompleted(@Param('dayId') dayId: string) {
    return this.seasons.toggleDayCompleted(dayId);
  }

  @Delete('days/:dayId')
  async deleteDay(@Param('dayId') dayId: string) {
    return this.seasons.deleteDay(dayId);
  }

  // Matches - MUST be before :id route
  @Post(':seasonId/matches')
  async createMatch(
    @Param('seasonId') seasonId: string,
    @Body()
    body: {
      date: string;
      opponent: string;
      location: string;
      competition?: string;
      notes?: string;
    },
  ) {
    return this.seasons.createMatch(seasonId, {
      ...body,
      date: new Date(body.date),
    });
  }

  @Get(':seasonId/matches')
  async listMatches(@Param('seasonId') seasonId: string) {
    return this.seasons.listMatches(seasonId);
  }

  @Put('matches/:matchId')
  async updateMatch(@Param('matchId') matchId: string, @Body() body: any) {
    return this.seasons.updateMatch(matchId, body);
  }

  @Delete('matches/:matchId')
  async deleteMatch(@Param('matchId') matchId: string) {
    return this.seasons.deleteMatch(matchId);
  }

  // Generic :id routes MUST be last
  @Get(':id')
  async getSeason(@Param('id') id: string) {
    const season = await this.seasons.getSeason(id);
    // Debug logging
    console.log('Season fetch - ID:', id);
    console.log('Season fetch - Weeks count:', season?.weeks?.length || 0);
    if (season?.weeks?.[0]) {
      console.log('Season fetch - First week has days:', season.weeks[0].days?.length || 0);
      if (season.weeks[0].days?.[0]) {
        console.log('Season fetch - First day has trainingPlan:', !!season.weeks[0].days[0].trainingPlan);
      }
    }
    return season;
  }

  @Delete(':id')
  async deleteSeason(@Param('id') id: string) {
    return this.seasons.deleteSeason(id);
  }
}
