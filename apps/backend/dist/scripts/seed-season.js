"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function seedSeasonData() {
    console.log('🌱 Seeding season data...');
    let club = await prisma.club.findFirst();
    if (!club) {
        club = await prisma.club.create({
            data: {
                name: 'Demo Kulübü',
                description: 'Örnek kulüp verisi',
            },
        });
    }
    let coach = await prisma.user.findFirst({ where: { role: 'COACH' } });
    if (!coach) {
        const hash = await bcrypt.hash('demo123', 10);
        coach = await prisma.user.create({
            data: {
                name: 'Demo Antrenör',
                email: 'coach@demo.com',
                passwordHash: hash,
                role: 'COACH',
                clubId: club.id,
            },
        });
    }
    const season = await prisma.season.create({
        data: {
            name: '2025/2026 – A Takım',
            clubId: club.id,
            userId: coach.id,
            startDate: new Date('2025-07-01'),
            endDate: new Date('2026-06-30'),
        },
    });
    console.log(`✅ Season created: ${season.name}`);
    const preSeason = await prisma.macroCycle.create({
        data: {
            seasonId: season.id,
            title: 'Hazırlık Dönemi',
            startDate: new Date('2025-07-01'),
            endDate: new Date('2025-08-15'),
            type: 'PRE_SEASON',
            intensity: 8,
            notes: 'Fiziksel kondisyon ve takım uyumu',
        },
    });
    const inSeason = await prisma.macroCycle.create({
        data: {
            seasonId: season.id,
            title: 'Lig Sezonu',
            startDate: new Date('2025-08-16'),
            endDate: new Date('2026-05-31'),
            type: 'IN_SEASON',
            intensity: 7,
            notes: 'Müsabaka dönemi',
        },
    });
    console.log('✅ MacroCycles created: 2');
    await prisma.mesoCycle.create({
        data: {
            seasonId: season.id,
            macroId: preSeason.id,
            startWeek: 1,
            endWeek: 6,
            goal: 'Dayanıklılık ve kuvvet gelişimi',
            intensityJson: { physical: 9, technical: 6, tactical: 5 },
        },
    });
    await prisma.mesoCycle.create({
        data: {
            seasonId: season.id,
            macroId: inSeason.id,
            startWeek: 7,
            endWeek: 14,
            goal: 'Lig performansı optimizasyonu',
            intensityJson: { physical: 7, technical: 8, tactical: 9 },
        },
    });
    console.log('✅ MesoCycles created: 2');
    for (let week = 1; week <= 4; week++) {
        await prisma.microCycle.create({
            data: {
                seasonId: season.id,
                weekNumber: week,
                dayPlans: [
                    { day: 1, drillIds: [], notes: 'Pazartesi - Toparlanma' },
                    { day: 2, drillIds: [], notes: 'Salı - Teknik çalışma' },
                    { day: 3, drillIds: [], notes: 'Çarşamba - Taktik' },
                    { day: 4, drillIds: [], notes: 'Perşembe - Set piesleri' },
                    { day: 5, drillIds: [], notes: 'Cuma - Maç taktiği' },
                    { day: 6, drillIds: [], notes: 'Cumartesi - Hafif antrenman' },
                    { day: 7, drillIds: [], notes: 'Pazar - Maç günü' },
                ],
            },
        });
    }
    console.log('✅ MicroCycles created: 4');
    const players = [];
    for (let i = 1; i <= 3; i++) {
        let player = await prisma.user.findFirst({
            where: { email: `player${i}@demo.com` },
        });
        if (!player) {
            const hash = await bcrypt.hash('demo123', 10);
            player = await prisma.user.create({
                data: {
                    name: `Oyuncu ${i}`,
                    email: `player${i}@demo.com`,
                    passwordHash: hash,
                    role: 'PLAYER',
                    clubId: club.id,
                },
            });
        }
        players.push(player);
    }
    let loadCount = 0;
    for (const player of players) {
        for (let day = 0; day < 7; day++) {
            const date = new Date('2025-07-01');
            date.setDate(date.getDate() + day);
            await prisma.playerLoad.create({
                data: {
                    playerId: player.id,
                    date,
                    totalDistance: 5000 + Math.random() * 3000,
                    hsr: 500 + Math.random() * 500,
                    sprintDistance: 200 + Math.random() * 300,
                    accelerations: Math.floor(20 + Math.random() * 30),
                    wellness: {
                        sleep: Math.floor(3 + Math.random() * 2),
                        fatigue: Math.floor(2 + Math.random() * 3),
                        soreness: Math.floor(2 + Math.random() * 3),
                        stress: Math.floor(2 + Math.random() * 3),
                    },
                },
            });
            loadCount++;
        }
    }
    console.log(`✅ PlayerLoad entries created: ${loadCount}`);
    console.log('\n🎉 Season data seeding completed!');
    console.log(`Season ID: ${season.id}`);
    console.log(`Club: ${club.name}`);
    console.log(`Coach: ${coach.email}`);
}
seedSeasonData()
    .catch((e) => {
    console.error('❌ Error seeding season data:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-season.js.map