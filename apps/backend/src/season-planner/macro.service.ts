import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMacroDto } from './dto/create-macro.dto';

@Injectable()
export class MacroService {
  constructor(private prisma: PrismaService) {}

  async create(seasonId: string, dto: CreateMacroDto) {
    return this.prisma.macroCycle.create({
      data: {
        seasonId,
        title: dto.title,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        type: dto.type,
        intensity: dto.intensity ?? 5,
        notes: dto.notes,
      },
    });
  }

  async findBySeasonId(seasonId: string) {
    return this.prisma.macroCycle.findMany({
      where: { seasonId },
      orderBy: { startDate: 'asc' },
      include: {
        mesos: true,
      },
    });
  }
}
