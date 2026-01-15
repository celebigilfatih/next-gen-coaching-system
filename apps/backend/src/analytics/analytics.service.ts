import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // Player Performance CRUD
  async createPlayerPerformance(data: any) {
    const { id, player, createdAt, updatedAt, ...createData } = data;
    if (createData.date) createData.date = new Date(createData.date);
    return this.prisma.playerPerformance.create({ data: createData });
  }

  async getPlayerPerformances(playerId?: string, analysisType?: string) {
    const whereClause: any = {};
    if (playerId) whereClause.playerId = playerId;
    if (analysisType) whereClause.analysisType = analysisType;
    
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

  async deleteReport(id: string) {
    return this.prisma.analysisReport.delete({ where: { id } });
  }

  // Team Performance CRUD
  async createTeamPerformance(data: any) {
    const { id, createdAt, updatedAt, ...createData } = data;
    if (createData.date) createData.date = new Date(createData.date);
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
    return this.prisma.matchAnalysis.update({ where: { id }, data: sanitizedData });
  }

  async deleteMatchAnalysis(id: string) {
    return this.prisma.matchAnalysis.delete({ where: { id } });
  }

  // Match & Opponent Analysis (Updating Match model)
  async updateMatchAnalysis(matchId: string, data: { opponentAnalysis?: any; videoLinks?: any; notes?: string; ourFormation?: string }) {
    return this.prisma.match.update({
      where: { id: matchId },
      data,
    });
  }
}
