import type * as runtime from '@prisma/client/runtime/library';
import type * as Prisma from '../internal/prismaNamespace.js';
export type ClubModel = runtime.Types.Result.DefaultSelection<Prisma.$ClubPayload>;
export type AggregateClub = {
    _count: ClubCountAggregateOutputType | null;
    _min: ClubMinAggregateOutputType | null;
    _max: ClubMaxAggregateOutputType | null;
};
export type ClubMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    logo: string | null;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ClubMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    logo: string | null;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ClubCountAggregateOutputType = {
    id: number;
    name: number;
    logo: number;
    description: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ClubMinAggregateInputType = {
    id?: true;
    name?: true;
    logo?: true;
    description?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ClubMaxAggregateInputType = {
    id?: true;
    name?: true;
    logo?: true;
    description?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ClubCountAggregateInputType = {
    id?: true;
    name?: true;
    logo?: true;
    description?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ClubAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClubWhereInput;
    orderBy?: Prisma.ClubOrderByWithRelationInput | Prisma.ClubOrderByWithRelationInput[];
    cursor?: Prisma.ClubWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ClubCountAggregateInputType;
    _min?: ClubMinAggregateInputType;
    _max?: ClubMaxAggregateInputType;
};
export type GetClubAggregateType<T extends ClubAggregateArgs> = {
    [P in keyof T & keyof AggregateClub]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateClub[P]> : Prisma.GetScalarType<T[P], AggregateClub[P]>;
};
export type ClubGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClubWhereInput;
    orderBy?: Prisma.ClubOrderByWithAggregationInput | Prisma.ClubOrderByWithAggregationInput[];
    by: Prisma.ClubScalarFieldEnum[] | Prisma.ClubScalarFieldEnum;
    having?: Prisma.ClubScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ClubCountAggregateInputType | true;
    _min?: ClubMinAggregateInputType;
    _max?: ClubMaxAggregateInputType;
};
export type ClubGroupByOutputType = {
    id: string;
    name: string;
    logo: string | null;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: ClubCountAggregateOutputType | null;
    _min: ClubMinAggregateOutputType | null;
    _max: ClubMaxAggregateOutputType | null;
};
type GetClubGroupByPayload<T extends ClubGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ClubGroupByOutputType, T['by']> & {
    [P in keyof T & keyof ClubGroupByOutputType]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ClubGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ClubGroupByOutputType[P]>;
}>>;
export type ClubWhereInput = {
    AND?: Prisma.ClubWhereInput | Prisma.ClubWhereInput[];
    OR?: Prisma.ClubWhereInput[];
    NOT?: Prisma.ClubWhereInput | Prisma.ClubWhereInput[];
    id?: Prisma.StringFilter<'Club'> | string;
    name?: Prisma.StringFilter<'Club'> | string;
    logo?: Prisma.StringNullableFilter<'Club'> | string | null;
    description?: Prisma.StringNullableFilter<'Club'> | string | null;
    createdAt?: Prisma.DateTimeFilter<'Club'> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<'Club'> | Date | string;
    users?: Prisma.UserListRelationFilter;
    groups?: Prisma.PlayerGroupListRelationFilter;
    plans?: Prisma.TrainingPlanListRelationFilter;
};
export type ClubOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    logo?: Prisma.SortOrderInput | Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    users?: Prisma.UserOrderByRelationAggregateInput;
    groups?: Prisma.PlayerGroupOrderByRelationAggregateInput;
    plans?: Prisma.TrainingPlanOrderByRelationAggregateInput;
};
export type ClubWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ClubWhereInput | Prisma.ClubWhereInput[];
    OR?: Prisma.ClubWhereInput[];
    NOT?: Prisma.ClubWhereInput | Prisma.ClubWhereInput[];
    name?: Prisma.StringFilter<'Club'> | string;
    logo?: Prisma.StringNullableFilter<'Club'> | string | null;
    description?: Prisma.StringNullableFilter<'Club'> | string | null;
    createdAt?: Prisma.DateTimeFilter<'Club'> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<'Club'> | Date | string;
    users?: Prisma.UserListRelationFilter;
    groups?: Prisma.PlayerGroupListRelationFilter;
    plans?: Prisma.TrainingPlanListRelationFilter;
}, 'id'>;
export type ClubOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    logo?: Prisma.SortOrderInput | Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ClubCountOrderByAggregateInput;
    _max?: Prisma.ClubMaxOrderByAggregateInput;
    _min?: Prisma.ClubMinOrderByAggregateInput;
};
export type ClubScalarWhereWithAggregatesInput = {
    AND?: Prisma.ClubScalarWhereWithAggregatesInput | Prisma.ClubScalarWhereWithAggregatesInput[];
    OR?: Prisma.ClubScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ClubScalarWhereWithAggregatesInput | Prisma.ClubScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<'Club'> | string;
    name?: Prisma.StringWithAggregatesFilter<'Club'> | string;
    logo?: Prisma.StringNullableWithAggregatesFilter<'Club'> | string | null;
    description?: Prisma.StringNullableWithAggregatesFilter<'Club'> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<'Club'> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<'Club'> | Date | string;
};
export type ClubCreateInput = {
    id?: string;
    name: string;
    logo?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserCreateNestedManyWithoutClubInput;
    groups?: Prisma.PlayerGroupCreateNestedManyWithoutClubInput;
    plans?: Prisma.TrainingPlanCreateNestedManyWithoutClubInput;
};
export type ClubUncheckedCreateInput = {
    id?: string;
    name: string;
    logo?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserUncheckedCreateNestedManyWithoutClubInput;
    groups?: Prisma.PlayerGroupUncheckedCreateNestedManyWithoutClubInput;
    plans?: Prisma.TrainingPlanUncheckedCreateNestedManyWithoutClubInput;
};
export type ClubUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    logo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUpdateManyWithoutClubNestedInput;
    groups?: Prisma.PlayerGroupUpdateManyWithoutClubNestedInput;
    plans?: Prisma.TrainingPlanUpdateManyWithoutClubNestedInput;
};
export type ClubUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    logo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUncheckedUpdateManyWithoutClubNestedInput;
    groups?: Prisma.PlayerGroupUncheckedUpdateManyWithoutClubNestedInput;
    plans?: Prisma.TrainingPlanUncheckedUpdateManyWithoutClubNestedInput;
};
export type ClubCreateManyInput = {
    id?: string;
    name: string;
    logo?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClubUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    logo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClubUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    logo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClubNullableScalarRelationFilter = {
    is?: Prisma.ClubWhereInput | null;
    isNot?: Prisma.ClubWhereInput | null;
};
export type ClubCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    logo?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ClubMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    logo?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ClubMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    logo?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ClubScalarRelationFilter = {
    is?: Prisma.ClubWhereInput;
    isNot?: Prisma.ClubWhereInput;
};
export type ClubCreateNestedOneWithoutUsersInput = {
    create?: Prisma.XOR<Prisma.ClubCreateWithoutUsersInput, Prisma.ClubUncheckedCreateWithoutUsersInput>;
    connectOrCreate?: Prisma.ClubCreateOrConnectWithoutUsersInput;
    connect?: Prisma.ClubWhereUniqueInput;
};
export type ClubUpdateOneWithoutUsersNestedInput = {
    create?: Prisma.XOR<Prisma.ClubCreateWithoutUsersInput, Prisma.ClubUncheckedCreateWithoutUsersInput>;
    connectOrCreate?: Prisma.ClubCreateOrConnectWithoutUsersInput;
    upsert?: Prisma.ClubUpsertWithoutUsersInput;
    disconnect?: Prisma.ClubWhereInput | boolean;
    delete?: Prisma.ClubWhereInput | boolean;
    connect?: Prisma.ClubWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClubUpdateToOneWithWhereWithoutUsersInput, Prisma.ClubUpdateWithoutUsersInput>, Prisma.ClubUncheckedUpdateWithoutUsersInput>;
};
export type ClubCreateNestedOneWithoutGroupsInput = {
    create?: Prisma.XOR<Prisma.ClubCreateWithoutGroupsInput, Prisma.ClubUncheckedCreateWithoutGroupsInput>;
    connectOrCreate?: Prisma.ClubCreateOrConnectWithoutGroupsInput;
    connect?: Prisma.ClubWhereUniqueInput;
};
export type ClubUpdateOneRequiredWithoutGroupsNestedInput = {
    create?: Prisma.XOR<Prisma.ClubCreateWithoutGroupsInput, Prisma.ClubUncheckedCreateWithoutGroupsInput>;
    connectOrCreate?: Prisma.ClubCreateOrConnectWithoutGroupsInput;
    upsert?: Prisma.ClubUpsertWithoutGroupsInput;
    connect?: Prisma.ClubWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClubUpdateToOneWithWhereWithoutGroupsInput, Prisma.ClubUpdateWithoutGroupsInput>, Prisma.ClubUncheckedUpdateWithoutGroupsInput>;
};
export type ClubCreateNestedOneWithoutPlansInput = {
    create?: Prisma.XOR<Prisma.ClubCreateWithoutPlansInput, Prisma.ClubUncheckedCreateWithoutPlansInput>;
    connectOrCreate?: Prisma.ClubCreateOrConnectWithoutPlansInput;
    connect?: Prisma.ClubWhereUniqueInput;
};
export type ClubUpdateOneRequiredWithoutPlansNestedInput = {
    create?: Prisma.XOR<Prisma.ClubCreateWithoutPlansInput, Prisma.ClubUncheckedCreateWithoutPlansInput>;
    connectOrCreate?: Prisma.ClubCreateOrConnectWithoutPlansInput;
    upsert?: Prisma.ClubUpsertWithoutPlansInput;
    connect?: Prisma.ClubWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClubUpdateToOneWithWhereWithoutPlansInput, Prisma.ClubUpdateWithoutPlansInput>, Prisma.ClubUncheckedUpdateWithoutPlansInput>;
};
export type ClubCreateWithoutUsersInput = {
    id?: string;
    name: string;
    logo?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    groups?: Prisma.PlayerGroupCreateNestedManyWithoutClubInput;
    plans?: Prisma.TrainingPlanCreateNestedManyWithoutClubInput;
};
export type ClubUncheckedCreateWithoutUsersInput = {
    id?: string;
    name: string;
    logo?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    groups?: Prisma.PlayerGroupUncheckedCreateNestedManyWithoutClubInput;
    plans?: Prisma.TrainingPlanUncheckedCreateNestedManyWithoutClubInput;
};
export type ClubCreateOrConnectWithoutUsersInput = {
    where: Prisma.ClubWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClubCreateWithoutUsersInput, Prisma.ClubUncheckedCreateWithoutUsersInput>;
};
export type ClubUpsertWithoutUsersInput = {
    update: Prisma.XOR<Prisma.ClubUpdateWithoutUsersInput, Prisma.ClubUncheckedUpdateWithoutUsersInput>;
    create: Prisma.XOR<Prisma.ClubCreateWithoutUsersInput, Prisma.ClubUncheckedCreateWithoutUsersInput>;
    where?: Prisma.ClubWhereInput;
};
export type ClubUpdateToOneWithWhereWithoutUsersInput = {
    where?: Prisma.ClubWhereInput;
    data: Prisma.XOR<Prisma.ClubUpdateWithoutUsersInput, Prisma.ClubUncheckedUpdateWithoutUsersInput>;
};
export type ClubUpdateWithoutUsersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    logo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    groups?: Prisma.PlayerGroupUpdateManyWithoutClubNestedInput;
    plans?: Prisma.TrainingPlanUpdateManyWithoutClubNestedInput;
};
export type ClubUncheckedUpdateWithoutUsersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    logo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    groups?: Prisma.PlayerGroupUncheckedUpdateManyWithoutClubNestedInput;
    plans?: Prisma.TrainingPlanUncheckedUpdateManyWithoutClubNestedInput;
};
export type ClubCreateWithoutGroupsInput = {
    id?: string;
    name: string;
    logo?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserCreateNestedManyWithoutClubInput;
    plans?: Prisma.TrainingPlanCreateNestedManyWithoutClubInput;
};
export type ClubUncheckedCreateWithoutGroupsInput = {
    id?: string;
    name: string;
    logo?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserUncheckedCreateNestedManyWithoutClubInput;
    plans?: Prisma.TrainingPlanUncheckedCreateNestedManyWithoutClubInput;
};
export type ClubCreateOrConnectWithoutGroupsInput = {
    where: Prisma.ClubWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClubCreateWithoutGroupsInput, Prisma.ClubUncheckedCreateWithoutGroupsInput>;
};
export type ClubUpsertWithoutGroupsInput = {
    update: Prisma.XOR<Prisma.ClubUpdateWithoutGroupsInput, Prisma.ClubUncheckedUpdateWithoutGroupsInput>;
    create: Prisma.XOR<Prisma.ClubCreateWithoutGroupsInput, Prisma.ClubUncheckedCreateWithoutGroupsInput>;
    where?: Prisma.ClubWhereInput;
};
export type ClubUpdateToOneWithWhereWithoutGroupsInput = {
    where?: Prisma.ClubWhereInput;
    data: Prisma.XOR<Prisma.ClubUpdateWithoutGroupsInput, Prisma.ClubUncheckedUpdateWithoutGroupsInput>;
};
export type ClubUpdateWithoutGroupsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    logo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUpdateManyWithoutClubNestedInput;
    plans?: Prisma.TrainingPlanUpdateManyWithoutClubNestedInput;
};
export type ClubUncheckedUpdateWithoutGroupsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    logo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUncheckedUpdateManyWithoutClubNestedInput;
    plans?: Prisma.TrainingPlanUncheckedUpdateManyWithoutClubNestedInput;
};
export type ClubCreateWithoutPlansInput = {
    id?: string;
    name: string;
    logo?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserCreateNestedManyWithoutClubInput;
    groups?: Prisma.PlayerGroupCreateNestedManyWithoutClubInput;
};
export type ClubUncheckedCreateWithoutPlansInput = {
    id?: string;
    name: string;
    logo?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    users?: Prisma.UserUncheckedCreateNestedManyWithoutClubInput;
    groups?: Prisma.PlayerGroupUncheckedCreateNestedManyWithoutClubInput;
};
export type ClubCreateOrConnectWithoutPlansInput = {
    where: Prisma.ClubWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClubCreateWithoutPlansInput, Prisma.ClubUncheckedCreateWithoutPlansInput>;
};
export type ClubUpsertWithoutPlansInput = {
    update: Prisma.XOR<Prisma.ClubUpdateWithoutPlansInput, Prisma.ClubUncheckedUpdateWithoutPlansInput>;
    create: Prisma.XOR<Prisma.ClubCreateWithoutPlansInput, Prisma.ClubUncheckedCreateWithoutPlansInput>;
    where?: Prisma.ClubWhereInput;
};
export type ClubUpdateToOneWithWhereWithoutPlansInput = {
    where?: Prisma.ClubWhereInput;
    data: Prisma.XOR<Prisma.ClubUpdateWithoutPlansInput, Prisma.ClubUncheckedUpdateWithoutPlansInput>;
};
export type ClubUpdateWithoutPlansInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    logo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUpdateManyWithoutClubNestedInput;
    groups?: Prisma.PlayerGroupUpdateManyWithoutClubNestedInput;
};
export type ClubUncheckedUpdateWithoutPlansInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    logo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    users?: Prisma.UserUncheckedUpdateManyWithoutClubNestedInput;
    groups?: Prisma.PlayerGroupUncheckedUpdateManyWithoutClubNestedInput;
};
export type ClubCountOutputType = {
    users: number;
    groups: number;
    plans: number;
};
export type ClubCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    users?: boolean | ClubCountOutputTypeCountUsersArgs;
    groups?: boolean | ClubCountOutputTypeCountGroupsArgs;
    plans?: boolean | ClubCountOutputTypeCountPlansArgs;
};
export type ClubCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClubCountOutputTypeSelect<ExtArgs> | null;
};
export type ClubCountOutputTypeCountUsersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
};
export type ClubCountOutputTypeCountGroupsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PlayerGroupWhereInput;
};
export type ClubCountOutputTypeCountPlansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TrainingPlanWhereInput;
};
export type ClubSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    logo?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    users?: boolean | Prisma.Club$usersArgs<ExtArgs>;
    groups?: boolean | Prisma.Club$groupsArgs<ExtArgs>;
    plans?: boolean | Prisma.Club$plansArgs<ExtArgs>;
    _count?: boolean | Prisma.ClubCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs['result']['club']>;
export type ClubSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    logo?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs['result']['club']>;
export type ClubSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    logo?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs['result']['club']>;
export type ClubSelectScalar = {
    id?: boolean;
    name?: boolean;
    logo?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ClubOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<'id' | 'name' | 'logo' | 'description' | 'createdAt' | 'updatedAt', ExtArgs['result']['club']>;
export type ClubInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    users?: boolean | Prisma.Club$usersArgs<ExtArgs>;
    groups?: boolean | Prisma.Club$groupsArgs<ExtArgs>;
    plans?: boolean | Prisma.Club$plansArgs<ExtArgs>;
    _count?: boolean | Prisma.ClubCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ClubIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type ClubIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $ClubPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: 'Club';
    objects: {
        users: Prisma.$UserPayload<ExtArgs>[];
        groups: Prisma.$PlayerGroupPayload<ExtArgs>[];
        plans: Prisma.$TrainingPlanPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        logo: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs['result']['club']>;
    composites: {};
};
export type ClubGetPayload<S extends boolean | null | undefined | ClubDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ClubPayload, S>;
export type ClubCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ClubFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ClubCountAggregateInputType | true;
};
export interface ClubDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Club'];
        meta: {
            name: 'Club';
        };
    };
    findUnique<T extends ClubFindUniqueArgs>(args: Prisma.SelectSubset<T, ClubFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ClubClient<runtime.Types.Result.GetResult<Prisma.$ClubPayload<ExtArgs>, T, 'findUnique', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ClubFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ClubFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClubClient<runtime.Types.Result.GetResult<Prisma.$ClubPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ClubFindFirstArgs>(args?: Prisma.SelectSubset<T, ClubFindFirstArgs<ExtArgs>>): Prisma.Prisma__ClubClient<runtime.Types.Result.GetResult<Prisma.$ClubPayload<ExtArgs>, T, 'findFirst', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ClubFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ClubFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClubClient<runtime.Types.Result.GetResult<Prisma.$ClubPayload<ExtArgs>, T, 'findFirstOrThrow', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ClubFindManyArgs>(args?: Prisma.SelectSubset<T, ClubFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClubPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>>;
    create<T extends ClubCreateArgs>(args: Prisma.SelectSubset<T, ClubCreateArgs<ExtArgs>>): Prisma.Prisma__ClubClient<runtime.Types.Result.GetResult<Prisma.$ClubPayload<ExtArgs>, T, 'create', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ClubCreateManyArgs>(args?: Prisma.SelectSubset<T, ClubCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ClubCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ClubCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClubPayload<ExtArgs>, T, 'createManyAndReturn', GlobalOmitOptions>>;
    delete<T extends ClubDeleteArgs>(args: Prisma.SelectSubset<T, ClubDeleteArgs<ExtArgs>>): Prisma.Prisma__ClubClient<runtime.Types.Result.GetResult<Prisma.$ClubPayload<ExtArgs>, T, 'delete', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ClubUpdateArgs>(args: Prisma.SelectSubset<T, ClubUpdateArgs<ExtArgs>>): Prisma.Prisma__ClubClient<runtime.Types.Result.GetResult<Prisma.$ClubPayload<ExtArgs>, T, 'update', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ClubDeleteManyArgs>(args?: Prisma.SelectSubset<T, ClubDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ClubUpdateManyArgs>(args: Prisma.SelectSubset<T, ClubUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ClubUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ClubUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClubPayload<ExtArgs>, T, 'updateManyAndReturn', GlobalOmitOptions>>;
    upsert<T extends ClubUpsertArgs>(args: Prisma.SelectSubset<T, ClubUpsertArgs<ExtArgs>>): Prisma.Prisma__ClubClient<runtime.Types.Result.GetResult<Prisma.$ClubPayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ClubCountArgs>(args?: Prisma.Subset<T, ClubCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ClubCountAggregateOutputType> : number>;
    aggregate<T extends ClubAggregateArgs>(args: Prisma.Subset<T, ClubAggregateArgs>): Prisma.PrismaPromise<GetClubAggregateType<T>>;
    groupBy<T extends ClubGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ClubGroupByArgs['orderBy'];
    } : {
        orderBy?: ClubGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ClubGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClubGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ClubFieldRefs;
}
export interface Prisma__ClubClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    users<T extends Prisma.Club$usersArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Club$usersArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions> | Null>;
    groups<T extends Prisma.Club$groupsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Club$groupsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlayerGroupPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions> | Null>;
    plans<T extends Prisma.Club$plansArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Club$plansArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TrainingPlanPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ClubFieldRefs {
    readonly id: Prisma.FieldRef<'Club', 'String'>;
    readonly name: Prisma.FieldRef<'Club', 'String'>;
    readonly logo: Prisma.FieldRef<'Club', 'String'>;
    readonly description: Prisma.FieldRef<'Club', 'String'>;
    readonly createdAt: Prisma.FieldRef<'Club', 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<'Club', 'DateTime'>;
}
export type ClubFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClubSelect<ExtArgs> | null;
    omit?: Prisma.ClubOmit<ExtArgs> | null;
    include?: Prisma.ClubInclude<ExtArgs> | null;
    where: Prisma.ClubWhereUniqueInput;
};
export type ClubFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClubSelect<ExtArgs> | null;
    omit?: Prisma.ClubOmit<ExtArgs> | null;
    include?: Prisma.ClubInclude<ExtArgs> | null;
    where: Prisma.ClubWhereUniqueInput;
};
export type ClubFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClubSelect<ExtArgs> | null;
    omit?: Prisma.ClubOmit<ExtArgs> | null;
    include?: Prisma.ClubInclude<ExtArgs> | null;
    where?: Prisma.ClubWhereInput;
    orderBy?: Prisma.ClubOrderByWithRelationInput | Prisma.ClubOrderByWithRelationInput[];
    cursor?: Prisma.ClubWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClubScalarFieldEnum | Prisma.ClubScalarFieldEnum[];
};
export type ClubFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClubSelect<ExtArgs> | null;
    omit?: Prisma.ClubOmit<ExtArgs> | null;
    include?: Prisma.ClubInclude<ExtArgs> | null;
    where?: Prisma.ClubWhereInput;
    orderBy?: Prisma.ClubOrderByWithRelationInput | Prisma.ClubOrderByWithRelationInput[];
    cursor?: Prisma.ClubWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClubScalarFieldEnum | Prisma.ClubScalarFieldEnum[];
};
export type ClubFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClubSelect<ExtArgs> | null;
    omit?: Prisma.ClubOmit<ExtArgs> | null;
    include?: Prisma.ClubInclude<ExtArgs> | null;
    where?: Prisma.ClubWhereInput;
    orderBy?: Prisma.ClubOrderByWithRelationInput | Prisma.ClubOrderByWithRelationInput[];
    cursor?: Prisma.ClubWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClubScalarFieldEnum | Prisma.ClubScalarFieldEnum[];
};
export type ClubCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClubSelect<ExtArgs> | null;
    omit?: Prisma.ClubOmit<ExtArgs> | null;
    include?: Prisma.ClubInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClubCreateInput, Prisma.ClubUncheckedCreateInput>;
};
export type ClubCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ClubCreateManyInput | Prisma.ClubCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ClubCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClubSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClubOmit<ExtArgs> | null;
    data: Prisma.ClubCreateManyInput | Prisma.ClubCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ClubUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClubSelect<ExtArgs> | null;
    omit?: Prisma.ClubOmit<ExtArgs> | null;
    include?: Prisma.ClubInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClubUpdateInput, Prisma.ClubUncheckedUpdateInput>;
    where: Prisma.ClubWhereUniqueInput;
};
export type ClubUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ClubUpdateManyMutationInput, Prisma.ClubUncheckedUpdateManyInput>;
    where?: Prisma.ClubWhereInput;
    limit?: number;
};
export type ClubUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClubSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClubOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClubUpdateManyMutationInput, Prisma.ClubUncheckedUpdateManyInput>;
    where?: Prisma.ClubWhereInput;
    limit?: number;
};
export type ClubUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClubSelect<ExtArgs> | null;
    omit?: Prisma.ClubOmit<ExtArgs> | null;
    include?: Prisma.ClubInclude<ExtArgs> | null;
    where: Prisma.ClubWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClubCreateInput, Prisma.ClubUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ClubUpdateInput, Prisma.ClubUncheckedUpdateInput>;
};
export type ClubDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClubSelect<ExtArgs> | null;
    omit?: Prisma.ClubOmit<ExtArgs> | null;
    include?: Prisma.ClubInclude<ExtArgs> | null;
    where: Prisma.ClubWhereUniqueInput;
};
export type ClubDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClubWhereInput;
    limit?: number;
};
export type Club$usersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Club$groupsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Club$plansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClubDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClubSelect<ExtArgs> | null;
    omit?: Prisma.ClubOmit<ExtArgs> | null;
    include?: Prisma.ClubInclude<ExtArgs> | null;
};
export {};
