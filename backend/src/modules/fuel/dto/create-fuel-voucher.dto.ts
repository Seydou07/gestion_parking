import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional, IsInt } from 'class-validator';

export class CreateFuelVoucherDto {
    @IsString()
    @IsNotEmpty()
    numero: string;

    @IsNumber()
    @IsNotEmpty()
    valeur: number;

    @IsDateString()
    @IsNotEmpty()
    dateEmission: string;

    @IsDateString()
    @IsOptional()
    dateExpiration?: string;

    @IsInt()
    @IsOptional()
    vehiculeId?: number;

    @IsString()
    @IsOptional()
    notes?: string;
}
