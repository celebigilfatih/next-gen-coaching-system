import type * as runtime from '@prisma/client/runtime/library';
import type * as $Enums from '../enums.js';
import type * as Prisma from '../internal/prismaNamespace.js';
export type PlanDrillModel = runtime.Types.Result.DefaultSelection<Prisma.$PlanDrillPayload>;
export type AggregatePlanDrill = {
    _count: PlanDrillCountAggregateOutputType | null;
    _avg: PlanDrillAvgAggregateOutputType | null;
    _sum: PlanDrillSumAggregateOutputType | null;
    _min: PlanDrillMinAggregateOutputType | null;
    _max: PlanDrillMaxAggregateOutputType | null;
};
export type PlanDrillAvgAggregateOutputType = {
    order: number | null;
};
export type PlanDrillSumAggregateOutputType = {
    order: number | null;
};
export type PlanDrillMinAggregateOutputType = {
    id: string | null;
    trainingPlanId: string | null;
    drillId: string | null;
    phase: $Enums.Phase | null;
    order: number | null;
    notes: string | null;
};
export type PlanDrillMaxAggregateOutputType = {
    id: string | null;
    trainingPlanId: string | null;
    drillId: string | null;
    phase: $Enums.Phase | null;
    order: number | null;
    notes: string | null;
};
export type PlanDrillCountAggregateOutputType = {
    id: number;
    trainingPlanId: number;
    drillId: number;
    phase: number;
    order: number;
    notes: number;
    _all: number;
};
export type PlanDrillAvgAggregateInputType = {
    order?: true;
};
export type PlanDrillSumAggregateInputType = {
    order?: true;
};
export type PlanDrillMinAggregateInputType = {
    id?: true;
    trainingPlanId?: true;
    drillId?: true;
    phase?: true;
    order?: true;
    notes?: true;
};
export type PlanDrillMaxAggregateInputType = {
    id?: true;
    trainingPlanId?: true;
    drillId?: true;
    phase?: true;
    order?: true;
    notes?: true;
};
export type PlanDrillCountAggregateInputType = {
    id?: true;
    trainingPlanId?: true;
    drillId?: true;
    phase?: true;
    order?: true;
    notes?: true;
    _all?: true;
};
export type PlanDrillAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PlanDrillWhereInput;
    orderBy?: Prisma.PlanDrillOrderByWithRelationInput | Prisma.PlanDrillOrderByWithRelationInput[];
    cursor?: Prisma.PlanDrillWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | PlanDrillCountAggregateInputType;
    _avg?: PlanDrillAvgAggregateInputType;
    _sum?: PlanDrillSumAggregateInputType;
    _min?: PlanDrillMinAggregateInputType;
    _max?: PlanDrillMaxAggregateInputType;
};
export type GetPlanDrillAggregateType<T extends PlanDrillAggregateArgs> = {
    [P in keyof T & keyof AggregatePlanDrill]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePlanDrill[P]> : Prisma.GetScalarType<T[P], AggregatePlanDrill[P]>;
};
export type PlanDrillGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PlanDrillWhereInput;
    orderBy?: Prisma.PlanDrillOrderByWithAggregationInput | Prisma.PlanDrillOrderByWithAggregationInput[];
    by: Prisma.PlanDrillScalarFieldEnum[] | Prisma.PlanDrillScalarFieldEnum;
    having?: Prisma.PlanDrillScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PlanDrillCountAggregateInputType | true;
    _avg?: PlanDrillAvgAggregateInputType;
    _sum?: PlanDrillSumAggregateInputType;
    _min?: PlanDrillMinAggregateInputType;
    _max?: PlanDrillMaxAggregateInputType;
};
export type PlanDrillGroupByOutputType = {
    id: string;
    trainingPlanId: string;
    drillId: string;
    phase: $Enums.Phase;
    order: number;
    notes: string | null;
    _count: PlanDrillCountAggregateOutputType | null;
    _avg: PlanDrillAvgAggregateOutputType | null;
    _sum: PlanDrillSumAggregateOutputType | null;
    _min: PlanDrillMinAggregateOutputType | null;
    _max: PlanDrillMaxAggregateOutputType | null;
};
type GetPlanDrillGroupByPayload<T extends PlanDrillGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PlanDrillGroupByOutputType, T['by']> & {
    [P in keyof T & keyof PlanDrillGroupByOutputType]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PlanDrillGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PlanDrillGroupByOutputType[P]>;
}>>;
export type PlanDrillWhereInput = {
    AND?: Prisma.PlanDrillWhereInput | Prisma.PlanDrillWhereInput[];
    OR?: Prisma.PlanDrillWhereInput[];
    NOT?: Prisma.PlanDrillWhereInput | Prisma.PlanDrillWhereInput[];
    id?: Prisma.StringFilter<'PlanDrill'> | string;
    trainingPlanId?: Prisma.StringFilter<'PlanDrill'> | string;
    drillId?: Prisma.StringFilter<'PlanDrill'> | string;
    phase?: Prisma.EnumPhaseFilter<'PlanDrill'> | $Enums.Phase;
    order?: Prisma.IntFilter<'PlanDrill'> | number;
    notes?: Prisma.StringNullableFilter<'PlanDrill'> | string | null;
    trainingPlan?: Prisma.XOR<Prisma.TrainingPlanScalarRelationFilter, Prisma.TrainingPlanWhereInput>;
    drill?: Prisma.XOR<Prisma.DrillScalarRelationFilter, Prisma.DrillWhereInput>;
};
export type PlanDrillOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    trainingPlanId?: Prisma.SortOrder;
    drillId?: Prisma.SortOrder;
    phase?: Prisma.SortOrder;
    order?: Prisma.SortOrder;
    notes?: Prisma.SortOrderInput | Prisma.SortOrder;
    trainingPlan?: Prisma.TrainingPlanOrderByWithRelationInput;
    drill?: Prisma.DrillOrderByWithRelationInput;
};
export type PlanDrillWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.PlanDrillWhereInput | Prisma.PlanDrillWhereInput[];
    OR?: Prisma.PlanDrillWhereInput[];
    NOT?: Prisma.PlanDrillWhereInput | Prisma.PlanDrillWhereInput[];
    trainingPlanId?: Prisma.StringFilter<'PlanDrill'> | string;
    drillId?: Prisma.StringFilter<'PlanDrill'> | string;
    phase?: Prisma.EnumPhaseFilter<'PlanDrill'> | $Enums.Phase;
    order?: Prisma.IntFilter<'PlanDrill'> | number;
    notes?: Prisma.StringNullableFilter<'PlanDrill'> | string | null;
    trainingPlan?: Prisma.XOR<Prisma.TrainingPlanScalarRelationFilter, Prisma.TrainingPlanWhereInput>;
    drill?: Prisma.XOR<Prisma.DrillScalarRelationFilter, Prisma.DrillWhereInput>;
}, 'id'>;
export type PlanDrillOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    trainingPlanId?: Prisma.SortOrder;
    drillId?: Prisma.SortOrder;
    phase?: Prisma.SortOrder;
    order?: Prisma.SortOrder;
    notes?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.PlanDrillCountOrderByAggregateInput;
    _avg?: Prisma.PlanDrillAvgOrderByAggregateInput;
    _max?: Prisma.PlanDrillMaxOrderByAggregateInput;
    _min?: Prisma.PlanDrillMinOrderByAggregateInput;
    _sum?: Prisma.PlanDrillSumOrderByAggregateInput;
};
export type PlanDrillScalarWhereWithAggregatesInput = {
    AND?: Prisma.PlanDrillScalarWhereWithAggregatesInput | Prisma.PlanDrillScalarWhereWithAggregatesInput[];
    OR?: Prisma.PlanDrillScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PlanDrillScalarWhereWithAggregatesInput | Prisma.PlanDrillScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<'PlanDrill'> | string;
    trainingPlanId?: Prisma.StringWithAggregatesFilter<'PlanDrill'> | string;
    drillId?: Prisma.StringWithAggregatesFilter<'PlanDrill'> | string;
    phase?: Prisma.EnumPhaseWithAggregatesFilter<'PlanDrill'> | $Enums.Phase;
    order?: Prisma.IntWithAggregatesFilter<'PlanDrill'> | number;
    notes?: Prisma.StringNullableWithAggregatesFilter<'PlanDrill'> | string | null;
};
export type PlanDrillCreateInput = {
    id?: string;
    phase: $Enums.Phase;
    order?: number;
    notes?: string | null;
    trainingPlan: Prisma.TrainingPlanCreateNestedOneWithoutDrillsInput;
    drill: Prisma.DrillCreateNestedOneWithoutPlansInput;
};
export type PlanDrillUncheckedCreateInput = {
    id?: string;
    trainingPlanId: string;
    drillId: string;
    phase: $Enums.Phase;
    order?: number;
    notes?: string | null;
};
export type PlanDrillUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    phase?: Prisma.EnumPhaseFieldUpdateOperationsInput | $Enums.Phase;
    order?: Prisma.IntFieldUpdateOperationsInput | number;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trainingPlan?: Prisma.TrainingPlanUpdateOneRequiredWithoutDrillsNestedInput;
    drill?: Prisma.DrillUpdateOneRequiredWithoutPlansNestedInput;
};
export type PlanDrillUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    trainingPlanId?: Prisma.StringFieldUpdateOperationsInput | string;
    drillId?: Prisma.StringFieldUpdateOperationsInput | string;
    phase?: Prisma.EnumPhaseFieldUpdateOperationsInput | $Enums.Phase;
    order?: Prisma.IntFieldUpdateOperationsInput | number;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type PlanDrillCreateManyInput = {
    id?: string;
    trainingPlanId: string;
    drillId: string;
    phase: $Enums.Phase;
    order?: number;
    notes?: string | null;
};
export type PlanDrillUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    phase?: Prisma.EnumPhaseFieldUpdateOperationsInput | $Enums.Phase;
    order?: Prisma.IntFieldUpdateOperationsInput | number;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type PlanDrillUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    trainingPlanId?: Prisma.StringFieldUpdateOperationsInput | string;
    drillId?: Prisma.StringFieldUpdateOperationsInput | string;
    phase?: Prisma.EnumPhaseFieldUpdateOperationsInput | $Enums.Phase;
    order?: Prisma.IntFieldUpdateOperationsInput | number;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type PlanDrillListRelationFilter = {
    every?: Prisma.PlanDrillWhereInput;
    some?: Prisma.PlanDrillWhereInput;
    none?: Prisma.PlanDrillWhereInput;
};
export type PlanDrillOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type PlanDrillCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    trainingPlanId?: Prisma.SortOrder;
    drillId?: Prisma.SortOrder;
    phase?: Prisma.SortOrder;
    order?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
};
export type PlanDrillAvgOrderByAggregateInput = {
    order?: Prisma.SortOrder;
};
export type PlanDrillMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    trainingPlanId?: Prisma.SortOrder;
    drillId?: Prisma.SortOrder;
    phase?: Prisma.SortOrder;
    order?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
};
export type PlanDrillMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    trainingPlanId?: Prisma.SortOrder;
    drillId?: Prisma.SortOrder;
    phase?: Prisma.SortOrder;
    order?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
};
export type PlanDrillSumOrderByAggregateInput = {
    order?: Prisma.SortOrder;
};
export type PlanDrillCreateNestedManyWithoutDrillInput = {
    create?: Prisma.XOR<Prisma.PlanDrillCreateWithoutDrillInput, Prisma.PlanDrillUncheckedCreateWithoutDrillInput> | Prisma.PlanDrillCreateWithoutDrillInput[] | Prisma.PlanDrillUncheckedCreateWithoutDrillInput[];
    connectOrCreate?: Prisma.PlanDrillCreateOrConnectWithoutDrillInput | Prisma.PlanDrillCreateOrConnectWithoutDrillInput[];
    createMany?: Prisma.PlanDrillCreateManyDrillInputEnvelope;
    connect?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
};
export type PlanDrillUncheckedCreateNestedManyWithoutDrillInput = {
    create?: Prisma.XOR<Prisma.PlanDrillCreateWithoutDrillInput, Prisma.PlanDrillUncheckedCreateWithoutDrillInput> | Prisma.PlanDrillCreateWithoutDrillInput[] | Prisma.PlanDrillUncheckedCreateWithoutDrillInput[];
    connectOrCreate?: Prisma.PlanDrillCreateOrConnectWithoutDrillInput | Prisma.PlanDrillCreateOrConnectWithoutDrillInput[];
    createMany?: Prisma.PlanDrillCreateManyDrillInputEnvelope;
    connect?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
};
export type PlanDrillUpdateManyWithoutDrillNestedInput = {
    create?: Prisma.XOR<Prisma.PlanDrillCreateWithoutDrillInput, Prisma.PlanDrillUncheckedCreateWithoutDrillInput> | Prisma.PlanDrillCreateWithoutDrillInput[] | Prisma.PlanDrillUncheckedCreateWithoutDrillInput[];
    connectOrCreate?: Prisma.PlanDrillCreateOrConnectWithoutDrillInput | Prisma.PlanDrillCreateOrConnectWithoutDrillInput[];
    upsert?: Prisma.PlanDrillUpsertWithWhereUniqueWithoutDrillInput | Prisma.PlanDrillUpsertWithWhereUniqueWithoutDrillInput[];
    createMany?: Prisma.PlanDrillCreateManyDrillInputEnvelope;
    set?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
    disconnect?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
    delete?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
    connect?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
    update?: Prisma.PlanDrillUpdateWithWhereUniqueWithoutDrillInput | Prisma.PlanDrillUpdateWithWhereUniqueWithoutDrillInput[];
    updateMany?: Prisma.PlanDrillUpdateManyWithWhereWithoutDrillInput | Prisma.PlanDrillUpdateManyWithWhereWithoutDrillInput[];
    deleteMany?: Prisma.PlanDrillScalarWhereInput | Prisma.PlanDrillScalarWhereInput[];
};
export type PlanDrillUncheckedUpdateManyWithoutDrillNestedInput = {
    create?: Prisma.XOR<Prisma.PlanDrillCreateWithoutDrillInput, Prisma.PlanDrillUncheckedCreateWithoutDrillInput> | Prisma.PlanDrillCreateWithoutDrillInput[] | Prisma.PlanDrillUncheckedCreateWithoutDrillInput[];
    connectOrCreate?: Prisma.PlanDrillCreateOrConnectWithoutDrillInput | Prisma.PlanDrillCreateOrConnectWithoutDrillInput[];
    upsert?: Prisma.PlanDrillUpsertWithWhereUniqueWithoutDrillInput | Prisma.PlanDrillUpsertWithWhereUniqueWithoutDrillInput[];
    createMany?: Prisma.PlanDrillCreateManyDrillInputEnvelope;
    set?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
    disconnect?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
    delete?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
    connect?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
    update?: Prisma.PlanDrillUpdateWithWhereUniqueWithoutDrillInput | Prisma.PlanDrillUpdateWithWhereUniqueWithoutDrillInput[];
    updateMany?: Prisma.PlanDrillUpdateManyWithWhereWithoutDrillInput | Prisma.PlanDrillUpdateManyWithWhereWithoutDrillInput[];
    deleteMany?: Prisma.PlanDrillScalarWhereInput | Prisma.PlanDrillScalarWhereInput[];
};
export type PlanDrillCreateNestedManyWithoutTrainingPlanInput = {
    create?: Prisma.XOR<Prisma.PlanDrillCreateWithoutTrainingPlanInput, Prisma.PlanDrillUncheckedCreateWithoutTrainingPlanInput> | Prisma.PlanDrillCreateWithoutTrainingPlanInput[] | Prisma.PlanDrillUncheckedCreateWithoutTrainingPlanInput[];
    connectOrCreate?: Prisma.PlanDrillCreateOrConnectWithoutTrainingPlanInput | Prisma.PlanDrillCreateOrConnectWithoutTrainingPlanInput[];
    createMany?: Prisma.PlanDrillCreateManyTrainingPlanInputEnvelope;
    connect?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
};
export type PlanDrillUncheckedCreateNestedManyWithoutTrainingPlanInput = {
    create?: Prisma.XOR<Prisma.PlanDrillCreateWithoutTrainingPlanInput, Prisma.PlanDrillUncheckedCreateWithoutTrainingPlanInput> | Prisma.PlanDrillCreateWithoutTrainingPlanInput[] | Prisma.PlanDrillUncheckedCreateWithoutTrainingPlanInput[];
    connectOrCreate?: Prisma.PlanDrillCreateOrConnectWithoutTrainingPlanInput | Prisma.PlanDrillCreateOrConnectWithoutTrainingPlanInput[];
    createMany?: Prisma.PlanDrillCreateManyTrainingPlanInputEnvelope;
    connect?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
};
export type PlanDrillUpdateManyWithoutTrainingPlanNestedInput = {
    create?: Prisma.XOR<Prisma.PlanDrillCreateWithoutTrainingPlanInput, Prisma.PlanDrillUncheckedCreateWithoutTrainingPlanInput> | Prisma.PlanDrillCreateWithoutTrainingPlanInput[] | Prisma.PlanDrillUncheckedCreateWithoutTrainingPlanInput[];
    connectOrCreate?: Prisma.PlanDrillCreateOrConnectWithoutTrainingPlanInput | Prisma.PlanDrillCreateOrConnectWithoutTrainingPlanInput[];
    upsert?: Prisma.PlanDrillUpsertWithWhereUniqueWithoutTrainingPlanInput | Prisma.PlanDrillUpsertWithWhereUniqueWithoutTrainingPlanInput[];
    createMany?: Prisma.PlanDrillCreateManyTrainingPlanInputEnvelope;
    set?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
    disconnect?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
    delete?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
    connect?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
    update?: Prisma.PlanDrillUpdateWithWhereUniqueWithoutTrainingPlanInput | Prisma.PlanDrillUpdateWithWhereUniqueWithoutTrainingPlanInput[];
    updateMany?: Prisma.PlanDrillUpdateManyWithWhereWithoutTrainingPlanInput | Prisma.PlanDrillUpdateManyWithWhereWithoutTrainingPlanInput[];
    deleteMany?: Prisma.PlanDrillScalarWhereInput | Prisma.PlanDrillScalarWhereInput[];
};
export type PlanDrillUncheckedUpdateManyWithoutTrainingPlanNestedInput = {
    create?: Prisma.XOR<Prisma.PlanDrillCreateWithoutTrainingPlanInput, Prisma.PlanDrillUncheckedCreateWithoutTrainingPlanInput> | Prisma.PlanDrillCreateWithoutTrainingPlanInput[] | Prisma.PlanDrillUncheckedCreateWithoutTrainingPlanInput[];
    connectOrCreate?: Prisma.PlanDrillCreateOrConnectWithoutTrainingPlanInput | Prisma.PlanDrillCreateOrConnectWithoutTrainingPlanInput[];
    upsert?: Prisma.PlanDrillUpsertWithWhereUniqueWithoutTrainingPlanInput | Prisma.PlanDrillUpsertWithWhereUniqueWithoutTrainingPlanInput[];
    createMany?: Prisma.PlanDrillCreateManyTrainingPlanInputEnvelope;
    set?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
    disconnect?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
    delete?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
    connect?: Prisma.PlanDrillWhereUniqueInput | Prisma.PlanDrillWhereUniqueInput[];
    update?: Prisma.PlanDrillUpdateWithWhereUniqueWithoutTrainingPlanInput | Prisma.PlanDrillUpdateWithWhereUniqueWithoutTrainingPlanInput[];
    updateMany?: Prisma.PlanDrillUpdateManyWithWhereWithoutTrainingPlanInput | Prisma.PlanDrillUpdateManyWithWhereWithoutTrainingPlanInput[];
    deleteMany?: Prisma.PlanDrillScalarWhereInput | Prisma.PlanDrillScalarWhereInput[];
};
export type EnumPhaseFieldUpdateOperationsInput = {
    set?: $Enums.Phase;
};
export type PlanDrillCreateWithoutDrillInput = {
    id?: string;
    phase: $Enums.Phase;
    order?: number;
    notes?: string | null;
    trainingPlan: Prisma.TrainingPlanCreateNestedOneWithoutDrillsInput;
};
export type PlanDrillUncheckedCreateWithoutDrillInput = {
    id?: string;
    trainingPlanId: string;
    phase: $Enums.Phase;
    order?: number;
    notes?: string | null;
};
export type PlanDrillCreateOrConnectWithoutDrillInput = {
    where: Prisma.PlanDrillWhereUniqueInput;
    create: Prisma.XOR<Prisma.PlanDrillCreateWithoutDrillInput, Prisma.PlanDrillUncheckedCreateWithoutDrillInput>;
};
export type PlanDrillCreateManyDrillInputEnvelope = {
    data: Prisma.PlanDrillCreateManyDrillInput | Prisma.PlanDrillCreateManyDrillInput[];
    skipDuplicates?: boolean;
};
export type PlanDrillUpsertWithWhereUniqueWithoutDrillInput = {
    where: Prisma.PlanDrillWhereUniqueInput;
    update: Prisma.XOR<Prisma.PlanDrillUpdateWithoutDrillInput, Prisma.PlanDrillUncheckedUpdateWithoutDrillInput>;
    create: Prisma.XOR<Prisma.PlanDrillCreateWithoutDrillInput, Prisma.PlanDrillUncheckedCreateWithoutDrillInput>;
};
export type PlanDrillUpdateWithWhereUniqueWithoutDrillInput = {
    where: Prisma.PlanDrillWhereUniqueInput;
    data: Prisma.XOR<Prisma.PlanDrillUpdateWithoutDrillInput, Prisma.PlanDrillUncheckedUpdateWithoutDrillInput>;
};
export type PlanDrillUpdateManyWithWhereWithoutDrillInput = {
    where: Prisma.PlanDrillScalarWhereInput;
    data: Prisma.XOR<Prisma.PlanDrillUpdateManyMutationInput, Prisma.PlanDrillUncheckedUpdateManyWithoutDrillInput>;
};
export type PlanDrillScalarWhereInput = {
    AND?: Prisma.PlanDrillScalarWhereInput | Prisma.PlanDrillScalarWhereInput[];
    OR?: Prisma.PlanDrillScalarWhereInput[];
    NOT?: Prisma.PlanDrillScalarWhereInput | Prisma.PlanDrillScalarWhereInput[];
    id?: Prisma.StringFilter<'PlanDrill'> | string;
    trainingPlanId?: Prisma.StringFilter<'PlanDrill'> | string;
    drillId?: Prisma.StringFilter<'PlanDrill'> | string;
    phase?: Prisma.EnumPhaseFilter<'PlanDrill'> | $Enums.Phase;
    order?: Prisma.IntFilter<'PlanDrill'> | number;
    notes?: Prisma.StringNullableFilter<'PlanDrill'> | string | null;
};
export type PlanDrillCreateWithoutTrainingPlanInput = {
    id?: string;
    phase: $Enums.Phase;
    order?: number;
    notes?: string | null;
    drill: Prisma.DrillCreateNestedOneWithoutPlansInput;
};
export type PlanDrillUncheckedCreateWithoutTrainingPlanInput = {
    id?: string;
    drillId: string;
    phase: $Enums.Phase;
    order?: number;
    notes?: string | null;
};
export type PlanDrillCreateOrConnectWithoutTrainingPlanInput = {
    where: Prisma.PlanDrillWhereUniqueInput;
    create: Prisma.XOR<Prisma.PlanDrillCreateWithoutTrainingPlanInput, Prisma.PlanDrillUncheckedCreateWithoutTrainingPlanInput>;
};
export type PlanDrillCreateManyTrainingPlanInputEnvelope = {
    data: Prisma.PlanDrillCreateManyTrainingPlanInput | Prisma.PlanDrillCreateManyTrainingPlanInput[];
    skipDuplicates?: boolean;
};
export type PlanDrillUpsertWithWhereUniqueWithoutTrainingPlanInput = {
    where: Prisma.PlanDrillWhereUniqueInput;
    update: Prisma.XOR<Prisma.PlanDrillUpdateWithoutTrainingPlanInput, Prisma.PlanDrillUncheckedUpdateWithoutTrainingPlanInput>;
    create: Prisma.XOR<Prisma.PlanDrillCreateWithoutTrainingPlanInput, Prisma.PlanDrillUncheckedCreateWithoutTrainingPlanInput>;
};
export type PlanDrillUpdateWithWhereUniqueWithoutTrainingPlanInput = {
    where: Prisma.PlanDrillWhereUniqueInput;
    data: Prisma.XOR<Prisma.PlanDrillUpdateWithoutTrainingPlanInput, Prisma.PlanDrillUncheckedUpdateWithoutTrainingPlanInput>;
};
export type PlanDrillUpdateManyWithWhereWithoutTrainingPlanInput = {
    where: Prisma.PlanDrillScalarWhereInput;
    data: Prisma.XOR<Prisma.PlanDrillUpdateManyMutationInput, Prisma.PlanDrillUncheckedUpdateManyWithoutTrainingPlanInput>;
};
export type PlanDrillCreateManyDrillInput = {
    id?: string;
    trainingPlanId: string;
    phase: $Enums.Phase;
    order?: number;
    notes?: string | null;
};
export type PlanDrillUpdateWithoutDrillInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    phase?: Prisma.EnumPhaseFieldUpdateOperationsInput | $Enums.Phase;
    order?: Prisma.IntFieldUpdateOperationsInput | number;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trainingPlan?: Prisma.TrainingPlanUpdateOneRequiredWithoutDrillsNestedInput;
};
export type PlanDrillUncheckedUpdateWithoutDrillInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    trainingPlanId?: Prisma.StringFieldUpdateOperationsInput | string;
    phase?: Prisma.EnumPhaseFieldUpdateOperationsInput | $Enums.Phase;
    order?: Prisma.IntFieldUpdateOperationsInput | number;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type PlanDrillUncheckedUpdateManyWithoutDrillInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    trainingPlanId?: Prisma.StringFieldUpdateOperationsInput | string;
    phase?: Prisma.EnumPhaseFieldUpdateOperationsInput | $Enums.Phase;
    order?: Prisma.IntFieldUpdateOperationsInput | number;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type PlanDrillCreateManyTrainingPlanInput = {
    id?: string;
    drillId: string;
    phase: $Enums.Phase;
    order?: number;
    notes?: string | null;
};
export type PlanDrillUpdateWithoutTrainingPlanInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    phase?: Prisma.EnumPhaseFieldUpdateOperationsInput | $Enums.Phase;
    order?: Prisma.IntFieldUpdateOperationsInput | number;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    drill?: Prisma.DrillUpdateOneRequiredWithoutPlansNestedInput;
};
export type PlanDrillUncheckedUpdateWithoutTrainingPlanInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    drillId?: Prisma.StringFieldUpdateOperationsInput | string;
    phase?: Prisma.EnumPhaseFieldUpdateOperationsInput | $Enums.Phase;
    order?: Prisma.IntFieldUpdateOperationsInput | number;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type PlanDrillUncheckedUpdateManyWithoutTrainingPlanInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    drillId?: Prisma.StringFieldUpdateOperationsInput | string;
    phase?: Prisma.EnumPhaseFieldUpdateOperationsInput | $Enums.Phase;
    order?: Prisma.IntFieldUpdateOperationsInput | number;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type PlanDrillSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    trainingPlanId?: boolean;
    drillId?: boolean;
    phase?: boolean;
    order?: boolean;
    notes?: boolean;
    trainingPlan?: boolean | Prisma.TrainingPlanDefaultArgs<ExtArgs>;
    drill?: boolean | Prisma.DrillDefaultArgs<ExtArgs>;
}, ExtArgs['result']['planDrill']>;
export type PlanDrillSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    trainingPlanId?: boolean;
    drillId?: boolean;
    phase?: boolean;
    order?: boolean;
    notes?: boolean;
    trainingPlan?: boolean | Prisma.TrainingPlanDefaultArgs<ExtArgs>;
    drill?: boolean | Prisma.DrillDefaultArgs<ExtArgs>;
}, ExtArgs['result']['planDrill']>;
export type PlanDrillSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    trainingPlanId?: boolean;
    drillId?: boolean;
    phase?: boolean;
    order?: boolean;
    notes?: boolean;
    trainingPlan?: boolean | Prisma.TrainingPlanDefaultArgs<ExtArgs>;
    drill?: boolean | Prisma.DrillDefaultArgs<ExtArgs>;
}, ExtArgs['result']['planDrill']>;
export type PlanDrillSelectScalar = {
    id?: boolean;
    trainingPlanId?: boolean;
    drillId?: boolean;
    phase?: boolean;
    order?: boolean;
    notes?: boolean;
};
export type PlanDrillOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<'id' | 'trainingPlanId' | 'drillId' | 'phase' | 'order' | 'notes', ExtArgs['result']['planDrill']>;
export type PlanDrillInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    trainingPlan?: boolean | Prisma.TrainingPlanDefaultArgs<ExtArgs>;
    drill?: boolean | Prisma.DrillDefaultArgs<ExtArgs>;
};
export type PlanDrillIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    trainingPlan?: boolean | Prisma.TrainingPlanDefaultArgs<ExtArgs>;
    drill?: boolean | Prisma.DrillDefaultArgs<ExtArgs>;
};
export type PlanDrillIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    trainingPlan?: boolean | Prisma.TrainingPlanDefaultArgs<ExtArgs>;
    drill?: boolean | Prisma.DrillDefaultArgs<ExtArgs>;
};
export type $PlanDrillPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: 'PlanDrill';
    objects: {
        trainingPlan: Prisma.$TrainingPlanPayload<ExtArgs>;
        drill: Prisma.$DrillPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        trainingPlanId: string;
        drillId: string;
        phase: $Enums.Phase;
        order: number;
        notes: string | null;
    }, ExtArgs['result']['planDrill']>;
    composites: {};
};
export type PlanDrillGetPayload<S extends boolean | null | undefined | PlanDrillDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PlanDrillPayload, S>;
export type PlanDrillCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PlanDrillFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PlanDrillCountAggregateInputType | true;
};
export interface PlanDrillDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['PlanDrill'];
        meta: {
            name: 'PlanDrill';
        };
    };
    findUnique<T extends PlanDrillFindUniqueArgs>(args: Prisma.SelectSubset<T, PlanDrillFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PlanDrillClient<runtime.Types.Result.GetResult<Prisma.$PlanDrillPayload<ExtArgs>, T, 'findUnique', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends PlanDrillFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PlanDrillFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PlanDrillClient<runtime.Types.Result.GetResult<Prisma.$PlanDrillPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends PlanDrillFindFirstArgs>(args?: Prisma.SelectSubset<T, PlanDrillFindFirstArgs<ExtArgs>>): Prisma.Prisma__PlanDrillClient<runtime.Types.Result.GetResult<Prisma.$PlanDrillPayload<ExtArgs>, T, 'findFirst', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends PlanDrillFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PlanDrillFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PlanDrillClient<runtime.Types.Result.GetResult<Prisma.$PlanDrillPayload<ExtArgs>, T, 'findFirstOrThrow', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends PlanDrillFindManyArgs>(args?: Prisma.SelectSubset<T, PlanDrillFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlanDrillPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>>;
    create<T extends PlanDrillCreateArgs>(args: Prisma.SelectSubset<T, PlanDrillCreateArgs<ExtArgs>>): Prisma.Prisma__PlanDrillClient<runtime.Types.Result.GetResult<Prisma.$PlanDrillPayload<ExtArgs>, T, 'create', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends PlanDrillCreateManyArgs>(args?: Prisma.SelectSubset<T, PlanDrillCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends PlanDrillCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PlanDrillCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlanDrillPayload<ExtArgs>, T, 'createManyAndReturn', GlobalOmitOptions>>;
    delete<T extends PlanDrillDeleteArgs>(args: Prisma.SelectSubset<T, PlanDrillDeleteArgs<ExtArgs>>): Prisma.Prisma__PlanDrillClient<runtime.Types.Result.GetResult<Prisma.$PlanDrillPayload<ExtArgs>, T, 'delete', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends PlanDrillUpdateArgs>(args: Prisma.SelectSubset<T, PlanDrillUpdateArgs<ExtArgs>>): Prisma.Prisma__PlanDrillClient<runtime.Types.Result.GetResult<Prisma.$PlanDrillPayload<ExtArgs>, T, 'update', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends PlanDrillDeleteManyArgs>(args?: Prisma.SelectSubset<T, PlanDrillDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends PlanDrillUpdateManyArgs>(args: Prisma.SelectSubset<T, PlanDrillUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends PlanDrillUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PlanDrillUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlanDrillPayload<ExtArgs>, T, 'updateManyAndReturn', GlobalOmitOptions>>;
    upsert<T extends PlanDrillUpsertArgs>(args: Prisma.SelectSubset<T, PlanDrillUpsertArgs<ExtArgs>>): Prisma.Prisma__PlanDrillClient<runtime.Types.Result.GetResult<Prisma.$PlanDrillPayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends PlanDrillCountArgs>(args?: Prisma.Subset<T, PlanDrillCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PlanDrillCountAggregateOutputType> : number>;
    aggregate<T extends PlanDrillAggregateArgs>(args: Prisma.Subset<T, PlanDrillAggregateArgs>): Prisma.PrismaPromise<GetPlanDrillAggregateType<T>>;
    groupBy<T extends PlanDrillGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PlanDrillGroupByArgs['orderBy'];
    } : {
        orderBy?: PlanDrillGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PlanDrillGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlanDrillGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: PlanDrillFieldRefs;
}
export interface Prisma__PlanDrillClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    trainingPlan<T extends Prisma.TrainingPlanDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TrainingPlanDefaultArgs<ExtArgs>>): Prisma.Prisma__TrainingPlanClient<runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    drill<T extends Prisma.DrillDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DrillDefaultArgs<ExtArgs>>): Prisma.Prisma__DrillClient<runtime.Types.Result.GetResult<Prisma.$DrillPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface PlanDrillFieldRefs {
    readonly id: Prisma.FieldRef<'PlanDrill', 'String'>;
    readonly trainingPlanId: Prisma.FieldRef<'PlanDrill', 'String'>;
    readonly drillId: Prisma.FieldRef<'PlanDrill', 'String'>;
    readonly phase: Prisma.FieldRef<'PlanDrill', 'Phase'>;
    readonly order: Prisma.FieldRef<'PlanDrill', 'Int'>;
    readonly notes: Prisma.FieldRef<'PlanDrill', 'String'>;
}
export type PlanDrillFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlanDrillSelect<ExtArgs> | null;
    omit?: Prisma.PlanDrillOmit<ExtArgs> | null;
    include?: Prisma.PlanDrillInclude<ExtArgs> | null;
    where: Prisma.PlanDrillWhereUniqueInput;
};
export type PlanDrillFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlanDrillSelect<ExtArgs> | null;
    omit?: Prisma.PlanDrillOmit<ExtArgs> | null;
    include?: Prisma.PlanDrillInclude<ExtArgs> | null;
    where: Prisma.PlanDrillWhereUniqueInput;
};
export type PlanDrillFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PlanDrillFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PlanDrillFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PlanDrillCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlanDrillSelect<ExtArgs> | null;
    omit?: Prisma.PlanDrillOmit<ExtArgs> | null;
    include?: Prisma.PlanDrillInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PlanDrillCreateInput, Prisma.PlanDrillUncheckedCreateInput>;
};
export type PlanDrillCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.PlanDrillCreateManyInput | Prisma.PlanDrillCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PlanDrillCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlanDrillSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PlanDrillOmit<ExtArgs> | null;
    data: Prisma.PlanDrillCreateManyInput | Prisma.PlanDrillCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.PlanDrillIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type PlanDrillUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlanDrillSelect<ExtArgs> | null;
    omit?: Prisma.PlanDrillOmit<ExtArgs> | null;
    include?: Prisma.PlanDrillInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PlanDrillUpdateInput, Prisma.PlanDrillUncheckedUpdateInput>;
    where: Prisma.PlanDrillWhereUniqueInput;
};
export type PlanDrillUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.PlanDrillUpdateManyMutationInput, Prisma.PlanDrillUncheckedUpdateManyInput>;
    where?: Prisma.PlanDrillWhereInput;
    limit?: number;
};
export type PlanDrillUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlanDrillSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PlanDrillOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PlanDrillUpdateManyMutationInput, Prisma.PlanDrillUncheckedUpdateManyInput>;
    where?: Prisma.PlanDrillWhereInput;
    limit?: number;
    include?: Prisma.PlanDrillIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type PlanDrillUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlanDrillSelect<ExtArgs> | null;
    omit?: Prisma.PlanDrillOmit<ExtArgs> | null;
    include?: Prisma.PlanDrillInclude<ExtArgs> | null;
    where: Prisma.PlanDrillWhereUniqueInput;
    create: Prisma.XOR<Prisma.PlanDrillCreateInput, Prisma.PlanDrillUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.PlanDrillUpdateInput, Prisma.PlanDrillUncheckedUpdateInput>;
};
export type PlanDrillDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlanDrillSelect<ExtArgs> | null;
    omit?: Prisma.PlanDrillOmit<ExtArgs> | null;
    include?: Prisma.PlanDrillInclude<ExtArgs> | null;
    where: Prisma.PlanDrillWhereUniqueInput;
};
export type PlanDrillDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PlanDrillWhereInput;
    limit?: number;
};
export type PlanDrillDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlanDrillSelect<ExtArgs> | null;
    omit?: Prisma.PlanDrillOmit<ExtArgs> | null;
    include?: Prisma.PlanDrillInclude<ExtArgs> | null;
};
export {};
