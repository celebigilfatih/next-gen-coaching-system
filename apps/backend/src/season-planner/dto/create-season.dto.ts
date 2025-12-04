import { IsString, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSeasonDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  clubId?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
