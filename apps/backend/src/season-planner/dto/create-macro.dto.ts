import { IsString, IsDateString, IsInt, IsNotEmpty, IsOptional, Min, Max } from 'class-validator';

export class CreateMacroDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  type: string; // PRE_SEASON, IN_SEASON, POST_SEASON

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  intensity?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
