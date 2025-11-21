import { IsString, IsInt, IsNotEmpty, IsObject } from 'class-validator';

export class CreateMesoDto {
  @IsString()
  @IsNotEmpty()
  macroId: string;

  @IsInt()
  startWeek: number;

  @IsInt()
  endWeek: number;

  @IsString()
  @IsNotEmpty()
  goal: string;

  @IsObject()
  intensityJson: { physical: number; technical: number; tactical: number };
}
