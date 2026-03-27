import { IsNotEmpty, IsString, IsNumber, IsOptional, IsInt, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFuelVoucherDto {
    @IsString()
    @IsOptional()
    numero?: string;

    @IsInt()
    @IsOptional()
    @Min(1)
    quantite?: number;

    @IsNumber()
    @IsNotEmpty()
    valeur: number;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    dateEmission: Date;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dateExpiration?: Date;

    @IsInt()
    @IsOptional()
    vehiculeId?: number;

    @IsString()
    @IsOptional()
    notes?: string;
}
