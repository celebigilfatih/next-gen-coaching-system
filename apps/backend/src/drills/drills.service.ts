import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DrillsService {
  constructor(private prisma: PrismaService) {}

  async list(filters: {
    category?: string;
    ageGroup?: string;
    difficulty?: string;
  }) {
    return this.prisma.drill.findMany({
      where: {
        category: filters.category as any,
        ageGroup: filters.ageGroup as any,
        difficulty: filters.difficulty as any,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    title: string;
    category: string;
    ageGroup: string;
    durationMin: number;
    difficulty: string;
    equipment?: string;
    jsonData: any;
    imageUrl?: string;
  }) {
    return this.prisma.drill.create({ data: data as any });
  }

  async get(id: string) {
    return this.prisma.drill.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      category: string;
      ageGroup: string;
      durationMin: number;
      difficulty: string;
      equipment?: string;
      jsonData: any;
      imageUrl?: string;
    }>,
  ) {
    return this.prisma.drill.update({ where: { id }, data: data as any });
  }

  async remove(id: string) {
    return this.prisma.drill.delete({ where: { id } });
  }
}
