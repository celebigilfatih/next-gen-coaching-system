"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var seasonId, matches, _i, matches_1, m, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    seasonId = "cmkdvnkaa000oqd01rj8ylu4a";
                    matches = [
                        {
                            date: new Date("2026-01-18T19:00:00Z"),
                            opponent: "Fenerbahçe",
                            location: "AWAY",
                            competition: "Lig",
                            notes: "Derbi maçı."
                        },
                        {
                            date: new Date("2026-01-25T16:00:00Z"),
                            opponent: "Kasımpaşa",
                            location: "HOME",
                            competition: "Lig",
                            notes: "Kendi sahamızdaki ilk maç."
                        },
                        {
                            date: new Date("2026-02-01T19:00:00Z"),
                            opponent: "Beşiktaş",
                            location: "HOME",
                            competition: "Lig",
                            notes: "Kritik hafta."
                        },
                        {
                            date: new Date("2026-02-04T20:30:00Z"),
                            opponent: "Antalyaspor",
                            location: "AWAY",
                            competition: "Kupa",
                            notes: "Türkiye Kupası Çeyrek Final."
                        },
                        {
                            date: new Date("2026-02-08T13:30:00Z"),
                            opponent: "Göztepe",
                            location: "AWAY",
                            competition: "Lig",
                            notes: "Deplasman yolculuğu."
                        },
                        {
                            date: new Date("2026-02-15T19:00:00Z"),
                            opponent: "Galatasaray",
                            location: "HOME",
                            competition: "Lig",
                            notes: "Şampiyonluk yolunda kritik viraj."
                        },
                        {
                            date: new Date("2026-02-22T16:00:00Z"),
                            opponent: "Trabzonspor",
                            location: "AWAY",
                            competition: "Lig",
                            notes: "Zorlu Karadeniz deplasmanı."
                        },
                        {
                            date: new Date("2026-03-01T19:00:00Z"),
                            opponent: "Başakşehir",
                            location: "HOME",
                            competition: "Lig",
                            notes: "Taktiksel mücadele."
                        }
                    ];
                    console.log("Adding ".concat(matches.length, " random matches to season..."));
                    _i = 0, matches_1 = matches;
                    _a.label = 1;
                case 1:
                    if (!(_i < matches_1.length)) return [3 /*break*/, 6];
                    m = matches_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, prisma.match.create({
                            data: {
                                seasonId: seasonId,
                                date: m.date,
                                opponent: m.opponent,
                                location: m.location,
                                competition: m.competition,
                                notes: m.notes
                            }
                        })];
                case 3:
                    _a.sent();
                    console.log("\u2705 Match Added: ".concat(m.opponent, " (").concat(m.competition, ") - ").concat(m.date.toLocaleDateString()));
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    console.error("\u274C Failed to add match vs ".concat(m.opponent, ":"), e_1.message);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    console.log("Done!");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) { return console.error(e); })
    .finally(function () { return prisma.$disconnect(); });
