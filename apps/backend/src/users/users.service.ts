import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(params: {
    name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'COACH' | 'PLAYER';
    clubId?: string;
    position?: 'KALECI' | 'DEFANS' | 'ORTA_SAHA' | 'FORVET';
    birthDate?: Date;
  }) {
    const hash = await bcrypt.hash(params.password, 10);
    return this.prisma.user.create({
      data: {
        name: params.name,
        email: params.email,
        passwordHash: hash,
        role: params.role as any,
        clubId: params.clubId || null,
        position: params.position as any,
        birthDate: params.birthDate,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async listAll() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async listPlayers(clubId?: string) {
    const where: any = { role: 'PLAYER' };
    if (clubId) {
      where.clubId = clubId;
    }
    return this.prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clubId: true,
        position: true,
        birthDate: true,
      },
    });
  }

  // Health Logs
  async getPlayerHealthLogs(playerId: string) {
    return this.prisma.playerHealthLog.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addPlayerHealthLog(
    playerId: string,
    data: {
      status: 'SAGLIK' | 'HAREKET_SINIRLAMASI' | 'IZOLASYON' | 'YARALI';
      severity?: 'HAFIF' | 'ORTA' | 'CIDDI';
      bodyPart?: string;
      expectedReturnDate?: Date;
      notes?: string;
    }
  ) {
    return this.prisma.playerHealthLog.create({
      data: {
        playerId,
        status: data.status,
        severity: data.severity || null,
        bodyPart: data.bodyPart || null,
        expectedReturnDate: data.expectedReturnDate || null,
        notes: data.notes || null,
      },
    });
  }

  async deletePlayerHealthLog(logId: string) {
    return this.prisma.playerHealthLog.delete({
      where: { id: logId },
    });
  }

  // Coach Notes
  async getPlayerCoachNotes(playerId: string) {
    return this.prisma.playerCoachNote.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addPlayerCoachNote(
    playerId: string,
    data: { note: string }
  ) {
    return this.prisma.playerCoachNote.create({
      data: {
        playerId,
        note: data.note,
      },
    });
  }

  async deletePlayerCoachNote(noteId: string) {
    return this.prisma.playerCoachNote.delete({
      where: { id: noteId },
    });
  }

  // Comprehensive Health Status
  async getPlayerHealthStatus(playerId: string) {
    return this.prisma.playerHealthStatus.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addPlayerHealthStatus(
    playerId: string,
    data: {
      primaryStatus: string;
      injuryType?: string;
      muscleInjurySubtype?: string;
      ligamentInjurySubtype?: string;
      tendonInjurySubtype?: string;
      boneInjurySubtype?: string;
      bodyPart?: string;
      rehabPhase?: string;
      trainingParticipation?: string;
      estimatedReturnDays?: string;
      clinicalNotes?: string;
    }
  ) {
    return this.prisma.playerHealthStatus.create({
      data: {
        playerId,
        primaryStatus: data.primaryStatus as any,
        injuryType: data.injuryType as any || null,
        muscleInjurySubtype: data.muscleInjurySubtype as any || null,
        ligamentInjurySubtype: data.ligamentInjurySubtype as any || null,
        tendonInjurySubtype: data.tendonInjurySubtype as any || null,
        boneInjurySubtype: data.boneInjurySubtype as any || null,
        bodyPart: data.bodyPart as any || null,
        rehabPhase: data.rehabPhase as any || null,
        trainingParticipation: data.trainingParticipation as any || null,
        estimatedReturnDays: data.estimatedReturnDays as any || null,
        clinicalNotes: data.clinicalNotes || null,
      },
    });
  }

  async deletePlayerHealthStatus(statusId: string) {
    return this.prisma.playerHealthStatus.delete({
      where: { id: statusId },
    });
  }

  async updatePlayerHealthStatus(
    statusId: string,
    data: {
      primaryStatus?: string;
      injuryType?: string;
      muscleInjurySubtype?: string;
      ligamentInjurySubtype?: string;
      tendonInjurySubtype?: string;
      boneInjurySubtype?: string;
      bodyPart?: string;
      rehabPhase?: string;
      trainingParticipation?: string;
      estimatedReturnDays?: string;
      clinicalNotes?: string;
    }
  ) {
    const updateData: any = {};
    if (data.primaryStatus !== undefined) updateData.primaryStatus = data.primaryStatus;
    if (data.injuryType !== undefined) updateData.injuryType = data.injuryType;
    if (data.muscleInjurySubtype !== undefined) updateData.muscleInjurySubtype = data.muscleInjurySubtype;
    if (data.ligamentInjurySubtype !== undefined) updateData.ligamentInjurySubtype = data.ligamentInjurySubtype;
    if (data.tendonInjurySubtype !== undefined) updateData.tendonInjurySubtype = data.tendonInjurySubtype;
    if (data.boneInjurySubtype !== undefined) updateData.boneInjurySubtype = data.boneInjurySubtype;
    if (data.bodyPart !== undefined) updateData.bodyPart = data.bodyPart;
    if (data.rehabPhase !== undefined) updateData.rehabPhase = data.rehabPhase;
    if (data.trainingParticipation !== undefined) updateData.trainingParticipation = data.trainingParticipation;
    if (data.estimatedReturnDays !== undefined) updateData.estimatedReturnDays = data.estimatedReturnDays;
    if (data.clinicalNotes !== undefined) updateData.clinicalNotes = data.clinicalNotes;

    return this.prisma.playerHealthStatus.update({
      where: { id: statusId },
      data: updateData,
    });
  }
}
