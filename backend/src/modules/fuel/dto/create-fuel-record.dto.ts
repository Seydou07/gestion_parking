import { IsNotEmpty, IsNumber, IsInt, IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';
import { PaymentMethod, FuelType } from '@prisma/client';

export class CreateFuelRecordDto {
    @IsInt()
    @IsNotEmpty()
    vehiculeId: number;

    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsNumber()
    @IsNotEmpty()
    quantite: number;

    @IsNumber()
    @IsNotEmpty()
    montant: number;

    @IsInt()
    @IsNotEmpty()
    kilometrage: number;

    @IsEnum(FuelType)
    @IsNotEmpty()
    typeCarburant: FuelType;

    @IsString()
    @IsOptional()
    station?: string;

    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    modePaiement: PaymentMethod;

    @IsInt()
    @IsOptional()
    carteCarburantId?: number;

    @IsInt()
    @IsOptional()
    bonEssenceId?: number;
}
