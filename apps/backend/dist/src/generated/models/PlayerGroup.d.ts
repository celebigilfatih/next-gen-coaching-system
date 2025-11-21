import type * as runtime from '@prisma/client/runtime/library';
import type * as $Enums from '../enums.js';
import type * as Prisma from '../internal/prismaNamespace.js';
export type PlayerGroupModel = runtime.Types.Result.DefaultSelection<Prisma.$PlayerGroupPayload>;
export type AggregatePlayerGroup = {
    _count: PlayerGroupCountAggregateOutputType | null;
    _min: PlayerGroupMinAggregateOutputType | null;
    _max: PlayerGroupMaxAggregateOutputType | null;
};
export type PlayerGroupMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    clubId: string | null;
    ageGroup: $Enums.AgeGroup | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type PlayerGroupMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    clubId: string | null;
    ageGroup: $Enums.AgeGroup | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type PlayerGroupCountAggregateOutputType = {
    id: number;
    name: number;
    clubId: number;
    ageGroup: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type PlayerGroupMinAggregateInputType = {
    id?: true;
    name?: true;
    clubId?: true;
    ageGroup?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type PlayerGroupMaxAggregateInputType = {
    id?: true;
    name?: true;
    clubId?: true;
    ageGroup?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type PlayerGroupCountAggregateInputType = {
    id?: true;
    name?: true;
    clubId?: true;
    ageGroup?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type PlayerGroupAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PlayerGroupWhereInput;
    orderBy?: Prisma.PlayerGroupOrderByWithRelationInput | Prisma.PlayerGroupOrderByWithRelationInput[];
    cursor?: Prisma.PlayerGroupWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | PlayerGroupCountAggregateInputType;
    _min?: PlayerGroupMinAggregateInputType;
    _max?: PlayerGroupMaxAggregateInputType;
};
export type GetPlayerGroupAggregateType<T extends PlayerGroupAggregateArgs> = {
    [P in keyof T & keyof AggregatePlayerGroup]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePlayerGroup[P]> : Prisma.GetScalarType<T[P], AggregatePlayerGroup[P]>;
};
export type PlayerGroupGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PlayerGroupWhereInput;
    orderBy?: Prisma.PlayerGroupOrderByWithAggregationInput | Prisma.PlayerGroupOrderByWithAggregationInput[];
    by: Prisma.PlayerGroupScalarFieldEnum[] | Prisma.PlayerGroupScalarFieldEnum;
    having?: Prisma.PlayerGroupScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PlayerGroupCountAggregateInputType | true;
    _min?: PlayerGroupMinAggregateInputType;
    _max?: PlayerGroupMaxAggregateInputType;
};
export type PlayerGroupGroupByOutputType = {
    id: string;
    name: string;
    clubId: string;
    ageGroup: $Enums.AgeGroup;
    createdAt: Date;
    updatedAt: Date;
    _count: PlayerGroupCountAggregateOutputType | null;
    _min: PlayerGroupMinAggregateOutputType | null;
    _max: PlayerGroupMaxAggregateOutputType | null;
};
type GetPlayerGroupGroupByPayload<T extends PlayerGroupGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PlayerGroupGroupByOutputType, T['by']> & {
    [P in keyof T & keyof PlayerGroupGroupByOutputType]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PlayerGroupGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PlayerGroupGroupByOutputType[P]>;
}>>;
export type PlayerGroupWhereInput = {
    AND?: Prisma.PlayerGroupWhereInput | Prisma.PlayerGroupWhereInput[];
    OR?: Prisma.PlayerGroupWhereInput[];
    NOT?: Prisma.PlayerGroupWhereInput | Prisma.PlayerGroupWhereInput[];
    id?: Prisma.StringFilter<'PlayerGroup'> | string;
    name?: Prisma.StringFilter<'PlayerGroup'> | string;
    clubId?: Prisma.StringFilter<'PlayerGroup'> | string;
    ageGroup?: Prisma.EnumAgeGroupFilter<'PlayerGroup'> | $Enums.AgeGroup;
    createdAt?: Prisma.DateTimeFilter<'PlayerGroup'> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<'PlayerGroup'> | Date | string;
    club?: Prisma.XOR<Prisma.ClubScalarRelationFilter, Prisma.ClubWhereInput>;
    members?: Prisma.GroupMemberListRelationFilter;
    sessions?: Prisma.TrainingPlanListRelationFilter;
};
export type PlayerGroupOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    clubId?: Prisma.SortOrder;
    ageGroup?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    club?: Prisma.ClubOrderByWithRelationInput;
    members?: Prisma.GroupMemberOrderByRelationAggregateInput;
    sessions?: Prisma.TrainingPlanOrderByRelationAggregateInput;
};
export type PlayerGroupWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.PlayerGroupWhereInput | Prisma.PlayerGroupWhereInput[];
    OR?: Prisma.PlayerGroupWhereInput[];
    NOT?: Prisma.PlayerGroupWhereInput | Prisma.PlayerGroupWhereInput[];
    name?: Prisma.StringFilter<'PlayerGroup'> | string;
    clubId?: Prisma.StringFilter<'PlayerGroup'> | string;
    ageGroup?: Prisma.EnumAgeGroupFilter<'PlayerGroup'> | $Enums.AgeGroup;
    createdAt?: Prisma.DateTimeFilter<'PlayerGroup'> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<'PlayerGroup'> | Date | string;
    club?: Prisma.XOR<Prisma.ClubScalarRelationFilter, Prisma.ClubWhereInput>;
    members?: Prisma.GroupMemberListRelationFilter;
    sessions?: Prisma.TrainingPlanListRelationFilter;
}, 'id'>;
export type PlayerGroupOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    clubId?: Prisma.SortOrder;
    ageGroup?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.PlayerGroupCountOrderByAggregateInput;
    _max?: Prisma.PlayerGroupMaxOrderByAggregateInput;
    _min?: Prisma.PlayerGroupMinOrderByAggregateInput;
};
export type PlayerGroupScalarWhereWithAggregatesInput = {
    AND?: Prisma.PlayerGroupScalarWhereWithAggregatesInput | Prisma.PlayerGroupScalarWhereWithAggregatesInput[];
    OR?: Prisma.PlayerGroupScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PlayerGroupScalarWhereWithAggregatesInput | Prisma.PlayerGroupScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<'PlayerGroup'> | string;
    name?: Prisma.StringWithAggregatesFilter<'PlayerGroup'> | string;
    clubId?: Prisma.StringWithAggregatesFilter<'PlayerGroup'> | string;
    ageGroup?: Prisma.EnumAgeGroupWithAggregatesFilter<'PlayerGroup'> | $Enums.AgeGroup;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<'PlayerGroup'> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<'PlayerGroup'> | Date | string;
};
export type PlayerGroupCreateInput = {
    id?: string;
    name: string;
    ageGroup: $Enums.AgeGroup;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    club: Prisma.ClubCreateNestedOneWithoutGroupsInput;
    members?: Prisma.GroupMemberCreateNestedManyWithoutGroupInput;
    sessions?: Prisma.TrainingPlanCreateNestedManyWithoutGroupInput;
};
export type PlayerGroupUncheckedCreateInput = {
    id?: string;
    name: string;
    clubId: string;
    ageGroup: $Enums.AgeGroup;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    members?: Prisma.GroupMemberUncheckedCreateNestedManyWithoutGroupInput;
    sessions?: Prisma.TrainingPlanUncheckedCreateNestedManyWithoutGroupInput;
};
export type PlayerGroupUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    club?: Prisma.ClubUpdateOneRequiredWithoutGroupsNestedInput;
    members?: Prisma.GroupMemberUpdateManyWithoutGroupNestedInput;
    sessions?: Prisma.TrainingPlanUpdateManyWithoutGroupNestedInput;
};
export type PlayerGroupUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    clubId?: Prisma.StringFieldUpdateOperationsInput | string;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    members?: Prisma.GroupMemberUncheckedUpdateManyWithoutGroupNestedInput;
    sessions?: Prisma.TrainingPlanUncheckedUpdateManyWithoutGroupNestedInput;
};
export type PlayerGroupCreateManyInput = {
    id?: string;
    name: string;
    clubId: string;
    ageGroup: $Enums.AgeGroup;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PlayerGroupUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PlayerGroupUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    clubId?: Prisma.StringFieldUpdateOperationsInput | string;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PlayerGroupListRelationFilter = {
    every?: Prisma.PlayerGroupWhereInput;
    some?: Prisma.PlayerGroupWhereInput;
    none?: Prisma.PlayerGroupWhereInput;
};
export type PlayerGroupOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type PlayerGroupCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    clubId?: Prisma.SortOrder;
    ageGroup?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PlayerGroupMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    clubId?: Prisma.SortOrder;
    ageGroup?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PlayerGroupMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    clubId?: Prisma.SortOrder;
    ageGroup?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PlayerGroupScalarRelationFilter = {
    is?: Prisma.PlayerGroupWhereInput;
    isNot?: Prisma.PlayerGroupWhereInput;
};
export type PlayerGroupNullableScalarRelationFilter = {
    is?: Prisma.PlayerGroupWhereInput | null;
    isNot?: Prisma.PlayerGroupWhereInput | null;
};
export type PlayerGroupCreateNestedManyWithoutClubInput = {
    create?: Prisma.XOR<Prisma.PlayerGroupCreateWithoutClubInput, Prisma.PlayerGroupUncheckedCreateWithoutClubInput> | Prisma.PlayerGroupCreateWithoutClubInput[] | Prisma.PlayerGroupUncheckedCreateWithoutClubInput[];
    connectOrCreate?: Prisma.PlayerGroupCreateOrConnectWithoutClubInput | Prisma.PlayerGroupCreateOrConnectWithoutClubInput[];
    createMany?: Prisma.PlayerGroupCreateManyClubInputEnvelope;
    connect?: Prisma.PlayerGroupWhereUniqueInput | Prisma.PlayerGroupWhereUniqueInput[];
};
export type PlayerGroupUncheckedCreateNestedManyWithoutClubInput = {
    create?: Prisma.XOR<Prisma.PlayerGroupCreateWithoutClubInput, Prisma.PlayerGroupUncheckedCreateWithoutClubInput> | Prisma.PlayerGroupCreateWithoutClubInput[] | Prisma.PlayerGroupUncheckedCreateWithoutClubInput[];
    connectOrCreate?: Prisma.PlayerGroupCreateOrConnectWithoutClubInput | Prisma.PlayerGroupCreateOrConnectWithoutClubInput[];
    createMany?: Prisma.PlayerGroupCreateManyClubInputEnvelope;
    connect?: Prisma.PlayerGroupWhereUniqueInput | Prisma.PlayerGroupWhereUniqueInput[];
};
export type PlayerGroupUpdateManyWithoutClubNestedInput = {
    create?: Prisma.XOR<Prisma.PlayerGroupCreateWithoutClubInput, Prisma.PlayerGroupUncheckedCreateWithoutClubInput> | Prisma.PlayerGroupCreateWithoutClubInput[] | Prisma.PlayerGroupUncheckedCreateWithoutClubInput[];
    connectOrCreate?: Prisma.PlayerGroupCreateOrConnectWithoutClubInput | Prisma.PlayerGroupCreateOrConnectWithoutClubInput[];
    upsert?: Prisma.PlayerGroupUpsertWithWhereUniqueWithoutClubInput | Prisma.PlayerGroupUpsertWithWhereUniqueWithoutClubInput[];
    createMany?: Prisma.PlayerGroupCreateManyClubInputEnvelope;
    set?: Prisma.PlayerGroupWhereUniqueInput | Prisma.PlayerGroupWhereUniqueInput[];
    disconnect?: Prisma.PlayerGroupWhereUniqueInput | Prisma.PlayerGroupWhereUniqueInput[];
    delete?: Prisma.PlayerGroupWhereUniqueInput | Prisma.PlayerGroupWhereUniqueInput[];
    connect?: Prisma.PlayerGroupWhereUniqueInput | Prisma.PlayerGroupWhereUniqueInput[];
    update?: Prisma.PlayerGroupUpdateWithWhereUniqueWithoutClubInput | Prisma.PlayerGroupUpdateWithWhereUniqueWithoutClubInput[];
    updateMany?: Prisma.PlayerGroupUpdateManyWithWhereWithoutClubInput | Prisma.PlayerGroupUpdateManyWithWhereWithoutClubInput[];
    deleteMany?: Prisma.PlayerGroupScalarWhereInput | Prisma.PlayerGroupScalarWhereInput[];
};
export type PlayerGroupUncheckedUpdateManyWithoutClubNestedInput = {
    create?: Prisma.XOR<Prisma.PlayerGroupCreateWithoutClubInput, Prisma.PlayerGroupUncheckedCreateWithoutClubInput> | Prisma.PlayerGroupCreateWithoutClubInput[] | Prisma.PlayerGroupUncheckedCreateWithoutClubInput[];
    connectOrCreate?: Prisma.PlayerGroupCreateOrConnectWithoutClubInput | Prisma.PlayerGroupCreateOrConnectWithoutClubInput[];
    upsert?: Prisma.PlayerGroupUpsertWithWhereUniqueWithoutClubInput | Prisma.PlayerGroupUpsertWithWhereUniqueWithoutClubInput[];
    createMany?: Prisma.PlayerGroupCreateManyClubInputEnvelope;
    set?: Prisma.PlayerGroupWhereUniqueInput | Prisma.PlayerGroupWhereUniqueInput[];
    disconnect?: Prisma.PlayerGroupWhereUniqueInput | Prisma.PlayerGroupWhereUniqueInput[];
    delete?: Prisma.PlayerGroupWhereUniqueInput | Prisma.PlayerGroupWhereUniqueInput[];
    connect?: Prisma.PlayerGroupWhereUniqueInput | Prisma.PlayerGroupWhereUniqueInput[];
    update?: Prisma.PlayerGroupUpdateWithWhereUniqueWithoutClubInput | Prisma.PlayerGroupUpdateWithWhereUniqueWithoutClubInput[];
    updateMany?: Prisma.PlayerGroupUpdateManyWithWhereWithoutClubInput | Prisma.PlayerGroupUpdateManyWithWhereWithoutClubInput[];
    deleteMany?: Prisma.PlayerGroupScalarWhereInput | Prisma.PlayerGroupScalarWhereInput[];
};
export type EnumAgeGroupFieldUpdateOperationsInput = {
    set?: $Enums.AgeGroup;
};
export type PlayerGroupCreateNestedOneWithoutMembersInput = {
    create?: Prisma.XOR<Prisma.PlayerGroupCreateWithoutMembersInput, Prisma.PlayerGroupUncheckedCreateWithoutMembersInput>;
    connectOrCreate?: Prisma.PlayerGroupCreateOrConnectWithoutMembersInput;
    connect?: Prisma.PlayerGroupWhereUniqueInput;
};
export type PlayerGroupUpdateOneRequiredWithoutMembersNestedInput = {
    create?: Prisma.XOR<Prisma.PlayerGroupCreateWithoutMembersInput, Prisma.PlayerGroupUncheckedCreateWithoutMembersInput>;
    connectOrCreate?: Prisma.PlayerGroupCreateOrConnectWithoutMembersInput;
    upsert?: Prisma.PlayerGroupUpsertWithoutMembersInput;
    connect?: Prisma.PlayerGroupWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PlayerGroupUpdateToOneWithWhereWithoutMembersInput, Prisma.PlayerGroupUpdateWithoutMembersInput>, Prisma.PlayerGroupUncheckedUpdateWithoutMembersInput>;
};
export type PlayerGroupCreateNestedOneWithoutSessionsInput = {
    create?: Prisma.XOR<Prisma.PlayerGroupCreateWithoutSessionsInput, Prisma.PlayerGroupUncheckedCreateWithoutSessionsInput>;
    connectOrCreate?: Prisma.PlayerGroupCreateOrConnectWithoutSessionsInput;
    connect?: Prisma.PlayerGroupWhereUniqueInput;
};
export type PlayerGroupUpdateOneWithoutSessionsNestedInput = {
    create?: Prisma.XOR<Prisma.PlayerGroupCreateWithoutSessionsInput, Prisma.PlayerGroupUncheckedCreateWithoutSessionsInput>;
    connectOrCreate?: Prisma.PlayerGroupCreateOrConnectWithoutSessionsInput;
    upsert?: Prisma.PlayerGroupUpsertWithoutSessionsInput;
    disconnect?: Prisma.PlayerGroupWhereInput | boolean;
    delete?: Prisma.PlayerGroupWhereInput | boolean;
    connect?: Prisma.PlayerGroupWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PlayerGroupUpdateToOneWithWhereWithoutSessionsInput, Prisma.PlayerGroupUpdateWithoutSessionsInput>, Prisma.PlayerGroupUncheckedUpdateWithoutSessionsInput>;
};
export type PlayerGroupCreateWithoutClubInput = {
    id?: string;
    name: string;
    ageGroup: $Enums.AgeGroup;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    members?: Prisma.GroupMemberCreateNestedManyWithoutGroupInput;
    sessions?: Prisma.TrainingPlanCreateNestedManyWithoutGroupInput;
};
export type PlayerGroupUncheckedCreateWithoutClubInput = {
    id?: string;
    name: string;
    ageGroup: $Enums.AgeGroup;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    members?: Prisma.GroupMemberUncheckedCreateNestedManyWithoutGroupInput;
    sessions?: Prisma.TrainingPlanUncheckedCreateNestedManyWithoutGroupInput;
};
export type PlayerGroupCreateOrConnectWithoutClubInput = {
    where: Prisma.PlayerGroupWhereUniqueInput;
    create: Prisma.XOR<Prisma.PlayerGroupCreateWithoutClubInput, Prisma.PlayerGroupUncheckedCreateWithoutClubInput>;
};
export type PlayerGroupCreateManyClubInputEnvelope = {
    data: Prisma.PlayerGroupCreateManyClubInput | Prisma.PlayerGroupCreateManyClubInput[];
    skipDuplicates?: boolean;
};
export type PlayerGroupUpsertWithWhereUniqueWithoutClubInput = {
    where: Prisma.PlayerGroupWhereUniqueInput;
    update: Prisma.XOR<Prisma.PlayerGroupUpdateWithoutClubInput, Prisma.PlayerGroupUncheckedUpdateWithoutClubInput>;
    create: Prisma.XOR<Prisma.PlayerGroupCreateWithoutClubInput, Prisma.PlayerGroupUncheckedCreateWithoutClubInput>;
};
export type PlayerGroupUpdateWithWhereUniqueWithoutClubInput = {
    where: Prisma.PlayerGroupWhereUniqueInput;
    data: Prisma.XOR<Prisma.PlayerGroupUpdateWithoutClubInput, Prisma.PlayerGroupUncheckedUpdateWithoutClubInput>;
};
export type PlayerGroupUpdateManyWithWhereWithoutClubInput = {
    where: Prisma.PlayerGroupScalarWhereInput;
    data: Prisma.XOR<Prisma.PlayerGroupUpdateManyMutationInput, Prisma.PlayerGroupUncheckedUpdateManyWithoutClubInput>;
};
export type PlayerGroupScalarWhereInput = {
    AND?: Prisma.PlayerGroupScalarWhereInput | Prisma.PlayerGroupScalarWhereInput[];
    OR?: Prisma.PlayerGroupScalarWhereInput[];
    NOT?: Prisma.PlayerGroupScalarWhereInput | Prisma.PlayerGroupScalarWhereInput[];
    id?: Prisma.StringFilter<'PlayerGroup'> | string;
    name?: Prisma.StringFilter<'PlayerGroup'> | string;
    clubId?: Prisma.StringFilter<'PlayerGroup'> | string;
    ageGroup?: Prisma.EnumAgeGroupFilter<'PlayerGroup'> | $Enums.AgeGroup;
    createdAt?: Prisma.DateTimeFilter<'PlayerGroup'> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<'PlayerGroup'> | Date | string;
};
export type PlayerGroupCreateWithoutMembersInput = {
    id?: string;
    name: string;
    ageGroup: $Enums.AgeGroup;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    club: Prisma.ClubCreateNestedOneWithoutGroupsInput;
    sessions?: Prisma.TrainingPlanCreateNestedManyWithoutGroupInput;
};
export type PlayerGroupUncheckedCreateWithoutMembersInput = {
    id?: string;
    name: string;
    clubId: string;
    ageGroup: $Enums.AgeGroup;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    sessions?: Prisma.TrainingPlanUncheckedCreateNestedManyWithoutGroupInput;
};
export type PlayerGroupCreateOrConnectWithoutMembersInput = {
    where: Prisma.PlayerGroupWhereUniqueInput;
    create: Prisma.XOR<Prisma.PlayerGroupCreateWithoutMembersInput, Prisma.PlayerGroupUncheckedCreateWithoutMembersInput>;
};
export type PlayerGroupUpsertWithoutMembersInput = {
    update: Prisma.XOR<Prisma.PlayerGroupUpdateWithoutMembersInput, Prisma.PlayerGroupUncheckedUpdateWithoutMembersInput>;
    create: Prisma.XOR<Prisma.PlayerGroupCreateWithoutMembersInput, Prisma.PlayerGroupUncheckedCreateWithoutMembersInput>;
    where?: Prisma.PlayerGroupWhereInput;
};
export type PlayerGroupUpdateToOneWithWhereWithoutMembersInput = {
    where?: Prisma.PlayerGroupWhereInput;
    data: Prisma.XOR<Prisma.PlayerGroupUpdateWithoutMembersInput, Prisma.PlayerGroupUncheckedUpdateWithoutMembersInput>;
};
export type PlayerGroupUpdateWithoutMembersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    club?: Prisma.ClubUpdateOneRequiredWithoutGroupsNestedInput;
    sessions?: Prisma.TrainingPlanUpdateManyWithoutGroupNestedInput;
};
export type PlayerGroupUncheckedUpdateWithoutMembersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    clubId?: Prisma.StringFieldUpdateOperationsInput | string;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    sessions?: Prisma.TrainingPlanUncheckedUpdateManyWithoutGroupNestedInput;
};
export type PlayerGroupCreateWithoutSessionsInput = {
    id?: string;
    name: string;
    ageGroup: $Enums.AgeGroup;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    club: Prisma.ClubCreateNestedOneWithoutGroupsInput;
    members?: Prisma.GroupMemberCreateNestedManyWithoutGroupInput;
};
export type PlayerGroupUncheckedCreateWithoutSessionsInput = {
    id?: string;
    name: string;
    clubId: string;
    ageGroup: $Enums.AgeGroup;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    members?: Prisma.GroupMemberUncheckedCreateNestedManyWithoutGroupInput;
};
export type PlayerGroupCreateOrConnectWithoutSessionsInput = {
    where: Prisma.PlayerGroupWhereUniqueInput;
    create: Prisma.XOR<Prisma.PlayerGroupCreateWithoutSessionsInput, Prisma.PlayerGroupUncheckedCreateWithoutSessionsInput>;
};
export type PlayerGroupUpsertWithoutSessionsInput = {
    update: Prisma.XOR<Prisma.PlayerGroupUpdateWithoutSessionsInput, Prisma.PlayerGroupUncheckedUpdateWithoutSessionsInput>;
    create: Prisma.XOR<Prisma.PlayerGroupCreateWithoutSessionsInput, Prisma.PlayerGroupUncheckedCreateWithoutSessionsInput>;
    where?: Prisma.PlayerGroupWhereInput;
};
export type PlayerGroupUpdateToOneWithWhereWithoutSessionsInput = {
    where?: Prisma.PlayerGroupWhereInput;
    data: Prisma.XOR<Prisma.PlayerGroupUpdateWithoutSessionsInput, Prisma.PlayerGroupUncheckedUpdateWithoutSessionsInput>;
};
export type PlayerGroupUpdateWithoutSessionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    club?: Prisma.ClubUpdateOneRequiredWithoutGroupsNestedInput;
    members?: Prisma.GroupMemberUpdateManyWithoutGroupNestedInput;
};
export type PlayerGroupUncheckedUpdateWithoutSessionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    clubId?: Prisma.StringFieldUpdateOperationsInput | string;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    members?: Prisma.GroupMemberUncheckedUpdateManyWithoutGroupNestedInput;
};
export type PlayerGroupCreateManyClubInput = {
    id?: string;
    name: string;
    ageGroup: $Enums.AgeGroup;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PlayerGroupUpdateWithoutClubInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    members?: Prisma.GroupMemberUpdateManyWithoutGroupNestedInput;
    sessions?: Prisma.TrainingPlanUpdateManyWithoutGroupNestedInput;
};
export type PlayerGroupUncheckedUpdateWithoutClubInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    members?: Prisma.GroupMemberUncheckedUpdateManyWithoutGroupNestedInput;
    sessions?: Prisma.TrainingPlanUncheckedUpdateManyWithoutGroupNestedInput;
};
export type PlayerGroupUncheckedUpdateManyWithoutClubInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    ageGroup?: Prisma.EnumAgeGroupFieldUpdateOperationsInput | $Enums.AgeGroup;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PlayerGroupCountOutputType = {
    members: number;
    sessions: number;
};
export type PlayerGroupCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    members?: boolean | PlayerGroupCountOutputTypeCountMembersArgs;
    sessions?: boolean | PlayerGroupCountOutputTypeCountSessionsArgs;
};
export type PlayerGroupCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlayerGroupCountOutputTypeSelect<ExtArgs> | null;
};
export type PlayerGroupCountOutputTypeCountMembersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GroupMemberWhereInput;
};
export type PlayerGroupCountOutputTypeCountSessionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TrainingPlanWhereInput;
};
export type PlayerGroupSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    clubId?: boolean;
    ageGroup?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    club?: boolean | Prisma.ClubDefaultArgs<ExtArgs>;
    members?: boolean | Prisma.PlayerGroup$membersArgs<ExtArgs>;
    sessions?: boolean | Prisma.PlayerGroup$sessionsArgs<ExtArgs>;
    _count?: boolean | Prisma.PlayerGroupCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs['result']['playerGroup']>;
export type PlayerGroupSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    clubId?: boolean;
    ageGroup?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    club?: boolean | Prisma.ClubDefaultArgs<ExtArgs>;
}, ExtArgs['result']['playerGroup']>;
export type PlayerGroupSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    clubId?: boolean;
    ageGroup?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    club?: boolean | Prisma.ClubDefaultArgs<ExtArgs>;
}, ExtArgs['result']['playerGroup']>;
export type PlayerGroupSelectScalar = {
    id?: boolean;
    name?: boolean;
    clubId?: boolean;
    ageGroup?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type PlayerGroupOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<'id' | 'name' | 'clubId' | 'ageGroup' | 'createdAt' | 'updatedAt', ExtArgs['result']['playerGroup']>;
export type PlayerGroupInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    club?: boolean | Prisma.ClubDefaultArgs<ExtArgs>;
    members?: boolean | Prisma.PlayerGroup$membersArgs<ExtArgs>;
    sessions?: boolean | Prisma.PlayerGroup$sessionsArgs<ExtArgs>;
    _count?: boolean | Prisma.PlayerGroupCountOutputTypeDefaultArgs<ExtArgs>;
};
export type PlayerGroupIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    club?: boolean | Prisma.ClubDefaultArgs<ExtArgs>;
};
export type PlayerGroupIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    club?: boolean | Prisma.ClubDefaultArgs<ExtArgs>;
};
export type $PlayerGroupPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: 'PlayerGroup';
    objects: {
        club: Prisma.$ClubPayload<ExtArgs>;
        members: Prisma.$GroupMemberPayload<ExtArgs>[];
        sessions: Prisma.$TrainingPlanPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        clubId: string;
        ageGroup: $Enums.AgeGroup;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs['result']['playerGroup']>;
    composites: {};
};
export type PlayerGroupGetPayload<S extends boolean | null | undefined | PlayerGroupDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PlayerGroupPayload, S>;
export type PlayerGroupCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PlayerGroupFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PlayerGroupCountAggregateInputType | true;
};
export interface PlayerGroupDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['PlayerGroup'];
        meta: {
            name: 'PlayerGroup';
        };
    };
    findUnique<T extends PlayerGroupFindUniqueArgs>(args: Prisma.SelectSubset<T, PlayerGroupFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PlayerGroupClient<runtime.Types.Result.GetResult<Prisma.$PlayerGroupPayload<ExtArgs>, T, 'findUnique', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends PlayerGroupFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PlayerGroupFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PlayerGroupClient<runtime.Types.Result.GetResult<Prisma.$PlayerGroupPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends PlayerGroupFindFirstArgs>(args?: Prisma.SelectSubset<T, PlayerGroupFindFirstArgs<ExtArgs>>): Prisma.Prisma__PlayerGroupClient<runtime.Types.Result.GetResult<Prisma.$PlayerGroupPayload<ExtArgs>, T, 'findFirst', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends PlayerGroupFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PlayerGroupFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PlayerGroupClient<runtime.Types.Result.GetResult<Prisma.$PlayerGroupPayload<ExtArgs>, T, 'findFirstOrThrow', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends PlayerGroupFindManyArgs>(args?: Prisma.SelectSubset<T, PlayerGroupFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlayerGroupPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>>;
    create<T extends PlayerGroupCreateArgs>(args: Prisma.SelectSubset<T, PlayerGroupCreateArgs<ExtArgs>>): Prisma.Prisma__PlayerGroupClient<runtime.Types.Result.GetResult<Prisma.$PlayerGroupPayload<ExtArgs>, T, 'create', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends PlayerGroupCreateManyArgs>(args?: Prisma.SelectSubset<T, PlayerGroupCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends PlayerGroupCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PlayerGroupCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlayerGroupPayload<ExtArgs>, T, 'createManyAndReturn', GlobalOmitOptions>>;
    delete<T extends PlayerGroupDeleteArgs>(args: Prisma.SelectSubset<T, PlayerGroupDeleteArgs<ExtArgs>>): Prisma.Prisma__PlayerGroupClient<runtime.Types.Result.GetResult<Prisma.$PlayerGroupPayload<ExtArgs>, T, 'delete', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends PlayerGroupUpdateArgs>(args: Prisma.SelectSubset<T, PlayerGroupUpdateArgs<ExtArgs>>): Prisma.Prisma__PlayerGroupClient<runtime.Types.Result.GetResult<Prisma.$PlayerGroupPayload<ExtArgs>, T, 'update', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends PlayerGroupDeleteManyArgs>(args?: Prisma.SelectSubset<T, PlayerGroupDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends PlayerGroupUpdateManyArgs>(args: Prisma.SelectSubset<T, PlayerGroupUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends PlayerGroupUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PlayerGroupUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlayerGroupPayload<ExtArgs>, T, 'updateManyAndReturn', GlobalOmitOptions>>;
    upsert<T extends PlayerGroupUpsertArgs>(args: Prisma.SelectSubset<T, PlayerGroupUpsertArgs<ExtArgs>>): Prisma.Prisma__PlayerGroupClient<runtime.Types.Result.GetResult<Prisma.$PlayerGroupPayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends PlayerGroupCountArgs>(args?: Prisma.Subset<T, PlayerGroupCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PlayerGroupCountAggregateOutputType> : number>;
    aggregate<T extends PlayerGroupAggregateArgs>(args: Prisma.Subset<T, PlayerGroupAggregateArgs>): Prisma.PrismaPromise<GetPlayerGroupAggregateType<T>>;
    groupBy<T extends PlayerGroupGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PlayerGroupGroupByArgs['orderBy'];
    } : {
        orderBy?: PlayerGroupGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PlayerGroupGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlayerGroupGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: PlayerGroupFieldRefs;
}
export interface Prisma__PlayerGroupClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    club<T extends Prisma.ClubDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClubDefaultArgs<ExtArgs>>): Prisma.Prisma__ClubClient<runtime.Types.Result.GetResult<Prisma.$ClubPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    members<T extends Prisma.PlayerGroup$membersArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PlayerGroup$membersArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GroupMemberPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions> | Null>;
    sessions<T extends Prisma.PlayerGroup$sessionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PlayerGroup$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface PlayerGroupFieldRefs {
    readonly id: Prisma.FieldRef<'PlayerGroup', 'String'>;
    readonly name: Prisma.FieldRef<'PlayerGroup', 'String'>;
    readonly clubId: Prisma.FieldRef<'PlayerGroup', 'String'>;
    readonly ageGroup: Prisma.FieldRef<'PlayerGroup', 'AgeGroup'>;
    readonly createdAt: Prisma.FieldRef<'PlayerGroup', 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<'PlayerGroup', 'DateTime'>;
}
export type PlayerGroupFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlayerGroupSelect<ExtArgs> | null;
    omit?: Prisma.PlayerGroupOmit<ExtArgs> | null;
    include?: Prisma.PlayerGroupInclude<ExtArgs> | null;
    where: Prisma.PlayerGroupWhereUniqueInput;
};
export type PlayerGroupFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlayerGroupSelect<ExtArgs> | null;
    omit?: Prisma.PlayerGroupOmit<ExtArgs> | null;
    include?: Prisma.PlayerGroupInclude<ExtArgs> | null;
    where: Prisma.PlayerGroupWhereUniqueInput;
};
export type PlayerGroupFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlayerGroupSelect<ExtArgs> | null;
    omit?: Prisma.PlayerGroupOmit<ExtArgs> | null;
    include?: Prisma.PlayerGroupInclude<ExtArgs> | null;
    where?: Prisma.PlayerGroupWhereInput;
    orderBy?: Prisma.PlayerGroupOrderByWithRelationInput | Prisma.PlayerGroupOrderByWithRelationInput[];
    cursor?: Prisma.PlayerGroupWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PlayerGroupScalarFieldEnum | Prisma.PlayerGroupScalarFieldEnum[];
};
export type PlayerGroupFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlayerGroupSelect<ExtArgs> | null;
    omit?: Prisma.PlayerGroupOmit<ExtArgs> | null;
    include?: Prisma.PlayerGroupInclude<ExtArgs> | null;
    where?: Prisma.PlayerGroupWhereInput;
    orderBy?: Prisma.PlayerGroupOrderByWithRelationInput | Prisma.PlayerGroupOrderByWithRelationInput[];
    cursor?: Prisma.PlayerGroupWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PlayerGroupScalarFieldEnum | Prisma.PlayerGroupScalarFieldEnum[];
};
export type PlayerGroupFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlayerGroupSelect<ExtArgs> | null;
    omit?: Prisma.PlayerGroupOmit<ExtArgs> | null;
    include?: Prisma.PlayerGroupInclude<ExtArgs> | null;
    where?: Prisma.PlayerGroupWhereInput;
    orderBy?: Prisma.PlayerGroupOrderByWithRelationInput | Prisma.PlayerGroupOrderByWithRelationInput[];
    cursor?: Prisma.PlayerGroupWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PlayerGroupScalarFieldEnum | Prisma.PlayerGroupScalarFieldEnum[];
};
export type PlayerGroupCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlayerGroupSelect<ExtArgs> | null;
    omit?: Prisma.PlayerGroupOmit<ExtArgs> | null;
    include?: Prisma.PlayerGroupInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PlayerGroupCreateInput, Prisma.PlayerGroupUncheckedCreateInput>;
};
export type PlayerGroupCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.PlayerGroupCreateManyInput | Prisma.PlayerGroupCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PlayerGroupCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlayerGroupSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PlayerGroupOmit<ExtArgs> | null;
    data: Prisma.PlayerGroupCreateManyInput | Prisma.PlayerGroupCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.PlayerGroupIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type PlayerGroupUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlayerGroupSelect<ExtArgs> | null;
    omit?: Prisma.PlayerGroupOmit<ExtArgs> | null;
    include?: Prisma.PlayerGroupInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PlayerGroupUpdateInput, Prisma.PlayerGroupUncheckedUpdateInput>;
    where: Prisma.PlayerGroupWhereUniqueInput;
};
export type PlayerGroupUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.PlayerGroupUpdateManyMutationInput, Prisma.PlayerGroupUncheckedUpdateManyInput>;
    where?: Prisma.PlayerGroupWhereInput;
    limit?: number;
};
export type PlayerGroupUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlayerGroupSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PlayerGroupOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PlayerGroupUpdateManyMutationInput, Prisma.PlayerGroupUncheckedUpdateManyInput>;
    where?: Prisma.PlayerGroupWhereInput;
    limit?: number;
    include?: Prisma.PlayerGroupIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type PlayerGroupUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlayerGroupSelect<ExtArgs> | null;
    omit?: Prisma.PlayerGroupOmit<ExtArgs> | null;
    include?: Prisma.PlayerGroupInclude<ExtArgs> | null;
    where: Prisma.PlayerGroupWhereUniqueInput;
    create: Prisma.XOR<Prisma.PlayerGroupCreateInput, Prisma.PlayerGroupUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.PlayerGroupUpdateInput, Prisma.PlayerGroupUncheckedUpdateInput>;
};
export type PlayerGroupDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlayerGroupSelect<ExtArgs> | null;
    omit?: Prisma.PlayerGroupOmit<ExtArgs> | null;
    include?: Prisma.PlayerGroupInclude<ExtArgs> | null;
    where: Prisma.PlayerGroupWhereUniqueInput;
};
export type PlayerGroupDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PlayerGroupWhereInput;
    limit?: number;
};
export type PlayerGroup$membersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PlayerGroup$sessionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PlayerGroupDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PlayerGroupSelect<ExtArgs> | null;
    omit?: Prisma.PlayerGroupOmit<ExtArgs> | null;
    include?: Prisma.PlayerGroupInclude<ExtArgs> | null;
};
export {};
