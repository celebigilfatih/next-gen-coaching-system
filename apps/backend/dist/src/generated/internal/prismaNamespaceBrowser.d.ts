import * as runtime from '@prisma/client/runtime/index-browser';
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: new (secret: never) => typeof runtime.objectEnumValues.instances.DbNull;
    JsonNull: new (secret: never) => typeof runtime.objectEnumValues.instances.JsonNull;
    AnyNull: new (secret: never) => typeof runtime.objectEnumValues.instances.AnyNull;
};
export declare const DbNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
export declare const JsonNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
export declare const AnyNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
export declare const ModelName: {
    readonly User: "User";
    readonly Club: "Club";
    readonly PlayerGroup: "PlayerGroup";
    readonly GroupMember: "GroupMember";
    readonly Drill: "Drill";
    readonly TrainingPlan: "TrainingPlan";
    readonly PlanDrill: "PlanDrill";
    readonly Attendance: "Attendance";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly email: "email";
    readonly passwordHash: "passwordHash";
    readonly role: "role";
    readonly clubId: "clubId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const ClubScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly logo: "logo";
    readonly description: "description";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ClubScalarFieldEnum = (typeof ClubScalarFieldEnum)[keyof typeof ClubScalarFieldEnum];
export declare const PlayerGroupScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly clubId: "clubId";
    readonly ageGroup: "ageGroup";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type PlayerGroupScalarFieldEnum = (typeof PlayerGroupScalarFieldEnum)[keyof typeof PlayerGroupScalarFieldEnum];
export declare const GroupMemberScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly groupId: "groupId";
    readonly createdAt: "createdAt";
};
export type GroupMemberScalarFieldEnum = (typeof GroupMemberScalarFieldEnum)[keyof typeof GroupMemberScalarFieldEnum];
export declare const DrillScalarFieldEnum: {
    readonly id: "id";
    readonly title: "title";
    readonly category: "category";
    readonly ageGroup: "ageGroup";
    readonly durationMin: "durationMin";
    readonly difficulty: "difficulty";
    readonly equipment: "equipment";
    readonly jsonData: "jsonData";
    readonly imageUrl: "imageUrl";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type DrillScalarFieldEnum = (typeof DrillScalarFieldEnum)[keyof typeof DrillScalarFieldEnum];
export declare const TrainingPlanScalarFieldEnum: {
    readonly id: "id";
    readonly title: "title";
    readonly clubId: "clubId";
    readonly coachId: "coachId";
    readonly totalDuration: "totalDuration";
    readonly groupId: "groupId";
    readonly date: "date";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TrainingPlanScalarFieldEnum = (typeof TrainingPlanScalarFieldEnum)[keyof typeof TrainingPlanScalarFieldEnum];
export declare const PlanDrillScalarFieldEnum: {
    readonly id: "id";
    readonly trainingPlanId: "trainingPlanId";
    readonly drillId: "drillId";
    readonly phase: "phase";
    readonly order: "order";
    readonly notes: "notes";
};
export type PlanDrillScalarFieldEnum = (typeof PlanDrillScalarFieldEnum)[keyof typeof PlanDrillScalarFieldEnum];
export declare const AttendanceScalarFieldEnum: {
    readonly id: "id";
    readonly playerId: "playerId";
    readonly planId: "planId";
    readonly status: "status";
    readonly createdAt: "createdAt";
};
export type AttendanceScalarFieldEnum = (typeof AttendanceScalarFieldEnum)[keyof typeof AttendanceScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const JsonNullValueInput: {
    readonly JsonNull: {
        "__#private@#private": any;
        _getNamespace(): string;
        _getName(): string;
        toString(): string;
    };
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const JsonNullValueFilter: {
    readonly DbNull: {
        "__#private@#private": any;
        _getNamespace(): string;
        _getName(): string;
        toString(): string;
    };
    readonly JsonNull: {
        "__#private@#private": any;
        _getNamespace(): string;
        _getName(): string;
        toString(): string;
    };
    readonly AnyNull: {
        "__#private@#private": any;
        _getNamespace(): string;
        _getName(): string;
        toString(): string;
    };
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
