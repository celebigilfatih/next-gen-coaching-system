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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingPlansController = void 0;
const common_1 = require("@nestjs/common");
const training_plans_service_1 = require("./training-plans.service");
const passport_1 = require("@nestjs/passport");
let TrainingPlansController = class TrainingPlansController {
    constructor(plans) {
        this.plans = plans;
    }
    async list(clubId, coachId, groupId) {
        return this.plans.list({ clubId, coachId, groupId });
    }
    async my(req) {
        return this.plans.listForUser(req.user.userId);
    }
    async get(id) {
        return this.plans.get(id);
    }
    async create(body) {
        return this.plans.create(body);
    }
    async addDrill(id, body) {
        return this.plans.addDrill(id, body.drillId, body.phase, body.order, body.notes);
    }
    async update(id, body) {
        return this.plans.update(id, body);
    }
    async remove(id) {
        return this.plans.remove(id);
    }
};
exports.TrainingPlansController = TrainingPlansController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('clubId')),
    __param(1, (0, common_1.Query)('coachId')),
    __param(2, (0, common_1.Query)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TrainingPlansController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrainingPlansController.prototype, "my", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrainingPlansController.prototype, "get", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrainingPlansController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)(':id/drills'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TrainingPlansController.prototype, "addDrill", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TrainingPlansController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrainingPlansController.prototype, "remove", null);
exports.TrainingPlansController = TrainingPlansController = __decorate([
    (0, common_1.Controller)('training-plans'),
    __metadata("design:paramtypes", [training_plans_service_1.TrainingPlansService])
], TrainingPlansController);
//# sourceMappingURL=training-plans.controller.js.map