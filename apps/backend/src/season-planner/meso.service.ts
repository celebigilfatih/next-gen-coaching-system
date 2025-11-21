import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMesoDto } from './dto/create-meso.dto';

@Injectable()
export class MesoService {
  constructor(private prisma: PrismaService) {}

  async create(seasonId: string, dto: CreateMesoDto) {
    return this.prisma.mesoCycle.create({
      data: {
        seasonId,
        macroId: dto.macroId,
        startWeek: dto.startWeek,
        endWeek: dto.endWeek,
        goal: dto.goal,
        intensityJson: dto.intensityJson,
      },
    });
  }
}
