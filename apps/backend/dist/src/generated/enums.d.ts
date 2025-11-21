export declare const UserRole: {
    readonly ADMIN: "ADMIN";
    readonly COACH: "COACH";
    readonly PLAYER: "PLAYER";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const DrillCategory: {
    readonly WARM_UP: "WARM_UP";
    readonly TECHNICAL: "TECHNICAL";
    readonly TACTICAL: "TACTICAL";
    readonly COOL_DOWN: "COOL_DOWN";
};
export type DrillCategory = (typeof DrillCategory)[keyof typeof DrillCategory];
export declare const Phase: {
    readonly WARM_UP: "WARM_UP";
    readonly TECHNICAL: "TECHNICAL";
    readonly TACTICAL: "TACTICAL";
    readonly COOL_DOWN: "COOL_DOWN";
};
export type Phase = (typeof Phase)[keyof typeof Phase];
export declare const AgeGroup: {
    readonly U8: "U8";
    readonly U10: "U10";
    readonly U12: "U12";
    readonly U14: "U14";
    readonly U16: "U16";
    readonly U18: "U18";
    readonly SENIOR: "SENIOR";
};
export type AgeGroup = (typeof AgeGroup)[keyof typeof AgeGroup];
export declare const AttendanceStatus: {
    readonly PRESENT: "PRESENT";
    readonly ABSENT: "ABSENT";
};
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];
export declare const Difficulty: {
    readonly EASY: "EASY";
    readonly MEDIUM: "MEDIUM";
    readonly HARD: "HARD";
};
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];
