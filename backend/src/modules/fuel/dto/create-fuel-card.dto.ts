import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsDate, IsInt, Min } from 'class-validator';
import { FuelCardStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateFuelCardDto {
    @IsString()
    @IsOptional()
    numero?: string;

    @IsInt()
    @IsOptional()
    @Min(1)
    quantite?: number;

    @IsNumber()
    @IsNotEmpty()
    soldeInitial: number;

    @IsNumber()
    @IsNotEmpty()
    solde: number;

    @IsNumber()
    @IsOptional()
    prixLitre?: number;

    @IsNumber()
    @IsOptional()
    prixDiesel?: number;

    @IsNumber()
    @IsOptional()
    prixSuper?: number;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    dateExpiration: Date;

    @IsString()
    @IsOptional()
    fournisseur?: string;

    @IsString()
    @IsOptional()
    station?: string;

    @IsEnum(FuelCardStatus)
    @IsOptional()
    statut?: FuelCardStatus;

    @IsString()
    @IsOptional()
    notes?: string;
}
