import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

export class SupplyGlobalBudgetDto {
  @IsEnum(['MAINTENANCE', 'FUEL_CARD', 'FUEL_BON'])
  field: 'MAINTENANCE' | 'FUEL_CARD' | 'FUEL_BON';

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
