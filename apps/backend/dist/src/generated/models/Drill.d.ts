import type * as runtime from '@prisma/client/runtime/library';
import type * as $Enums from '../enums.js';
import type * as Prisma from '../internal/prismaNamespace.js';
export type DrillModel = runtime.Types.Result.DefaultSelection<Prisma.$DrillPayload>;
export type AggregateDrill = {
    _count: DrillCountAggregateOutputType | null;
    _avg: DrillAvgAggregateOutputType | null;
    _sum: DrillSumAggregateOutputType | null;
    _min: DrillMinAggregateOutputType | null;
    _max: DrillMaxAggregateOutputType | null;
};
export type DrillAvgAggregateOutputType = {
    durationMin: number | null;
};
export type DrillSumAggregateOutputType = {
    durationMin: number | null;
};
export type DrillMinAggregateOutputType = {
    id: string | null;
    title: string | null;
    category: $Enums.DrillCategory | null;
    ageGroup: $Enums.AgeGroup | null;
    durationMin: number | null;
    difficulty: $Enums.Difficulty | null;
    equipment: string | null;
    imageUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type DrillMaxAggregateOutputType = {
    id: string | null;
    title: string | null;
    category: $Enums.DrillCategory | null;
    ageGroup: $Enums.AgeGroup | null;
    durationMin: number | null;
    difficulty: $Enums.Difficulty | null;
    equipment: string | null;
    imageUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type DrillCountAggregateOutputType = {
    id: number;
    title: number;
    category: number;
    ageGroup: number;
    durationMin: number;
    difficulty: number;
    equipment: number;
    jsonData: number;
    imageUrl: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type DrillAvgAggregateInputType = {
    durationMin?: true;
};
export type DrillSumAggregateInputType = {
    durationMin?: true;
};
export type DrillMinAggregateInputType = {
    id?: true;
    title?: true;
    category?: true;
    ageGroup?: true;
    durationMin?: true;
    difficulty?: true;
    equipment?: true;
    imageUrl?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type DrillMaxAggregateInputType = {
    id?: true;
    title?: true;
    category?: true;
    ageGroup?: true;
    durationMin?: true;
    difficulty?: true;
    equipment?: true;
    imageUrl?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type DrillCountAggregateInputType = {
    id?: true;
    title?: true;
    category?: true;
    ageGroup?: true;
    durationMin?: true;
    difficulty?: true;
    equipment?: true;
    jsonData?: true;
    imageUrl?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type DrillAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DrillWhereInput;
    orderBy?: Prisma.DrillOrderByWithRelationInput | Prisma.DrillOrderByWithRelationInput[];
    cursor?: Prisma.DrillWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | DrillCountAggregateInputType;
    _avg?: DrillAvgAggregateInputType;
    _sum?: DrillSumAggregateInputType;
    _min?: DrillMinAggregateInputType;
    _max?: DrillMaxAggregateInputType;
};
export type GetDrillAggregateType<T extends DrillAggregateArgs> = {
    [P in keyof T & keyof AggregateDrill]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateDrill[P]> : Prisma.GetScalarType<T[P], AggregateDrill[P]>;
};
export type DrillGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DrillWhereInput;
    orderBy?: Prisma.DrillOrderByWithAggregationInput | Prisma.DrillOrderByWithAggregationInput[];
    by: Prisma.DrillScalarFieldEnum[] | Prisma.DrillScalarFieldEnum;
    having?: Prisma.DrillScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DrillCountAggregateInputType | true;
    _avg?: DrillAvgAggregateInputType;
    _sum?: DrillSumAggregateInputType;
    _min?: DrillMinAggregateInputType;
    _max?: DrillMaxAggregateInputType;
};
export type DrillGroupByOutputType = {
    id: string;
    title: string;
    category: $Enums.DrillCategory;
    ageGroup: $Enums.AgeGroup;
    durationMin: number;
    difficulty: $Enums.Difficulty;
    equipment: string | null;
    jsonData: runtime.JsonValue;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: DrillCountAggregateOutputType | null;
    _avg: DrillAvgAggregateOutputType | null;
    _sum: DrillSumAggregateOutputType | null;
    _min: DrillMinAggregateOutputType | null;
    _max: DrillMaxAggregateOutputType | null;
};
type GetDrillGroupByPayload<T extends DrillGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<DrillGroupByOutputType, T['by']> & {
    [P in keyof T & keyof DrillGroupByOutputType]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], DrillGroupByOutputType[P]> : Prisma.GetScalarType<T[P], DrillGroupByOutputType[P]>;
}>>;
export type DrillWhereInput = {
    AND?: Prisma.DrillWhereInput | Prisma.DrillWhereInput[];
    OR?: Prisma.DrillWhereInput[];
    NOT?: Prisma.DrillWhereInput | Prisma.DrillWhereInput[];
    id?: Prisma.StringFilter<'Drill'> | string;
    title?: Prisma.StringFilter<'Drill'> | string;
    category?: Prisma.EnumDrillCategoryFilter<'Drill'> | $Enums.DrillCategory;
    ageGroup?: Prisma.EnumAgeGroupFilter<'Drill'> | $Enums.AgeGroup;
    durationMin?: Prisma.IntFilter<'Drill'> | number;
    difficulty?: Prisma.EnumDifficultyFilter<'Drill'> | $Enums.Difficulty;
    equipment?: Prisma.StringNullableFilter<'Drill'> | string | null;
    jsonData?: Prisma.JsonFilter<'Drill'>;
    imageUrl?: Prisma.StringNullableFilter<'Drill'> | string | null;
    createdAt?: Prisma.DateTimeFilter<'Drill'> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<'Drill'> | Date | string;
    plans?: Prisma.PlanDrillListRelationFilter;
};
export type DrillOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    ageGroup?: Prisma.SortOrder;
    durationMin?: Prisma.SortOrder;
    difficulty?: Prisma.SortOrder;
    equipment?: Prisma.SortOrderInput | Prisma.SortOrder;
    jsonData?: Prisma.SortOrder;
    imageUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    plans?: Prisma.PlanDrillOrderByRelationAggregateInput;
};
export type DrillWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.DrillWhereInput | Prisma.DrillWhereInput[];
    OR?: Prisma.DrillWhereInput[];
    NOT?: Prisma.DrillWhereInput | Prisma.DrillWhereInput[];
    title?: Prisma.StringFilter<'Drill'> | string;
    category?: Prisma.EnumDrillCategoryFilter<'Drill'> | $Enums.DrillCategory;
    ageGroup?: Prisma.EnumAgeGroupFilter<'Drill'> | $Enums.AgeGroup;
    durationMin?: Prisma.IntFilter<'Drill'> | number;
    difficulty?: Prisma.EnumDifficultyFilter<'Drill'> | $Enums.Difficulty;
    equipment?: Prisma.StringNullableFilter<'Drill'> | string | null;
    jsonData?: Prisma.JsonFilter<'Drill'>;
    imageUrl?: Prisma.StringNullableFilter<'Drill'> | string | null;
    createdAt?: Prisma.DateTimeFilter<'Drill'> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<'Drill'> | Date | string;
    plans?: Prisma.PlanDrillListRelationFilter;
}, 'id'>;
export type DrillOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    ageGroup?: Prisma.SortOrder;
    durationMin?: Prisma.SortOrder;
    difficulty?: Prisma.SortOrder;
    equipment?: Prisma.SortOrderInput | Prisma.SortOrder;
    jsonData?: Prisma.SortOrder;
    imageUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.DrillCountOrderByAggregateInput;
    _avg?: Prisma.DrillAvgOrderByAggregateInput;
    _max?: Prisma.DrillMaxOrderByAggregateInput;
    _min?: Prisma.DrillMinOrderByAggregateInput;
    _sum?: Prisma.DrillSumOrderByAggregateInput;
};
export type DrillScalarWhereWithAggregatesInput = {
    AND?: Prisma.DrillScalarWhereWithAggregatesInput | Prisma.DrillScalarWhereWithAggregatesInput[];
    OR?: Prisma.DrillScalarWhereWithAggregatesInput[];
    NOT?: Prisma.DrillScalarWhereWithAggregatesInput | Prisma.DrillScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<'Drill'> | string;
    title?: Prisma.StringWithAggregatesFilter<'Drill'> | string;
    category?: Prisma.EnumDrillCategoryWithAggregatesFilter<'Drill'> | $Enums.DrillCategory;
    ageGroup?: Prisma.EnumAgeGroupWithAggregatesFilter<'Drill'> | $Enums.AgeGroup;
    durationMin?: Prisma.IntWithAggregatesFilter<'Drill'> | number;
    difficulty?: Prisma.EnumDifficultyWithAggregatesFilter<'Drill'> | $Enums.Difficulty;
    equipment?: Prisma.StringNullableWithAggregatesFilter<'Drill'> | string | null;
    jsonData?: Prisma.JsonWithAggregatesFilter<'Drill'>;
    imageUrl?: Prisma.StringNullableWithAggregatesFilter<'Drill'> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<'Drill'> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<'Drill'> | Date | string;
};
export type DrillCreateInput = {
    id?: string;
    title: string;
    category: $Enums.DrillCategory;
    ageGroup: $Enums.AgeGroup;
    durationMin: number;
    difficulty: $Enums.Difficulty;
    equipment?: string | null;
    jsonData: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    imageUrl?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    plans?: Prisma.PlanDrillCreateNestedManyWithoutDrillInput;
};
export type DrillUncheckedCreateInput = {
    id?: string;
    title: string;
    category: $Enums.DrillCategory;
    ageGroup: $Enums.AgeGroup;
    durationMin: number;
    difficulty: $Enums.Difficulty;
    equipment?: string | null;
    jsonData: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    imageUrl?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    plans?: Prisma.PlanDrillUncheckedCreateNestedManyWithoutDrillInput;
};
export type DrillUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    category?: Prisma.EnumDrillCategoryFieldUpdateOperationsInput | $Enums.DrillCategory;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    durationMin?: Prisma.IntFieldUpdateOperationsInput | number;
    difficulty?: Prisma.EnumDifficultyFieldUpdateOperationsInput | $Enums.Difficulty;
    equipment?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    jsonData?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    plans?: Prisma.PlanDrillUpdateManyWithoutDrillNestedInput;
};
export type DrillUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    category?: Prisma.EnumDrillCategoryFieldUpdateOperationsInput | $Enums.DrillCategory;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    durationMin?: Prisma.IntFieldUpdateOperationsInput | number;
    difficulty?: Prisma.EnumDifficultyFieldUpdateOperationsInput | $Enums.Difficulty;
    equipment?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    jsonData?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    plans?: Prisma.PlanDrillUncheckedUpdateManyWithoutDrillNestedInput;
};
export type DrillCreateManyInput = {
    id?: string;
    title: string;
    category: $Enums.DrillCategory;
    ageGroup: $Enums.AgeGroup;
    durationMin: number;
    difficulty: $Enums.Difficulty;
    equipment?: string | null;
    jsonData: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    imageUrl?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type DrillUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    category?: Prisma.EnumDrillCategoryFieldUpdateOperationsInput | $Enums.DrillCategory;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    durationMin?: Prisma.IntFieldUpdateOperationsInput | number;
    difficulty?: Prisma.EnumDifficultyFieldUpdateOperationsInput | $Enums.Difficulty;
    equipment?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    jsonData?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DrillUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    category?: Prisma.EnumDrillCategoryFieldUpdateOperationsInput | $Enums.DrillCategory;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    durationMin?: Prisma.IntFieldUpdateOperationsInput | number;
    difficulty?: Prisma.EnumDifficultyFieldUpdateOperationsInput | $Enums.Difficulty;
    equipment?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    jsonData?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DrillCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    ageGroup?: Prisma.SortOrder;
    durationMin?: Prisma.SortOrder;
    difficulty?: Prisma.SortOrder;
    equipment?: Prisma.SortOrder;
    jsonData?: Prisma.SortOrder;
    imageUrl?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type DrillAvgOrderByAggregateInput = {
    durationMin?: Prisma.SortOrder;
};
export type DrillMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    ageGroup?: Prisma.SortOrder;
    durationMin?: Prisma.SortOrder;
    difficulty?: Prisma.SortOrder;
    equipment?: Prisma.SortOrder;
    imageUrl?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type DrillMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    ageGroup?: Prisma.SortOrder;
    durationMin?: Prisma.SortOrder;
    difficulty?: Prisma.SortOrder;
    equipment?: Prisma.SortOrder;
    imageUrl?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type DrillSumOrderByAggregateInput = {
    durationMin?: Prisma.SortOrder;
};
export type DrillScalarRelationFilter = {
    is?: Prisma.DrillWhereInput;
    isNot?: Prisma.DrillWhereInput;
};
export type EnumDrillCategoryFieldUpdateOperationsInput = {
    set?: $Enums.DrillCategory;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type EnumDifficultyFieldUpdateOperationsInput = {
    set?: $Enums.Difficulty;
};
export type DrillCreateNestedOneWithoutPlansInput = {
    create?: Prisma.XOR<Prisma.DrillCreateWithoutPlansInput, Prisma.DrillUncheckedCreateWithoutPlansInput>;
    connectOrCreate?: Prisma.DrillCreateOrConnectWithoutPlansInput;
    connect?: Prisma.DrillWhereUniqueInput;
};
export type DrillUpdateOneRequiredWithoutPlansNestedInput = {
    create?: Prisma.XOR<Prisma.DrillCreateWithoutPlansInput, Prisma.DrillUncheckedCreateWithoutPlansInput>;
    connectOrCreate?: Prisma.DrillCreateOrConnectWithoutPlansInput;
    upsert?: Prisma.DrillUpsertWithoutPlansInput;
    connect?: Prisma.DrillWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.DrillUpdateToOneWithWhereWithoutPlansInput, Prisma.DrillUpdateWithoutPlansInput>, Prisma.DrillUncheckedUpdateWithoutPlansInput>;
};
export type DrillCreateWithoutPlansInput = {
    id?: string;
    title: string;
    category: $Enums.DrillCategory;
    ageGroup: $Enums.AgeGroup;
    durationMin: number;
    difficulty: $Enums.Difficulty;
    equipment?: string | null;
    jsonData: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    imageUrl?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type DrillUncheckedCreateWithoutPlansInput = {
    id?: string;
    title: string;
    category: $Enums.DrillCategory;
    ageGroup: $Enums.AgeGroup;
    durationMin: number;
    difficulty: $Enums.Difficulty;
    equipment?: string | null;
    jsonData: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    imageUrl?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type DrillCreateOrConnectWithoutPlansInput = {
    where: Prisma.DrillWhereUniqueInput;
    create: Prisma.XOR<Prisma.DrillCreateWithoutPlansInput, Prisma.DrillUncheckedCreateWithoutPlansInput>;
};
export type DrillUpsertWithoutPlansInput = {
    update: Prisma.XOR<Prisma.DrillUpdateWithoutPlansInput, Prisma.DrillUncheckedUpdateWithoutPlansInput>;
    create: Prisma.XOR<Prisma.DrillCreateWithoutPlansInput, Prisma.DrillUncheckedCreateWithoutPlansInput>;
    where?: Prisma.DrillWhereInput;
};
export type DrillUpdateToOneWithWhereWithoutPlansInput = {
    where?: Prisma.DrillWhereInput;
    data: Prisma.XOR<Prisma.DrillUpdateWithoutPlansInput, Prisma.DrillUncheckedUpdateWithoutPlansInput>;
};
export type DrillUpdateWithoutPlansInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    category?: Prisma.EnumDrillCategoryFieldUpdateOperationsInput | $Enums.DrillCategory;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    durationMin?: Prisma.IntFieldUpdateOperationsInput | number;
    difficulty?: Prisma.EnumDifficultyFieldUpdateOperationsInput | $Enums.Difficulty;
    equipment?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    jsonData?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DrillUncheckedUpdateWithoutPlansInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    category?: Prisma.EnumDrillCategoryFieldUpdateOperationsInput | $Enums.DrillCategory;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    durationMin?: Prisma.IntFieldUpdateOperationsInput | number;
    difficulty?: Prisma.EnumDifficultyFieldUpdateOperationsInput | $Enums.Difficulty;
    equipment?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    jsonData?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DrillCountOutputType = {
    plans: number;
};
export type DrillCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    plans?: boolean | DrillCountOutputTypeCountPlansArgs;
};
export type DrillCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DrillCountOutputTypeSelect<ExtArgs> | null;
};
export type DrillCountOutputTypeCountPlansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PlanDrillWhereInput;
};
export type DrillSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    title?: boolean;
    category?: boolean;
    ageGroup?: boolean;
    durationMin?: boolean;
    difficulty?: boolean;
    equipment?: boolean;
    jsonData?: boolean;
    imageUrl?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    plans?: boolean | Prisma.Drill$plansArgs<ExtArgs>;
    _count?: boolean | Prisma.DrillCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs['result']['drill']>;
export type DrillSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    title?: boolean;
    category?: boolean;
    ageGroup?: boolean;
    durationMin?: boolean;
    difficulty?: boolean;
    equipment?: boolean;
    jsonData?: boolean;
    imageUrl?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs['result']['drill']>;
export type DrillSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    title?: boolean;
    category?: boolean;
    ageGroup?: boolean;
    durationMin?: boolean;
    difficulty?: boolean;
    equipment?: boolean;
    jsonData?: boolean;
    imageUrl?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs['result']['drill']>;
export type DrillSelectScalar = {
    id?: boolean;
    title?: boolean;
    category?: boolean;
    ageGroup?: boolean;
    durationMin?: boolean;
    difficulty?: boolean;
    equipment?: boolean;
    jsonData?: boolean;
    imageUrl?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type DrillOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<'id' | 'title' | 'category' | 'ageGroup' | 'durationMin' | 'difficulty' | 'equipment' | 'jsonData' | 'imageUrl' | 'createdAt' | 'updatedAt', ExtArgs['result']['drill']>;
export type DrillInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    plans?: boolean | Prisma.Drill$plansArgs<ExtArgs>;
    _count?: boolean | Prisma.DrillCountOutputTypeDefaultArgs<ExtArgs>;
};
export type DrillIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type DrillIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $DrillPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: 'Drill';
    objects: {
        plans: Prisma.$PlanDrillPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        title: string;
        category: $Enums.DrillCategory;
        ageGroup: $Enums.AgeGroup;
        durationMin: number;
        difficulty: $Enums.Difficulty;
        equipment: string | null;
        jsonData: runtime.JsonValue;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs['result']['drill']>;
    composites: {};
};
export type DrillGetPayload<S extends boolean | null | undefined | DrillDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$DrillPayload, S>;
export type DrillCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<DrillFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: DrillCountAggregateInputType | true;
};
export interface DrillDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Drill'];
        meta: {
            name: 'Drill';
        };
    };
    findUnique<T extends DrillFindUniqueArgs>(args: Prisma.SelectSubset<T, DrillFindUniqueArgs<ExtArgs>>): Prisma.Prisma__DrillClient<runtime.Types.Result.GetResult<Prisma.$DrillPayload<ExtArgs>, T, 'findUnique', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends DrillFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, DrillFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__DrillClient<runtime.Types.Result.GetResult<Prisma.$DrillPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends DrillFindFirstArgs>(args?: Prisma.SelectSubset<T, DrillFindFirstArgs<ExtArgs>>): Prisma.Prisma__DrillClient<runtime.Types.Result.GetResult<Prisma.$DrillPayload<ExtArgs>, T, 'findFirst', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends DrillFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, DrillFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__DrillClient<runtime.Types.Result.GetResult<Prisma.$DrillPayload<ExtArgs>, T, 'findFirstOrThrow', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends DrillFindManyArgs>(args?: Prisma.SelectSubset<T, DrillFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DrillPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>>;
    create<T extends DrillCreateArgs>(args: Prisma.SelectSubset<T, DrillCreateArgs<ExtArgs>>): Prisma.Prisma__DrillClient<runtime.Types.Result.GetResult<Prisma.$DrillPayload<ExtArgs>, T, 'create', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends DrillCreateManyArgs>(args?: Prisma.SelectSubset<T, DrillCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends DrillCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, DrillCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DrillPayload<ExtArgs>, T, 'createManyAndReturn', GlobalOmitOptions>>;
    delete<T extends DrillDeleteArgs>(args: Prisma.SelectSubset<T, DrillDeleteArgs<ExtArgs>>): Prisma.Prisma__DrillClient<runtime.Types.Result.GetResult<Prisma.$DrillPayload<ExtArgs>, T, 'delete', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends DrillUpdateArgs>(args: Prisma.SelectSubset<T, DrillUpdateArgs<ExtArgs>>): Prisma.Prisma__DrillClient<runtime.Types.Result.GetResult<Prisma.$DrillPayload<ExtArgs>, T, 'update', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends DrillDeleteManyArgs>(args?: Prisma.SelectSubset<T, DrillDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends DrillUpdateManyArgs>(args: Prisma.SelectSubset<T, DrillUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends DrillUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, DrillUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DrillPayload<ExtArgs>, T, 'updateManyAndReturn', GlobalOmitOptions>>;
    upsert<T extends DrillUpsertArgs>(args: Prisma.SelectSubset<T, DrillUpsertArgs<ExtArgs>>): Prisma.Prisma__DrillClient<runtime.Types.Result.GetResult<Prisma.$DrillPayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends DrillCountArgs>(args?: Prisma.Subset<T, DrillCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], DrillCountAggregateOutputType> : number>;
    aggregate<T extends DrillAggregateArgs>(args: Prisma.Subset<T, DrillAggregateArgs>): Prisma.PrismaPromise<GetDrillAggregateType<T>>;
    groupBy<T extends DrillGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: DrillGroupByArgs['orderBy'];
    } : {
        orderBy?: DrillGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, DrillGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDrillGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: DrillFieldRefs;
}
export interface Prisma__DrillClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    plans<T extends Prisma.Drill$plansArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Drill$plansArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlanDrillPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface DrillFieldRefs {
    readonly id: Prisma.FieldRef<'Drill', 'String'>;
    readonly title: Prisma.FieldRef<'Drill', 'String'>;
    readonly category: Prisma.FieldRef<'Drill', 'DrillCategory'>;
    readonly ageGroup: Prisma.FieldRef<'Drill', 'AgeGroup'>;
    readonly durationMin: Prisma.FieldRef<'Drill', 'Int'>;
    readonly difficulty: Prisma.FieldRef<'Drill', 'Difficulty'>;
    readonly equipment: Prisma.FieldRef<'Drill', 'String'>;
    readonly jsonData: Prisma.FieldRef<'Drill', 'Json'>;
    readonly imageUrl: Prisma.FieldRef<'Drill', 'String'>;
    readonly createdAt: Prisma.FieldRef<'Drill', 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<'Drill', 'DateTime'>;
}
export type DrillFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DrillSelect<ExtArgs> | null;
    omit?: Prisma.DrillOmit<ExtArgs> | null;
    include?: Prisma.DrillInclude<ExtArgs> | null;
    where: Prisma.DrillWhereUniqueInput;
};
export type DrillFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DrillSelect<ExtArgs> | null;
    omit?: Prisma.DrillOmit<ExtArgs> | null;
    include?: Prisma.DrillInclude<ExtArgs> | null;
    where: Prisma.DrillWhereUniqueInput;
};
export type DrillFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DrillSelect<ExtArgs> | null;
    omit?: Prisma.DrillOmit<ExtArgs> | null;
    include?: Prisma.DrillInclude<ExtArgs> | null;
    where?: Prisma.DrillWhereInput;
    orderBy?: Prisma.DrillOrderByWithRelationInput | Prisma.DrillOrderByWithRelationInput[];
    cursor?: Prisma.DrillWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DrillScalarFieldEnum | Prisma.DrillScalarFieldEnum[];
};
export type DrillFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DrillSelect<ExtArgs> | null;
    omit?: Prisma.DrillOmit<ExtArgs> | null;
    include?: Prisma.DrillInclude<ExtArgs> | null;
    where?: Prisma.DrillWhereInput;
    orderBy?: Prisma.DrillOrderByWithRelationInput | Prisma.DrillOrderByWithRelationInput[];
    cursor?: Prisma.DrillWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DrillScalarFieldEnum | Prisma.DrillScalarFieldEnum[];
};
export type DrillFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DrillSelect<ExtArgs> | null;
    omit?: Prisma.DrillOmit<ExtArgs> | null;
    include?: Prisma.DrillInclude<ExtArgs> | null;
    where?: Prisma.DrillWhereInput;
    orderBy?: Prisma.DrillOrderByWithRelationInput | Prisma.DrillOrderByWithRelationInput[];
    cursor?: Prisma.DrillWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DrillScalarFieldEnum | Prisma.DrillScalarFieldEnum[];
};
export type DrillCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DrillSelect<ExtArgs> | null;
    omit?: Prisma.DrillOmit<ExtArgs> | null;
    include?: Prisma.DrillInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DrillCreateInput, Prisma.DrillUncheckedCreateInput>;
};
export type DrillCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.DrillCreateManyInput | Prisma.DrillCreateManyInput[];
    skipDuplicates?: boolean;
};
export type DrillCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DrillSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DrillOmit<ExtArgs> | null;
    data: Prisma.DrillCreateManyInput | Prisma.DrillCreateManyInput[];
    skipDuplicates?: boolean;
};
export type DrillUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DrillSelect<ExtArgs> | null;
    omit?: Prisma.DrillOmit<ExtArgs> | null;
    include?: Prisma.DrillInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DrillUpdateInput, Prisma.DrillUncheckedUpdateInput>;
    where: Prisma.DrillWhereUniqueInput;
};
export type DrillUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.DrillUpdateManyMutationInput, Prisma.DrillUncheckedUpdateManyInput>;
    where?: Prisma.DrillWhereInput;
    limit?: number;
};
export type DrillUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DrillSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DrillOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DrillUpdateManyMutationInput, Prisma.DrillUncheckedUpdateManyInput>;
    where?: Prisma.DrillWhereInput;
    limit?: number;
};
export type DrillUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DrillSelect<ExtArgs> | null;
    omit?: Prisma.DrillOmit<ExtArgs> | null;
    include?: Prisma.DrillInclude<ExtArgs> | null;
    where: Prisma.DrillWhereUniqueInput;
    create: Prisma.XOR<Prisma.DrillCreateInput, Prisma.DrillUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.DrillUpdateInput, Prisma.DrillUncheckedUpdateInput>;
};
export type DrillDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DrillSelect<ExtArgs> | null;
    omit?: Prisma.DrillOmit<ExtArgs> | null;
    include?: Prisma.DrillInclude<ExtArgs> | null;
    where: Prisma.DrillWhereUniqueInput;
};
export type DrillDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DrillWhereInput;
    limit?: number;
};
export type Drill$plansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type DrillDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DrillSelect<ExtArgs> | null;
    omit?: Prisma.DrillOmit<ExtArgs> | null;
    include?: Prisma.DrillInclude<ExtArgs> | null;
};
export {};
