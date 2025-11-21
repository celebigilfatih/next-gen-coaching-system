import type * as runtime from '@prisma/client/runtime/library';
import type * as $Enums from '../enums.js';
import type * as Prisma from '../internal/prismaNamespace.js';
export type UserModel = runtime.Types.Result.DefaultSelection<Prisma.$UserPayload>;
export type AggregateUser = {
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
};
export type UserMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    email: string | null;
    passwordHash: string | null;
    role: $Enums.UserRole | null;
    clubId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type UserMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    email: string | null;
    passwordHash: string | null;
    role: $Enums.UserRole | null;
    clubId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type UserCountAggregateOutputType = {
    id: number;
    name: number;
    email: number;
    passwordHash: number;
    role: number;
    clubId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type UserMinAggregateInputType = {
    id?: true;
    name?: true;
    email?: true;
    passwordHash?: true;
    role?: true;
    clubId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type UserMaxAggregateInputType = {
    id?: true;
    name?: true;
    email?: true;
    passwordHash?: true;
    role?: true;
    clubId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type UserCountAggregateInputType = {
    id?: true;
    name?: true;
    email?: true;
    passwordHash?: true;
    role?: true;
    clubId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type UserAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | UserCountAggregateInputType;
    _min?: UserMinAggregateInputType;
    _max?: UserMaxAggregateInputType;
};
export type GetUserAggregateType<T extends UserAggregateArgs> = {
    [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateUser[P]> : Prisma.GetScalarType<T[P], AggregateUser[P]>;
};
export type UserGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithAggregationInput | Prisma.UserOrderByWithAggregationInput[];
    by: Prisma.UserScalarFieldEnum[] | Prisma.UserScalarFieldEnum;
    having?: Prisma.UserScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserCountAggregateInputType | true;
    _min?: UserMinAggregateInputType;
    _max?: UserMaxAggregateInputType;
};
export type UserGroupByOutputType = {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    clubId: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: UserCountAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
};
type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<UserGroupByOutputType, T['by']> & {
    [P in keyof T & keyof UserGroupByOutputType]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], UserGroupByOutputType[P]> : Prisma.GetScalarType<T[P], UserGroupByOutputType[P]>;
}>>;
export type UserWhereInput = {
    AND?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    OR?: Prisma.UserWhereInput[];
    NOT?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    id?: Prisma.StringFilter<'User'> | string;
    name?: Prisma.StringFilter<'User'> | string;
    email?: Prisma.StringFilter<'User'> | string;
    passwordHash?: Prisma.StringFilter<'User'> | string;
    role?: Prisma.EnumUserRoleFilter<'User'> | $Enums.UserRole;
    clubId?: Prisma.StringNullableFilter<'User'> | string | null;
    createdAt?: Prisma.DateTimeFilter<'User'> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<'User'> | Date | string;
    club?: Prisma.XOR<Prisma.ClubNullableScalarRelationFilter, Prisma.ClubWhereInput> | null;
    groups?: Prisma.GroupMemberListRelationFilter;
    coachedPlans?: Prisma.TrainingPlanListRelationFilter;
    attendances?: Prisma.AttendanceListRelationFilter;
};
export type UserOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    role?: Prisma.SortOrder;
    clubId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    club?: Prisma.ClubOrderByWithRelationInput;
    groups?: Prisma.GroupMemberOrderByRelationAggregateInput;
    coachedPlans?: Prisma.TrainingPlanOrderByRelationAggregateInput;
    attendances?: Prisma.AttendanceOrderByRelationAggregateInput;
};
export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    email?: string;
    AND?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    OR?: Prisma.UserWhereInput[];
    NOT?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    name?: Prisma.StringFilter<'User'> | string;
    passwordHash?: Prisma.StringFilter<'User'> | string;
    role?: Prisma.EnumUserRoleFilter<'User'> | $Enums.UserRole;
    clubId?: Prisma.StringNullableFilter<'User'> | string | null;
    createdAt?: Prisma.DateTimeFilter<'User'> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<'User'> | Date | string;
    club?: Prisma.XOR<Prisma.ClubNullableScalarRelationFilter, Prisma.ClubWhereInput> | null;
    groups?: Prisma.GroupMemberListRelationFilter;
    coachedPlans?: Prisma.TrainingPlanListRelationFilter;
    attendances?: Prisma.AttendanceListRelationFilter;
}, 'id' | 'email'>;
export type UserOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    role?: Prisma.SortOrder;
    clubId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.UserCountOrderByAggregateInput;
    _max?: Prisma.UserMaxOrderByAggregateInput;
    _min?: Prisma.UserMinOrderByAggregateInput;
};
export type UserScalarWhereWithAggregatesInput = {
    AND?: Prisma.UserScalarWhereWithAggregatesInput | Prisma.UserScalarWhereWithAggregatesInput[];
    OR?: Prisma.UserScalarWhereWithAggregatesInput[];
    NOT?: Prisma.UserScalarWhereWithAggregatesInput | Prisma.UserScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<'User'> | string;
    name?: Prisma.StringWithAggregatesFilter<'User'> | string;
    email?: Prisma.StringWithAggregatesFilter<'User'> | string;
    passwordHash?: Prisma.StringWithAggregatesFilter<'User'> | string;
    role?: Prisma.EnumUserRoleWithAggregatesFilter<'User'> | $Enums.UserRole;
    clubId?: Prisma.StringNullableWithAggregatesFilter<'User'> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<'User'> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<'User'> | Date | string;
};
export type UserCreateInput = {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    club?: Prisma.ClubCreateNestedOneWithoutUsersInput;
    groups?: Prisma.GroupMemberCreateNestedManyWithoutUserInput;
    coachedPlans?: Prisma.TrainingPlanCreateNestedManyWithoutCoachInput;
    attendances?: Prisma.AttendanceCreateNestedManyWithoutPlayerInput;
};
export type UserUncheckedCreateInput = {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    clubId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    groups?: Prisma.GroupMemberUncheckedCreateNestedManyWithoutUserInput;
    coachedPlans?: Prisma.TrainingPlanUncheckedCreateNestedManyWithoutCoachInput;
    attendances?: Prisma.AttendanceUncheckedCreateNestedManyWithoutPlayerInput;
};
export type UserUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    role?: Prisma.EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    club?: Prisma.ClubUpdateOneWithoutUsersNestedInput;
    groups?: Prisma.GroupMemberUpdateManyWithoutUserNestedInput;
    coachedPlans?: Prisma.TrainingPlanUpdateManyWithoutCoachNestedInput;
    attendances?: Prisma.AttendanceUpdateManyWithoutPlayerNestedInput;
};
export type UserUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    role?: Prisma.EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    clubId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    groups?: Prisma.GroupMemberUncheckedUpdateManyWithoutUserNestedInput;
    coachedPlans?: Prisma.TrainingPlanUncheckedUpdateManyWithoutCoachNestedInput;
    attendances?: Prisma.AttendanceUncheckedUpdateManyWithoutPlayerNestedInput;
};
export type UserCreateManyInput = {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    clubId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type UserUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    role?: Prisma.EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    role?: Prisma.EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    clubId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    role?: Prisma.SortOrder;
    clubId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type UserMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    role?: Prisma.SortOrder;
    clubId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type UserMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    role?: Prisma.SortOrder;
    clubId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type UserListRelationFilter = {
    every?: Prisma.UserWhereInput;
    some?: Prisma.UserWhereInput;
    none?: Prisma.UserWhereInput;
};
export type UserOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type UserScalarRelationFilter = {
    is?: Prisma.UserWhereInput;
    isNot?: Prisma.UserWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type UserCreateNestedManyWithoutClubInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutClubInput, Prisma.UserUncheckedCreateWithoutClubInput> | Prisma.UserCreateWithoutClubInput[] | Prisma.UserUncheckedCreateWithoutClubInput[];
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutClubInput | Prisma.UserCreateOrConnectWithoutClubInput[];
    createMany?: Prisma.UserCreateManyClubInputEnvelope;
    connect?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
};
export type UserUncheckedCreateNestedManyWithoutClubInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutClubInput, Prisma.UserUncheckedCreateWithoutClubInput> | Prisma.UserCreateWithoutClubInput[] | Prisma.UserUncheckedCreateWithoutClubInput[];
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutClubInput | Prisma.UserCreateOrConnectWithoutClubInput[];
    createMany?: Prisma.UserCreateManyClubInputEnvelope;
    connect?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
};
export type UserUpdateManyWithoutClubNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutClubInput, Prisma.UserUncheckedCreateWithoutClubInput> | Prisma.UserCreateWithoutClubInput[] | Prisma.UserUncheckedCreateWithoutClubInput[];
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutClubInput | Prisma.UserCreateOrConnectWithoutClubInput[];
    upsert?: Prisma.UserUpsertWithWhereUniqueWithoutClubInput | Prisma.UserUpsertWithWhereUniqueWithoutClubInput[];
    createMany?: Prisma.UserCreateManyClubInputEnvelope;
    set?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
    disconnect?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
    delete?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
    connect?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
    update?: Prisma.UserUpdateWithWhereUniqueWithoutClubInput | Prisma.UserUpdateWithWhereUniqueWithoutClubInput[];
    updateMany?: Prisma.UserUpdateManyWithWhereWithoutClubInput | Prisma.UserUpdateManyWithWhereWithoutClubInput[];
    deleteMany?: Prisma.UserScalarWhereInput | Prisma.UserScalarWhereInput[];
};
export type UserUncheckedUpdateManyWithoutClubNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutClubInput, Prisma.UserUncheckedCreateWithoutClubInput> | Prisma.UserCreateWithoutClubInput[] | Prisma.UserUncheckedCreateWithoutClubInput[];
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutClubInput | Prisma.UserCreateOrConnectWithoutClubInput[];
    upsert?: Prisma.UserUpsertWithWhereUniqueWithoutClubInput | Prisma.UserUpsertWithWhereUniqueWithoutClubInput[];
    createMany?: Prisma.UserCreateManyClubInputEnvelope;
    set?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
    disconnect?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
    delete?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
    connect?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
    update?: Prisma.UserUpdateWithWhereUniqueWithoutClubInput | Prisma.UserUpdateWithWhereUniqueWithoutClubInput[];
    updateMany?: Prisma.UserUpdateManyWithWhereWithoutClubInput | Prisma.UserUpdateManyWithWhereWithoutClubInput[];
    deleteMany?: Prisma.UserScalarWhereInput | Prisma.UserScalarWhereInput[];
};
export type UserCreateNestedOneWithoutGroupsInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutGroupsInput, Prisma.UserUncheckedCreateWithoutGroupsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutGroupsInput;
    connect?: Prisma.UserWhereUniqueInput;
};
export type UserUpdateOneRequiredWithoutGroupsNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutGroupsInput, Prisma.UserUncheckedCreateWithoutGroupsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutGroupsInput;
    upsert?: Prisma.UserUpsertWithoutGroupsInput;
    connect?: Prisma.UserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutGroupsInput, Prisma.UserUpdateWithoutGroupsInput>, Prisma.UserUncheckedUpdateWithoutGroupsInput>;
};
export type UserCreateNestedOneWithoutCoachedPlansInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutCoachedPlansInput, Prisma.UserUncheckedCreateWithoutCoachedPlansInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutCoachedPlansInput;
    connect?: Prisma.UserWhereUniqueInput;
};
export type UserUpdateOneRequiredWithoutCoachedPlansNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutCoachedPlansInput, Prisma.UserUncheckedCreateWithoutCoachedPlansInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutCoachedPlansInput;
    upsert?: Prisma.UserUpsertWithoutCoachedPlansInput;
    connect?: Prisma.UserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutCoachedPlansInput, Prisma.UserUpdateWithoutCoachedPlansInput>, Prisma.UserUncheckedUpdateWithoutCoachedPlansInput>;
};
export type UserCreateNestedOneWithoutAttendancesInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutAttendancesInput, Prisma.UserUncheckedCreateWithoutAttendancesInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutAttendancesInput;
    connect?: Prisma.UserWhereUniqueInput;
};
export type UserUpdateOneRequiredWithoutAttendancesNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutAttendancesInput, Prisma.UserUncheckedCreateWithoutAttendancesInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutAttendancesInput;
    upsert?: Prisma.UserUpsertWithoutAttendancesInput;
    connect?: Prisma.UserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutAttendancesInput, Prisma.UserUpdateWithoutAttendancesInput>, Prisma.UserUncheckedUpdateWithoutAttendancesInput>;
};
export type UserCreateWithoutClubInput = {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    groups?: Prisma.GroupMemberCreateNestedManyWithoutUserInput;
    coachedPlans?: Prisma.TrainingPlanCreateNestedManyWithoutCoachInput;
    attendances?: Prisma.AttendanceCreateNestedManyWithoutPlayerInput;
};
export type UserUncheckedCreateWithoutClubInput = {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    groups?: Prisma.GroupMemberUncheckedCreateNestedManyWithoutUserInput;
    coachedPlans?: Prisma.TrainingPlanUncheckedCreateNestedManyWithoutCoachInput;
    attendances?: Prisma.AttendanceUncheckedCreateNestedManyWithoutPlayerInput;
};
export type UserCreateOrConnectWithoutClubInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutClubInput, Prisma.UserUncheckedCreateWithoutClubInput>;
};
export type UserCreateManyClubInputEnvelope = {
    data: Prisma.UserCreateManyClubInput | Prisma.UserCreateManyClubInput[];
    skipDuplicates?: boolean;
};
export type UserUpsertWithWhereUniqueWithoutClubInput = {
    where: Prisma.UserWhereUniqueInput;
    update: Prisma.XOR<Prisma.UserUpdateWithoutClubInput, Prisma.UserUncheckedUpdateWithoutClubInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutClubInput, Prisma.UserUncheckedCreateWithoutClubInput>;
};
export type UserUpdateWithWhereUniqueWithoutClubInput = {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutClubInput, Prisma.UserUncheckedUpdateWithoutClubInput>;
};
export type UserUpdateManyWithWhereWithoutClubInput = {
    where: Prisma.UserScalarWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateManyMutationInput, Prisma.UserUncheckedUpdateManyWithoutClubInput>;
};
export type UserScalarWhereInput = {
    AND?: Prisma.UserScalarWhereInput | Prisma.UserScalarWhereInput[];
    OR?: Prisma.UserScalarWhereInput[];
    NOT?: Prisma.UserScalarWhereInput | Prisma.UserScalarWhereInput[];
    id?: Prisma.StringFilter<'User'> | string;
    name?: Prisma.StringFilter<'User'> | string;
    email?: Prisma.StringFilter<'User'> | string;
    passwordHash?: Prisma.StringFilter<'User'> | string;
    role?: Prisma.EnumUserRoleFilter<'User'> | $Enums.UserRole;
    clubId?: Prisma.StringNullableFilter<'User'> | string | null;
    createdAt?: Prisma.DateTimeFilter<'User'> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<'User'> | Date | string;
};
export type UserCreateWithoutGroupsInput = {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    club?: Prisma.ClubCreateNestedOneWithoutUsersInput;
    coachedPlans?: Prisma.TrainingPlanCreateNestedManyWithoutCoachInput;
    attendances?: Prisma.AttendanceCreateNestedManyWithoutPlayerInput;
};
export type UserUncheckedCreateWithoutGroupsInput = {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    clubId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    coachedPlans?: Prisma.TrainingPlanUncheckedCreateNestedManyWithoutCoachInput;
    attendances?: Prisma.AttendanceUncheckedCreateNestedManyWithoutPlayerInput;
};
export type UserCreateOrConnectWithoutGroupsInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutGroupsInput, Prisma.UserUncheckedCreateWithoutGroupsInput>;
};
export type UserUpsertWithoutGroupsInput = {
    update: Prisma.XOR<Prisma.UserUpdateWithoutGroupsInput, Prisma.UserUncheckedUpdateWithoutGroupsInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutGroupsInput, Prisma.UserUncheckedCreateWithoutGroupsInput>;
    where?: Prisma.UserWhereInput;
};
export type UserUpdateToOneWithWhereWithoutGroupsInput = {
    where?: Prisma.UserWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutGroupsInput, Prisma.UserUncheckedUpdateWithoutGroupsInput>;
};
export type UserUpdateWithoutGroupsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    role?: Prisma.EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    club?: Prisma.ClubUpdateOneWithoutUsersNestedInput;
    coachedPlans?: Prisma.TrainingPlanUpdateManyWithoutCoachNestedInput;
    attendances?: Prisma.AttendanceUpdateManyWithoutPlayerNestedInput;
};
export type UserUncheckedUpdateWithoutGroupsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    role?: Prisma.EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    clubId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    coachedPlans?: Prisma.TrainingPlanUncheckedUpdateManyWithoutCoachNestedInput;
    attendances?: Prisma.AttendanceUncheckedUpdateManyWithoutPlayerNestedInput;
};
export type UserCreateWithoutCoachedPlansInput = {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    club?: Prisma.ClubCreateNestedOneWithoutUsersInput;
    groups?: Prisma.GroupMemberCreateNestedManyWithoutUserInput;
    attendances?: Prisma.AttendanceCreateNestedManyWithoutPlayerInput;
};
export type UserUncheckedCreateWithoutCoachedPlansInput = {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    clubId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    groups?: Prisma.GroupMemberUncheckedCreateNestedManyWithoutUserInput;
    attendances?: Prisma.AttendanceUncheckedCreateNestedManyWithoutPlayerInput;
};
export type UserCreateOrConnectWithoutCoachedPlansInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutCoachedPlansInput, Prisma.UserUncheckedCreateWithoutCoachedPlansInput>;
};
export type UserUpsertWithoutCoachedPlansInput = {
    update: Prisma.XOR<Prisma.UserUpdateWithoutCoachedPlansInput, Prisma.UserUncheckedUpdateWithoutCoachedPlansInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutCoachedPlansInput, Prisma.UserUncheckedCreateWithoutCoachedPlansInput>;
    where?: Prisma.UserWhereInput;
};
export type UserUpdateToOneWithWhereWithoutCoachedPlansInput = {
    where?: Prisma.UserWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutCoachedPlansInput, Prisma.UserUncheckedUpdateWithoutCoachedPlansInput>;
};
export type UserUpdateWithoutCoachedPlansInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    role?: Prisma.EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    club?: Prisma.ClubUpdateOneWithoutUsersNestedInput;
    groups?: Prisma.GroupMemberUpdateManyWithoutUserNestedInput;
    attendances?: Prisma.AttendanceUpdateManyWithoutPlayerNestedInput;
};
export type UserUncheckedUpdateWithoutCoachedPlansInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    role?: Prisma.EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    clubId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    groups?: Prisma.GroupMemberUncheckedUpdateManyWithoutUserNestedInput;
    attendances?: Prisma.AttendanceUncheckedUpdateManyWithoutPlayerNestedInput;
};
export type UserCreateWithoutAttendancesInput = {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    club?: Prisma.ClubCreateNestedOneWithoutUsersInput;
    groups?: Prisma.GroupMemberCreateNestedManyWithoutUserInput;
    coachedPlans?: Prisma.TrainingPlanCreateNestedManyWithoutCoachInput;
};
export type UserUncheckedCreateWithoutAttendancesInput = {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    clubId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    groups?: Prisma.GroupMemberUncheckedCreateNestedManyWithoutUserInput;
    coachedPlans?: Prisma.TrainingPlanUncheckedCreateNestedManyWithoutCoachInput;
};
export type UserCreateOrConnectWithoutAttendancesInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutAttendancesInput, Prisma.UserUncheckedCreateWithoutAttendancesInput>;
};
export type UserUpsertWithoutAttendancesInput = {
    update: Prisma.XOR<Prisma.UserUpdateWithoutAttendancesInput, Prisma.UserUncheckedUpdateWithoutAttendancesInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutAttendancesInput, Prisma.UserUncheckedCreateWithoutAttendancesInput>;
    where?: Prisma.UserWhereInput;
};
export type UserUpdateToOneWithWhereWithoutAttendancesInput = {
    where?: Prisma.UserWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutAttendancesInput, Prisma.UserUncheckedUpdateWithoutAttendancesInput>;
};
export type UserUpdateWithoutAttendancesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    role?: Prisma.EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    club?: Prisma.ClubUpdateOneWithoutUsersNestedInput;
    groups?: Prisma.GroupMemberUpdateManyWithoutUserNestedInput;
    coachedPlans?: Prisma.TrainingPlanUpdateManyWithoutCoachNestedInput;
};
export type UserUncheckedUpdateWithoutAttendancesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    role?: Prisma.EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    clubId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    groups?: Prisma.GroupMemberUncheckedUpdateManyWithoutUserNestedInput;
    coachedPlans?: Prisma.TrainingPlanUncheckedUpdateManyWithoutCoachNestedInput;
};
export type UserCreateManyClubInput = {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    role: $Enums.UserRole;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type UserUpdateWithoutClubInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    role?: Prisma.EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    groups?: Prisma.GroupMemberUpdateManyWithoutUserNestedInput;
    coachedPlans?: Prisma.TrainingPlanUpdateManyWithoutCoachNestedInput;
    attendances?: Prisma.AttendanceUpdateManyWithoutPlayerNestedInput;
};
export type UserUncheckedUpdateWithoutClubInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    role?: Prisma.EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    groups?: Prisma.GroupMemberUncheckedUpdateManyWithoutUserNestedInput;
    coachedPlans?: Prisma.TrainingPlanUncheckedUpdateManyWithoutCoachNestedInput;
    attendances?: Prisma.AttendanceUncheckedUpdateManyWithoutPlayerNestedInput;
};
export type UserUncheckedUpdateManyWithoutClubInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    role?: Prisma.EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserCountOutputType = {
    groups: number;
    coachedPlans: number;
    attendances: number;
};
export type UserCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    groups?: boolean | UserCountOutputTypeCountGroupsArgs;
    coachedPlans?: boolean | UserCountOutputTypeCountCoachedPlansArgs;
    attendances?: boolean | UserCountOutputTypeCountAttendancesArgs;
};
export type UserCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserCountOutputTypeSelect<ExtArgs> | null;
};
export type UserCountOutputTypeCountGroupsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GroupMemberWhereInput;
};
export type UserCountOutputTypeCountCoachedPlansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TrainingPlanWhereInput;
};
export type UserCountOutputTypeCountAttendancesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AttendanceWhereInput;
};
export type UserSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    email?: boolean;
    passwordHash?: boolean;
    role?: boolean;
    clubId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    club?: boolean | Prisma.User$clubArgs<ExtArgs>;
    groups?: boolean | Prisma.User$groupsArgs<ExtArgs>;
    coachedPlans?: boolean | Prisma.User$coachedPlansArgs<ExtArgs>;
    attendances?: boolean | Prisma.User$attendancesArgs<ExtArgs>;
    _count?: boolean | Prisma.UserCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs['result']['user']>;
export type UserSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    email?: boolean;
    passwordHash?: boolean;
    role?: boolean;
    clubId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    club?: boolean | Prisma.User$clubArgs<ExtArgs>;
}, ExtArgs['result']['user']>;
export type UserSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    email?: boolean;
    passwordHash?: boolean;
    role?: boolean;
    clubId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    club?: boolean | Prisma.User$clubArgs<ExtArgs>;
}, ExtArgs['result']['user']>;
export type UserSelectScalar = {
    id?: boolean;
    name?: boolean;
    email?: boolean;
    passwordHash?: boolean;
    role?: boolean;
    clubId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type UserOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<'id' | 'name' | 'email' | 'passwordHash' | 'role' | 'clubId' | 'createdAt' | 'updatedAt', ExtArgs['result']['user']>;
export type UserInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    club?: boolean | Prisma.User$clubArgs<ExtArgs>;
    groups?: boolean | Prisma.User$groupsArgs<ExtArgs>;
    coachedPlans?: boolean | Prisma.User$coachedPlansArgs<ExtArgs>;
    attendances?: boolean | Prisma.User$attendancesArgs<ExtArgs>;
    _count?: boolean | Prisma.UserCountOutputTypeDefaultArgs<ExtArgs>;
};
export type UserIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    club?: boolean | Prisma.User$clubArgs<ExtArgs>;
};
export type UserIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    club?: boolean | Prisma.User$clubArgs<ExtArgs>;
};
export type $UserPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: 'User';
    objects: {
        club: Prisma.$ClubPayload<ExtArgs> | null;
        groups: Prisma.$GroupMemberPayload<ExtArgs>[];
        coachedPlans: Prisma.$TrainingPlanPayload<ExtArgs>[];
        attendances: Prisma.$AttendancePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        email: string;
        passwordHash: string;
        role: $Enums.UserRole;
        clubId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs['result']['user']>;
    composites: {};
};
export type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UserPayload, S>;
export type UserCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UserCountAggregateInputType | true;
};
export interface UserDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['User'];
        meta: {
            name: 'User';
        };
    };
    findUnique<T extends UserFindUniqueArgs>(args: Prisma.SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findUnique', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends UserFindFirstArgs>(args?: Prisma.SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findFirst', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findFirstOrThrow', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends UserFindManyArgs>(args?: Prisma.SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>>;
    create<T extends UserCreateArgs>(args: Prisma.SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'create', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends UserCreateManyArgs>(args?: Prisma.SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'createManyAndReturn', GlobalOmitOptions>>;
    delete<T extends UserDeleteArgs>(args: Prisma.SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'delete', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends UserUpdateArgs>(args: Prisma.SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'update', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends UserDeleteManyArgs>(args?: Prisma.SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends UserUpdateManyArgs>(args: Prisma.SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'updateManyAndReturn', GlobalOmitOptions>>;
    upsert<T extends UserUpsertArgs>(args: Prisma.SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends UserCountArgs>(args?: Prisma.Subset<T, UserCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], UserCountAggregateOutputType> : number>;
    aggregate<T extends UserAggregateArgs>(args: Prisma.Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>;
    groupBy<T extends UserGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: UserGroupByArgs['orderBy'];
    } : {
        orderBy?: UserGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: UserFieldRefs;
}
export interface Prisma__UserClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    club<T extends Prisma.User$clubArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$clubArgs<ExtArgs>>): Prisma.Prisma__ClubClient<runtime.Types.Result.GetResult<Prisma.$ClubPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    groups<T extends Prisma.User$groupsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$groupsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GroupMemberPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions> | Null>;
    coachedPlans<T extends Prisma.User$coachedPlansArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$coachedPlansArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions> | Null>;
    attendances<T extends Prisma.User$attendancesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$attendancesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, 'findMany', GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface UserFieldRefs {
    readonly id: Prisma.FieldRef<'User', 'String'>;
    readonly name: Prisma.FieldRef<'User', 'String'>;
    readonly email: Prisma.FieldRef<'User', 'String'>;
    readonly passwordHash: Prisma.FieldRef<'User', 'String'>;
    readonly role: Prisma.FieldRef<'User', 'UserRole'>;
    readonly clubId: Prisma.FieldRef<'User', 'String'>;
    readonly createdAt: Prisma.FieldRef<'User', 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<'User', 'DateTime'>;
}
export type UserFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
};
export type UserFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
};
export type UserFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type UserFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type UserFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type UserCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>;
};
export type UserCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.UserCreateManyInput | Prisma.UserCreateManyInput[];
    skipDuplicates?: boolean;
};
export type UserCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    data: Prisma.UserCreateManyInput | Prisma.UserCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.UserIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type UserUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>;
    where: Prisma.UserWhereUniqueInput;
};
export type UserUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.UserUpdateManyMutationInput, Prisma.UserUncheckedUpdateManyInput>;
    where?: Prisma.UserWhereInput;
    limit?: number;
};
export type UserUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserUpdateManyMutationInput, Prisma.UserUncheckedUpdateManyInput>;
    where?: Prisma.UserWhereInput;
    limit?: number;
    include?: Prisma.UserIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type UserUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>;
};
export type UserDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
};
export type UserDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
    limit?: number;
};
export type User$clubArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClubSelect<ExtArgs> | null;
    omit?: Prisma.ClubOmit<ExtArgs> | null;
    include?: Prisma.ClubInclude<ExtArgs> | null;
    where?: Prisma.ClubWhereInput;
};
export type User$groupsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GroupMemberSelect<ExtArgs> | null;
    omit?: Prisma.GroupMemberOmit<ExtArgs> | null;
    include?: Prisma.GroupMemberInclude<ExtArgs> | null;
    where?: Prisma.GroupMemberWhereInput;
    orderBy?: Prisma.GroupMemberOrderByWithRelationInput | Prisma.GroupMemberOrderByWithRelationInput[];
    cursor?: Prisma.GroupMemberWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.GroupMemberScalarFieldEnum | Prisma.GroupMemberScalarFieldEnum[];
};
export type User$coachedPlansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrainingPlanSelect<ExtArgs> | null;
    omit?: Prisma.TrainingPlanOmit<ExtArgs> | null;
    include?: Prisma.TrainingPlanInclude<ExtArgs> | null;
    where?: Prisma.TrainingPlanWhereInput;
    orderBy?: Prisma.TrainingPlanOrderByWithRelationInput | Prisma.TrainingPlanOrderByWithRelationInput[];
    cursor?: Prisma.TrainingPlanWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TrainingPlanScalarFieldEnum | Prisma.TrainingPlanScalarFieldEnum[];
};
export type User$attendancesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
    where?: Prisma.AttendanceWhereInput;
    orderBy?: Prisma.AttendanceOrderByWithRelationInput | Prisma.AttendanceOrderByWithRelationInput[];
    cursor?: Prisma.AttendanceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AttendanceScalarFieldEnum | Prisma.AttendanceScalarFieldEnum[];
};
export type UserDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
};
export {};
