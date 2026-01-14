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
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GroupsService = class GroupsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        try {
            return await this.prisma.playerGroup.create({
                data: {
                    clubId: data.clubId,
                    name: data.name,
                    ageGroup: data.ageGroup,
                    category: data.category || 'ALT_YAPI',
                },
            });
        }
        catch (error) {
            console.error('Error creating player group:', error);
            if (error.code === 'P2003') {
                throw new Error(`Invalid clubId: ${data.clubId}. Club does not exist.`);
            }
            throw error;
        }
    }
    async listByClub(clubId) {
        return this.prisma.playerGroup.findMany({
            where: { clubId },
            include: { members: true },
        });
    }
    async update(id, data) {
        console.log('GroupsService.update called:', { id, data });
        return this.prisma.playerGroup.update({
            where: { id },
            data: data,
        });
    }
    async delete(id) {
        await this.prisma.groupMember.deleteMany({
            where: { groupId: id },
        });
        return this.prisma.playerGroup.delete({
            where: { id },
        });
    }
    async addMember(groupId, userId) {
        const existing = await this.prisma.groupMember.findFirst({
            where: { groupId, userId },
        });
        if (existing) {
            throw new Error('User is already a member of this group');
        }
        return this.prisma.groupMember.create({ data: { groupId, userId } });
    }
    async removeMember(groupId, userId) {
        const member = await this.prisma.groupMember.findFirst({
            where: { groupId, userId },
        });
        if (!member) {
            throw new Error('Member not found');
        }
        return this.prisma.groupMember.delete({ where: { id: member.id } });
    }
    async getMembers(groupId) {
        return this.prisma.groupMember.findMany({
            where: { groupId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        position: true,
                    },
                },
            },
        });
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupsService);
//# sourceMappingURL=groups.service.js.map