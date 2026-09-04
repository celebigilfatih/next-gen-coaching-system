import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  /**
   * AnalyticsService handles CRUD operations for various analytics models including
   * PlayerPerformance, VideoAnalysis, AnalysisReport, TeamPerformance, ScoutingReport, and MatchAnalysis.
   */
  constructor(private prisma: PrismaService) {}

  // Player Performance CRUD
  async createPlayerPerformance(data: any) {
    const { id, player, createdAt, updatedAt, ...createData } = data;
    if (createData.date) createData.date = new Date(createData.date);
    // Ensure numeric fields are correctly typed
    if (createData.rating !== undefined) createData.rating = parseFloat(createData.rating);
    if (createData.speed !== undefined) createData.speed = parseInt(createData.speed);
    if (createData.technique !== undefined) createData.technique = parseInt(createData.technique);
    if (createData.endurance !== undefined) createData.endurance = parseInt(createData.endurance);
    if (createData.tactical !== undefined) createData.tactical = parseInt(createData.tactical);
    if (createData.form !== undefined) createData.form = parseInt(createData.form);
    return this.prisma.playerPerformance.create({ data: createData });
  }

  async getPlayerPerformances(playerId?: string, analysisType?: string, groupId?: string) {
    const whereClause: any = {};
    if (playerId && playerId !== 'ALL') whereClause.playerId = playerId;
    if (analysisType && analysisType !== 'ALL') whereClause.analysisType = analysisType;
    if (groupId && groupId !== 'ALL') {
      whereClause.player = {
        groups: {
          some: {
            groupId: groupId
          }
        }
      };
    }
    
    return this.prisma.playerPerformance.findMany({
      where: whereClause,
      include: { 
        player: { 
          select: { 
            id: true,
            name: true, 
            position: true,
            groups: {
              select: {
                groupId: true,
                group: {
                  select: {
                    name: true,
                    ageGroup: true
                  }
                }
              }
            }
          } 
        } 
      },
      orderBy: { date: 'desc' },
    });
  }

  async updatePlayerPerformance(id: string, data: any) {
    // Sanitize data to remove non-Prisma fields and ID
    const { id: _id, player, createdAt, updatedAt, ...sanitizedData } = data;
    if (sanitizedData.date) sanitizedData.date = new Date(sanitizedData.date);
    if (sanitizedData.rating !== undefined) sanitizedData.rating = parseFloat(sanitizedData.rating);
    if (sanitizedData.speed !== undefined) sanitizedData.speed = parseInt(sanitizedData.speed);
    if (sanitizedData.technique !== undefined) sanitizedData.technique = parseInt(sanitizedData.technique);
    if (sanitizedData.endurance !== undefined) sanitizedData.endurance = parseInt(sanitizedData.endurance);
    if (sanitizedData.tactical !== undefined) sanitizedData.tactical = parseInt(sanitizedData.tactical);
    if (sanitizedData.form !== undefined) sanitizedData.form = parseInt(sanitizedData.form);
    return this.prisma.playerPerformance.update({ 
      where: { id }, 
      data: sanitizedData 
    });
  }

  async deletePlayerPerformance(id: string) {
    return this.prisma.playerPerformance.delete({ where: { id } });
  }

  // Video Analysis CRUD
  async createVideoAnalysis(data: any) {
    const { id, createdAt, updatedAt, ...createData } = data;
    if (createData.date) createData.date = new Date(createData.date);
    if (createData.clipsCount !== undefined) createData.clipsCount = parseInt(createData.clipsCount);
    return this.prisma.videoAnalysis.create({ data: createData });
  }

  async getVideoAnalyses() {
    return this.prisma.videoAnalysis.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async updateVideoAnalysis(id: string, data: any) {
    const { id: _id, createdAt, updatedAt, ...sanitizedData } = data;
    if (sanitizedData.date) sanitizedData.date = new Date(sanitizedData.date);
    if (sanitizedData.clipsCount !== undefined) sanitizedData.clipsCount = parseInt(sanitizedData.clipsCount);
    return this.prisma.videoAnalysis.update({ where: { id }, data: sanitizedData });
  }

  async deleteVideoAnalysis(id: string) {
    return this.prisma.videoAnalysis.delete({ where: { id } });
  }

  // Reports CRUD
  async createReport(data: any) {
    const { id, createdAt, updatedAt, ...createData } = data;
    if (createData.date) createData.date = new Date(createData.date);
    return this.prisma.analysisReport.create({ data: createData });
  }

  async getReports() {
    return this.prisma.analysisReport.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async updateReport(id: string, data: any) {
    const { id: _id, createdAt, updatedAt, ...sanitizedData } = data;
    if (sanitizedData.date) sanitizedData.date = new Date(sanitizedData.date);
    return this.prisma.analysisReport.update({ where: { id }, data: sanitizedData });
  }

  async deleteReport(id: string) {
    return this.prisma.analysisReport.delete({ where: { id } });
  }

  // Team Performance CRUD
  async createTeamPerformance(data: any) {
    const { id, createdAt, updatedAt, ...createData } = data;
    if (createData.date) createData.date = new Date(createData.date);
    if (createData.rating !== undefined) createData.rating = parseFloat(createData.rating);
    if (createData.passAccuracy !== undefined) createData.passAccuracy = parseInt(createData.passAccuracy);
    if (createData.possession !== undefined) createData.possession = parseInt(createData.possession);
    if (createData.shotsOnTarget !== undefined) createData.shotsOnTarget = parseInt(createData.shotsOnTarget);
    if (createData.goalsScored !== undefined) createData.goalsScored = parseInt(createData.goalsScored);
    if (createData.goalsConceded !== undefined) createData.goalsConceded = parseInt(createData.goalsConceded);
    return this.prisma.teamPerformance.create({ data: createData });
  }

  async getTeamPerformances() {
    return this.prisma.teamPerformance.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async updateTeamPerformance(id: string, data: any) {
    const { id: _id, createdAt, updatedAt, ...sanitizedData } = data;
    if (sanitizedData.date) sanitizedData.date = new Date(sanitizedData.date);
    if (sanitizedData.rating !== undefined) sanitizedData.rating = parseFloat(sanitizedData.rating);
    if (sanitizedData.passAccuracy !== undefined) sanitizedData.passAccuracy = parseInt(sanitizedData.passAccuracy);
    if (sanitizedData.possession !== undefined) sanitizedData.possession = parseInt(sanitizedData.possession);
    if (sanitizedData.shotsOnTarget !== undefined) sanitizedData.shotsOnTarget = parseInt(sanitizedData.shotsOnTarget);
    if (sanitizedData.goalsScored !== undefined) sanitizedData.goalsScored = parseInt(sanitizedData.goalsScored);
    if (sanitizedData.goalsConceded !== undefined) sanitizedData.goalsConceded = parseInt(sanitizedData.goalsConceded);
    return this.prisma.teamPerformance.update({ where: { id }, data: sanitizedData });
  }

  async deleteTeamPerformance(id: string) {
    return this.prisma.teamPerformance.delete({ where: { id } });
  }

  // Scouting Report CRUD (Rakip Analizi)
  async createScoutingReport(data: any) {
    const { id, createdAt, updatedAt, ...createData } = data;
    if (createData.date) createData.date = new Date(createData.date);
    return this.prisma.scoutingReport.create({ data: createData });
  }

  async getScoutingReports() {
    return this.prisma.scoutingReport.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async updateScoutingReport(id: string, data: any) {
    const { id: _id, createdAt, updatedAt, ...sanitizedData } = data;
    if (sanitizedData.date) sanitizedData.date = new Date(sanitizedData.date);
    return this.prisma.scoutingReport.update({ where: { id }, data: sanitizedData });
  }

  async deleteScoutingReport(id: string) {
    return this.prisma.scoutingReport.delete({ where: { id } });
  }

  // Match Analysis CRUD (Standalone)
  async createMatchAnalysis(data: any) {
    const { id, createdAt, updatedAt, ...createData } = data;
    if (createData.date) createData.date = new Date(createData.date);
    if (createData.rating !== undefined) createData.rating = parseFloat(createData.rating);
    if (createData.possession !== undefined) createData.possession = parseInt(createData.possession);
    if (createData.passAccuracy !== undefined) createData.passAccuracy = parseInt(createData.passAccuracy);
    if (createData.shotsOnTarget !== undefined) createData.shotsOnTarget = parseInt(createData.shotsOnTarget);
    if (createData.goalsScored !== undefined) createData.goalsScored = parseInt(createData.goalsScored);
    if (createData.goalsConceded !== undefined) createData.goalsConceded = parseInt(createData.goalsConceded);
    return this.prisma.matchAnalysis.create({ data: createData });
  }

  async getMatchAnalyses() {
    return this.prisma.matchAnalysis.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async updateMatchAnalysisStandalone(id: string, data: any) {
    const { id: _id, createdAt, updatedAt, ...sanitizedData } = data;
    if (sanitizedData.date) sanitizedData.date = new Date(sanitizedData.date);
    if (sanitizedData.rating !== undefined) sanitizedData.rating = parseFloat(sanitizedData.rating);
    if (sanitizedData.possession !== undefined) sanitizedData.possession = parseInt(sanitizedData.possession);
    if (sanitizedData.passAccuracy !== undefined) sanitizedData.passAccuracy = parseInt(sanitizedData.passAccuracy);
    if (sanitizedData.shotsOnTarget !== undefined) sanitizedData.shotsOnTarget = parseInt(sanitizedData.shotsOnTarget);
    if (sanitizedData.goalsScored !== undefined) sanitizedData.goalsScored = parseInt(sanitizedData.goalsScored);
    if (sanitizedData.goalsConceded !== undefined) sanitizedData.goalsConceded = parseInt(sanitizedData.goalsConceded);
    return this.prisma.matchAnalysis.update({ where: { id }, data: sanitizedData });
  }

  async deleteMatchAnalysis(id: string) {
    return this.prisma.matchAnalysis.delete({ where: { id } });
  }

  // Match & Opponent Analysis (Updating Match model)
  async updateMatchAnalysis(matchId: string, data: any) {
    const { id, createdAt, updatedAt, ...sanitizedData } = data;
    
    // Only allow fields that exist in the Match model
    const allowedFields = [
      'opponentAnalysis', 'ourFormation', 'notes', 'videoLinks', 
      'result', 'date', 'opponent', 'location', 'competition', 'groupId'
    ];
    
    const filteredData: any = {};
    for (const key of allowedFields) {
      if (sanitizedData[key] !== undefined) {
        filteredData[key] = sanitizedData[key];
      }
    }

    if (filteredData.date) filteredData.date = new Date(filteredData.date);

    return this.prisma.match.update({
      where: { id: matchId },
      data: filteredData,
    });
  }
}
