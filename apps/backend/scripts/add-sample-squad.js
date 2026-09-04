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
var bcrypt = require("bcrypt");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var clubId, groupId, passwordHash, players, _i, players_1, p, user, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clubId = "cmkdscp8b000iqd019z2soilh";
                    groupId = "cmkdt1c9e00026og4p5gpc64s";
                    return [4 /*yield*/, bcrypt.hash("spor123", 10)];
                case 1:
                    passwordHash = _a.sent();
                    players = [
                        // Kaleciler
                        { name: "Altay Bayındır", email: "altay@ngcs.com", position: "KALECI" },
                        { name: "Uğurcan Çakır", email: "ugurcan@ngcs.com", position: "KALECI" },
                        { name: "Mert Günok", email: "mert@ngcs.com", position: "KALECI" },
                        // Defans
                        { name: "Merih Demiral", email: "merih@ngcs.com", position: "DEFANS" },
                        { name: "Çağlar Söyüncü", email: "caglar@ngcs.com", position: "DEFANS" },
                        { name: "Abdülkerim Bardakcı", email: "abdulkerim@ngcs.com", position: "DEFANS" },
                        { name: "Ferdi Kadıoğlu", email: "ferdi@ngcs.com", position: "DEFANS" },
                        { name: "Zeki Çelik", email: "zeki@ngcs.com", position: "DEFANS" },
                        { name: "Samet Akaydin", email: "samet@ngcs.com", position: "DEFANS" },
                        { name: "Eren Elmalı", email: "eren@ngcs.com", position: "DEFANS" },
                        // Orta Saha
                        { name: "Hakan Çalhanoğlu", email: "hakan@ngcs.com", position: "ORTA_SAHA" },
                        { name: "Orkun Kökçü", email: "orkun@ngcs.com", position: "ORTA_SAHA" },
                        { name: "Salih Özcan", email: "salih@ngcs.com", position: "ORTA_SAHA" },
                        { name: "İsmail Yüksek", email: "ismail@ngcs.com", position: "ORTA_SAHA" },
                        { name: "Arda Güler", email: "arda@ngcs.com", position: "ORTA_SAHA" },
                        { name: "İrfan Can Kahveci", email: "irfan@ngcs.com", position: "ORTA_SAHA" },
                        { name: "Kerem Aktürkoğlu", email: "kerem@ngcs.com", position: "ORTA_SAHA" },
                        { name: "Barış Alper Yılmaz", email: "baris@ngcs.com", position: "ORTA_SAHA" },
                        // Forvet
                        { name: "Cenk Tosun", email: "cenk@ngcs.com", position: "FORVET" },
                        { name: "Kenan Yıldız", email: "kenan@ngcs.com", position: "FORVET" },
                        { name: "Semih Kılıçsoy", email: "semih@ngcs.com", position: "FORVET" },
                        { name: "Bertuğ Yıldırım", email: "bertug@ngcs.com", position: "FORVET" },
                    ];
                    console.log("Creating ".concat(players.length, " players for A Tak\u0131m..."));
                    _i = 0, players_1 = players;
                    _a.label = 2;
                case 2:
                    if (!(_i < players_1.length)) return [3 /*break*/, 8];
                    p = players_1[_i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: p.name,
                                email: p.email,
                                passwordHash: passwordHash,
                                role: "PLAYER",
                                position: p.position,
                                clubId: clubId,
                            }
                        })];
                case 4:
                    user = _a.sent();
                    // Add to A Takım group
                    return [4 /*yield*/, prisma.groupMember.create({
                            data: {
                                groupId: groupId,
                                userId: user.id
                            }
                        })];
                case 5:
                    // Add to A Takım group
                    _a.sent();
                    console.log("\u2705 Added: ".concat(p.name, " (").concat(p.position, ")"));
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _a.sent();
                    console.error("\u274C Error adding ".concat(p.name, ":"), e_1.message);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8:
                    console.log("Done!");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) { return console.error(e); })
    .finally(function () { return prisma.$disconnect(); });
