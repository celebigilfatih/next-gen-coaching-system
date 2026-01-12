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
exports.TrainingPlansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TrainingPlansService = class TrainingPlansService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filters) {
        const where = {};
        if (filters.clubId)
            where.clubId = filters.clubId;
        if (filters.coachId)
            where.coachId = filters.coachId;
        if (filters.groupId)
            where.groupId = filters.groupId;
        return this.prisma.trainingPlan.findMany({
            where,
            include: { attendance: true, drills: { include: { drill: true } } },
        });
    }
    async get(id) {
        return this.prisma.trainingPlan.findUnique({
            where: { id },
            include: {
                drills: { include: { drill: true } },
                attendance: { include: { player: true } },
                group: { include: { members: { include: { user: true } } } },
            },
        });
    }
    async create(data) {
        const plan = await this.prisma.trainingPlan.create({ data: data });
        if (data.date) {
            await this.linkPlanToSeasonDay(plan.id, plan.clubId, data.date);
        }
        return plan;
    }
    async linkPlanToSeasonDay(planId, clubId, date) {
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            console.log('🔗 Linking plan to season day:', { planId, clubId, date: dateObj.toISOString() });
            const seasons = await this.prisma.season.findMany({
                where: {
                    OR: [
                        { clubId },
                        { clubId: null },
                    ],
                    startDate: { lte: dateObj },
                    endDate: { gte: dateObj },
                },
                include: {
                    weeks: {
                        where: {
                            startDate: { lte: dateObj },
                            endDate: { gte: dateObj },
                        },
                    },
                },
            });
            console.log(`📅 Found ${seasons.length} seasons for club ${clubId}`);
            if (seasons.length === 0) {
                console.warn('⚠️  No active season found for this date:', dateObj.toISOString());
                console.warn('⚠️  Please create a season that includes this date.');
                const allSeasons = await this.prisma.season.findMany({
                    where: { clubId },
                    select: { id: true, name: true, startDate: true, endDate: true },
                });
                console.log('📋 Available seasons for this club:', allSeasons);
                return;
            }
            const seasonWeeks = seasons[0].weeks || [];
            if (seasonWeeks.length === 0) {
                console.warn('⚠️  Season found but no weeks for this date.');
                console.warn('⚠️  Season:', seasons[0].id, seasons[0].name);
                console.warn('⚠️  Looking for week containing:', dateObj.toISOString());
                const allWeeks = await this.prisma.weekPlan.findMany({
                    where: { seasonId: seasons[0].id },
                    select: { weekNumber: true, startDate: true, endDate: true },
                    orderBy: { weekNumber: 'asc' },
                });
                console.log('📋 All weeks in season:', allWeeks);
                if (allWeeks.length === 0) {
                    console.warn('⚠️  No weeks exist at all. Please generate weeks first.');
                }
                else {
                    console.warn('⚠️  Weeks exist but date doesn\'t fall within any week range.');
                }
                return;
            }
            const week = seasonWeeks[0];
            const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay();
            console.log(`📆 Found week: ${week.weekNumber}, day: ${dayOfWeek}`);
            const trainingPlan = await this.prisma.trainingPlan.findUnique({
                where: { id: planId },
                include: {
                    drills: { include: { drill: true } },
                },
            });
            if (!trainingPlan) {
                console.error('❌ Training plan not found:', planId);
                return;
            }
            console.log(`📋 Creating day plan with ${trainingPlan.drills.length} drills`);
            const dayPlan = await this.prisma.dayPlan.create({
                data: {
                    weekId: week.id,
                    dayOfWeek,
                    date: dateObj,
                    type: 'TRAINING',
                    title: trainingPlan.title,
                    trainingPlanId: planId,
                    duration: trainingPlan.totalDuration,
                    notes: `Kayıtlı Antrenman: ${trainingPlan.drills.length} drill`,
                },
            });
            console.log('✅ Day plan created successfully:', dayPlan.id);
        }
        catch (error) {
            console.error('❌ Error linking plan to season day:', error);
        }
    }
    async addDrill(planId, drillId, phase, order, notes) {
        const pd = await this.prisma.planDrill.create({
            data: {
                trainingPlanId: planId,
                drillId,
                phase: phase,
                order,
                notes,
            },
        });
        await this.recalculateTotalDuration(planId);
        return pd;
    }
    async recalculateTotalDuration(planId) {
        const drills = await this.prisma.planDrill.findMany({
            where: { trainingPlanId: planId },
            include: { drill: true },
        });
        const total = drills.reduce((sum, d) => sum + (d.drill?.durationMin ?? 0), 0);
        await this.prisma.trainingPlan.update({
            where: { id: planId },
            data: { totalDuration: total },
        });
    }
    async update(id, data) {
        return this.prisma.trainingPlan.update({
            where: { id },
            data: data,
        });
    }
    async listForUser(userId) {
        const groups = await this.prisma.groupMember.findMany({
            where: { userId },
            select: { groupId: true },
        });
        const groupIds = groups.map((g) => g.groupId);
        return this.prisma.trainingPlan.findMany({
            where: { OR: [{ groupId: { in: groupIds } }, { coachId: userId }] },
            include: { attendance: true, drills: { include: { drill: true } } },
        });
    }
    async remove(id) {
        return this.prisma.trainingPlan.delete({ where: { id } });
    }
};
exports.TrainingPlansService = TrainingPlansService;
exports.TrainingPlansService = TrainingPlansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrainingPlansService);
//# sourceMappingURL=training-plans.service.js.map