"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeasonService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SeasonService = class SeasonService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
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
    async findAll(clubId) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Season ${id} not found`);
        }
        return season;
    }
    async update(id, dto) {
        const data = {};
        if (dto.name)
            data.name = dto.name;
        if (dto.startDate)
            data.startDate = new Date(dto.startDate);
        if (dto.endDate)
            data.endDate = new Date(dto.endDate);
        return this.prisma.season.update({
            where: { id },
            data,
            include: {
                club: true,
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async remove(id) {
        return this.prisma.season.delete({ where: { id } });
    }
};
exports.SeasonService = SeasonService;
exports.SeasonService = SeasonService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeasonService);
//# sourceMappingURL=season.service.js.map