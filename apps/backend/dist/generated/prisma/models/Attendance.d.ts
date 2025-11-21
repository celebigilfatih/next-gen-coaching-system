import type * as runtime from '@prisma/client/runtime/library';
import type * as $Enums from '../enums.js';
import type * as Prisma from '../internal/prismaNamespace.js';
export type AttendanceModel = runtime.Types.Result.DefaultSelection<Prisma.$AttendancePayload>;
export type AggregateAttendance = {
    _count: AttendanceCountAggregateOutputType | null;
    _min: AttendanceMinAggregateOutputType | null;
    _max: AttendanceMaxAggregateOutputType | null;
};
export type AttendanceMinAggregateOutputType = {
    id: string | null;
    playerId: string | null;
    planId: string | null;
    status: $Enums.AttendanceStatus | null;
    createdAt: Date | null;
};
export type AttendanceMaxAggregateOutputType = {
    id: string | null;
    playerId: string | null;
    planId: string | null;
    status: $Enums.AttendanceStatus | null;
    createdAt: Date | null;
};
export type AttendanceCountAggregateOutputType = {
    id: number;
    playerId: number;
    planId: number;
    status: number;
    createdAt: number;
    _all: number;
};
export type AttendanceMinAggregateInputType = {
    id?: true;
    playerId?: true;
    planId?: true;
    status?: true;
    createdAt?: true;
};
export type AttendanceMaxAggregateInputType = {
    id?: true;
    playerId?: true;
    planId?: true;
    status?: true;
    createdAt?: true;
};
export type AttendanceCountAggregateInputType = {
    id?: true;
    playerId?: true;
    planId?: true;
    status?: true;
    createdAt?: true;
    _all?: true;
};
export type AttendanceAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AttendanceWhereInput;
    orderBy?: Prisma.AttendanceOrderByWithRelationInput | Prisma.AttendanceOrderByWithRelationInput[];
    cursor?: Prisma.AttendanceWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | AttendanceCountAggregateInputType;
    _min?: AttendanceMinAggregateInputType;
    _max?: AttendanceMaxAggregateInputType;
};
export type GetAttendanceAggregateType<T extends AttendanceAggregateArgs> = {
    [P in keyof T & keyof AggregateAttendance]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAttendance[P]> : Prisma.GetScalarType<T[P], AggregateAttendance[P]>;
};
export type AttendanceGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AttendanceWhereInput;
    orderBy?: Prisma.AttendanceOrderByWithAggregationInput | Prisma.AttendanceOrderByWithAggregationInput[];
    by: Prisma.AttendanceScalarFieldEnum[] | Prisma.AttendanceScalarFieldEnum;
    having?: Prisma.AttendanceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AttendanceCountAggregateInputType | true;
    _min?: AttendanceMinAggregateInputType;
    _max?: AttendanceMaxAggregateInputType;
};
export type AttendanceGroupByOutputType = {
    id: string;
    playerId: string;
    planId: string;
    status: $Enums.AttendanceStatus;
    createdAt: Date;
    _count: AttendanceCountAggregateOutputType | null;
    _min: AttendanceMinAggregateOutputType | null;
    _max: AttendanceMaxAggregateOutputType | null;
};
type GetAttendanceGroupByPayload<T extends AttendanceGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AttendanceGroupByOutputType, T['by']> & {
    [P in keyof T & keyof AttendanceGroupByOutputType]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AttendanceGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AttendanceGroupByOutputType[P]>;
}>>;
export type AttendanceWhereInput = {
    AND?: Prisma.AttendanceWhereInput | Prisma.AttendanceWhereInput[];
    OR?: Prisma.AttendanceWhereInput[];
    NOT?: Prisma.AttendanceWhereInput | Prisma.AttendanceWhereInput[];
    id?: Prisma.StringFilter<'Attendance'> | string;
    playerId?: Prisma.StringFilter<'Attendance'> | string;
    planId?: Prisma.StringFilter<'Attendance'> | string;
    status?: Prisma.EnumAttendanceStatusFilter<'Attendance'> | $Enums.AttendanceStatus;
    createdAt?: Prisma.DateTimeFilter<'Attendance'> | Date | string;
    player?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    plan?: Prisma.XOR<Prisma.TrainingPlanScalarRelationFilter, Prisma.TrainingPlanWhereInput>;
};
export type AttendanceOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    playerId?: Prisma.SortOrder;
    planId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    player?: Prisma.UserOrderByWithRelationInput;
    plan?: Prisma.TrainingPlanOrderByWithRelationInput;
};
export type AttendanceWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.AttendanceWhereInput | Prisma.AttendanceWhereInput[];
    OR?: Prisma.AttendanceWhereInput[];
    NOT?: Prisma.AttendanceWhereInput | Prisma.AttendanceWhereInput[];
    playerId?: Prisma.StringFilter<'Attendance'> | string;
    planId?: Prisma.StringFilter<'Attendance'> | string;
    status?: Prisma.EnumAttendanceStatusFilter<'Attendance'> | $Enums.AttendanceStatus;
    createdAt?: Prisma.DateTimeFilter<'Attendance'> | Date | string;
    player?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    plan?: Prisma.XOR<Prisma.TrainingPlanScalarRelationFilter, Prisma.TrainingPlanWhereInput>;
}, 'id'>;
export type AttendanceOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    playerId?: Prisma.SortOrder;
    planId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.AttendanceCountOrderByAggregateInput;
    _max?: Prisma.AttendanceMaxOrderByAggregateInput;
    _min?: Prisma.AttendanceMinOrderByAggregateInput;
};
export type AttendanceScalarWhereWithAggregatesInput = {
    AND?: Prisma.AttendanceScalarWhereWithAggregatesInput | Prisma.AttendanceScalarWhereWithAggregatesInput[];
    OR?: Prisma.AttendanceScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AttendanceScalarWhereWithAggregatesInput | Prisma.AttendanceScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<'Attendance'> | string;
    playerId?: Prisma.StringWithAggregatesFilter<'Attendance'> | string;
    planId?: Prisma.StringWithAggregatesFilter<'Attendance'> | string;
    status?: Prisma.EnumAttendanceStatusWithAggregatesFilter<'Attendance'> | $Enums.AttendanceStatus;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<'Attendance'> | Date | string;
};
export type AttendanceCreateInput = {
    id?: string;
    status: $Enums.AttendanceStatus;
    createdAt?: Date | string;
    player: Prisma.UserCreateNestedOneWithoutAttendancesInput;
    plan: Prisma.TrainingPlanCreateNestedOneWithoutAttendanceInput;
};
export type AttendanceUncheckedCreateInput = {
    id?: string;
    playerId: string;
    planId: string;
    status: $Enums.AttendanceStatus;
    createdAt?: Date | string;
};
export type AttendanceUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    player?: Prisma.UserUpdateOneRequiredWithoutAttendancesNestedInput;
    plan?: Prisma.TrainingPlanUpdateOneRequiredWithoutAttendanceNestedInput;
};
export type AttendanceUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    playerId?: Prisma.StringFieldUpdateOperationsInput | string;
    planId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceCreateManyInput = {
    id?: string;
    playerId: string;
    planId: string;
    status: $Enums.AttendanceStatus;
    createdAt?: Date | string;
};
export type AttendanceUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    playerId?: Prisma.StringFieldUpdateOperationsInput | string;
    planId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceListRelationFilter = {
    every?: Prisma.AttendanceWhereInput;
    some?: Prisma.AttendanceWhereInput;
    none?: Prisma.AttendanceWhereInput;
};
export type AttendanceOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type AttendanceCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    playerId?: Prisma.SortOrder;
    planId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type AttendanceMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    playerId?: Prisma.SortOrder;
    planId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type AttendanceMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    playerId?: Prisma.SortOrder;
    planId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type AttendanceCreateNestedManyWithoutPlayerInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutPlayerInput, Prisma.AttendanceUncheckedCreateWithoutPlayerInput> | Prisma.AttendanceCreateWithoutPlayerInput[] | Prisma.AttendanceUncheckedCreateWithoutPlayerInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutPlayerInput | Prisma.AttendanceCreateOrConnectWithoutPlayerInput[];
    createMany?: Prisma.AttendanceCreateManyPlayerInputEnvelope;
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
};
export type AttendanceUncheckedCreateNestedManyWithoutPlayerInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutPlayerInput, Prisma.AttendanceUncheckedCreateWithoutPlayerInput> | Prisma.AttendanceCreateWithoutPlayerInput[] | Prisma.AttendanceUncheckedCreateWithoutPlayerInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutPlayerInput | Prisma.AttendanceCreateOrConnectWithoutPlayerInput[];
    createMany?: Prisma.AttendanceCreateManyPlayerInputEnvelope;
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
};
export type AttendanceUpdateManyWithoutPlayerNestedInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutPlayerInput, Prisma.AttendanceUncheckedCreateWithoutPlayerInput> | Prisma.AttendanceCreateWithoutPlayerInput[] | Prisma.AttendanceUncheckedCreateWithoutPlayerInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutPlayerInput | Prisma.AttendanceCreateOrConnectWithoutPlayerInput[];
    upsert?: Prisma.AttendanceUpsertWithWhereUniqueWithoutPlayerInput | Prisma.AttendanceUpsertWithWhereUniqueWithoutPlayerInput[];
    createMany?: Prisma.AttendanceCreateManyPlayerInputEnvelope;
    set?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    disconnect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    delete?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    update?: Prisma.AttendanceUpdateWithWhereUniqueWithoutPlayerInput | Prisma.AttendanceUpdateWithWhereUniqueWithoutPlayerInput[];
    updateMany?: Prisma.AttendanceUpdateManyWithWhereWithoutPlayerInput | Prisma.AttendanceUpdateManyWithWhereWithoutPlayerInput[];
    deleteMany?: Prisma.AttendanceScalarWhereInput | Prisma.AttendanceScalarWhereInput[];
};
export type AttendanceUncheckedUpdateManyWithoutPlayerNestedInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutPlayerInput, Prisma.AttendanceUncheckedCreateWithoutPlayerInput> | Prisma.AttendanceCreateWithoutPlayerInput[] | Prisma.AttendanceUncheckedCreateWithoutPlayerInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutPlayerInput | Prisma.AttendanceCreateOrConnectWithoutPlayerInput[];
    upsert?: Prisma.AttendanceUpsertWithWhereUniqueWithoutPlayerInput | Prisma.AttendanceUpsertWithWhereUniqueWithoutPlayerInput[];
    createMany?: Prisma.AttendanceCreateManyPlayerInputEnvelope;
    set?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    disconnect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    delete?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    update?: Prisma.AttendanceUpdateWithWhereUniqueWithoutPlayerInput | Prisma.AttendanceUpdateWithWhereUniqueWithoutPlayerInput[];
    updateMany?: Prisma.AttendanceUpdateManyWithWhereWithoutPlayerInput | Prisma.AttendanceUpdateManyWithWhereWithoutPlayerInput[];
    deleteMany?: Prisma.AttendanceScalarWhereInput | Prisma.AttendanceScalarWhereInput[];
};
export type AttendanceCreateNestedManyWithoutPlanInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutPlanInput, Prisma.AttendanceUncheckedCreateWithoutPlanInput> | Prisma.AttendanceCreateWithoutPlanInput[] | Prisma.AttendanceUncheckedCreateWithoutPlanInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutPlanInput | Prisma.AttendanceCreateOrConnectWithoutPlanInput[];
    createMany?: Prisma.AttendanceCreateManyPlanInputEnvelope;
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
};
export type AttendanceUncheckedCreateNestedManyWithoutPlanInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutPlanInput, Prisma.AttendanceUncheckedCreateWithoutPlanInput> | Prisma.AttendanceCreateWithoutPlanInput[] | Prisma.AttendanceUncheckedCreateWithoutPlanInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutPlanInput | Prisma.AttendanceCreateOrConnectWithoutPlanInput[];
    createMany?: Prisma.AttendanceCreateManyPlanInputEnvelope;
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
};
export type AttendanceUpdateManyWithoutPlanNestedInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutPlanInput, Prisma.AttendanceUncheckedCreateWithoutPlanInput> | Prisma.AttendanceCreateWithoutPlanInput[] | Prisma.AttendanceUncheckedCreateWithoutPlanInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutPlanInput | Prisma.AttendanceCreateOrConnectWithoutPlanInput[];
    upsert?: Prisma.AttendanceUpsertWithWhereUniqueWithoutPlanInput | Prisma.AttendanceUpsertWithWhereUniqueWithoutPlanInput[];
    createMany?: Prisma.AttendanceCreateManyPlanInputEnvelope;
    set?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    disconnect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    delete?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    update?: Prisma.AttendanceUpdateWithWhereUniqueWithoutPlanInput | Prisma.AttendanceUpdateWithWhereUniqueWithoutPlanInput[];
    updateMany?: Prisma.AttendanceUpdateManyWithWhereWithoutPlanInput | Prisma.AttendanceUpdateManyWithWhereWithoutPlanInput[];
    deleteMany?: Prisma.AttendanceScalarWhereInput | Prisma.AttendanceScalarWhereInput[];
};
export type AttendanceUncheckedUpdateManyWithoutPlanNestedInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutPlanInput, Prisma.AttendanceUncheckedCreateWithoutPlanInput> | Prisma.AttendanceCreateWithoutPlanInput[] | Prisma.AttendanceUncheckedCreateWithoutPlanInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutPlanInput | Prisma.AttendanceCreateOrConnectWithoutPlanInput[];
    upsert?: Prisma.AttendanceUpsertWithWhereUniqueWithoutPlanInput | Prisma.AttendanceUpsertWithWhereUniqueWithoutPlanInput[];
    createMany?: Prisma.AttendanceCreateManyPlanInputEnvelope;
    set?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    disconnect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    delete?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    update?: Prisma.AttendanceUpdateWithWhereUniqueWithoutPlanInput | Prisma.AttendanceUpdateWithWhereUniqueWithoutPlanInput[];
    updateMany?: Prisma.AttendanceUpdateManyWithWhereWithoutPlanInput | Prisma.AttendanceUpdateManyWithWhereWithoutPlanInput[];
    deleteMany?: Prisma.AttendanceScalarWhereInput | Prisma.AttendanceScalarWhereInput[];
};
export type EnumAttendanceStatusFieldUpdateOperationsInput = {
    set?: $Enums.AttendanceStatus;
};
export type AttendanceCreateWithoutPlayerInput = {
    id?: string;
    status: $Enums.AttendanceStatus;
    createdAt?: Date | string;
    plan: Prisma.TrainingPlanCreateNestedOneWithoutAttendanceInput;
};
export type AttendanceUncheckedCreateWithoutPlayerInput = {
    id?: string;
    planId: string;
    status: $Enums.AttendanceStatus;
    createdAt?: Date | string;
};
export type AttendanceCreateOrConnectWithoutPlayerInput = {
    where: Prisma.AttendanceWhereUniqueInput;
    create: Prisma.XOR<Prisma.AttendanceCreateWithoutPlayerInput, Prisma.AttendanceUncheckedCreateWithoutPlayerInput>;
};
export type AttendanceCreateManyPlayerInputEnvelope = {
    data: Prisma.AttendanceCreateManyPlayerInput | Prisma.AttendanceCreateManyPlayerInput[];
    skipDuplicates?: boolean;
};
export type AttendanceUpsertWithWhereUniqueWithoutPlayerInput = {
    where: Prisma.AttendanceWhereUniqueInput;
    update: Prisma.XOR<Prisma.AttendanceUpdateWithoutPlayerInput, Prisma.AttendanceUncheckedUpdateWithoutPlayerInput>;
    create: Prisma.XOR<Prisma.AttendanceCreateWithoutPlayerInput, Prisma.AttendanceUncheckedCreateWithoutPlayerInput>;
};
export type AttendanceUpdateWithWhereUniqueWithoutPlayerInput = {
    where: Prisma.AttendanceWhereUniqueInput;
    data: Prisma.XOR<Prisma.AttendanceUpdateWithoutPlayerInput, Prisma.AttendanceUncheckedUpdateWithoutPlayerInput>;
};
export type AttendanceUpdateManyWithWhereWithoutPlayerInput = {
    where: Prisma.AttendanceScalarWhereInput;
    data: Prisma.XOR<Prisma.AttendanceUpdateManyMutationInput, Prisma.AttendanceUncheckedUpdateManyWithoutPlayerInput>;
};
export type AttendanceScalarWhereInput = {
    AND?: Prisma.AttendanceScalarWhereInput | Prisma.AttendanceScalarWhereInput[];
    OR?: Prisma.AttendanceScalarWhereInput[];
    NOT?: Prisma.AttendanceScalarWhereInput | Prisma.AttendanceScalarWhereInput[];
    id?: Prisma.StringFilter<'Attendance'> | string;
    playerId?: Prisma.StringFilter<'Attendance'> | string;
    planId?: Prisma.StringFilter<'Attendance'> | string;
    status?: Prisma.EnumAttendanceStatusFilter<'Attendance'> | $Enums.AttendanceStatus;
    createdAt?: Prisma.DateTimeFilter<'Attendance'> | Date | string;
};
export type AttendanceCreateWithoutPlanInput = {
    id?: string;
    status: $Enums.AttendanceStatus;
    createdAt?: Date | string;
    player: Prisma.UserCreateNestedOneWithoutAttendancesInput;
};
export type AttendanceUncheckedCreateWithoutPlanInput = {
    id?: string;
    playerId: string;
    status: $Enums.AttendanceStatus;
    createdAt?: Date | string;
};
export type AttendanceCreateOrConnectWithoutPlanInput = {
    where: Prisma.AttendanceWhereUniqueInput;
    create: Prisma.XOR<Prisma.AttendanceCreateWithoutPlanInput, Prisma.AttendanceUncheckedCreateWithoutPlanInput>;
};
export type AttendanceCreateManyPlanInputEnvelope = {
    data: Prisma.AttendanceCreateManyPlanInput | Prisma.AttendanceCreateManyPlanInput[];
    skipDuplicates?: boolean;
};
export type AttendanceUpsertWithWhereUniqueWithoutPlanInput = {
    where: Prisma.AttendanceWhereUniqueInput;
    update: Prisma.XOR<Prisma.AttendanceUpdateWithoutPlanInput, Prisma.AttendanceUncheckedUpdateWithoutPlanInput>;
    create: Prisma.XOR<Prisma.AttendanceCreateWithoutPlanInput, Prisma.AttendanceUncheckedCreateWithoutPlanInput>;
};
export type AttendanceUpdateWithWhereUniqueWithoutPlanInput = {
    where: Prisma.AttendanceWhereUniqueInput;
    data: Prisma.XOR<Prisma.AttendanceUpdateWithoutPlanInput, Prisma.AttendanceUncheckedUpdateWithoutPlanInput>;
};
export type AttendanceUpdateManyWithWhereWithoutPlanInput = {
    where: Prisma.AttendanceScalarWhereInput;
    data: Prisma.XOR<Prisma.AttendanceUpdateManyMutationInput, Prisma.AttendanceUncheckedUpdateManyWithoutPlanInput>;
};
export type AttendanceCreateManyPlayerInput = {
    id?: string;
    planId: string;
    status: $Enums.AttendanceStatus;
    createdAt?: Date | string;
};
export type AttendanceUpdateWithoutPlayerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    plan?: Prisma.TrainingPlanUpdateOneRequiredWithoutAttendanceNestedInput;
};
export type AttendanceUncheckedUpdateWithoutPlayerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    planId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceUncheckedUpdateManyWithoutPlayerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    planId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceCreateManyPlanInput = {
    id?: string;
    playerId: string;
    status: $Enums.AttendanceStatus;
    createdAt?: Date | string;
};
export type AttendanceUpdateWithoutPlanInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    player?: Prisma.UserUpdateOneRequiredWithoutAttendancesNestedInput;
};
export type AttendanceUncheckedUpdateWithoutPlanInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    playerId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceUncheckedUpdateManyWithoutPlanInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    playerId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    playerId?: boolean;
    planId?: boolean;
    status?: boolean;
    createdAt?: boolean;
    player?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    plan?: boolean | Prisma.TrainingPlanDefaultArgs<ExtArgs>;
}, ExtArgs['result']['attendance']>;
export type AttendanceSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    playerId?: boolean;
    planId?: boolean;
    status?: boolean;
    createdAt?: boolean;
    player?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    plan?: boolean | Prisma.TrainingPlanDefaultArgs<ExtArgs>;
}, ExtArgs['result']['attendance']>;
export type AttendanceSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    playerId?: boolean;
    planId?: boolean;
    status?: boolean;
    createdAt?: boolean;
    player?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    plan?: boolean | Prisma.TrainingPlanDefaultArgs<ExtArgs>;
}, ExtArgs['result']['attendance']>;
export type AttendanceSelectScalar = {
    id?: boolean;
    playerId?: boolean;
    planId?: boolean;
    status?: boolean;
    createdAt?: boolean;
};
export type AttendanceOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<'id' | 'playerId' | 'planId' | 'status' | 'createdAt', ExtArgs['result']['attendance']>;
export type AttendanceInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    player?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    plan?: boolean | Prisma.TrainingPlanDefaultArgs<ExtArgs>;
};
export type AttendanceIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    player?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    plan?: boolean | Prisma.TrainingPlanDefaultArgs<ExtArgs>;
};
export type AttendanceIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    player?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    plan?: boolean | Prisma.TrainingPlanDefaultArgs<ExtArgs>;
};
export type $AttendancePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: 'Attendance';
    objects: {
        player: Prisma.$UserPayload<ExtArgs>;
        plan: Prisma.$TrainingPlanPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        playerId: string;
        planId: string;
        status: $Enums.AttendanceStatus;
        createdAt: Date;
    }, ExtArgs['result']['attendance']>;
    composites: {};
};
export type AttendanceGetPayload<S extends boolean | null | undefined | AttendanceDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AttendancePayload, S>;
export type AttendanceCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AttendanceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AttendanceCountAggregateInputType | true;
};
export interface AttendanceDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Attendance'];
        meta: {
            name: 'Attendance';
        };
    };
    findUnique<T extends AttendanceFindUniqueArgs>(args: Prisma.SelectSubset<T, AttendanceFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, 'findUnique', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends AttendanceFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AttendanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends AttendanceFindFirstArgs>(args?: Prisma.SelectSubset<T, AttendanceFindFirstArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, 'findFirst', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends AttendanceFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AttendanceFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, 'findFirstOrThrow', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends AttendanceFindManyArgs>(args?: Prisma.SelectSubset<T, AttendanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>>;
    create<T extends AttendanceCreateArgs>(args: Prisma.SelectSubset<T, AttendanceCreateArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, 'create', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends AttendanceCreateManyArgs>(args?: Prisma.SelectSubset<T, AttendanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends AttendanceCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, AttendanceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, 'createManyAndReturn', GlobalOmitOptions>>;
    delete<T extends AttendanceDeleteArgs>(args: Prisma.SelectSubset<T, AttendanceDeleteArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, 'delete', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends AttendanceUpdateArgs>(args: Prisma.SelectSubset<T, AttendanceUpdateArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, 'update', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends AttendanceDeleteManyArgs>(args?: Prisma.SelectSubset<T, AttendanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends AttendanceUpdateManyArgs>(args: Prisma.SelectSubset<T, AttendanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends AttendanceUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, AttendanceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, 'updateManyAndReturn', GlobalOmitOptions>>;
    upsert<T extends AttendanceUpsertArgs>(args: Prisma.SelectSubset<T, AttendanceUpsertArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends AttendanceCountArgs>(args?: Prisma.Subset<T, AttendanceCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AttendanceCountAggregateOutputType> : number>;
    aggregate<T extends AttendanceAggregateArgs>(args: Prisma.Subset<T, AttendanceAggregateArgs>): Prisma.PrismaPromise<GetAttendanceAggregateType<T>>;
    groupBy<T extends AttendanceGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AttendanceGroupByArgs['orderBy'];
    } : {
        orderBy?: AttendanceGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AttendanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAttendanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: AttendanceFieldRefs;
}
export interface Prisma__AttendanceClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    player<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    plan<T extends Prisma.TrainingPlanDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TrainingPlanDefaultArgs<ExtArgs>>): Prisma.Prisma__TrainingPlanClient<runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface AttendanceFieldRefs {
    readonly id: Prisma.FieldRef<'Attendance', 'String'>;
    readonly playerId: Prisma.FieldRef<'Attendance', 'String'>;
    readonly planId: Prisma.FieldRef<'Attendance', 'String'>;
    readonly status: Prisma.FieldRef<'Attendance', 'AttendanceStatus'>;
    readonly createdAt: Prisma.FieldRef<'Attendance', 'DateTime'>;
}
export type AttendanceFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
    where: Prisma.AttendanceWhereUniqueInput;
};
export type AttendanceFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
    where: Prisma.AttendanceWhereUniqueInput;
};
export type AttendanceFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AttendanceFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AttendanceFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AttendanceCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AttendanceCreateInput, Prisma.AttendanceUncheckedCreateInput>;
};
export type AttendanceCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.AttendanceCreateManyInput | Prisma.AttendanceCreateManyInput[];
    skipDuplicates?: boolean;
};
export type AttendanceCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    data: Prisma.AttendanceCreateManyInput | Prisma.AttendanceCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.AttendanceIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type AttendanceUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AttendanceUpdateInput, Prisma.AttendanceUncheckedUpdateInput>;
    where: Prisma.AttendanceWhereUniqueInput;
};
export type AttendanceUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.AttendanceUpdateManyMutationInput, Prisma.AttendanceUncheckedUpdateManyInput>;
    where?: Prisma.AttendanceWhereInput;
    limit?: number;
};
export type AttendanceUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AttendanceUpdateManyMutationInput, Prisma.AttendanceUncheckedUpdateManyInput>;
    where?: Prisma.AttendanceWhereInput;
    limit?: number;
    include?: Prisma.AttendanceIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type AttendanceUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
    where: Prisma.AttendanceWhereUniqueInput;
    create: Prisma.XOR<Prisma.AttendanceCreateInput, Prisma.AttendanceUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.AttendanceUpdateInput, Prisma.AttendanceUncheckedUpdateInput>;
};
export type AttendanceDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
    where: Prisma.AttendanceWhereUniqueInput;
};
export type AttendanceDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AttendanceWhereInput;
    limit?: number;
};
export type AttendanceDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
};
export {};
