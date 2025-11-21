import type * as runtime from '@prisma/client/runtime/library';
import type * as Prisma from '../internal/prismaNamespace.js';
export type TrainingPlanModel = runtime.Types.Result.DefaultSelection<Prisma.$TrainingPlanPayload>;
export type AggregateTrainingPlan = {
    _count: TrainingPlanCountAggregateOutputType | null;
    _avg: TrainingPlanAvgAggregateOutputType | null;
    _sum: TrainingPlanSumAggregateOutputType | null;
    _min: TrainingPlanMinAggregateOutputType | null;
    _max: TrainingPlanMaxAggregateOutputType | null;
};
export type TrainingPlanAvgAggregateOutputType = {
    totalDuration: number | null;
};
export type TrainingPlanSumAggregateOutputType = {
    totalDuration: number | null;
};
export type TrainingPlanMinAggregateOutputType = {
    id: string | null;
    title: string | null;
    clubId: string | null;
    coachId: string | null;
    totalDuration: number | null;
    groupId: string | null;
    date: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TrainingPlanMaxAggregateOutputType = {
    id: string | null;
    title: string | null;
    clubId: string | null;
    coachId: string | null;
    totalDuration: number | null;
    groupId: string | null;
    date: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TrainingPlanCountAggregateOutputType = {
    id: number;
    title: number;
    clubId: number;
    coachId: number;
    totalDuration: number;
    groupId: number;
    date: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type TrainingPlanAvgAggregateInputType = {
    totalDuration?: true;
};
export type TrainingPlanSumAggregateInputType = {
    totalDuration?: true;
};
export type TrainingPlanMinAggregateInputType = {
    id?: true;
    title?: true;
    clubId?: true;
    coachId?: true;
    totalDuration?: true;
    groupId?: true;
    date?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TrainingPlanMaxAggregateInputType = {
    id?: true;
    title?: true;
    clubId?: true;
    coachId?: true;
    totalDuration?: true;
    groupId?: true;
    date?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TrainingPlanCountAggregateInputType = {
    id?: true;
    title?: true;
    clubId?: true;
    coachId?: true;
    totalDuration?: true;
    groupId?: true;
    date?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type TrainingPlanAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TrainingPlanWhereInput;
    orderBy?: Prisma.TrainingPlanOrderByWithRelationInput | Prisma.TrainingPlanOrderByWithRelationInput[];
    cursor?: Prisma.TrainingPlanWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TrainingPlanCountAggregateInputType;
    _avg?: TrainingPlanAvgAggregateInputType;
    _sum?: TrainingPlanSumAggregateInputType;
    _min?: TrainingPlanMinAggregateInputType;
    _max?: TrainingPlanMaxAggregateInputType;
};
export type GetTrainingPlanAggregateType<T extends TrainingPlanAggregateArgs> = {
    [P in keyof T & keyof AggregateTrainingPlan]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTrainingPlan[P]> : Prisma.GetScalarType<T[P], AggregateTrainingPlan[P]>;
};
export type TrainingPlanGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TrainingPlanWhereInput;
    orderBy?: Prisma.TrainingPlanOrderByWithAggregationInput | Prisma.TrainingPlanOrderByWithAggregationInput[];
    by: Prisma.TrainingPlanScalarFieldEnum[] | Prisma.TrainingPlanScalarFieldEnum;
    having?: Prisma.TrainingPlanScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TrainingPlanCountAggregateInputType | true;
    _avg?: TrainingPlanAvgAggregateInputType;
    _sum?: TrainingPlanSumAggregateInputType;
    _min?: TrainingPlanMinAggregateInputType;
    _max?: TrainingPlanMaxAggregateInputType;
};
export type TrainingPlanGroupByOutputType = {
    id: string;
    title: string;
    clubId: string;
    coachId: string;
    totalDuration: number;
    groupId: string | null;
    date: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: TrainingPlanCountAggregateOutputType | null;
    _avg: TrainingPlanAvgAggregateOutputType | null;
    _sum: TrainingPlanSumAggregateOutputType | null;
    _min: TrainingPlanMinAggregateOutputType | null;
    _max: TrainingPlanMaxAggregateOutputType | null;
};
type GetTrainingPlanGroupByPayload<T extends TrainingPlanGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TrainingPlanGroupByOutputType, T['by']> & {
    [P in keyof T & keyof TrainingPlanGroupByOutputType]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TrainingPlanGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TrainingPlanGroupByOutputType[P]>;
}>>;
export type TrainingPlanWhereInput = {
    AND?: Prisma.TrainingPlanWhereInput | Prisma.TrainingPlanWhereInput[];
    OR?: Prisma.TrainingPlanWhereInput[];
    NOT?: Prisma.TrainingPlanWhereInput | Prisma.TrainingPlanWhereInput[];
    id?: Prisma.StringFilter<'TrainingPlan'> | string;
    title?: Prisma.StringFilter<'TrainingPlan'> | string;
    clubId?: Prisma.StringFilter<'TrainingPlan'> | string;
    coachId?: Prisma.StringFilter<'TrainingPlan'> | string;
    totalDuration?: Prisma.IntFilter<'TrainingPlan'> | number;
    groupId?: Prisma.StringNullableFilter<'TrainingPlan'> | string | null;
    date?: Prisma.DateTimeNullableFilter<'TrainingPlan'> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<'TrainingPlan'> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<'TrainingPlan'> | Date | string;
    club?: Prisma.XOR<Prisma.ClubScalarRelationFilter, Prisma.ClubWhereInput>;
    coach?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    drills?: Prisma.PlanDrillListRelationFilter;
    group?: Prisma.XOR<Prisma.PlayerGroupNullableScalarRelationFilter, Prisma.PlayerGroupWhereInput> | null;
    attendance?: Prisma.AttendanceListRelationFilter;
};
export type TrainingPlanOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    clubId?: Prisma.SortOrder;
    coachId?: Prisma.SortOrder;
    totalDuration?: Prisma.SortOrder;
    groupId?: Prisma.SortOrderInput | Prisma.SortOrder;
    date?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    club?: Prisma.ClubOrderByWithRelationInput;
    coach?: Prisma.UserOrderByWithRelationInput;
    drills?: Prisma.PlanDrillOrderByRelationAggregateInput;
    group?: Prisma.PlayerGroupOrderByWithRelationInput;
    attendance?: Prisma.AttendanceOrderByRelationAggregateInput;
};
export type TrainingPlanWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.TrainingPlanWhereInput | Prisma.TrainingPlanWhereInput[];
    OR?: Prisma.TrainingPlanWhereInput[];
    NOT?: Prisma.TrainingPlanWhereInput | Prisma.TrainingPlanWhereInput[];
    title?: Prisma.StringFilter<'TrainingPlan'> | string;
    clubId?: Prisma.StringFilter<'TrainingPlan'> | string;
    coachId?: Prisma.StringFilter<'TrainingPlan'> | string;
    totalDuration?: Prisma.IntFilter<'TrainingPlan'> | number;
    groupId?: Prisma.StringNullableFilter<'TrainingPlan'> | string | null;
    date?: Prisma.DateTimeNullableFilter<'TrainingPlan'> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<'TrainingPlan'> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<'TrainingPlan'> | Date | string;
    club?: Prisma.XOR<Prisma.ClubScalarRelationFilter, Prisma.ClubWhereInput>;
    coach?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    drills?: Prisma.PlanDrillListRelationFilter;
    group?: Prisma.XOR<Prisma.PlayerGroupNullableScalarRelationFilter, Prisma.PlayerGroupWhereInput> | null;
    attendance?: Prisma.AttendanceListRelationFilter;
}, 'id'>;
export type TrainingPlanOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    clubId?: Prisma.SortOrder;
    coachId?: Prisma.SortOrder;
    totalDuration?: Prisma.SortOrder;
    groupId?: Prisma.SortOrderInput | Prisma.SortOrder;
    date?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.TrainingPlanCountOrderByAggregateInput;
    _avg?: Prisma.TrainingPlanAvgOrderByAggregateInput;
    _max?: Prisma.TrainingPlanMaxOrderByAggregateInput;
    _min?: Prisma.TrainingPlanMinOrderByAggregateInput;
    _sum?: Prisma.TrainingPlanSumOrderByAggregateInput;
};
export type TrainingPlanScalarWhereWithAggregatesInput = {
    AND?: Prisma.TrainingPlanScalarWhereWithAggregatesInput | Prisma.TrainingPlanScalarWhereWithAggregatesInput[];
    OR?: Prisma.TrainingPlanScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TrainingPlanScalarWhereWithAggregatesInput | Prisma.TrainingPlanScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<'TrainingPlan'> | string;
    title?: Prisma.StringWithAggregatesFilter<'TrainingPlan'> | string;
    clubId?: Prisma.StringWithAggregatesFilter<'TrainingPlan'> | string;
    coachId?: Prisma.StringWithAggregatesFilter<'TrainingPlan'> | string;
    totalDuration?: Prisma.IntWithAggregatesFilter<'TrainingPlan'> | number;
    groupId?: Prisma.StringNullableWithAggregatesFilter<'TrainingPlan'> | string | null;
    date?: Prisma.DateTimeNullableWithAggregatesFilter<'TrainingPlan'> | Date | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<'TrainingPlan'> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<'TrainingPlan'> | Date | string;
};
export type TrainingPlanCreateInput = {
    id?: string;
    title: string;
    totalDuration?: number;
    date?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    club: Prisma.ClubCreateNestedOneWithoutPlansInput;
    coach: Prisma.UserCreateNestedOneWithoutCoachedPlansInput;
    drills?: Prisma.PlanDrillCreateNestedManyWithoutTrainingPlanInput;
    group?: Prisma.PlayerGroupCreateNestedOneWithoutSessionsInput;
    attendance?: Prisma.AttendanceCreateNestedManyWithoutPlanInput;
};
export type TrainingPlanUncheckedCreateInput = {
    id?: string;
    title: string;
    clubId: string;
    coachId: string;
    totalDuration?: number;
    groupId?: string | null;
    date?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    drills?: Prisma.PlanDrillUncheckedCreateNestedManyWithoutTrainingPlanInput;
    attendance?: Prisma.AttendanceUncheckedCreateNestedManyWithoutPlanInput;
};
export type TrainingPlanUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    club?: Prisma.ClubUpdateOneRequiredWithoutPlansNestedInput;
    coach?: Prisma.UserUpdateOneRequiredWithoutCoachedPlansNestedInput;
    drills?: Prisma.PlanDrillUpdateManyWithoutTrainingPlanNestedInput;
    group?: Prisma.PlayerGroupUpdateOneWithoutSessionsNestedInput;
    attendance?: Prisma.AttendanceUpdateManyWithoutPlanNestedInput;
};
export type TrainingPlanUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    clubId?: Prisma.StringFieldUpdateOperationsInput | string;
    coachId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    groupId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    drills?: Prisma.PlanDrillUncheckedUpdateManyWithoutTrainingPlanNestedInput;
    attendance?: Prisma.AttendanceUncheckedUpdateManyWithoutPlanNestedInput;
};
export type TrainingPlanCreateManyInput = {
    id?: string;
    title: string;
    clubId: string;
    coachId: string;
    totalDuration?: number;
    groupId?: string | null;
    date?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TrainingPlanUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TrainingPlanUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    clubId?: Prisma.StringFieldUpdateOperationsInput | string;
    coachId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    groupId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TrainingPlanListRelationFilter = {
    every?: Prisma.TrainingPlanWhereInput;
    some?: Prisma.TrainingPlanWhereInput;
    none?: Prisma.TrainingPlanWhereInput;
};
export type TrainingPlanOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TrainingPlanCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    clubId?: Prisma.SortOrder;
    coachId?: Prisma.SortOrder;
    totalDuration?: Prisma.SortOrder;
    groupId?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TrainingPlanAvgOrderByAggregateInput = {
    totalDuration?: Prisma.SortOrder;
};
export type TrainingPlanMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    clubId?: Prisma.SortOrder;
    coachId?: Prisma.SortOrder;
    totalDuration?: Prisma.SortOrder;
    groupId?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TrainingPlanMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    clubId?: Prisma.SortOrder;
    coachId?: Prisma.SortOrder;
    totalDuration?: Prisma.SortOrder;
    groupId?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TrainingPlanSumOrderByAggregateInput = {
    totalDuration?: Prisma.SortOrder;
};
export type TrainingPlanScalarRelationFilter = {
    is?: Prisma.TrainingPlanWhereInput;
    isNot?: Prisma.TrainingPlanWhereInput;
};
export type TrainingPlanCreateNestedManyWithoutCoachInput = {
    create?: Prisma.XOR<Prisma.TrainingPlanCreateWithoutCoachInput, Prisma.TrainingPlanUncheckedCreateWithoutCoachInput> | Prisma.TrainingPlanCreateWithoutCoachInput[] | Prisma.TrainingPlanUncheckedCreateWithoutCoachInput[];
    connectOrCreate?: Prisma.TrainingPlanCreateOrConnectWithoutCoachInput | Prisma.TrainingPlanCreateOrConnectWithoutCoachInput[];
    createMany?: Prisma.TrainingPlanCreateManyCoachInputEnvelope;
    connect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
};
export type TrainingPlanUncheckedCreateNestedManyWithoutCoachInput = {
    create?: Prisma.XOR<Prisma.TrainingPlanCreateWithoutCoachInput, Prisma.TrainingPlanUncheckedCreateWithoutCoachInput> | Prisma.TrainingPlanCreateWithoutCoachInput[] | Prisma.TrainingPlanUncheckedCreateWithoutCoachInput[];
    connectOrCreate?: Prisma.TrainingPlanCreateOrConnectWithoutCoachInput | Prisma.TrainingPlanCreateOrConnectWithoutCoachInput[];
    createMany?: Prisma.TrainingPlanCreateManyCoachInputEnvelope;
    connect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
};
export type TrainingPlanUpdateManyWithoutCoachNestedInput = {
    create?: Prisma.XOR<Prisma.TrainingPlanCreateWithoutCoachInput, Prisma.TrainingPlanUncheckedCreateWithoutCoachInput> | Prisma.TrainingPlanCreateWithoutCoachInput[] | Prisma.TrainingPlanUncheckedCreateWithoutCoachInput[];
    connectOrCreate?: Prisma.TrainingPlanCreateOrConnectWithoutCoachInput | Prisma.TrainingPlanCreateOrConnectWithoutCoachInput[];
    upsert?: Prisma.TrainingPlanUpsertWithWhereUniqueWithoutCoachInput | Prisma.TrainingPlanUpsertWithWhereUniqueWithoutCoachInput[];
    createMany?: Prisma.TrainingPlanCreateManyCoachInputEnvelope;
    set?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    disconnect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    delete?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    connect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    update?: Prisma.TrainingPlanUpdateWithWhereUniqueWithoutCoachInput | Prisma.TrainingPlanUpdateWithWhereUniqueWithoutCoachInput[];
    updateMany?: Prisma.TrainingPlanUpdateManyWithWhereWithoutCoachInput | Prisma.TrainingPlanUpdateManyWithWhereWithoutCoachInput[];
    deleteMany?: Prisma.TrainingPlanScalarWhereInput | Prisma.TrainingPlanScalarWhereInput[];
};
export type TrainingPlanUncheckedUpdateManyWithoutCoachNestedInput = {
    create?: Prisma.XOR<Prisma.TrainingPlanCreateWithoutCoachInput, Prisma.TrainingPlanUncheckedCreateWithoutCoachInput> | Prisma.TrainingPlanCreateWithoutCoachInput[] | Prisma.TrainingPlanUncheckedCreateWithoutCoachInput[];
    connectOrCreate?: Prisma.TrainingPlanCreateOrConnectWithoutCoachInput | Prisma.TrainingPlanCreateOrConnectWithoutCoachInput[];
    upsert?: Prisma.TrainingPlanUpsertWithWhereUniqueWithoutCoachInput | Prisma.TrainingPlanUpsertWithWhereUniqueWithoutCoachInput[];
    createMany?: Prisma.TrainingPlanCreateManyCoachInputEnvelope;
    set?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    disconnect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    delete?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    connect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    update?: Prisma.TrainingPlanUpdateWithWhereUniqueWithoutCoachInput | Prisma.TrainingPlanUpdateWithWhereUniqueWithoutCoachInput[];
    updateMany?: Prisma.TrainingPlanUpdateManyWithWhereWithoutCoachInput | Prisma.TrainingPlanUpdateManyWithWhereWithoutCoachInput[];
    deleteMany?: Prisma.TrainingPlanScalarWhereInput | Prisma.TrainingPlanScalarWhereInput[];
};
export type TrainingPlanCreateNestedManyWithoutClubInput = {
    create?: Prisma.XOR<Prisma.TrainingPlanCreateWithoutClubInput, Prisma.TrainingPlanUncheckedCreateWithoutClubInput> | Prisma.TrainingPlanCreateWithoutClubInput[] | Prisma.TrainingPlanUncheckedCreateWithoutClubInput[];
    connectOrCreate?: Prisma.TrainingPlanCreateOrConnectWithoutClubInput | Prisma.TrainingPlanCreateOrConnectWithoutClubInput[];
    createMany?: Prisma.TrainingPlanCreateManyClubInputEnvelope;
    connect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
};
export type TrainingPlanUncheckedCreateNestedManyWithoutClubInput = {
    create?: Prisma.XOR<Prisma.TrainingPlanCreateWithoutClubInput, Prisma.TrainingPlanUncheckedCreateWithoutClubInput> | Prisma.TrainingPlanCreateWithoutClubInput[] | Prisma.TrainingPlanUncheckedCreateWithoutClubInput[];
    connectOrCreate?: Prisma.TrainingPlanCreateOrConnectWithoutClubInput | Prisma.TrainingPlanCreateOrConnectWithoutClubInput[];
    createMany?: Prisma.TrainingPlanCreateManyClubInputEnvelope;
    connect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
};
export type TrainingPlanUpdateManyWithoutClubNestedInput = {
    create?: Prisma.XOR<Prisma.TrainingPlanCreateWithoutClubInput, Prisma.TrainingPlanUncheckedCreateWithoutClubInput> | Prisma.TrainingPlanCreateWithoutClubInput[] | Prisma.TrainingPlanUncheckedCreateWithoutClubInput[];
    connectOrCreate?: Prisma.TrainingPlanCreateOrConnectWithoutClubInput | Prisma.TrainingPlanCreateOrConnectWithoutClubInput[];
    upsert?: Prisma.TrainingPlanUpsertWithWhereUniqueWithoutClubInput | Prisma.TrainingPlanUpsertWithWhereUniqueWithoutClubInput[];
    createMany?: Prisma.TrainingPlanCreateManyClubInputEnvelope;
    set?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    disconnect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    delete?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    connect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    update?: Prisma.TrainingPlanUpdateWithWhereUniqueWithoutClubInput | Prisma.TrainingPlanUpdateWithWhereUniqueWithoutClubInput[];
    updateMany?: Prisma.TrainingPlanUpdateManyWithWhereWithoutClubInput | Prisma.TrainingPlanUpdateManyWithWhereWithoutClubInput[];
    deleteMany?: Prisma.TrainingPlanScalarWhereInput | Prisma.TrainingPlanScalarWhereInput[];
};
export type TrainingPlanUncheckedUpdateManyWithoutClubNestedInput = {
    create?: Prisma.XOR<Prisma.TrainingPlanCreateWithoutClubInput, Prisma.TrainingPlanUncheckedCreateWithoutClubInput> | Prisma.TrainingPlanCreateWithoutClubInput[] | Prisma.TrainingPlanUncheckedCreateWithoutClubInput[];
    connectOrCreate?: Prisma.TrainingPlanCreateOrConnectWithoutClubInput | Prisma.TrainingPlanCreateOrConnectWithoutClubInput[];
    upsert?: Prisma.TrainingPlanUpsertWithWhereUniqueWithoutClubInput | Prisma.TrainingPlanUpsertWithWhereUniqueWithoutClubInput[];
    createMany?: Prisma.TrainingPlanCreateManyClubInputEnvelope;
    set?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    disconnect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    delete?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    connect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    update?: Prisma.TrainingPlanUpdateWithWhereUniqueWithoutClubInput | Prisma.TrainingPlanUpdateWithWhereUniqueWithoutClubInput[];
    updateMany?: Prisma.TrainingPlanUpdateManyWithWhereWithoutClubInput | Prisma.TrainingPlanUpdateManyWithWhereWithoutClubInput[];
    deleteMany?: Prisma.TrainingPlanScalarWhereInput | Prisma.TrainingPlanScalarWhereInput[];
};
export type TrainingPlanCreateNestedManyWithoutGroupInput = {
    create?: Prisma.XOR<Prisma.TrainingPlanCreateWithoutGroupInput, Prisma.TrainingPlanUncheckedCreateWithoutGroupInput> | Prisma.TrainingPlanCreateWithoutGroupInput[] | Prisma.TrainingPlanUncheckedCreateWithoutGroupInput[];
    connectOrCreate?: Prisma.TrainingPlanCreateOrConnectWithoutGroupInput | Prisma.TrainingPlanCreateOrConnectWithoutGroupInput[];
    createMany?: Prisma.TrainingPlanCreateManyGroupInputEnvelope;
    connect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
};
export type TrainingPlanUncheckedCreateNestedManyWithoutGroupInput = {
    create?: Prisma.XOR<Prisma.TrainingPlanCreateWithoutGroupInput, Prisma.TrainingPlanUncheckedCreateWithoutGroupInput> | Prisma.TrainingPlanCreateWithoutGroupInput[] | Prisma.TrainingPlanUncheckedCreateWithoutGroupInput[];
    connectOrCreate?: Prisma.TrainingPlanCreateOrConnectWithoutGroupInput | Prisma.TrainingPlanCreateOrConnectWithoutGroupInput[];
    createMany?: Prisma.TrainingPlanCreateManyGroupInputEnvelope;
    connect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
};
export type TrainingPlanUpdateManyWithoutGroupNestedInput = {
    create?: Prisma.XOR<Prisma.TrainingPlanCreateWithoutGroupInput, Prisma.TrainingPlanUncheckedCreateWithoutGroupInput> | Prisma.TrainingPlanCreateWithoutGroupInput[] | Prisma.TrainingPlanUncheckedCreateWithoutGroupInput[];
    connectOrCreate?: Prisma.TrainingPlanCreateOrConnectWithoutGroupInput | Prisma.TrainingPlanCreateOrConnectWithoutGroupInput[];
    upsert?: Prisma.TrainingPlanUpsertWithWhereUniqueWithoutGroupInput | Prisma.TrainingPlanUpsertWithWhereUniqueWithoutGroupInput[];
    createMany?: Prisma.TrainingPlanCreateManyGroupInputEnvelope;
    set?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    disconnect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    delete?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    connect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    update?: Prisma.TrainingPlanUpdateWithWhereUniqueWithoutGroupInput | Prisma.TrainingPlanUpdateWithWhereUniqueWithoutGroupInput[];
    updateMany?: Prisma.TrainingPlanUpdateManyWithWhereWithoutGroupInput | Prisma.TrainingPlanUpdateManyWithWhereWithoutGroupInput[];
    deleteMany?: Prisma.TrainingPlanScalarWhereInput | Prisma.TrainingPlanScalarWhereInput[];
};
export type TrainingPlanUncheckedUpdateManyWithoutGroupNestedInput = {
    create?: Prisma.XOR<Prisma.TrainingPlanCreateWithoutGroupInput, Prisma.TrainingPlanUncheckedCreateWithoutGroupInput> | Prisma.TrainingPlanCreateWithoutGroupInput[] | Prisma.TrainingPlanUncheckedCreateWithoutGroupInput[];
    connectOrCreate?: Prisma.TrainingPlanCreateOrConnectWithoutGroupInput | Prisma.TrainingPlanCreateOrConnectWithoutGroupInput[];
    upsert?: Prisma.TrainingPlanUpsertWithWhereUniqueWithoutGroupInput | Prisma.TrainingPlanUpsertWithWhereUniqueWithoutGroupInput[];
    createMany?: Prisma.TrainingPlanCreateManyGroupInputEnvelope;
    set?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    disconnect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    delete?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    connect?: Prisma.TrainingPlanWhereUniqueInput | Prisma.TrainingPlanWhereUniqueInput[];
    update?: Prisma.TrainingPlanUpdateWithWhereUniqueWithoutGroupInput | Prisma.TrainingPlanUpdateWithWhereUniqueWithoutGroupInput[];
    updateMany?: Prisma.TrainingPlanUpdateManyWithWhereWithoutGroupInput | Prisma.TrainingPlanUpdateManyWithWhereWithoutGroupInput[];
    deleteMany?: Prisma.TrainingPlanScalarWhereInput | Prisma.TrainingPlanScalarWhereInput[];
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type TrainingPlanCreateNestedOneWithoutDrillsInput = {
    create?: Prisma.XOR<Prisma.TrainingPlanCreateWithoutDrillsInput, Prisma.TrainingPlanUncheckedCreateWithoutDrillsInput>;
    connectOrCreate?: Prisma.TrainingPlanCreateOrConnectWithoutDrillsInput;
    connect?: Prisma.TrainingPlanWhereUniqueInput;
};
export type TrainingPlanUpdateOneRequiredWithoutDrillsNestedInput = {
    create?: Prisma.XOR<Prisma.TrainingPlanCreateWithoutDrillsInput, Prisma.TrainingPlanUncheckedCreateWithoutDrillsInput>;
    connectOrCreate?: Prisma.TrainingPlanCreateOrConnectWithoutDrillsInput;
    upsert?: Prisma.TrainingPlanUpsertWithoutDrillsInput;
    connect?: Prisma.TrainingPlanWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TrainingPlanUpdateToOneWithWhereWithoutDrillsInput, Prisma.TrainingPlanUpdateWithoutDrillsInput>, Prisma.TrainingPlanUncheckedUpdateWithoutDrillsInput>;
};
export type TrainingPlanCreateNestedOneWithoutAttendanceInput = {
    create?: Prisma.XOR<Prisma.TrainingPlanCreateWithoutAttendanceInput, Prisma.TrainingPlanUncheckedCreateWithoutAttendanceInput>;
    connectOrCreate?: Prisma.TrainingPlanCreateOrConnectWithoutAttendanceInput;
    connect?: Prisma.TrainingPlanWhereUniqueInput;
};
export type TrainingPlanUpdateOneRequiredWithoutAttendanceNestedInput = {
    create?: Prisma.XOR<Prisma.TrainingPlanCreateWithoutAttendanceInput, Prisma.TrainingPlanUncheckedCreateWithoutAttendanceInput>;
    connectOrCreate?: Prisma.TrainingPlanCreateOrConnectWithoutAttendanceInput;
    upsert?: Prisma.TrainingPlanUpsertWithoutAttendanceInput;
    connect?: Prisma.TrainingPlanWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TrainingPlanUpdateToOneWithWhereWithoutAttendanceInput, Prisma.TrainingPlanUpdateWithoutAttendanceInput>, Prisma.TrainingPlanUncheckedUpdateWithoutAttendanceInput>;
};
export type TrainingPlanCreateWithoutCoachInput = {
    id?: string;
    title: string;
    totalDuration?: number;
    date?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    club: Prisma.ClubCreateNestedOneWithoutPlansInput;
    drills?: Prisma.PlanDrillCreateNestedManyWithoutTrainingPlanInput;
    group?: Prisma.PlayerGroupCreateNestedOneWithoutSessionsInput;
    attendance?: Prisma.AttendanceCreateNestedManyWithoutPlanInput;
};
export type TrainingPlanUncheckedCreateWithoutCoachInput = {
    id?: string;
    title: string;
    clubId: string;
    totalDuration?: number;
    groupId?: string | null;
    date?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    drills?: Prisma.PlanDrillUncheckedCreateNestedManyWithoutTrainingPlanInput;
    attendance?: Prisma.AttendanceUncheckedCreateNestedManyWithoutPlanInput;
};
export type TrainingPlanCreateOrConnectWithoutCoachInput = {
    where: Prisma.TrainingPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.TrainingPlanCreateWithoutCoachInput, Prisma.TrainingPlanUncheckedCreateWithoutCoachInput>;
};
export type TrainingPlanCreateManyCoachInputEnvelope = {
    data: Prisma.TrainingPlanCreateManyCoachInput | Prisma.TrainingPlanCreateManyCoachInput[];
    skipDuplicates?: boolean;
};
export type TrainingPlanUpsertWithWhereUniqueWithoutCoachInput = {
    where: Prisma.TrainingPlanWhereUniqueInput;
    update: Prisma.XOR<Prisma.TrainingPlanUpdateWithoutCoachInput, Prisma.TrainingPlanUncheckedUpdateWithoutCoachInput>;
    create: Prisma.XOR<Prisma.TrainingPlanCreateWithoutCoachInput, Prisma.TrainingPlanUncheckedCreateWithoutCoachInput>;
};
export type TrainingPlanUpdateWithWhereUniqueWithoutCoachInput = {
    where: Prisma.TrainingPlanWhereUniqueInput;
    data: Prisma.XOR<Prisma.TrainingPlanUpdateWithoutCoachInput, Prisma.TrainingPlanUncheckedUpdateWithoutCoachInput>;
};
export type TrainingPlanUpdateManyWithWhereWithoutCoachInput = {
    where: Prisma.TrainingPlanScalarWhereInput;
    data: Prisma.XOR<Prisma.TrainingPlanUpdateManyMutationInput, Prisma.TrainingPlanUncheckedUpdateManyWithoutCoachInput>;
};
export type TrainingPlanScalarWhereInput = {
    AND?: Prisma.TrainingPlanScalarWhereInput | Prisma.TrainingPlanScalarWhereInput[];
    OR?: Prisma.TrainingPlanScalarWhereInput[];
    NOT?: Prisma.TrainingPlanScalarWhereInput | Prisma.TrainingPlanScalarWhereInput[];
    id?: Prisma.StringFilter<'TrainingPlan'> | string;
    title?: Prisma.StringFilter<'TrainingPlan'> | string;
    clubId?: Prisma.StringFilter<'TrainingPlan'> | string;
    coachId?: Prisma.StringFilter<'TrainingPlan'> | string;
    totalDuration?: Prisma.IntFilter<'TrainingPlan'> | number;
    groupId?: Prisma.StringNullableFilter<'TrainingPlan'> | string | null;
    date?: Prisma.DateTimeNullableFilter<'TrainingPlan'> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<'TrainingPlan'> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<'TrainingPlan'> | Date | string;
};
export type TrainingPlanCreateWithoutClubInput = {
    id?: string;
    title: string;
    totalDuration?: number;
    date?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    coach: Prisma.UserCreateNestedOneWithoutCoachedPlansInput;
    drills?: Prisma.PlanDrillCreateNestedManyWithoutTrainingPlanInput;
    group?: Prisma.PlayerGroupCreateNestedOneWithoutSessionsInput;
    attendance?: Prisma.AttendanceCreateNestedManyWithoutPlanInput;
};
export type TrainingPlanUncheckedCreateWithoutClubInput = {
    id?: string;
    title: string;
    coachId: string;
    totalDuration?: number;
    groupId?: string | null;
    date?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    drills?: Prisma.PlanDrillUncheckedCreateNestedManyWithoutTrainingPlanInput;
    attendance?: Prisma.AttendanceUncheckedCreateNestedManyWithoutPlanInput;
};
export type TrainingPlanCreateOrConnectWithoutClubInput = {
    where: Prisma.TrainingPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.TrainingPlanCreateWithoutClubInput, Prisma.TrainingPlanUncheckedCreateWithoutClubInput>;
};
export type TrainingPlanCreateManyClubInputEnvelope = {
    data: Prisma.TrainingPlanCreateManyClubInput | Prisma.TrainingPlanCreateManyClubInput[];
    skipDuplicates?: boolean;
};
export type TrainingPlanUpsertWithWhereUniqueWithoutClubInput = {
    where: Prisma.TrainingPlanWhereUniqueInput;
    update: Prisma.XOR<Prisma.TrainingPlanUpdateWithoutClubInput, Prisma.TrainingPlanUncheckedUpdateWithoutClubInput>;
    create: Prisma.XOR<Prisma.TrainingPlanCreateWithoutClubInput, Prisma.TrainingPlanUncheckedCreateWithoutClubInput>;
};
export type TrainingPlanUpdateWithWhereUniqueWithoutClubInput = {
    where: Prisma.TrainingPlanWhereUniqueInput;
    data: Prisma.XOR<Prisma.TrainingPlanUpdateWithoutClubInput, Prisma.TrainingPlanUncheckedUpdateWithoutClubInput>;
};
export type TrainingPlanUpdateManyWithWhereWithoutClubInput = {
    where: Prisma.TrainingPlanScalarWhereInput;
    data: Prisma.XOR<Prisma.TrainingPlanUpdateManyMutationInput, Prisma.TrainingPlanUncheckedUpdateManyWithoutClubInput>;
};
export type TrainingPlanCreateWithoutGroupInput = {
    id?: string;
    title: string;
    totalDuration?: number;
    date?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    club: Prisma.ClubCreateNestedOneWithoutPlansInput;
    coach: Prisma.UserCreateNestedOneWithoutCoachedPlansInput;
    drills?: Prisma.PlanDrillCreateNestedManyWithoutTrainingPlanInput;
    attendance?: Prisma.AttendanceCreateNestedManyWithoutPlanInput;
};
export type TrainingPlanUncheckedCreateWithoutGroupInput = {
    id?: string;
    title: string;
    clubId: string;
    coachId: string;
    totalDuration?: number;
    date?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    drills?: Prisma.PlanDrillUncheckedCreateNestedManyWithoutTrainingPlanInput;
    attendance?: Prisma.AttendanceUncheckedCreateNestedManyWithoutPlanInput;
};
export type TrainingPlanCreateOrConnectWithoutGroupInput = {
    where: Prisma.TrainingPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.TrainingPlanCreateWithoutGroupInput, Prisma.TrainingPlanUncheckedCreateWithoutGroupInput>;
};
export type TrainingPlanCreateManyGroupInputEnvelope = {
    data: Prisma.TrainingPlanCreateManyGroupInput | Prisma.TrainingPlanCreateManyGroupInput[];
    skipDuplicates?: boolean;
};
export type TrainingPlanUpsertWithWhereUniqueWithoutGroupInput = {
    where: Prisma.TrainingPlanWhereUniqueInput;
    update: Prisma.XOR<Prisma.TrainingPlanUpdateWithoutGroupInput, Prisma.TrainingPlanUncheckedUpdateWithoutGroupInput>;
    create: Prisma.XOR<Prisma.TrainingPlanCreateWithoutGroupInput, Prisma.TrainingPlanUncheckedCreateWithoutGroupInput>;
};
export type TrainingPlanUpdateWithWhereUniqueWithoutGroupInput = {
    where: Prisma.TrainingPlanWhereUniqueInput;
    data: Prisma.XOR<Prisma.TrainingPlanUpdateWithoutGroupInput, Prisma.TrainingPlanUncheckedUpdateWithoutGroupInput>;
};
export type TrainingPlanUpdateManyWithWhereWithoutGroupInput = {
    where: Prisma.TrainingPlanScalarWhereInput;
    data: Prisma.XOR<Prisma.TrainingPlanUpdateManyMutationInput, Prisma.TrainingPlanUncheckedUpdateManyWithoutGroupInput>;
};
export type TrainingPlanCreateWithoutDrillsInput = {
    id?: string;
    title: string;
    totalDuration?: number;
    date?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    club: Prisma.ClubCreateNestedOneWithoutPlansInput;
    coach: Prisma.UserCreateNestedOneWithoutCoachedPlansInput;
    group?: Prisma.PlayerGroupCreateNestedOneWithoutSessionsInput;
    attendance?: Prisma.AttendanceCreateNestedManyWithoutPlanInput;
};
export type TrainingPlanUncheckedCreateWithoutDrillsInput = {
    id?: string;
    title: string;
    clubId: string;
    coachId: string;
    totalDuration?: number;
    groupId?: string | null;
    date?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    attendance?: Prisma.AttendanceUncheckedCreateNestedManyWithoutPlanInput;
};
export type TrainingPlanCreateOrConnectWithoutDrillsInput = {
    where: Prisma.TrainingPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.TrainingPlanCreateWithoutDrillsInput, Prisma.TrainingPlanUncheckedCreateWithoutDrillsInput>;
};
export type TrainingPlanUpsertWithoutDrillsInput = {
    update: Prisma.XOR<Prisma.TrainingPlanUpdateWithoutDrillsInput, Prisma.TrainingPlanUncheckedUpdateWithoutDrillsInput>;
    create: Prisma.XOR<Prisma.TrainingPlanCreateWithoutDrillsInput, Prisma.TrainingPlanUncheckedCreateWithoutDrillsInput>;
    where?: Prisma.TrainingPlanWhereInput;
};
export type TrainingPlanUpdateToOneWithWhereWithoutDrillsInput = {
    where?: Prisma.TrainingPlanWhereInput;
    data: Prisma.XOR<Prisma.TrainingPlanUpdateWithoutDrillsInput, Prisma.TrainingPlanUncheckedUpdateWithoutDrillsInput>;
};
export type TrainingPlanUpdateWithoutDrillsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    club?: Prisma.ClubUpdateOneRequiredWithoutPlansNestedInput;
    coach?: Prisma.UserUpdateOneRequiredWithoutCoachedPlansNestedInput;
    group?: Prisma.PlayerGroupUpdateOneWithoutSessionsNestedInput;
    attendance?: Prisma.AttendanceUpdateManyWithoutPlanNestedInput;
};
export type TrainingPlanUncheckedUpdateWithoutDrillsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    clubId?: Prisma.StringFieldUpdateOperationsInput | string;
    coachId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    groupId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendance?: Prisma.AttendanceUncheckedUpdateManyWithoutPlanNestedInput;
};
export type TrainingPlanCreateWithoutAttendanceInput = {
    id?: string;
    title: string;
    totalDuration?: number;
    date?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    club: Prisma.ClubCreateNestedOneWithoutPlansInput;
    coach: Prisma.UserCreateNestedOneWithoutCoachedPlansInput;
    drills?: Prisma.PlanDrillCreateNestedManyWithoutTrainingPlanInput;
    group?: Prisma.PlayerGroupCreateNestedOneWithoutSessionsInput;
};
export type TrainingPlanUncheckedCreateWithoutAttendanceInput = {
    id?: string;
    title: string;
    clubId: string;
    coachId: string;
    totalDuration?: number;
    groupId?: string | null;
    date?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    drills?: Prisma.PlanDrillUncheckedCreateNestedManyWithoutTrainingPlanInput;
};
export type TrainingPlanCreateOrConnectWithoutAttendanceInput = {
    where: Prisma.TrainingPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.TrainingPlanCreateWithoutAttendanceInput, Prisma.TrainingPlanUncheckedCreateWithoutAttendanceInput>;
};
export type TrainingPlanUpsertWithoutAttendanceInput = {
    update: Prisma.XOR<Prisma.TrainingPlanUpdateWithoutAttendanceInput, Prisma.TrainingPlanUncheckedUpdateWithoutAttendanceInput>;
    create: Prisma.XOR<Prisma.TrainingPlanCreateWithoutAttendanceInput, Prisma.TrainingPlanUncheckedCreateWithoutAttendanceInput>;
    where?: Prisma.TrainingPlanWhereInput;
};
export type TrainingPlanUpdateToOneWithWhereWithoutAttendanceInput = {
    where?: Prisma.TrainingPlanWhereInput;
    data: Prisma.XOR<Prisma.TrainingPlanUpdateWithoutAttendanceInput, Prisma.TrainingPlanUncheckedUpdateWithoutAttendanceInput>;
};
export type TrainingPlanUpdateWithoutAttendanceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    club?: Prisma.ClubUpdateOneRequiredWithoutPlansNestedInput;
    coach?: Prisma.UserUpdateOneRequiredWithoutCoachedPlansNestedInput;
    drills?: Prisma.PlanDrillUpdateManyWithoutTrainingPlanNestedInput;
    group?: Prisma.PlayerGroupUpdateOneWithoutSessionsNestedInput;
};
export type TrainingPlanUncheckedUpdateWithoutAttendanceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    clubId?: Prisma.StringFieldUpdateOperationsInput | string;
    coachId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    groupId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    drills?: Prisma.PlanDrillUncheckedUpdateManyWithoutTrainingPlanNestedInput;
};
export type TrainingPlanCreateManyCoachInput = {
    id?: string;
    title: string;
    clubId: string;
    totalDuration?: number;
    groupId?: string | null;
    date?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TrainingPlanUpdateWithoutCoachInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    club?: Prisma.ClubUpdateOneRequiredWithoutPlansNestedInput;
    drills?: Prisma.PlanDrillUpdateManyWithoutTrainingPlanNestedInput;
    group?: Prisma.PlayerGroupUpdateOneWithoutSessionsNestedInput;
    attendance?: Prisma.AttendanceUpdateManyWithoutPlanNestedInput;
};
export type TrainingPlanUncheckedUpdateWithoutCoachInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    clubId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    groupId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    drills?: Prisma.PlanDrillUncheckedUpdateManyWithoutTrainingPlanNestedInput;
    attendance?: Prisma.AttendanceUncheckedUpdateManyWithoutPlanNestedInput;
};
export type TrainingPlanUncheckedUpdateManyWithoutCoachInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    clubId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    groupId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TrainingPlanCreateManyClubInput = {
    id?: string;
    title: string;
    coachId: string;
    totalDuration?: number;
    groupId?: string | null;
    date?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TrainingPlanUpdateWithoutClubInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    coach?: Prisma.UserUpdateOneRequiredWithoutCoachedPlansNestedInput;
    drills?: Prisma.PlanDrillUpdateManyWithoutTrainingPlanNestedInput;
    group?: Prisma.PlayerGroupUpdateOneWithoutSessionsNestedInput;
    attendance?: Prisma.AttendanceUpdateManyWithoutPlanNestedInput;
};
export type TrainingPlanUncheckedUpdateWithoutClubInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    coachId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    groupId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    drills?: Prisma.PlanDrillUncheckedUpdateManyWithoutTrainingPlanNestedInput;
    attendance?: Prisma.AttendanceUncheckedUpdateManyWithoutPlanNestedInput;
};
export type TrainingPlanUncheckedUpdateManyWithoutClubInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    coachId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    groupId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TrainingPlanCreateManyGroupInput = {
    id?: string;
    title: string;
    clubId: string;
    coachId: string;
    totalDuration?: number;
    date?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TrainingPlanUpdateWithoutGroupInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    club?: Prisma.ClubUpdateOneRequiredWithoutPlansNestedInput;
    coach?: Prisma.UserUpdateOneRequiredWithoutCoachedPlansNestedInput;
    drills?: Prisma.PlanDrillUpdateManyWithoutTrainingPlanNestedInput;
    attendance?: Prisma.AttendanceUpdateManyWithoutPlanNestedInput;
};
export type TrainingPlanUncheckedUpdateWithoutGroupInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    clubId?: Prisma.StringFieldUpdateOperationsInput | string;
    coachId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    drills?: Prisma.PlanDrillUncheckedUpdateManyWithoutTrainingPlanNestedInput;
    attendance?: Prisma.AttendanceUncheckedUpdateManyWithoutPlanNestedInput;
};
export type TrainingPlanUncheckedUpdateManyWithoutGroupInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    clubId?: Prisma.StringFieldUpdateOperationsInput | string;
    coachId?: Prisma.StringFieldUpdateOperationsInput | string;
    totalDuration?: Prisma.IntFieldUpdateOperationsInput | number;
    date?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TrainingPlanCountOutputType = {
    drills: number;
    attendance: number;
};
export type TrainingPlanCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    drills?: boolean | TrainingPlanCountOutputTypeCountDrillsArgs;
    attendance?: boolean | TrainingPlanCountOutputTypeCountAttendanceArgs;
};
export type TrainingPlanCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrainingPlanCountOutputTypeSelect<ExtArgs> | null;
};
export type TrainingPlanCountOutputTypeCountDrillsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PlanDrillWhereInput;
};
export type TrainingPlanCountOutputTypeCountAttendanceArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AttendanceWhereInput;
};
export type TrainingPlanSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    title?: boolean;
    clubId?: boolean;
    coachId?: boolean;
    totalDuration?: boolean;
    groupId?: boolean;
    date?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    club?: boolean | Prisma.ClubDefaultArgs<ExtArgs>;
    coach?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    drills?: boolean | Prisma.TrainingPlan$drillsArgs<ExtArgs>;
    group?: boolean | Prisma.TrainingPlan$groupArgs<ExtArgs>;
    attendance?: boolean | Prisma.TrainingPlan$attendanceArgs<ExtArgs>;
    _count?: boolean | Prisma.TrainingPlanCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs['result']['trainingPlan']>;
export type TrainingPlanSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    title?: boolean;
    clubId?: boolean;
    coachId?: boolean;
    totalDuration?: boolean;
    groupId?: boolean;
    date?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    club?: boolean | Prisma.ClubDefaultArgs<ExtArgs>;
    coach?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    group?: boolean | Prisma.TrainingPlan$groupArgs<ExtArgs>;
}, ExtArgs['result']['trainingPlan']>;
export type TrainingPlanSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    title?: boolean;
    clubId?: boolean;
    coachId?: boolean;
    totalDuration?: boolean;
    groupId?: boolean;
    date?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    club?: boolean | Prisma.ClubDefaultArgs<ExtArgs>;
    coach?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    group?: boolean | Prisma.TrainingPlan$groupArgs<ExtArgs>;
}, ExtArgs['result']['trainingPlan']>;
export type TrainingPlanSelectScalar = {
    id?: boolean;
    title?: boolean;
    clubId?: boolean;
    coachId?: boolean;
    totalDuration?: boolean;
    groupId?: boolean;
    date?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type TrainingPlanOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<'id' | 'title' | 'clubId' | 'coachId' | 'totalDuration' | 'groupId' | 'date' | 'createdAt' | 'updatedAt', ExtArgs['result']['trainingPlan']>;
export type TrainingPlanInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    club?: boolean | Prisma.ClubDefaultArgs<ExtArgs>;
    coach?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    drills?: boolean | Prisma.TrainingPlan$drillsArgs<ExtArgs>;
    group?: boolean | Prisma.TrainingPlan$groupArgs<ExtArgs>;
    attendance?: boolean | Prisma.TrainingPlan$attendanceArgs<ExtArgs>;
    _count?: boolean | Prisma.TrainingPlanCountOutputTypeDefaultArgs<ExtArgs>;
};
export type TrainingPlanIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    club?: boolean | Prisma.ClubDefaultArgs<ExtArgs>;
    coach?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    group?: boolean | Prisma.TrainingPlan$groupArgs<ExtArgs>;
};
export type TrainingPlanIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    club?: boolean | Prisma.ClubDefaultArgs<ExtArgs>;
    coach?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    group?: boolean | Prisma.TrainingPlan$groupArgs<ExtArgs>;
};
export type $TrainingPlanPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: 'TrainingPlan';
    objects: {
        club: Prisma.$ClubPayload<ExtArgs>;
        coach: Prisma.$UserPayload<ExtArgs>;
        drills: Prisma.$PlanDrillPayload<ExtArgs>[];
        group: Prisma.$PlayerGroupPayload<ExtArgs> | null;
        attendance: Prisma.$AttendancePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        title: string;
        clubId: string;
        coachId: string;
        totalDuration: number;
        groupId: string | null;
        date: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs['result']['trainingPlan']>;
    composites: {};
};
export type TrainingPlanGetPayload<S extends boolean | null | undefined | TrainingPlanDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload, S>;
export type TrainingPlanCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TrainingPlanFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TrainingPlanCountAggregateInputType | true;
};
export interface TrainingPlanDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TrainingPlan'];
        meta: {
            name: 'TrainingPlan';
        };
    };
    findUnique<T extends TrainingPlanFindUniqueArgs>(args: Prisma.SelectSubset<T, TrainingPlanFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TrainingPlanClient<runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload<ExtArgs>, T, 'findUnique', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TrainingPlanFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TrainingPlanFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TrainingPlanClient<runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TrainingPlanFindFirstArgs>(args?: Prisma.SelectSubset<T, TrainingPlanFindFirstArgs<ExtArgs>>): Prisma.Prisma__TrainingPlanClient<runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload<ExtArgs>, T, 'findFirst', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TrainingPlanFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TrainingPlanFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TrainingPlanClient<runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload<ExtArgs>, T, 'findFirstOrThrow', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TrainingPlanFindManyArgs>(args?: Prisma.SelectSubset<T, TrainingPlanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>>;
    create<T extends TrainingPlanCreateArgs>(args: Prisma.SelectSubset<T, TrainingPlanCreateArgs<ExtArgs>>): Prisma.Prisma__TrainingPlanClient<runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload<ExtArgs>, T, 'create', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TrainingPlanCreateManyArgs>(args?: Prisma.SelectSubset<T, TrainingPlanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TrainingPlanCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TrainingPlanCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload<ExtArgs>, T, 'createManyAndReturn', GlobalOmitOptions>>;
    delete<T extends TrainingPlanDeleteArgs>(args: Prisma.SelectSubset<T, TrainingPlanDeleteArgs<ExtArgs>>): Prisma.Prisma__TrainingPlanClient<runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload<ExtArgs>, T, 'delete', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TrainingPlanUpdateArgs>(args: Prisma.SelectSubset<T, TrainingPlanUpdateArgs<ExtArgs>>): Prisma.Prisma__TrainingPlanClient<runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload<ExtArgs>, T, 'update', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TrainingPlanDeleteManyArgs>(args?: Prisma.SelectSubset<T, TrainingPlanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TrainingPlanUpdateManyArgs>(args: Prisma.SelectSubset<T, TrainingPlanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TrainingPlanUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TrainingPlanUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload<ExtArgs>, T, 'updateManyAndReturn', GlobalOmitOptions>>;
    upsert<T extends TrainingPlanUpsertArgs>(args: Prisma.SelectSubset<T, TrainingPlanUpsertArgs<ExtArgs>>): Prisma.Prisma__TrainingPlanClient<runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TrainingPlanCountArgs>(args?: Prisma.Subset<T, TrainingPlanCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TrainingPlanCountAggregateOutputType> : number>;
    aggregate<T extends TrainingPlanAggregateArgs>(args: Prisma.Subset<T, TrainingPlanAggregateArgs>): Prisma.PrismaPromise<GetTrainingPlanAggregateType<T>>;
    groupBy<T extends TrainingPlanGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TrainingPlanGroupByArgs['orderBy'];
    } : {
        orderBy?: TrainingPlanGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TrainingPlanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrainingPlanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TrainingPlanFieldRefs;
}
export interface Prisma__TrainingPlanClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    club<T extends Prisma.ClubDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClubDefaultArgs<ExtArgs>>): Prisma.Prisma__ClubClient<runtime.Types.Result.GetResult<Prisma.$ClubPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    coach<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    drills<T extends Prisma.TrainingPlan$drillsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TrainingPlan$drillsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlanDrillPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions> | Null>;
    group<T extends Prisma.TrainingPlan$groupArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TrainingPlan$groupArgs<ExtArgs>>): Prisma.Prisma__PlayerGroupClient<runtime.Types.Result.GetResult<Prisma.$PlayerGroupPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    attendance<T extends Prisma.TrainingPlan$attendanceArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TrainingPlan$attendanceArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, 'findMany', GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TrainingPlanFieldRefs {
    readonly id: Prisma.FieldRef<'TrainingPlan', 'String'>;
    readonly title: Prisma.FieldRef<'TrainingPlan', 'String'>;
    readonly clubId: Prisma.FieldRef<'TrainingPlan', 'String'>;
    readonly coachId: Prisma.FieldRef<'TrainingPlan', 'String'>;
    readonly totalDuration: Prisma.FieldRef<'TrainingPlan', 'Int'>;
    readonly groupId: Prisma.FieldRef<'TrainingPlan', 'String'>;
    readonly date: Prisma.FieldRef<'TrainingPlan', 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<'TrainingPlan', 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<'TrainingPlan', 'DateTime'>;
}
export type TrainingPlanFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrainingPlanSelect<ExtArgs> | null;
    omit?: Prisma.TrainingPlanOmit<ExtArgs> | null;
    include?: Prisma.TrainingPlanInclude<ExtArgs> | null;
    where: Prisma.TrainingPlanWhereUniqueInput;
};
export type TrainingPlanFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrainingPlanSelect<ExtArgs> | null;
    omit?: Prisma.TrainingPlanOmit<ExtArgs> | null;
    include?: Prisma.TrainingPlanInclude<ExtArgs> | null;
    where: Prisma.TrainingPlanWhereUniqueInput;
};
export type TrainingPlanFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TrainingPlanFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TrainingPlanFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TrainingPlanCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrainingPlanSelect<ExtArgs> | null;
    omit?: Prisma.TrainingPlanOmit<ExtArgs> | null;
    include?: Prisma.TrainingPlanInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TrainingPlanCreateInput, Prisma.TrainingPlanUncheckedCreateInput>;
};
export type TrainingPlanCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TrainingPlanCreateManyInput | Prisma.TrainingPlanCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TrainingPlanCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrainingPlanSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TrainingPlanOmit<ExtArgs> | null;
    data: Prisma.TrainingPlanCreateManyInput | Prisma.TrainingPlanCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.TrainingPlanIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type TrainingPlanUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrainingPlanSelect<ExtArgs> | null;
    omit?: Prisma.TrainingPlanOmit<ExtArgs> | null;
    include?: Prisma.TrainingPlanInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TrainingPlanUpdateInput, Prisma.TrainingPlanUncheckedUpdateInput>;
    where: Prisma.TrainingPlanWhereUniqueInput;
};
export type TrainingPlanUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TrainingPlanUpdateManyMutationInput, Prisma.TrainingPlanUncheckedUpdateManyInput>;
    where?: Prisma.TrainingPlanWhereInput;
    limit?: number;
};
export type TrainingPlanUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrainingPlanSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TrainingPlanOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TrainingPlanUpdateManyMutationInput, Prisma.TrainingPlanUncheckedUpdateManyInput>;
    where?: Prisma.TrainingPlanWhereInput;
    limit?: number;
    include?: Prisma.TrainingPlanIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type TrainingPlanUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrainingPlanSelect<ExtArgs> | null;
    omit?: Prisma.TrainingPlanOmit<ExtArgs> | null;
    include?: Prisma.TrainingPlanInclude<ExtArgs> | null;
    where: Prisma.TrainingPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.TrainingPlanCreateInput, Prisma.TrainingPlanUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TrainingPlanUpdateInput, Prisma.TrainingPlanUncheckedUpdateInput>;
};
export type TrainingPlanDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrainingPlanSelect<ExtArgs> | null;
    omit?: Prisma.TrainingPlanOmit<ExtArgs> | null;
    include?: Prisma.TrainingPlanInclude<ExtArgs> | null;
    where: Prisma.TrainingPlanWhereUniqueInput;
};
export type TrainingPlanDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TrainingPlanWhereInput;
    limit?: number;
};
export type TrainingPlan$drillsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlanDrillSelect<ExtArgs> | null;
    omit?: Prisma.PlanDrillOmit<ExtArgs> | null;
    include?: Prisma.PlanDrillInclude<ExtArgs> | null;
    where?: Prisma.PlanDrillWhereInput;
    orderBy?: Prisma.PlanDrillOrderByWithRelationInput | Prisma.PlanDrillOrderByWithRelationInput[];
    cursor?: Prisma.PlanDrillWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PlanDrillScalarFieldEnum | Prisma.PlanDrillScalarFieldEnum[];
};
export type TrainingPlan$groupArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlayerGroupSelect<ExtArgs> | null;
    omit?: Prisma.PlayerGroupOmit<ExtArgs> | null;
    include?: Prisma.PlayerGroupInclude<ExtArgs> | null;
    where?: Prisma.PlayerGroupWhereInput;
};
export type TrainingPlan$attendanceArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TrainingPlanDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TrainingPlanSelect<ExtArgs> | null;
    omit?: Prisma.TrainingPlanOmit<ExtArgs> | null;
    include?: Prisma.TrainingPlanInclude<ExtArgs> | null;
};
export {};
