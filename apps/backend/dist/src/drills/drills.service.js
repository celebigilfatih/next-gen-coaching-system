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
exports.DrillsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DrillsService = class DrillsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filters) {
        return this.prisma.drill.findMany({
            where: {
                category: filters.category,
                ageGroup: filters.ageGroup,
                difficulty: filters.difficulty,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(data) {
        return this.prisma.drill.create({ data: data });
    }
    async get(id) {
        return this.prisma.drill.findUnique({ where: { id } });
    }
    async update(id, data) {
        return this.prisma.drill.update({ where: { id }, data: data });
    }
    async remove(id) {
        return this.prisma.drill.delete({ where: { id } });
    }
};
exports.DrillsService = DrillsService;
exports.DrillsService = DrillsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DrillsService);
//# sourceMappingURL=drills.service.js.map