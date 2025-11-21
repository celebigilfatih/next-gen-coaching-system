import { IsInt, IsArray, IsNotEmpty } from 'class-validator';

export class CreateMicroDto {
  @IsInt()
  weekNumber: number;

  @IsArray()
  @IsNotEmpty()
  dayPlans: Array<{ day: number; drillIds: string[]; notes: string }>;
}
