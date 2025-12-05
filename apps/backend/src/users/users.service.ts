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
  }) {
    const hash = await bcrypt.hash(params.password, 10);
    return this.prisma.user.create({
      data: {
        name: params.name,
        email: params.email,
        passwordHash: hash,
        role: params.role as any,
        clubId: params.clubId || null,
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
      },
    });
  }
}
