import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { AllocationType } from '@prisma/client';

export class AllocateBudgetDto {
  @IsNumber()
  vehiculeId: number;

  @IsNumber()
  montant: number;

  @IsNumber()
  annee: number;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsEnum(AllocationType)
  type: AllocationType;
}
