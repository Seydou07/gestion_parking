import { IsString, IsInt, IsOptional, IsNumber } from 'class-validator';

export class UpdateSettingsDto {
    @IsOptional()
    @IsString()
    nomEntreprise?: string;

    @IsOptional()
    @IsString()
    devise?: string;

    @IsOptional()
    @IsInt()
    alerteStockCarburant?: number;

    @IsOptional()
    @IsInt()
    seuilVidangeKm?: number;

    @IsOptional()
    @IsInt()
    relanceAssuranceJours?: number;

    @IsOptional()
    @IsInt()
    relanceVisiteJours?: number;

    @IsOptional()
    @IsNumber()
    budgetGlobalVehicules?: number;

    @IsOptional()
    @IsNumber()
    budgetGlobalCarburant?: number;

    @IsOptional()
    @IsNumber()
    budgetGlobalCartes?: number;

    @IsOptional()
    @IsNumber()
    budgetGlobalBons?: number;
}
