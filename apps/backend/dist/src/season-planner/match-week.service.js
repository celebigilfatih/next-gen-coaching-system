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
exports.MatchWeekService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MatchWeekService = class MatchWeekService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.matchWeekAnalysis.create({
            data: {
                seasonId: dto.seasonId,
                weekNumber: dto.weekNumber,
                opponentName: dto.opponentName,
                userId,
                opponentAnalysis: dto.opponentAnalysis,
                setPieces: dto.setPieces,
                videoLinks: dto.videoLinks,
            },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async findBySeasonId(seasonId) {
        return this.prisma.matchWeekAnalysis.findMany({
            where: { seasonId },
            orderBy: { weekNumber: 'asc' },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });
    }
};
exports.MatchWeekService = MatchWeekService;
exports.MatchWeekService = MatchWeekService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MatchWeekService);
//# sourceMappingURL=match-week.service.js.map