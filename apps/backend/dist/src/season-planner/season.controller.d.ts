import { SeasonService } from './season.service';
import { MacroService } from './macro.service';
import { MesoService } from './meso.service';
import { MicroService } from './micro.service';
import { MatchWeekService } from './match-week.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { CreateMacroDto } from './dto/create-macro.dto';
import { CreateMesoDto } from './dto/create-meso.dto';
import { CreateMicroDto } from './dto/create-micro.dto';
import { CreateMatchWeekDto } from './dto/create-match-week.dto';
export declare class SeasonController {
    private readonly seasonService;
    private readonly macroService;
    private readonly mesoService;
    private readonly microService;
    private readonly matchWeekService;
    constructor(seasonService: SeasonService, macroService: MacroService, mesoService: MesoService, microService: MicroService, matchWeekService: MatchWeekService);
    create(req: any, dto: CreateSeasonDto): Promise<{
        club: {
            id: string;
            name: string;
            logo: string | null;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        startDate: Date;
        endDate: Date;
        userId: string;
    }>;
    findAll(clubId?: string): Promise<({
        club: {
            id: string;
            name: string;
            logo: string | null;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        _count: {
            macros: number;
            micros: number;
        };
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        startDate: Date;
        endDate: Date;
        userId: string;
    })[]>;
    findOne(id: string): Promise<{
        club: {
            id: string;
            name: string;
            logo: string | null;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
        macros: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            title: string;
            type: string;
            intensity: number;
            notes: string | null;
            seasonId: string;
        }[];
        mesos: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            seasonId: string;
            startWeek: number;
            endWeek: number;
            goal: string;
            intensityJson: import("@prisma/client/runtime/library").JsonValue;
            macroId: string;
        }[];
        micros: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            seasonId: string;
            weekNumber: number;
            dayPlans: import("@prisma/client/runtime/library").JsonValue;
        }[];
        matchWeeks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            seasonId: string;
            weekNumber: number;
            opponentName: string;
            opponentAnalysis: import("@prisma/client/runtime/library").JsonValue | null;
            setPieces: import("@prisma/client/runtime/library").JsonValue | null;
            videoLinks: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        startDate: Date;
        endDate: Date;
        userId: string;
    }>;
    update(id: string, dto: UpdateSeasonDto): Promise<{
        club: {
            id: string;
            name: string;
            logo: string | null;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        startDate: Date;
        endDate: Date;
        userId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        clubId: string;
        startDate: Date;
        endDate: Date;
        userId: string;
    }>;
    createMacro(seasonId: string, dto: CreateMacroDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        title: string;
        type: string;
        intensity: number;
        notes: string | null;
        seasonId: string;
    }>;
    getMacros(seasonId: string): Promise<({
        mesos: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            seasonId: string;
            startWeek: number;
            endWeek: number;
            goal: string;
            intensityJson: import("@prisma/client/runtime/library").JsonValue;
            macroId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        title: string;
        type: string;
        intensity: number;
        notes: string | null;
        seasonId: string;
    })[]>;
    createMeso(seasonId: string, dto: CreateMesoDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        seasonId: string;
        startWeek: number;
        endWeek: number;
        goal: string;
        intensityJson: import("@prisma/client/runtime/library").JsonValue;
        macroId: string;
    }>;
    createMicro(seasonId: string, dto: CreateMicroDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        seasonId: string;
        weekNumber: number;
        dayPlans: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getMicro(seasonId: string, week: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        seasonId: string;
        weekNumber: number;
        dayPlans: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
    getMatchWeeks(seasonId: string): Promise<({
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        seasonId: string;
        weekNumber: number;
        opponentName: string;
        opponentAnalysis: import("@prisma/client/runtime/library").JsonValue | null;
        setPieces: import("@prisma/client/runtime/library").JsonValue | null;
        videoLinks: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
}
export declare class MatchWeekController {
    private readonly matchWeekService;
    constructor(matchWeekService: MatchWeekService);
    create(req: any, dto: CreateMatchWeekDto): Promise<{
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        seasonId: string;
        weekNumber: number;
        opponentName: string;
        opponentAnalysis: import("@prisma/client/runtime/library").JsonValue | null;
        setPieces: import("@prisma/client/runtime/library").JsonValue | null;
        videoLinks: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
