import { IsString, IsInt, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class CreateMatchWeekDto {
  @IsString()
  @IsNotEmpty()
  seasonId: string;

  @IsInt()
  weekNumber: number;

  @IsString()
  @IsNotEmpty()
  opponentName: string;

  @IsObject()
  @IsOptional()
  opponentAnalysis?: any;

  @IsObject()
  @IsOptional()
  setPieces?: any;

  @IsObject()
  @IsOptional()
  videoLinks?: any;
}
