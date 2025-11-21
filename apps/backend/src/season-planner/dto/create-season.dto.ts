import { IsString, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateSeasonDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  clubId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
