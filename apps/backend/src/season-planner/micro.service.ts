import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMicroDto } from './dto/create-micro.dto';

@Injectable()
export class MicroService {
  constructor(private prisma: PrismaService) {}

  async create(seasonId: string, dto: CreateMicroDto) {
    return this.prisma.microCycle.create({
      data: {
        seasonId,
        weekNumber: dto.weekNumber,
        dayPlans: dto.dayPlans,
      },
    });
  }

  async update(id: string, dayPlans: any[]) {
    return this.prisma.microCycle.update({
      where: { id },
      data: { dayPlans },
    });
  }

  async findBySeasonAndWeek(seasonId: string, weekNumber: number) {
    return this.prisma.microCycle.findFirst({
      where: { seasonId, weekNumber },
    });
  }
}
