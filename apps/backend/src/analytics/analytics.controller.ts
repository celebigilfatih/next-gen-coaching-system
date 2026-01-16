import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Player Performance
  @Post('player-performance')
  createPlayerPerformance(@Body() data: any) {
    return this.analyticsService.createPlayerPerformance(data);
  }

  @Get('player-performance')
  getPlayerPerformances(
    @Query('playerId') playerId?: string, 
    @Query('analysisType') analysisType?: string,
    @Query('groupId') groupId?: string
  ) {
    return this.analyticsService.getPlayerPerformances(playerId, analysisType, groupId);
  }

  @Put('player-performance/:id')
  updatePlayerPerformance(@Param('id') id: string, @Body() data: any) {
    return this.analyticsService.updatePlayerPerformance(id, data);
  }

  @Delete('player-performance/:id')
  deletePlayerPerformance(@Param('id') id: string) {
    return this.analyticsService.deletePlayerPerformance(id);
  }

  // Video Analysis
  @Post('video-analysis')
  createVideoAnalysis(@Body() data: any) {
    return this.analyticsService.createVideoAnalysis(data);
  }

  @Get('video-analysis')
  getVideoAnalyses() {
    return this.analyticsService.getVideoAnalyses();
  }

  @Put('video-analysis/:id')
  updateVideoAnalysis(@Param('id') id: string, @Body() data: any) {
    return this.analyticsService.updateVideoAnalysis(id, data);
  }

  @Delete('video-analysis/:id')
  deleteVideoAnalysis(@Param('id') id: string) {
    return this.analyticsService.deleteVideoAnalysis(id);
  }

  // Reports
  @Post('reports')
  createReport(@Body() data: any) {
    return this.analyticsService.createReport(data);
  }

  @Get('reports')
  getReports() {
    return this.analyticsService.getReports();
  }

  @Put('reports/:id')
  updateReport(@Param('id') id: string, @Body() data: any) {
    return this.analyticsService.updateReport(id, data);
  }

  @Delete('reports/:id')
  deleteReport(@Param('id') id: string) {
    return this.analyticsService.deleteReport(id);
  }

  // Team Performance
  @Post('team-performance')
  createTeamPerformance(@Body() data: any) {
    return this.analyticsService.createTeamPerformance(data);
  }

  @Get('team-performance')
  getTeamPerformances() {
    return this.analyticsService.getTeamPerformances();
  }

  @Put('team-performance/:id')
  updateTeamPerformance(@Param('id') id: string, @Body() data: any) {
    return this.analyticsService.updateTeamPerformance(id, data);
  }

  @Delete('team-performance/:id')
  deleteTeamPerformance(@Param('id') id: string) {
    return this.analyticsService.deleteTeamPerformance(id);
  }

  // Scouting Reports (Rakip Analizi standalone CRUD)
  @Post('scouting-reports')
  createScoutingReport(@Body() data: any) {
    return this.analyticsService.createScoutingReport(data);
  }

  @Get('scouting-reports')
  getScoutingReports() {
    return this.analyticsService.getScoutingReports();
  }

  @Put('scouting-reports/:id')
  updateScoutingReport(@Param('id') id: string, @Body() data: any) {
    return this.analyticsService.updateScoutingReport(id, data);
  }

  @Delete('scouting-reports/:id')
  deleteScoutingReport(@Param('id') id: string) {
    return this.analyticsService.deleteScoutingReport(id);
  }

  // Match Analysis Standalone CRUD
  @Post('match-analysis')
  createMatchAnalysis(@Body() data: any) {
    return this.analyticsService.createMatchAnalysis(data);
  }

  @Get('match-analysis')
  getMatchAnalyses() {
    return this.analyticsService.getMatchAnalyses();
  }

  @Put('match-analysis/:id')
  updateMatchAnalysisStandalone(@Param('id') id: string, @Body() data: any) {
    return this.analyticsService.updateMatchAnalysisStandalone(id, data);
  }

  @Delete('match-analysis/:id')
  deleteMatchAnalysis(@Param('id') id: string) {
    return this.analyticsService.deleteMatchAnalysis(id);
  }

  // Match & Opponent Analysis (Updating existing Match model)
  @Put('match/:id')
  updateMatchAnalysis(@Param('id') id: string, @Body() data: any) {
    return this.analyticsService.updateMatchAnalysis(id, data);
  }
}
