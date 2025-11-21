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
exports.ClubsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClubsService = class ClubsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createClub(data) {
        return this.prisma.club.create({ data });
    }
    async listClubs() {
        return this.prisma.club.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async getClubById(clubId) {
        return this.prisma.club.findUnique({ where: { id: clubId } });
    }
    async addUserToClub(userId, clubId) {
        return this.prisma.user.update({ where: { id: userId }, data: { clubId } });
    }
    async createGroup(clubId, name, ageGroup) {
        return this.prisma.playerGroup.create({
            data: { clubId, name, ageGroup: ageGroup },
        });
    }
    async listGroups(clubId) {
        return this.prisma.playerGroup.findMany({ where: { clubId } });
    }
};
exports.ClubsService = ClubsService;
exports.ClubsService = ClubsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClubsService);
//# sourceMappingURL=clubs.service.js.map