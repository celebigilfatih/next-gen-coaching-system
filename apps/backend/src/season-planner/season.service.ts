import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';

@Injectable()
export class SeasonService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSeasonDto) {
    return this.prisma.season.create({
      data: {
        name: dto.name,
        clubId: dto.clubId,
        userId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
      include: {
        club: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findAll(clubId?: string) {
    return this.prisma.season.findMany({
      where: clubId ? { clubId } : undefined,
      include: {
        club: true,
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { macros: true, micros: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const season = await this.prisma.season.findUnique({
      where: { id },
      include: {
        club: true,
        createdBy: { select: { id: true, name: true, email: true } },
        macros: { orderBy: { startDate: 'asc' } },
        mesos: { orderBy: { startWeek: 'asc' } },
        micros: { orderBy: { weekNumber: 'asc' } },
        matchWeeks: { orderBy: { weekNumber: 'asc' } },
      },
    });

    if (!season) {
      throw new NotFoundException(`Season ${id} not found`);
    }

    return season;
  }

  async update(id: string, dto: UpdateSeasonDto) {
    const data: any = {};
    if (dto.name) data.name = dto.name;
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);

    return this.prisma.season.update({
      where: { id },
      data,
      include: {
        club: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.season.delete({ where: { id } });
  }
}
