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
exports.MatchWeekController = exports.SeasonController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const season_service_1 = require("./season.service");
const macro_service_1 = require("./macro.service");
const meso_service_1 = require("./meso.service");
const micro_service_1 = require("./micro.service");
const match_week_service_1 = require("./match-week.service");
const create_season_dto_1 = require("./dto/create-season.dto");
const update_season_dto_1 = require("./dto/update-season.dto");
const create_macro_dto_1 = require("./dto/create-macro.dto");
const create_meso_dto_1 = require("./dto/create-meso.dto");
const create_micro_dto_1 = require("./dto/create-micro.dto");
const create_match_week_dto_1 = require("./dto/create-match-week.dto");
let SeasonController = class SeasonController {
    constructor(seasonService, macroService, mesoService, microService, matchWeekService) {
        this.seasonService = seasonService;
        this.macroService = macroService;
        this.mesoService = mesoService;
        this.microService = microService;
        this.matchWeekService = matchWeekService;
    }
    create(req, dto) {
        return this.seasonService.create(req.user.userId, dto);
    }
    findAll(clubId) {
        return this.seasonService.findAll(clubId);
    }
    findOne(id) {
        return this.seasonService.findOne(id);
    }
    update(id, dto) {
        return this.seasonService.update(id, dto);
    }
    remove(id) {
        return this.seasonService.remove(id);
    }
    createMacro(seasonId, dto) {
        return this.macroService.create(seasonId, dto);
    }
    getMacros(seasonId) {
        return this.macroService.findBySeasonId(seasonId);
    }
    createMeso(seasonId, dto) {
        return this.mesoService.create(seasonId, dto);
    }
    createMicro(seasonId, dto) {
        return this.microService.create(seasonId, dto);
    }
    getMicro(seasonId, week) {
        return this.microService.findBySeasonAndWeek(seasonId, parseInt(week));
    }
    getMatchWeeks(seasonId) {
        return this.matchWeekService.findBySeasonId(seasonId);
    }
};
exports.SeasonController = SeasonController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_season_dto_1.CreateSeasonDto]),
    __metadata("design:returntype", void 0)
], SeasonController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('clubId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SeasonController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SeasonController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_season_dto_1.UpdateSeasonDto]),
    __metadata("design:returntype", void 0)
], SeasonController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SeasonController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/macros'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_macro_dto_1.CreateMacroDto]),
    __metadata("design:returntype", void 0)
], SeasonController.prototype, "createMacro", null);
__decorate([
    (0, common_1.Get)(':id/macros'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SeasonController.prototype, "getMacros", null);
__decorate([
    (0, common_1.Post)(':id/meso'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_meso_dto_1.CreateMesoDto]),
    __metadata("design:returntype", void 0)
], SeasonController.prototype, "createMeso", null);
__decorate([
    (0, common_1.Post)(':id/micro'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_micro_dto_1.CreateMicroDto]),
    __metadata("design:returntype", void 0)
], SeasonController.prototype, "createMicro", null);
__decorate([
    (0, common_1.Get)(':id/micro/:week'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('week')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SeasonController.prototype, "getMicro", null);
__decorate([
    (0, common_1.Get)(':id/matchweeks'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SeasonController.prototype, "getMatchWeeks", null);
exports.SeasonController = SeasonController = __decorate([
    (0, common_1.Controller)('seasons'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [season_service_1.SeasonService,
        macro_service_1.MacroService,
        meso_service_1.MesoService,
        micro_service_1.MicroService,
        match_week_service_1.MatchWeekService])
], SeasonController);
let MatchWeekController = class MatchWeekController {
    constructor(matchWeekService) {
        this.matchWeekService = matchWeekService;
    }
    create(req, dto) {
        return this.matchWeekService.create(req.user.userId, dto);
    }
};
exports.MatchWeekController = MatchWeekController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_match_week_dto_1.CreateMatchWeekDto]),
    __metadata("design:returntype", void 0)
], MatchWeekController.prototype, "create", null);
exports.MatchWeekController = MatchWeekController = __decorate([
    (0, common_1.Controller)('matchweekanalysis'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [match_week_service_1.MatchWeekService])
], MatchWeekController);
//# sourceMappingURL=season.controller.js.map